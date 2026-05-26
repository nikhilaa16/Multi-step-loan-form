import { Button } from '@heroui/react';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Controller, useSmartStepper } from 'smartstepper';
import SignaturePad from './SignaturePad';

// Compression Utility
async function compressImage(file: File): Promise<{ base64: string; compressedSize: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.7;
        let base64 = '';
        let byteLength = 0;

        const attemptCompression = () => {
          base64 = canvas.toDataURL('image/jpeg', quality);
          const stringLength = base64.length - 'data:image/jpeg;base64,'.length;
          byteLength = Math.ceil((stringLength * 3) / 4);

          if (byteLength > 2 * 1024 * 1024 && quality > 0.3) {
            quality -= 0.1;
            attemptCompression();
          }
        };

        attemptCompression();
        resolve({ base64, compressedSize: byteLength });
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

async function processUploadFile(file: File): Promise<{
  base64: string;
  size: number;
  originalSize: number;
  compressed: boolean;
}> {
  const isImage = file.type.startsWith('image/');
  const originalSize = file.size;

  if (isImage) {
    const { base64, compressedSize } = await compressImage(file);
    return {
      base64,
      size: compressedSize,
      originalSize,
      compressed: true,
    };
  } else {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        resolve({
          base64: e.target?.result as string,
          size: originalSize,
          originalSize,
          compressed: false,
        });
      };
      reader.onerror = (err) => reject(err);
    });
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Single Document Uploader
interface DocUploaderProps {
  label: string;
  value?: string;
  onChange: (base64: string) => void;
  accept: string;
}

function DocumentUploader({ label, value, onChange, accept }: DocUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [fileDetails, setFileDetails] = useState<{
    originalSize?: number;
    compressedSize?: number;
    name?: string;
  } | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    accept: accept === 'image/*' ? { 'image/*': ['.jpg', '.jpeg', '.png'] } : { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      setLoading(true);
      try {
        const file = acceptedFiles[0];
        const res = await processUploadFile(file);
        onChange(res.base64);
        setFileDetails({
          name: file.name,
          originalSize: res.originalSize,
          compressedSize: res.compressed ? res.size : undefined,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      
      {value ? (
        <div className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-slate-50">
          <div className="flex items-center gap-3">
            {value.startsWith('data:image/') ? (
              <img src={value} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-red-100 text-red-600 rounded-lg font-bold text-sm">
                PDF
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800 truncate max-w-[180px]">
                {fileDetails?.name || 'document_upload'}
              </span>
              <span className="text-xs text-slate-500">
                {fileDetails?.compressedSize
                  ? `Original: ${formatBytes(fileDetails.originalSize || 0)} | Compressed: ${formatBytes(fileDetails.compressedSize)}`
                  : fileDetails?.originalSize
                  ? formatBytes(fileDetails.originalSize)
                  : 'Uploaded'}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            color="danger"
            variant="light"
            onClick={() => {
              onChange('');
              setFileDetails(null);
            }}
          >
            Remove
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-1 transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <input {...getInputProps()} />
          <span className="text-xl text-slate-400">📁</span>
          <span className="text-xs font-semibold text-slate-600">
            {loading ? 'Processing & Compressing...' : 'Drag & drop here or click to browse'}
          </span>
          <span className="text-[10px] text-slate-400">PDF, JPG, or PNG (Max 5MB)</span>
        </div>
      )}
    </div>
  );
}

export default function Step7UploadSignature() {
  const { control, navigateToNextStep, navigateToPreviousStep, watchStepperFieldValues } = useSmartStepper();

  const loanType = watchStepperFieldValues('loanType') || 'personal';
  const employmentType = watchStepperFieldValues('employmentType') || 'salaried';
  const panVerified = watchStepperFieldValues('panVerified');

  const requiredDocs = [
    { key: 'panCardFile', name: 'PAN Card Copy', accept: 'image/*,application/pdf', required: !panVerified },
    { key: 'aadhaarFrontFile', name: 'Aadhaar Card (Front)', accept: 'image/*', required: true },
    { key: 'aadhaarBackFile', name: 'Aadhaar Card (Back)', accept: 'image/*', required: true },
    { key: 'bankStatementFile', name: 'Bank Statement (Last 6 months)', accept: 'application/pdf', required: true },
    { key: 'photoFile', name: 'Passport Photograph', accept: 'image/*', required: true },
  ];

  if (employmentType === 'salaried') {
    requiredDocs.push({ key: 'salarySlipsFile', name: 'Salary Slips (Last 3 months)', accept: 'application/pdf', required: true });
  } else {
    requiredDocs.push({ key: 'itrFile', name: 'Income Tax Return (ITR) (Last 2 years)', accept: 'application/pdf', required: true });
  }

  if (loanType === 'home') {
    requiredDocs.push({ key: 'propertyDocsFile', name: 'Property Documents', accept: 'application/pdf', required: true });
  } else if (loanType === 'business') {
    requiredDocs.push({ key: 'businessRegFile', name: 'Business Registration Certificate', accept: 'application/pdf', required: true });
    requiredDocs.push({ key: 'gstReturnsFile', name: 'GST Returns (Last 4 quarters)', accept: 'application/pdf', required: true });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Document Upload & E-Signature</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload required documentation and provide your signature. Image files will be compressed client-side automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {requiredDocs.map((doc) => (
          <div key={doc.key}>
            <Controller
              name={doc.key}
              control={control}
              render={({ field, fieldState }) => (
                <div>
                  <DocumentUploader
                    label={`${doc.name}${doc.required ? ' *' : ' (Optional)'}`}
                    value={field.value}
                    onChange={field.onChange}
                    accept={doc.accept}
                  />
                  {fieldState.error && (
                    <span className="text-danger text-xs mt-1 block">
                      {fieldState.error.message}
                    </span>
                  )}
                </div>
              )}
            />
          </div>
        ))}
      </div>

      {/* Signature Canvas */}
      <div className="space-y-2 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <label className="text-sm font-semibold text-slate-700 block">
          Primary Applicant E-Signature *
        </label>
        <Controller
          name="primarySignature"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <SignaturePad
                value={field.value}
                onChange={field.onChange}
              />
              {fieldState.error && (
                <span className="text-danger text-xs mt-1 block">
                  {fieldState.error.message}
                </span>
              )}
            </div>
          )}
        />
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-100">
        <Button
          type="button"
          variant="bordered"
          size="lg"
          onClick={() => navigateToPreviousStep()}
          className="px-8 border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl h-12"
        >
          Back
        </Button>
        <Button
          type="button"
          color="primary"
          size="lg"
          onClick={() => navigateToNextStep()}
          className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md rounded-xl h-12"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}

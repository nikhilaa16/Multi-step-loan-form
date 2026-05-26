import { Button, Checkbox, Input, Select, SelectItem } from '@heroui/react';
import { useState, useEffect } from 'react';
import { Controller, useSmartStepper } from 'smartstepper';
import { simulatePANVerification } from './utils';
import SignaturePad from './SignaturePad';

export default function Step6CoApplicant() {
  const { control, navigateToNextStep, navigateToPreviousStep, watchStepperFieldValues, setStepperFieldValues } = useSmartStepper();

  const coApplicantPANVerified = watchStepperFieldValues('coApplicantPANVerified');
  const coApplicantPAN = watchStepperFieldValues('coApplicantPAN');
  const relationship = watchStepperFieldValues('relationship');
  const maritalStatus = watchStepperFieldValues('maritalStatus');

  // Verification states
  const [panVerifying, setPanVerifying] = useState(false);
  const [panError, setPanError] = useState('');

  // Default to spouse if married
  useEffect(() => {
    if (maritalStatus === 'married' && !relationship) {
      setStepperFieldValues('relationship', 'spouse');
    }
  }, [maritalStatus, relationship, setStepperFieldValues]);

  const handleVerifyPAN = async () => {
    if (!coApplicantPAN || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(coApplicantPAN)) {
      setPanError('Please enter a valid 10-character PAN in uppercase (e.g. AAAAA1111A).');
      return;
    }
    setPanError('');
    setPanVerifying(true);
    // Co-applicants are individuals, so fourth character must be P
    const res = await simulatePANVerification(coApplicantPAN, 'personal');
    setPanVerifying(false);
    if (res.success) {
      setStepperFieldValues('coApplicantPANVerified', true);
    } else {
      setPanError(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Co-Applicant & Guarantor Details</h2>
        <p className="text-sm text-slate-500 mt-1">
          Provide information about the co-applicant or guarantor. PAN verification and consent are mandatory.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          name="coApplicantName"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              label="Co-Applicant Full Name (as per PAN)"
              placeholder="Enter full name"
              variant="bordered"
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              classNames={{
                inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
              }}
            />
          )}
        />

        <Controller
          name="relationship"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              {...field}
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0];
                field.onChange(val);
              }}
              label="Relationship with Primary Applicant"
              placeholder="Select relationship"
              variant="bordered"
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              classNames={{
                trigger: 'h-12 border-slate-200 focus-within:border-blue-500',
              }}
            >
              <SelectItem key="spouse">Spouse</SelectItem>
              <SelectItem key="parent">Parent</SelectItem>
              <SelectItem key="sibling">Sibling</SelectItem>
              <SelectItem key="business-partner">Business Partner</SelectItem>
            </Select>
          )}
        />

        {/* PAN Input & Verification */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 border border-slate-100 p-5 rounded-2xl">
          <div className="md:col-span-2">
            <Controller
              name="coApplicantPAN"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  disabled={coApplicantPANVerified}
                  label="Co-Applicant PAN Number"
                  placeholder="Enter PAN Number (e.g. ABCDE1234F)"
                  variant="bordered"
                  isInvalid={!!fieldState.error || !!panError}
                  errorMessage={fieldState.error?.message || panError}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    field.onChange(val);
                    setStepperFieldValues('coApplicantPANVerified', false);
                    setPanError('');
                  }}
                  classNames={{
                    input: 'uppercase font-mono tracking-wider text-base',
                    inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
                  }}
                />
              )}
            />
          </div>
          <div>
            {coApplicantPANVerified ? (
              <span className="h-12 flex items-center justify-center text-green-600 font-bold bg-green-50 rounded-xl border border-green-200">
                ✓ PAN Verified
              </span>
            ) : (
              <Button
                color="primary"
                onClick={handleVerifyPAN}
                isLoading={panVerifying}
                disabled={!coApplicantPAN || coApplicantPAN.length !== 10}
                className="w-full h-12 bg-blue-600 text-white font-semibold rounded-xl"
              >
                Verify PAN
              </Button>
            )}
          </div>
        </div>

        <Controller
          name="coApplicantIncome"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="number"
              label="Co-Applicant Monthly Income (INR)"
              placeholder="e.g. 35000"
              variant="bordered"
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              startContent={<span className="text-slate-400 font-semibold">₹</span>}
              classNames={{
                inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
              }}
            />
          )}
        />
      </div>

      {/* Signature Canvas */}
      <div className="space-y-2 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <label className="text-sm font-semibold text-slate-700 block">
          Co-Applicant E-Signature
        </label>
        <Controller
          name="coApplicantSignature"
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

      <div className="pt-2">
        <Controller
          name="coApplicantConsent"
          control={control}
          render={({ field, fieldState }) => (
            <Checkbox
              isSelected={field.value === true}
              onValueChange={(val) => field.onChange(val)}
              isInvalid={!!fieldState.error}
              className="items-start"
            >
              <span className="text-slate-600 text-sm leading-relaxed block">
                As the co-applicant, I hereby consent to join this application and authorize LendSwift to access my credit records to evaluate loan eligibility and terms.
              </span>
              {fieldState.error && (
                <span className="text-danger text-xs block mt-1">
                  {fieldState.error.message}
                </span>
              )}
            </Checkbox>
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
          disabled={!coApplicantPANVerified}
          className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md rounded-xl h-12"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}

import { Button, Checkbox, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/react';
import { useState } from 'react';
import { Controller, useSmartStepper } from 'smartstepper';
import { formatIndianCurrency } from './utils';
import { clearDraft } from './useAutoSave';

export default function Step8ReviewSummary() {
  const { control, getStepperFieldValues, navigateToNextStep } = useSmartStepper();
  const allData = getStepperFieldValues();

  // Success Modal control
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [appId, setAppId] = useState('');

  // Extract variables
  const loanType = allData.loanType || 'personal';
  const loanAmount = Number(allData.loanAmount) || 0;
  const loanTenure = Number(allData.loanTenure) || 0;
  const employmentType = allData.employmentType || 'salaried';
  const maritalStatus = allData.maritalStatus || 'single';

  // Determine if Co-Applicant Step was active
  const isCoApplicantActive =
    loanType === 'home' ||
    (loanType === 'personal' && loanAmount > 500000) ||
    (loanType === 'business' && loanAmount > 2000000);

  // EMI and Financial Calculations
  const getInterestRate = (): number => {
    if (loanType === 'personal') return 10.5;
    if (loanType === 'home') return 8.5;
    if (loanType === 'business') return 14.0;
    return 0;
  };

  const getProcessingFee = (): number => {
    const rawFee = loanAmount * 0.01;
    return Math.max(2000, Math.min(25000, rawFee));
  };

  const calculateEMI = (): number => {
    const P = loanAmount;
    const annualRate = getInterestRate();
    const r = annualRate / 12 / 100;
    const n = loanTenure;

    if (P <= 0 || r <= 0 || n <= 0) return 0;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const emi = calculateEMI();
  const interestRate = getInterestRate();
  const processingFee = getProcessingFee();
  const totalInterest = emi * loanTenure - loanAmount;
  const totalRepayment = emi * loanTenure;

  const interestInterestPayable = () => {
    return Math.max(0, totalInterest);
  };

  // Format helper
  const formatVal = (v: unknown): string => {
    if (v === null || v === undefined || v === '') return 'Not Provided';
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    return String(v);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const uuid = 'LS-' + Math.floor(100000 + Math.random() * 900000) + '-' + new Date().getFullYear();
    setAppId(uuid);
    
    // Clear auto-save drafts upon successful submission
    clearDraft(loanType);
    
    onOpen();
  };

  // Check if employment type is salaried
  const isSalaried = employmentType === 'salaried';
  const isSelfEmployed = employmentType === 'self-employed';
  const isBusinessOwner = employmentType === 'business-owner';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Review & Pre-Approval Summary</h2>
        <p className="text-sm text-slate-500 mt-1">
          Review your loan application data and financial summary before submitting.
        </p>
      </div>

      {/* ==========================================
          💳 FINANCIAL PRE-APPROVAL CARD
          ========================================== */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span>📊</span> Indicative Pre-Approval Summary
        </h3>
        <Divider className="bg-white/20" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <span className="text-xs text-indigo-200 block">Requested Amount</span>
            <span className="text-xl font-bold">{formatIndianCurrency(loanAmount)}</span>
          </div>
          <div>
            <span className="text-xs text-indigo-200 block">Interest Rate</span>
            <span className="text-xl font-bold">{interestRate}% p.a. (Fixed)</span>
          </div>
          <div>
            <span className="text-xs text-indigo-200 block">Tenure Duration</span>
            <span className="text-xl font-bold">{loanTenure} Months</span>
          </div>
          <div>
            <span className="text-xs text-indigo-200 block">Estimated Monthly EMI</span>
            <span className="text-xl font-bold text-emerald-300">{formatIndianCurrency(emi)}</span>
          </div>
          <div>
            <span className="text-xs text-indigo-200 block">Total Interest Payable</span>
            <span className="text-xl font-bold">{formatIndianCurrency(interestInterestPayable())}</span>
          </div>
          <div>
            <span className="text-xs text-indigo-200 block">Processing Fee (1%)</span>
            <span className="text-xl font-bold">{formatIndianCurrency(processingFee)}</span>
          </div>
        </div>
        <Divider className="bg-white/20" />
        <div className="flex justify-between items-center text-sm pt-2">
          <span className="text-indigo-200">Total Amount Repayable (Principal + Interest)</span>
          <span className="text-lg font-bold text-emerald-300">{formatIndianCurrency(totalRepayment)}</span>
        </div>
      </div>

      {/* ==========================================
          📂 FORM DATA REVIEW SECTIONS
          ========================================== */}
      <div className="space-y-6">
        {/* Section 1: Basic Info */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-700">1. Loan & Basic Details</h4>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              onClick={() => navigateToNextStep('basicInfo')}
            >
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
            <div><strong>Loan Type:</strong> <span className="capitalize">{formatVal(allData.loanType)}</span></div>
            <div><strong>Loan Amount:</strong> {formatIndianCurrency(Number(allData.loanAmount))}</div>
            <div><strong>Tenure:</strong> {formatVal(allData.loanTenure)} Months</div>
            <div><strong>Purpose:</strong> <span className="capitalize">{formatVal(allData.loanPurpose)?.replace('_', ' ')}</span></div>
          </div>
        </div>

        {/* Section 2: Personal Info */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-700">2. Personal details</h4>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              onClick={() => navigateToNextStep('personalInfo')}
            >
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
            <div><strong>Full Name:</strong> {formatVal(allData.fullName)}</div>
            <div><strong>Date of Birth:</strong> {formatVal(allData.dob)}</div>
            <div><strong>Gender:</strong> <span className="capitalize">{formatVal(allData.gender)}</span></div>
            <div><strong>Marital Status:</strong> <span className="capitalize">{formatVal(allData.maritalStatus)}</span></div>
            <div><strong>Email Address:</strong> {formatVal(allData.email)}</div>
            <div><strong>Mobile Number:</strong> +91 {formatVal(allData.mobileNumber)}</div>
          </div>
        </div>

        {/* Section 3: Identity & KYC */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-700">3. Identity Verification (KYC)</h4>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              onClick={() => navigateToNextStep('identityKYC')}
            >
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
            <div><strong>PAN Number:</strong> <span className="font-mono">{formatVal(allData.panNumber)}</span> (Verified)</div>
            <div><strong>Aadhaar Number:</strong> <span className="font-mono">********{formatVal(allData.aadhaarNumber)?.slice(-4)}</span> (Verified)</div>
            {allData.voterId && <div><strong>Voter ID:</strong> <span className="font-mono">{allData.voterId}</span></div>}
            {allData.passport && <div><strong>Passport:</strong> <span className="font-mono">{allData.passport}</span></div>}
          </div>
        </div>

        {/* Section 4: Address Info */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-700">4. Residential Address</h4>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              onClick={() => navigateToNextStep('addressInfo')}
            >
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
            <div><strong>Current Address:</strong> {formatVal(allData.currentAddressLine1)}, {allData.currentAddressLine2 ? allData.currentAddressLine2 + ',' : ''} {allData.city}, {allData.state} - {allData.pinCode}</div>
            <div><strong>Residence Type:</strong> <span className="capitalize">{formatVal(allData.residenceType)}</span></div>
            {allData.residenceType === 'rented' && <div><strong>Monthly Rent:</strong> {formatIndianCurrency(Number(allData.rentAmount))}</div>}
            <div><strong>Years at Address:</strong> {formatVal(allData.yearsAtCurrentAddress)}</div>
          </div>
        </div>

        {/* Section 5: Employment & Income */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-700">5. Employment & Financial Income</h4>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              onClick={() => navigateToNextStep('employmentDetails')}
            >
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
            <div className="md:col-span-2"><strong>Employment Type:</strong> <span className="capitalize font-semibold">{formatVal(allData.employmentType)?.replace('-', ' ')}</span></div>
            {isSalaried && (
              <>
                <div><strong>Company:</strong> {formatVal(allData.companyName)}</div>
                <div><strong>Designation:</strong> {formatVal(allData.designation)}</div>
                <div><strong>Net Monthly Salary:</strong> {formatIndianCurrency(Number(allData.monthlyNetSalary))}</div>
                <div><strong>Experience:</strong> {formatVal(allData.yearsOfExperience)} Years</div>
              </>
            )}
            {(isSelfEmployed || isBusinessOwner) && (
              <>
                <div><strong>Business Name:</strong> {formatVal(allData.businessName)}</div>
                <div><strong>Business Structure:</strong> <span className="capitalize">{formatVal(allData.businessType)}</span></div>
                <div><strong>Annual Turnover:</strong> {formatIndianCurrency(Number(allData.annualTurnover))}</div>
                <div><strong>Years in Operations:</strong> {formatVal(allData.yearsInBusiness)} Years</div>
              </>
            )}
            {isSelfEmployed && <div><strong>Monthly Income:</strong> {formatIndianCurrency(Number(allData.monthlyIncome))}</div>}
            {isBusinessOwner && (
              <>
                <div><strong>GSTIN Number:</strong> <span className="font-mono">{formatVal(allData.gstNumber)}</span></div>
                <div className="md:col-span-2"><strong>Business Address:</strong> {formatVal(allData.businessAddress)}</div>
              </>
            )}
          </div>
        </div>

        {/* Section 6: Co-Applicant */}
        {isCoApplicantActive && (
          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-700">6. Co-Applicant / Guarantor Details</h4>
              <Button
                size="sm"
                variant="flat"
                color="primary"
                onClick={() => navigateToNextStep('coApplicant')}
              >
                Edit
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
              <div><strong>Name:</strong> {formatVal(allData.coApplicantName)}</div>
              <div><strong>Relationship:</strong> <span className="capitalize">{formatVal(allData.relationship)}</span></div>
              <div><strong>Co-Applicant PAN:</strong> <span className="font-mono">{formatVal(allData.coApplicantPAN)}</span></div>
              <div><strong>Monthly Income:</strong> {formatIndianCurrency(Number(allData.coApplicantIncome))}</div>
            </div>
          </div>
        )}
 
        {/* Section 7: Bank Details */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-700">7. Bank Account Details</h4>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              onClick={() => navigateToNextStep('bankDetails')}
            >
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
            <div><strong>Bank Name:</strong> {formatVal(allData.bankName)}</div>
            <div><strong>Account Type:</strong> <span className="capitalize">{formatVal(allData.accountType)}</span></div>
            <div>
              <strong>Account Number:</strong>{' '}
              <span className="font-mono">
                {allData.accountNumber
                  ? '*'.repeat(String(allData.accountNumber).length - 4) + String(allData.accountNumber).slice(-4)
                  : 'Not Provided'}
              </span>
            </div>
            <div><strong>IFSC Code:</strong> <span className="font-mono uppercase">{formatVal(allData.ifscCode)}</span></div>
          </div>
        </div>

        {/* Section 8: Documents & Signatures */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-700">8. Documentation & E-Signatures</h4>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              onClick={() => navigateToNextStep('uploadDocs')}
            >
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {allData.photoFile && (
              <div className="border border-slate-200 rounded-lg p-2 bg-white flex flex-col items-center gap-1">
                <img src={allData.photoFile} alt="Passport Size Photo" className="w-20 h-20 object-cover rounded-lg" />
                <span className="text-[10px] text-slate-500 font-semibold">Photograph</span>
              </div>
            )}
            {allData.primarySignature && (
              <div className="border border-slate-200 rounded-lg p-2 bg-white flex flex-col items-center gap-1">
                <img src={allData.primarySignature} alt="Applicant Signature" className="w-20 h-20 object-contain bg-slate-50 rounded-lg" />
                <span className="text-[10px] text-slate-500 font-semibold">Applicant E-Sign</span>
              </div>
            )}
            {isCoApplicantActive && allData.coApplicantSignature && (
              <div className="border border-slate-200 rounded-lg p-2 bg-white flex flex-col items-center gap-1">
                <img src={allData.coApplicantSignature} alt="Co-Applicant Signature" className="w-20 h-20 object-contain bg-slate-50 rounded-lg" />
                <span className="text-[10px] text-slate-500 font-semibold">Co-Applicant E-Sign</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          ✍️ FINAL CONSENTS & SUBMIT
          ========================================== */}
      <form onSubmit={handleFormSubmit} className="space-y-4 pt-4 border-t border-slate-100">
        <h4 className="font-bold text-slate-800 text-lg">Terms, Authorisation & Consents</h4>
        <div className="space-y-3">
          <Controller
            name="confirmAccurate"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <Checkbox isSelected={field.value === true} onValueChange={(val) => field.onChange(val)}>
                  <span className="text-slate-600 text-xs">I confirm that all information provided in this loan application is true, accurate, and up-to-date.</span>
                </Checkbox>
                {fieldState.error && <p className="text-danger text-xs ml-7 mt-0.5">{fieldState.error.message}</p>}
              </div>
            )}
          />
          
          <Controller
            name="authoriseCreditCheck"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <Checkbox isSelected={field.value === true} onValueChange={(val) => field.onChange(val)}>
                  <span className="text-slate-600 text-xs">I authorize LendSwift to check my credit history score from CIBIL, Equifax, or other credit bureaus.</span>
                </Checkbox>
                {fieldState.error && <p className="text-danger text-xs ml-7 mt-0.5">{fieldState.error.message}</p>}
              </div>
            )}
          />

          <Controller
            name="agreeTerms"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <Checkbox isSelected={field.value === true} onValueChange={(val) => field.onChange(val)}>
                  <span className="text-slate-600 text-xs">I agree to the LendSwift Terms and Conditions and borrow agreement contracts.</span>
                </Checkbox>
                {fieldState.error && <p className="text-danger text-xs ml-7 mt-0.5">{fieldState.error.message}</p>}
              </div>
            )}
          />

          <Controller
            name="consentComms"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <Checkbox isSelected={field.value === true} onValueChange={(val) => field.onChange(val)}>
                  <span className="text-slate-600 text-xs">I consent to receive communication updates via SMS, Whatsapp, Email, and Phone regarding this application.</span>
                </Checkbox>
                {fieldState.error && <p className="text-danger text-xs ml-7 mt-0.5">{fieldState.error.message}</p>}
              </div>
            )}
          />
        </div>

        <div className="flex justify-between pt-6 border-t border-slate-100">
          <Button
            type="button"
            variant="bordered"
            size="lg"
            onClick={() => navigateToNextStep('uploadDocs')}
            className="px-8 border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl h-12"
          >
            Back
          </Button>
          <Button
            type="submit"
            color="success"
            size="lg"
            className="px-8 bg-green-600 hover:bg-green-700 text-white font-bold shadow-md rounded-xl h-12"
          >
            Submit Application
          </Button>
        </div>
      </form>

      {/* Success Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md" isDismissable={false} className="font-sans">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 items-center pt-8">
                <span className="text-5xl">🎉</span>
                <h3 className="text-2xl font-bold text-slate-800">Application Submitted!</h3>
              </ModalHeader>
              <ModalBody className="text-center px-6">
                <p className="text-slate-600 text-sm leading-relaxed">
                  Your application has been received successfully. A LendSwift lending officer will review your documents and verify credentials.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4 text-center">
                  <span className="text-xs text-slate-500 block">Application Reference Number</span>
                  <span className="text-lg font-mono font-bold text-blue-600 tracking-wide select-all">{appId}</span>
                </div>
                <div className="mt-4 text-left border-t border-slate-100 pt-4 text-xs text-slate-500 space-y-1">
                  <div>• Indicative Loan Amount: <strong>{formatIndianCurrency(loanAmount)}</strong></div>
                  <div>• Estimated EMI: <strong>{formatIndianCurrency(emi)} / Month</strong></div>
                  <div>• Processing Fee: <strong>{formatIndianCurrency(processingFee)}</strong></div>
                  <div className="pt-2 text-[10px] text-slate-400 italic">
                    Note: Indicative terms are subject to bureau check evaluation.
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="flex justify-center pb-8 pt-4">
                <Button
                  color="primary"
                  onClick={() => {
                    onClose();
                    window.location.reload();
                  }}
                  className="px-8 font-semibold bg-blue-600 text-white rounded-xl"
                >
                  Apply for Another Loan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

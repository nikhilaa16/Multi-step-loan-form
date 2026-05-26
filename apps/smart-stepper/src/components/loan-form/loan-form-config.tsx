import { Card, CardBody, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Button, useDisclosure } from '@heroui/react';
import { useState, useEffect, useRef } from 'react';
import { SmartStepper, useSmartStepper, type FieldValues, type SmartStepperConfig } from 'smartstepper';
import Step1BasicInfo from './Step1BasicInfo';
import Step2PersonalInfo from './Step2PersonalInfo';
import Step3IdentityKYC from './Step3IdentityKYC';
import Step4AddressInfo from './Step4AddressInfo';
import Step5EmploymentIncome from './Step5EmploymentIncome';
import Step6CoApplicant from './Step6CoApplicant';
import Step5aBankDetails from './Step5aBankDetails';
import Step7UploadSignature from './Step7UploadSignature';
import Step8ReviewSummary from './Step8ReviewSummary';
import { step1Schema, step2Schema, step3Schema, step4Schema, step5Schema, step6Schema, bankDetailsSchema, step7Schema, step8Schema } from './step-schemas';
import { useAutoSave, checkSavedDrafts, decryptData, clearDraft } from './useAutoSave';

type LoanStep =
  | 'basicInfo'
  | 'personalInfo'
  | 'identityKYC'
  | 'addressInfo'
  | 'employmentDetails'
  | 'coApplicant'
  | 'bankDetails'
  | 'uploadDocs'
  | 'reviewSummary';

const stepLabels: Record<LoanStep, string> = {
  basicInfo: 'Basic Details',
  personalInfo: 'Personal Info',
  identityKYC: 'KYC Verification',
  addressInfo: 'Address details',
  employmentDetails: 'Employment',
  coApplicant: 'Co-Applicant',
  bankDetails: 'Bank Details',
  uploadDocs: 'Uploads & Sign',
  reviewSummary: 'Review & Consent',
};

const orderedSteps: LoanStep[] = [
  'basicInfo',
  'personalInfo',
  'identityKYC',
  'addressInfo',
  'employmentDetails',
  'coApplicant',
  'bankDetails',
  'uploadDocs',
  'reviewSummary',
];

interface FormStateSyncProps {
  onValuesChange: (values: Record<string, unknown>) => void;
  onStepChange: (stepName: LoanStep) => void;
  currentStepName: LoanStep;
}

function FormStateSync({ onValuesChange, onStepChange, currentStepName }: FormStateSyncProps) {
  const { watchStepperFieldValues } = useSmartStepper();
  const allValues = watchStepperFieldValues();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onStepChange(currentStepName);
  }, [currentStepName, onStepChange]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onValuesChange(allValues);
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [allValues, onValuesChange]);

  return null;
}

export function LoanApplicationForm() {
  const [currentStep, setCurrentStep] = useState<LoanStep>('basicInfo');
  const [formStateValues, setFormStateValues] = useState<Record<string, unknown>>({});
  const [remountKey, setRemountKey] = useState(0);

  // Draft recovery states
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [recoveredDraft, setRecoveredDraft] = useState<{
    loanType: string;
    step: string;
    timestamp: string;
  } | null>(null);

  // Check saved drafts on load
  useEffect(() => {
    const drafts = checkSavedDrafts();
    if (drafts.length > 0) {
      const latest = drafts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      setRecoveredDraft(latest);
      onOpen();
    }
  }, [onOpen]);

  const handleResumeDraft = async () => {
    if (!recoveredDraft) return;
    try {
      const encryptedData = localStorage.getItem(`lendswift_draft_${recoveredDraft.loanType}`);
      if (encryptedData) {
        const decrypted = await decryptData(encryptedData) as Record<string, unknown>;
        setFormStateValues(decrypted);
        setCurrentStep(recoveredDraft.step as LoanStep);
        setRemountKey((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Failed to decrypt and resume draft:', err);
    }
    setRecoveredDraft(null);
  };

  const handleStartFresh = () => {
    if (recoveredDraft) {
      clearDraft(recoveredDraft.loanType);
    }
    setFormStateValues({});
    setCurrentStep('basicInfo');
    setRemountKey((prev) => prev + 1);
    setRecoveredDraft(null);
  };

  const { lastSaved, showToast } = useAutoSave(formStateValues, currentStep, 30000);

  const renderProgressBar = () => {
    const isCoApplicantStepRequired =
      formStateValues.loanType === 'home' ||
      (formStateValues.loanType === 'personal' && Number(formStateValues.loanAmount) > 500000) ||
      (formStateValues.loanType === 'business' && Number(formStateValues.loanAmount) > 2000000);

    const stepsToDisplay = orderedSteps.filter((s) => s !== 'coApplicant' || isCoApplicantStepRequired);
    const displayActiveIndex = stepsToDisplay.indexOf(currentStep);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
          <span>Progress</span>
          <span>{Math.round(((displayActiveIndex + 1) / stepsToDisplay.length) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((displayActiveIndex + 1) / stepsToDisplay.length) * 100}%` }}
          />
        </div>

        <div className="flex justify-between gap-1 overflow-x-auto py-2 scrollbar-none md:flex-wrap">
          {stepsToDisplay.map((stepKey, idx) => {
            const isActive = stepKey === currentStep;
            const isCompleted = stepsToDisplay.indexOf(currentStep) > idx;

            return (
              <div key={stepKey} className="flex flex-col items-center gap-1 min-w-[70px] flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-[10px] font-semibold text-center whitespace-nowrap ${
                    isActive ? 'text-blue-600 font-bold' : 'text-slate-500'
                  }`}
                >
                  {stepLabels[stepKey]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getStepperConfig = (): SmartStepperConfig<LoanStep> => {
    return {
      start: currentStep,
      orchestration: {
        basicInfo: {
          next: () => 'personalInfo',
        },
        personalInfo: {
          next: () => 'identityKYC',
          previous: () => 'basicInfo',
        },
        identityKYC: {
          next: () => 'addressInfo',
          previous: () => 'personalInfo',
        },
        addressInfo: {
          next: () => 'employmentDetails',
          previous: () => 'identityKYC',
        },
        employmentDetails: {
          next: (data) => {
            const amount = Number(data.loanAmount) || 0;
            const type = data.loanType;
            if (type === 'home') return 'coApplicant';
            if (type === 'personal' && amount > 500000) return 'coApplicant';
            if (type === 'business' && amount > 2000000) return 'coApplicant';
            return 'bankDetails';
          },
          previous: () => 'addressInfo',
        },
        coApplicant: {
          next: () => 'bankDetails',
          previous: () => 'employmentDetails',
        },
        bankDetails: {
          next: () => 'uploadDocs',
          previous: (data) => {
            const amount = Number(data.loanAmount) || 0;
            const type = data.loanType;
            if (type === 'home') return 'coApplicant';
            if (type === 'personal' && amount > 500000) return 'coApplicant';
            if (type === 'business' && amount > 2000000) return 'coApplicant';
            return 'employmentDetails';
          },
        },
        uploadDocs: {
          next: () => 'reviewSummary',
          previous: () => 'bankDetails',
        },
        reviewSummary: {
          previous: () => 'uploadDocs',
        },
      },
      validations: {
        basicInfo: { schema: step1Schema, defaultValues: formStateValues },
        personalInfo: { schema: step2Schema, defaultValues: formStateValues },
        identityKYC: { schema: step3Schema, defaultValues: formStateValues },
        addressInfo: { schema: step4Schema, defaultValues: formStateValues },
        employmentDetails: { schema: step5Schema, defaultValues: formStateValues },
        coApplicant: { schema: step6Schema, defaultValues: formStateValues },
        bankDetails: { schema: bankDetailsSchema, defaultValues: formStateValues },
        uploadDocs: { schema: step7Schema, defaultValues: formStateValues },
        reviewSummary: { schema: step8Schema, defaultValues: formStateValues },
      },
      views: {
        basicInfo: {
          component: <Step1BasicInfo />,
          wrapper: (children) => (
            <>
              <FormStateSync onValuesChange={setFormStateValues} onStepChange={setCurrentStep} currentStepName="basicInfo" />
              {children}
            </>
          ),
        },
        personalInfo: {
          component: <Step2PersonalInfo />,
          wrapper: (children) => (
            <>
              <FormStateSync onValuesChange={setFormStateValues} onStepChange={setCurrentStep} currentStepName="personalInfo" />
              {children}
            </>
          ),
        },
        identityKYC: {
          component: <Step3IdentityKYC />,
          wrapper: (children) => (
            <>
              <FormStateSync onValuesChange={setFormStateValues} onStepChange={setCurrentStep} currentStepName="identityKYC" />
              {children}
            </>
          ),
        },
        addressInfo: {
          component: <Step4AddressInfo />,
          wrapper: (children) => (
            <>
              <FormStateSync onValuesChange={setFormStateValues} onStepChange={setCurrentStep} currentStepName="addressInfo" />
              {children}
            </>
          ),
        },
        employmentDetails: {
          component: <Step5EmploymentIncome />,
          wrapper: (children) => (
            <>
              <FormStateSync onValuesChange={setFormStateValues} onStepChange={setCurrentStep} currentStepName="employmentDetails" />
              {children}
            </>
          ),
        },
        coApplicant: {
          component: <Step6CoApplicant />,
          wrapper: (children) => (
            <>
              <FormStateSync onValuesChange={setFormStateValues} onStepChange={setCurrentStep} currentStepName="coApplicant" />
              {children}
            </>
          ),
        },
        bankDetails: {
          component: <Step5aBankDetails />,
          wrapper: (children) => (
            <>
              <FormStateSync onValuesChange={setFormStateValues} onStepChange={setCurrentStep} currentStepName="bankDetails" />
              {children}
            </>
          ),
        },
        uploadDocs: {
          component: <Step7UploadSignature />,
          wrapper: (children) => (
            <>
              <FormStateSync onValuesChange={setFormStateValues} onStepChange={setCurrentStep} currentStepName="uploadDocs" />
              {children}
            </>
          ),
        },
        reviewSummary: {
          component: <Step8ReviewSummary />,
          wrapper: (children) => (
            <>
              <FormStateSync onValuesChange={setFormStateValues} onStepChange={setCurrentStep} currentStepName="reviewSummary" />
              {children}
            </>
          ),
        },
      },
      onSubmit: (data) => {
        console.log('Submitted values:', data);
      },
    };
  };

  const config = getStepperConfig();

  return (
    <div className="space-y-6">
      {/* Auto-save draft toast notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-fade-in border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Draft saved at {lastSaved}
        </div>
      )}

      {/* Progress header */}
      <Card className="shadow-sm border border-slate-100 bg-white/70 backdrop-blur-md rounded-2xl">
        <CardBody className="p-6">{renderProgressBar()}</CardBody>
      </Card>

      {/* Main stepper card */}
      <Card className="shadow-lg border border-slate-100 bg-white rounded-2xl">
        <CardBody className="p-8">
          <SmartStepper
            key={`${remountKey}-${currentStep}`}
            config={{
              ...config,
              onSubmit: config.onSubmit,
            }}
          />
        </CardBody>
      </Card>

      {/* Draft Resume Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm" isDismissable={false} className="font-sans">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="font-bold text-slate-800 text-lg pt-6 text-center block">
                Recover Draft Application?
              </ModalHeader>
              <ModalBody className="text-center text-slate-600 text-sm">
                We found a saved draft for a <span className="capitalize font-semibold text-blue-600">{recoveredDraft?.loanType} Loan</span> from{' '}
                {recoveredDraft && new Date(recoveredDraft.timestamp).toLocaleString()}. Would you like to resume?
              </ModalBody>
              <ModalFooter className="flex justify-center gap-3 pb-6 pt-4">
                <Button color="danger" variant="flat" onClick={handleStartFresh} className="rounded-xl font-semibold">
                  Start Fresh
                </Button>
                <Button color="primary" onClick={handleResumeDraft} className="bg-blue-600 text-white font-semibold rounded-xl">
                  Resume Draft
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default LoanApplicationForm;

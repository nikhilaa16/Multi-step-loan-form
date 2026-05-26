import { Button, Input, Select, SelectItem } from '@heroui/react';
import { Controller, useSmartStepper } from 'smartstepper';

const bankList = [
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank (PNB)',
  'Bank of Baroda (BoB)',
  'Canara Bank',
  'Union Bank of India',
  'IndusInd Bank',
];

export default function Step5aBankDetails() {
  const { control, navigateToNextStep, navigateToPreviousStep, watchStepperFieldValues } = useSmartStepper();

  const loanType = watchStepperFieldValues('loanType') || 'personal';
  const loanAmount = Number(watchStepperFieldValues('loanAmount')) || 0;

  // Determine if Co-Applicant Step was active to decide where the "Back" button goes
  const isCoApplicantActive =
    loanType === 'home' ||
    (loanType === 'personal' && loanAmount > 500000) ||
    (loanType === 'business' && loanAmount > 2000000);

  const handleBack = () => {
    if (isCoApplicantActive) {
      navigateToPreviousStep(); // Back to coApplicant
    } else {
      navigateToPreviousStep(); // Back to employmentDetails
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Bank Account Details</h2>
        <p className="text-sm text-slate-500 mt-1">
          Specify the bank account where you would like the loan amount to be disbursed and from which auto-debit repayments will be set up.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          name="bankName"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              {...field}
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0];
                field.onChange(val);
              }}
              label="Select Bank"
              placeholder="Select your bank"
              variant="bordered"
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              classNames={{
                trigger: 'h-12 border-slate-200 focus-within:border-blue-500',
              }}
            >
              {bankList.map((bank) => (
                <SelectItem key={bank}>
                  {bank}
                </SelectItem>
              ))}
            </Select>
          )}
        />

        <Controller
          name="accountType"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              {...field}
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0];
                field.onChange(val);
              }}
              label="Account Type"
              placeholder="Select account type"
              variant="bordered"
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              classNames={{
                trigger: 'h-12 border-slate-200 focus-within:border-blue-500',
              }}
            >
              <SelectItem key="savings">Savings Account</SelectItem>
              <SelectItem key="current">Current Account</SelectItem>
            </Select>
          )}
        />

        <Controller
          name="accountNumber"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="password"
              label="Bank Account Number"
              placeholder="Enter bank account number"
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
          name="confirmAccountNumber"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="text"
              label="Confirm Bank Account Number"
              placeholder="Re-enter bank account number"
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
          name="ifscCode"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              label="Bank IFSC Code"
              placeholder="e.g. SBIN0001234"
              variant="bordered"
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              classNames={{
                input: 'uppercase font-mono tracking-wider',
                inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
              }}
            />
          )}
        />
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-100">
        <Button
          type="button"
          variant="bordered"
          size="lg"
          onClick={handleBack}
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

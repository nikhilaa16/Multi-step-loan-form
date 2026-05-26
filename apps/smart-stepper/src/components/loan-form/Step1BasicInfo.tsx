import { Button, Input, Radio, RadioGroup, Select, SelectItem } from '@heroui/react';
import { Controller, useSmartStepper } from 'smartstepper';
import { formatIndianCurrency } from './utils';
import { useEffect } from 'react';

export default function Step1BasicInfo() {
  const { control, navigateToNextStep, watchStepperFieldValues, setStepperFieldValues } = useSmartStepper();

  const loanType = watchStepperFieldValues('loanType');
  const loanAmount = watchStepperFieldValues('loanAmount');

  // Purpose options based on Loan Type
  const purposeOptions: Record<string, { label: string; value: string }[]> = {
    personal: [
      { label: 'Medical Expense', value: 'medical' },
      { label: 'Debt Consolidation', value: 'debt_consolidation' },
      { label: 'Education', value: 'education' },
      { label: 'Wedding / Family Event', value: 'wedding' },
      { label: 'Travel', value: 'travel' },
      { label: 'Home Renovation', value: 'renovation' },
      { label: 'Other', value: 'other' },
    ],
    home: [
      { label: 'Property Purchase', value: 'purchase' },
      { label: 'Home Construction', value: 'construction' },
      { label: 'Home Renovation / Repair', value: 'renovation' },
      { label: 'Home Extension', value: 'extension' },
      { label: 'Other', value: 'other' },
    ],
    business: [
      { label: 'Working Capital', value: 'working_capital' },
      { label: 'Machinery / Equipment Purchase', value: 'equipment' },
      { label: 'Business Expansion', value: 'expansion' },
      { label: 'Marketing & Advertising', value: 'marketing' },
      { label: 'Other', value: 'other' },
    ],
  };

  // Reset tenure and purpose if loan type changes
  useEffect(() => {
    if (loanType) {
      setStepperFieldValues('loanTenure', '');
      setStepperFieldValues('loanPurpose', '');
    }
  }, [loanType, setStepperFieldValues]);

  // Tenure options depending on Loan Type
  const getTenureOptions = () => {
    if (loanType === 'personal') {
      return [12, 24, 36, 48, 60].map((m) => ({ label: `${m} Months (${m / 12} Years)`, value: String(m) }));
    }
    if (loanType === 'home') {
      return [60, 120, 180, 240, 300, 360].map((m) => ({ label: `${m} Months (${m / 12} Years)`, value: String(m) }));
    }
    if (loanType === 'business') {
      return [12, 24, 36, 48, 60, 72, 84, 96, 108, 120].map((m) => ({
        label: `${m} Months (${m / 12} Years)`,
        value: String(m),
      }));
    }
    return [];
  };

  const getAmountLimitsText = () => {
    if (loanType === 'personal') return 'Min: ₹50,000 | Max: ₹10,00,000';
    if (loanType === 'home') return 'Min: ₹50,000 | Max: ₹1,00,00,000';
    if (loanType === 'business') return 'Min: ₹50,000 | Max: ₹50,00,000';
    return '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Select Loan Type & Amount</h2>
        <p className="text-sm text-slate-500 mt-1">
          Select the type of loan you wish to apply for and indicate your desired amount.
        </p>
      </div>

      <Controller
        name="loanType"
        control={control}
        render={({ field, fieldState }) => (
          <RadioGroup
            {...field}
            onValueChange={(val) => field.onChange(val)}
            label="What kind of loan do you need?"
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            classNames={{
              wrapper: 'grid grid-cols-1 md:grid-cols-3 gap-4 mt-2',
            }}
          >
            <Radio
              value="personal"
              classNames={{
                wrapper: 'border-2 border-slate-200 rounded-xl p-4 flex flex-col items-start gap-1 cursor-pointer w-full hover:border-blue-500',
              }}
              description="Max ₹10 Lakhs | 12-60 months"
            >
              <span className="font-semibold text-slate-700">Personal Loan</span>
            </Radio>
            <Radio
              value="home"
              classNames={{
                wrapper: 'border-2 border-slate-200 rounded-xl p-4 flex flex-col items-start gap-1 cursor-pointer w-full hover:border-blue-500',
              }}
              description="Max ₹1 Crore | 60-360 months"
            >
              <span className="font-semibold text-slate-700">Home Loan</span>
            </Radio>
            <Radio
              value="business"
              classNames={{
                wrapper: 'border-2 border-slate-200 rounded-xl p-4 flex flex-col items-start gap-1 cursor-pointer w-full hover:border-blue-500',
              }}
              description="Max ₹50 Lakhs | 12-120 months"
            >
              <span className="font-semibold text-slate-700">Business Loan</span>
            </Radio>
          </RadioGroup>
        )}
      />

      {loanType && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Controller
              name="loanAmount"
              control={control}
              render={({ field, fieldState }) => (
                <div>
                  <Input
                    {...field}
                    type="number"
                    label="Desired Loan Amount (INR)"
                    placeholder="Enter amount"
                    variant="bordered"
                    description={getAmountLimitsText()}
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    startContent={<span className="text-slate-400 font-semibold">₹</span>}
                    classNames={{
                      input: 'text-base font-semibold text-slate-800',
                      inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
                    }}
                  />
                  {loanAmount && !isNaN(Number(loanAmount)) && Number(loanAmount) >= 50000 && (
                    <div className="mt-2 text-sm text-green-600 font-medium">
                      In Words: {formatIndianCurrency(Number(loanAmount))}
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          <Controller
            name="loanTenure"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                {...field}
                selectedKeys={field.value ? [String(field.value)] : []}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0];
                  field.onChange(val);
                }}
                label="Desired Tenure"
                placeholder="Select tenure duration"
                variant="bordered"
                isInvalid={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                classNames={{
                  trigger: 'h-12 border-slate-200 focus-within:border-blue-500',
                }}
              >
                {getTenureOptions().map((opt) => (
                  <SelectItem key={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </Select>
            )}
          />

          <Controller
            name="loanPurpose"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                {...field}
                selectedKeys={field.value ? [field.value] : []}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0];
                  field.onChange(val);
                }}
                label="Purpose of Loan"
                placeholder="Select purpose"
                variant="bordered"
                isInvalid={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                classNames={{
                  trigger: 'h-12 border-slate-200 focus-within:border-blue-500',
                }}
              >
                {(purposeOptions[loanType] || []).map((opt) => (
                  <SelectItem key={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </Select>
            )}
          />

          <Controller
            name="referralCode"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Referral Code (Optional)"
                placeholder="Enter 6-10 digit code"
                variant="bordered"
                isInvalid={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                classNames={{
                  input: 'text-base text-slate-800',
                  inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
                }}
              />
            )}
          />
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button
          type="button"
          color="primary"
          size="lg"
          onClick={() => navigateToNextStep()}
          disabled={!loanType}
          className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md rounded-xl h-12"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}

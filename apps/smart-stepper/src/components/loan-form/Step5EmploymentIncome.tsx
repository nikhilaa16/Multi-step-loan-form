import { Button, Input, Radio, RadioGroup, Select, SelectItem, Textarea } from '@heroui/react';
import { Controller, useSmartStepper } from 'smartstepper';
import { formatIndianCurrency } from './utils';

export default function Step5EmploymentIncome() {
  const { control, navigateToNextStep, navigateToPreviousStep, watchStepperFieldValues, setStepperFieldValues } = useSmartStepper();

  const loanType = watchStepperFieldValues('loanType') || 'personal';
  const employmentType = watchStepperFieldValues('employmentType');
  
  const monthlyNetSalary = watchStepperFieldValues('monthlyNetSalary');
  const annualTurnover = watchStepperFieldValues('annualTurnover');
  const monthlyIncome = watchStepperFieldValues('monthlyIncome');

  const isSalaried = employmentType === 'salaried';
  const isSelfEmployed = employmentType === 'self-employed';
  const isBusinessOwner = employmentType === 'business-owner';

  const isBusinessLoan = loanType === 'business';

  // Business Type Options
  const businessTypeOptions = [
    { label: 'Sole Proprietorship', value: 'proprietorship' },
    { label: 'Partnership Firm', value: 'partnership' },
    { label: 'Private Limited Company (Pvt Ltd)', value: 'pvt_ltd' },
    { label: 'Limited Liability Partnership (LLP)', value: 'llp' },
    { label: 'One Person Company (OPC)', value: 'opc' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Employment & Income Details</h2>
        <p className="text-sm text-slate-500 mt-1">
          Provide your current employment status and financial income details.
        </p>
      </div>

      <div className="space-y-6">
        <Controller
          name="employmentType"
          control={control}
          render={({ field, fieldState }) => (
            <RadioGroup
              {...field}
              onValueChange={(val) => {
                field.onChange(val);
                // Clear other subform values
                setStepperFieldValues('companyName', '');
                setStepperFieldValues('designation', '');
                setStepperFieldValues('monthlyNetSalary', '');
                setStepperFieldValues('yearsOfExperience', '');
                setStepperFieldValues('businessName', '');
                setStepperFieldValues('businessType', '');
                setStepperFieldValues('annualTurnover', '');
                setStepperFieldValues('yearsInBusiness', '');
                setStepperFieldValues('monthlyIncome', '');
                setStepperFieldValues('gstNumber', '');
                setStepperFieldValues('businessAddress', '');
              }}
              label="Select your Employment Type"
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              classNames={{
                wrapper: 'grid grid-cols-1 md:grid-cols-3 gap-4 mt-2',
              }}
            >
              <Radio
                value="salaried"
                disabled={isBusinessLoan}
                classNames={{
                  wrapper: `border-2 border-slate-200 rounded-xl p-4 flex flex-col items-start gap-1 cursor-pointer w-full hover:border-blue-500 ${
                    isBusinessLoan ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''
                  }`,
                }}
                description={isBusinessLoan ? 'Not allowed for Business Loans' : 'Regular salary from employer'}
              >
                <span className="font-semibold text-slate-700">Salaried</span>
              </Radio>
              <Radio
                value="self-employed"
                classNames={{
                  wrapper: 'border-2 border-slate-200 rounded-xl p-4 flex flex-col items-start gap-1 cursor-pointer w-full hover:border-blue-500',
                }}
                description="Freelancers, Professionals"
              >
                <span className="font-semibold text-slate-700">Self-Employed</span>
              </Radio>
              <Radio
                value="business-owner"
                classNames={{
                  wrapper: 'border-2 border-slate-200 rounded-xl p-4 flex flex-col items-start gap-1 cursor-pointer w-full hover:border-blue-500',
                }}
                description="Owns registered business / firm"
              >
                <span className="font-semibold text-slate-700">Business Owner</span>
              </Radio>
            </RadioGroup>
          )}
        />

        {/* ==========================================
            💼 SALARIED SUB-FORM
            ========================================== */}
        {isSalaried && (
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-6">
            <h3 className="font-semibold text-slate-700 text-base">Salaried Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="companyName"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Company Name"
                    placeholder="Enter employer company name"
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
                name="designation"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Current Designation"
                    placeholder="e.g. Software Engineer"
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
                name="monthlyNetSalary"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      type="number"
                      label="Monthly Net Take-Home Salary"
                      placeholder="e.g. 50000"
                      variant="bordered"
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      startContent={<span className="text-slate-400 font-semibold">₹</span>}
                      classNames={{
                        input: 'text-base font-semibold',
                        inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
                      }}
                    />
                    {monthlyNetSalary && !isNaN(Number(monthlyNetSalary)) && (
                      <div className="mt-1.5 text-xs text-green-600 font-semibold">
                        In Words: {formatIndianCurrency(Number(monthlyNetSalary))}
                      </div>
                    )}
                  </div>
                )}
              />

              <Controller
                name="yearsOfExperience"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Total Years of Work Experience"
                    placeholder="e.g. 5"
                    variant="bordered"
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    classNames={{
                      inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
                    }}
                  />
                )}
              />
            </div>
          </div>
        )}

        {/* ==========================================
            💼 SELF-EMPLOYED SUB-FORM
            ========================================== */}
        {isSelfEmployed && (
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-6">
            <h3 className="font-semibold text-slate-700 text-base">Self-Employed / Professional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="businessName"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Business / Practice Name"
                    placeholder="Enter practice/firm name"
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
                name="businessType"
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) => {
                      const val = Array.from(keys)[0];
                      field.onChange(val);
                    }}
                    label="Business Structure"
                    placeholder="Select structure"
                    variant="bordered"
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    classNames={{
                      trigger: 'h-12 border-slate-200 focus-within:border-blue-500',
                    }}
                  >
                    {businessTypeOptions.map((opt) => (
                      <SelectItem key={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />

              <Controller
                name="annualTurnover"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      type="number"
                      label="Annual Turnover / Gross Receipts (INR)"
                      placeholder="e.g. 600000"
                      variant="bordered"
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      startContent={<span className="text-slate-400 font-semibold">₹</span>}
                      classNames={{
                        input: 'text-base font-semibold',
                        inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
                      }}
                    />
                    {annualTurnover && !isNaN(Number(annualTurnover)) && (
                      <div className="mt-1.5 text-xs text-green-600 font-semibold">
                        In Words: {formatIndianCurrency(Number(annualTurnover))}
                      </div>
                    )}
                  </div>
                )}
              />

              <Controller
                name="monthlyIncome"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      type="number"
                      label="Average Monthly Income (INR)"
                      placeholder="e.g. 50000"
                      variant="bordered"
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      startContent={<span className="text-slate-400 font-semibold">₹</span>}
                      classNames={{
                        input: 'text-base font-semibold',
                        inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
                      }}
                    />
                    {monthlyIncome && !isNaN(Number(monthlyIncome)) && (
                      <div className="mt-1.5 text-xs text-green-600 font-semibold">
                        In Words: {formatIndianCurrency(Number(monthlyIncome))}
                      </div>
                    )}
                  </div>
                )}
              />

              <Controller
                name="yearsInBusiness"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Years in Business / Practice (Min: 2)"
                    placeholder="e.g. 3"
                    variant="bordered"
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    classNames={{
                      inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
                    }}
                  />
                )}
              />
            </div>
          </div>
        )}

        {/* ==========================================
            💼 BUSINESS OWNER SUB-FORM
            ========================================== */}
        {isBusinessOwner && (
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-6">
            <h3 className="font-semibold text-slate-700 text-base">Business Owner Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="businessName"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Registered Business Name"
                    placeholder="Enter registered business name"
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
                name="businessType"
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) => {
                      const val = Array.from(keys)[0];
                      field.onChange(val);
                    }}
                    label="Business Entity Type"
                    placeholder="Select entity type"
                    variant="bordered"
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    classNames={{
                      trigger: 'h-12 border-slate-200 focus-within:border-blue-500',
                    }}
                  >
                    {businessTypeOptions.map((opt) => (
                      <SelectItem key={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />

              <Controller
                name="annualTurnover"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <Input
                      {...field}
                      type="number"
                      label="Annual Business Turnover (INR)"
                      placeholder="e.g. 1500000"
                      variant="bordered"
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      startContent={<span className="text-slate-400 font-semibold">₹</span>}
                      classNames={{
                        input: 'text-base font-semibold',
                        inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
                      }}
                    />
                    {annualTurnover && !isNaN(Number(annualTurnover)) && (
                      <div className="mt-1.5 text-xs text-green-600 font-semibold">
                        In Words: {formatIndianCurrency(Number(annualTurnover))}
                      </div>
                    )}
                  </div>
                )}
              />

              <Controller
                name="yearsInBusiness"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Years in Business Operations (Min: 2)"
                    placeholder="e.g. 4"
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
                name="gstNumber"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="GSTIN Number (15 Alphanumeric)"
                    placeholder="e.g. 22AAAAA1111A1Z5"
                    variant="bordered"
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    classNames={{
                      input: 'uppercase font-mono',
                      inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
                    }}
                  />
                )}
              />
            </div>

            <Controller
              name="businessAddress"
              control={control}
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  label="Registered Business Office Address"
                  placeholder="Enter full office/business address"
                  variant="bordered"
                  isInvalid={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  classNames={{
                    input: 'text-base',
                    inputWrapper: 'border-slate-200 focus-within:border-blue-500',
                  }}
                />
              )}
            />
          </div>
        )}
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
          disabled={!employmentType}
          className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md rounded-xl h-12"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}

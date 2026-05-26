import { Button, Checkbox, Input, Select, SelectItem } from '@heroui/react';
import { Controller, useSmartStepper } from 'smartstepper';
import { lookupPinCode } from './utils';

export default function Step4AddressInfo() {
  const { control, navigateToNextStep, navigateToPreviousStep, watchStepperFieldValues, setStepperFieldValues } = useSmartStepper();

  const residenceType = watchStepperFieldValues('residenceType');
  const yearsAtCurrentAddress = watchStepperFieldValues('yearsAtCurrentAddress');
  const sameAsPermanent = watchStepperFieldValues('sameAsPermanent') ?? true;

  // Watch PIN codes to auto-fill city/state
  const handlePinCodeChange = (e: React.ChangeEvent<HTMLInputElement>, fieldNamePrefix: '' | 'prev' | 'perm') => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 6);
    const formFieldName = fieldNamePrefix ? `${fieldNamePrefix}PinCode` : 'pinCode';
    setStepperFieldValues(formFieldName, val);

    if (val.length === 6) {
      const location = lookupPinCode(val);
      if (location) {
        if (!fieldNamePrefix) {
          setStepperFieldValues('city', location.city);
          setStepperFieldValues('state', location.state);
        } else if (fieldNamePrefix === 'prev') {
          setStepperFieldValues('prevCity', location.city);
          setStepperFieldValues('prevState', location.state);
        } else if (fieldNamePrefix === 'perm') {
          setStepperFieldValues('permCity', location.city);
          setStepperFieldValues('permState', location.state);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Address Information</h2>
        <p className="text-sm text-slate-500 mt-1">
          Specify your current residential details. PIN codes will auto-populate City and State.
        </p>
      </div>

      <div className="space-y-6">
        {/* CURRENT ADDRESS */}
        <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-4">
          <h3 className="font-semibold text-slate-700 text-base">Current Residential Address</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Controller
              name="pinCode"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="PIN Code (6 digits)"
                  placeholder="e.g. 560001"
                  variant="bordered"
                  isInvalid={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  onChange={(e) => handlePinCodeChange(e, '')}
                  classNames={{
                    inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
                  }}
                />
              )}
            />

            <Controller
              name="city"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="City"
                  placeholder="City"
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
              name="state"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="State"
                  placeholder="State"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="currentAddressLine1"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Flat / House / Building No."
                  placeholder="Address Line 1"
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
              name="currentAddressLine2"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Street / Area / Landmark"
                  placeholder="Address Line 2 (Optional)"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Controller
              name="residenceType"
              control={control}
              render={({ field, fieldState }) => (
                <Select
                  {...field}
                  selectedKeys={field.value ? [field.value] : []}
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0];
                    field.onChange(val);
                    if (val !== 'rented') {
                      setStepperFieldValues('rentAmount', '');
                    }
                  }}
                  label="Residence Type"
                  placeholder="Select type"
                  variant="bordered"
                  isInvalid={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  classNames={{
                    trigger: 'h-12 border-slate-200 focus-within:border-blue-500',
                  }}
                >
                  <SelectItem key="owned">Owned</SelectItem>
                  <SelectItem key="rented">Rented</SelectItem>
                  <SelectItem key="company">Provided by Company</SelectItem>
                  <SelectItem key="family">Living with Family</SelectItem>
                </Select>
              )}
            />

            {residenceType === 'rented' && (
              <Controller
                name="rentAmount"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Monthly Rent (INR)"
                    placeholder="Rent amount"
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
            )}

            <Controller
              name="yearsAtCurrentAddress"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  type="number"
                  label="Years at Current Address"
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

        {/* PREVIOUS ADDRESS (If current years < 1) */}
        {yearsAtCurrentAddress !== undefined && yearsAtCurrentAddress !== '' && Number(yearsAtCurrentAddress) < 1 && (
          <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl space-y-4">
            <div>
              <h3 className="font-semibold text-amber-800 text-base">Previous Address</h3>
              <p className="text-xs text-amber-600">Since you have lived at your current address for less than a year, your previous address is required.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Controller
                name="prevPinCode"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Previous PIN Code"
                    placeholder="e.g. 560001"
                    variant="bordered"
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    onChange={(e) => handlePinCodeChange(e, 'prev')}
                    classNames={{
                      inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
                    }}
                  />
                )}
              />

              <Controller
                name="prevCity"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Previous City"
                    placeholder="City"
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
                name="prevState"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Previous State"
                    placeholder="State"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="prevAddressLine1"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Previous Flat/House No."
                    placeholder="Address Line 1"
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
                name="prevAddressLine2"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Previous Area/Landmark"
                    placeholder="Address Line 2 (Optional)"
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

        {/* SAME AS PERMANENT CHECKBOX */}
        <div>
          <Controller
            name="sameAsPermanent"
            control={control}
            render={({ field }) => (
              <Checkbox
                isSelected={field.value !== false}
                onValueChange={(checked) => {
                  field.onChange(checked);
                  if (checked) {
                    setStepperFieldValues('permAddressLine1', '');
                    setStepperFieldValues('permAddressLine2', '');
                    setStepperFieldValues('permPinCode', '');
                    setStepperFieldValues('permCity', '');
                    setStepperFieldValues('permState', '');
                  }
                }}
              >
                <span className="text-sm font-semibold text-slate-700">Permanent address is same as current residential address</span>
              </Checkbox>
            )}
          />
        </div>

        {/* PERMANENT ADDRESS */}
        {!sameAsPermanent && (
          <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-4">
            <h3 className="font-semibold text-slate-700 text-base">Permanent Address</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Controller
                name="permPinCode"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Permanent PIN Code"
                    placeholder="e.g. 560001"
                    variant="bordered"
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    onChange={(e) => handlePinCodeChange(e, 'perm')}
                    classNames={{
                      inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
                    }}
                  />
                )}
              />

              <Controller
                name="permCity"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Permanent City"
                    placeholder="City"
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
                name="permState"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Permanent State"
                    placeholder="State"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="permAddressLine1"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Permanent Flat/House No."
                    placeholder="Address Line 1"
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
                name="permAddressLine2"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Permanent Area/Landmark"
                    placeholder="Address Line 2 (Optional)"
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

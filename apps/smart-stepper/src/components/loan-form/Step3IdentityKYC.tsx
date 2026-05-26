import { Button, Checkbox, Input } from '@heroui/react';
import { useState } from 'react';
import { Controller, useSmartStepper } from 'smartstepper';
import { simulatePANVerification, simulateAadhaarVerification } from './utils';

export default function Step3IdentityKYC() {
  const { control, navigateToNextStep, navigateToPreviousStep, watchStepperFieldValues, setStepperFieldValues } = useSmartStepper();

  const loanType = watchStepperFieldValues('loanType') || 'personal';
  const loanAmount = Number(watchStepperFieldValues('loanAmount')) || 0;

  const panVerified = watchStepperFieldValues('panVerified');
  const aadhaarVerified = watchStepperFieldValues('aadhaarVerified');
  const panNumber = watchStepperFieldValues('panNumber');
  const aadhaarNumber = watchStepperFieldValues('aadhaarNumber');

  const showPassport = loanType === 'home' && loanAmount > 5000000;

  // Verification states
  const [panVerifying, setPanVerifying] = useState(false);
  const [panError, setPanError] = useState('');
  
  const [aadhaarVerifying, setAadhaarVerifying] = useState(false);
  const [aadhaarError, setAadhaarError] = useState('');

  const handleVerifyPAN = async () => {
    if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
      setPanError('Please enter a valid 10-character PAN in uppercase (e.g. AAAAA1111A).');
      return;
    }
    setPanError('');
    setPanVerifying(true);
    const res = await simulatePANVerification(panNumber, loanType);
    setPanVerifying(false);
    if (res.success) {
      setStepperFieldValues('panVerified', true);
    } else {
      setPanError(res.message);
    }
  };

  const handleVerifyAadhaar = async () => {
    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      setAadhaarError('Aadhaar must be exactly 12 digits.');
      return;
    }
    setAadhaarError('');
    setAadhaarVerifying(true);
    const res = await simulateAadhaarVerification(aadhaarNumber);
    setAadhaarVerifying(false);
    if (res.success) {
      setStepperFieldValues('aadhaarVerified', true);
    } else {
      setAadhaarError(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Identity Verification (KYC)</h2>
        <p className="text-sm text-slate-500 mt-1">
          Perform real-time simulated verification of your PAN and Aadhaar identity details.
        </p>
      </div>

      <div className="space-y-6">
        {/* PAN Input & Verification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 border border-slate-100 p-5 rounded-2xl">
          <div className="md:col-span-2">
            <Controller
              name="panNumber"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  disabled={panVerified}
                  label="PAN Number (10 alphanumeric)"
                  placeholder="Enter PAN Number (e.g. ABCDE1234F)"
                  variant="bordered"
                  isInvalid={!!fieldState.error || !!panError}
                  errorMessage={fieldState.error?.message || panError}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    field.onChange(val);
                    setStepperFieldValues('panVerified', false);
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
            {panVerified ? (
              <span className="h-12 flex items-center justify-center text-green-600 font-bold bg-green-50 rounded-xl border border-green-200">
                ✓ PAN Verified
              </span>
            ) : (
              <Button
                color="primary"
                onClick={handleVerifyPAN}
                isLoading={panVerifying}
                disabled={!panNumber || panNumber.length !== 10}
                className="w-full h-12 bg-blue-600 text-white font-semibold rounded-xl"
              >
                Verify PAN
              </Button>
            )}
          </div>
        </div>

        {/* Aadhaar Input & Verification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 border border-slate-100 p-5 rounded-2xl">
          <div className="md:col-span-2">
            <Controller
              name="aadhaarNumber"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  disabled={aadhaarVerified}
                  label="Aadhaar Number (12 digits)"
                  placeholder="Enter Aadhaar Number (e.g. 367705963248)"
                  variant="bordered"
                  isInvalid={!!fieldState.error || !!aadhaarError}
                  errorMessage={fieldState.error?.message || aadhaarError}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    field.onChange(val);
                    setStepperFieldValues('aadhaarVerified', false);
                    setAadhaarError('');
                  }}
                  classNames={{
                    input: 'font-mono tracking-widest text-base',
                    inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
                  }}
                />
              )}
            />
          </div>
          <div>
            {aadhaarVerified ? (
              <span className="h-12 flex items-center justify-center text-green-600 font-bold bg-green-50 rounded-xl border border-green-200">
                ✓ Aadhaar Verified
              </span>
            ) : (
              <Button
                color="primary"
                onClick={handleVerifyAadhaar}
                isLoading={aadhaarVerifying}
                disabled={!aadhaarNumber || aadhaarNumber.length !== 12}
                className="w-full h-12 bg-blue-600 text-white font-semibold rounded-xl"
              >
                Verify Aadhaar
              </Button>
            )}
          </div>
        </div>

        {/* Aadhaar Consent */}
        <div className="pt-2">
          <Controller
            name="aadhaarConsent"
            control={control}
            render={({ field, fieldState }) => (
              <Checkbox
                isSelected={field.value === true}
                onValueChange={(val) => field.onChange(val)}
                isInvalid={!!fieldState.error}
                className="items-start"
              >
                <span className="text-slate-600 text-sm leading-relaxed block">
                  I hereby provide my explicit consent to LendSwift to verify my Aadhaar credentials with UIDAI and use my details for KYC and credit check purposes in accordance with RBI Digital Lending guidelines.
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

        {/* Optional Document Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <Controller
            name="voterId"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Voter ID Card Number (Optional)"
                placeholder="e.g. ABC1234567"
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

          {showPassport && (
            <Controller
              name="passport"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Passport Number (Required for Home Loans > 50L)"
                  placeholder="e.g. Z1234567"
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
          )}
        </div>
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
          disabled={!panVerified || !aadhaarVerified}
          className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md rounded-xl h-12"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}

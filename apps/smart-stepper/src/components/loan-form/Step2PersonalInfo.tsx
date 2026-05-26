import { Button, Input, Radio, RadioGroup, Select, SelectItem } from '@heroui/react';
import { useState } from 'react';
import { Controller, useSmartStepper } from 'smartstepper';
import { simulateOTPVerification } from './utils';

export default function Step2PersonalInfo() {
  const { control, navigateToNextStep, navigateToPreviousStep, watchStepperFieldValues, setStepperFieldValues } = useSmartStepper();

  const emailVerified = watchStepperFieldValues('emailVerified');
  const mobileVerified = watchStepperFieldValues('mobileVerified');
  const email = watchStepperFieldValues('email');
  const mobileNumber = watchStepperFieldValues('mobileNumber');

  // OTP simulation states
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpVerifying, setEmailOtpVerifying] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState('');

  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileOtpVerifying, setMobileOtpVerifying] = useState(false);
  const [mobileOtpError, setMobileOtpError] = useState('');

  const handleSendEmailOtp = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailOtpError('Please enter a valid email before sending OTP');
      return;
    }
    setEmailOtpError('');
    setEmailOtpSent(true);
    // Auto fill or help user
  };

  const handleConfirmEmailOtp = async () => {
    setEmailOtpVerifying(true);
    setEmailOtpError('');
    const res = await simulateOTPVerification(email, emailOtp);
    setEmailOtpVerifying(false);
    if (res.success) {
      setStepperFieldValues('emailVerified', true);
      setEmailOtpSent(false);
    } else {
      setEmailOtpError(res.message);
    }
  };

  const handleSendMobileOtp = () => {
    if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber)) {
      setMobileOtpError('Please enter a valid 10-digit mobile number before sending OTP');
      return;
    }
    setMobileOtpError('');
    setMobileOtpSent(true);
  };

  const handleConfirmMobileOtp = async () => {
    setMobileOtpVerifying(true);
    setMobileOtpError('');
    const res = await simulateOTPVerification(mobileNumber, mobileOtp);
    setMobileOtpVerifying(false);
    if (res.success) {
      setStepperFieldValues('mobileVerified', true);
      setMobileOtpSent(false);
    } else {
      setMobileOtpError(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Personal Information</h2>
        <p className="text-sm text-slate-500 mt-1">
          Provide your basic personal details. Note that email and mobile verification are mandatory.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          name="fullName"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              label="Full Name (as per PAN)"
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
          name="dob"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="date"
              label="Date of Birth"
              placeholder="DD/MM/YYYY"
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
          name="gender"
          control={control}
          render={({ field, fieldState }) => (
            <RadioGroup
              {...field}
              onValueChange={(val) => field.onChange(val)}
              label="Gender"
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              classNames={{ wrapper: 'flex flex-row gap-4 mt-1' }}
            >
              <Radio value="male">Male</Radio>
              <Radio value="female">Female</Radio>
              <Radio value="other">Other</Radio>
            </RadioGroup>
          )}
        />

        <Controller
          name="maritalStatus"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              {...field}
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0];
                field.onChange(val);
              }}
              label="Marital Status"
              placeholder="Select marital status"
              variant="bordered"
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              classNames={{
                trigger: 'h-12 border-slate-200 focus-within:border-blue-500',
              }}
            >
              <SelectItem key="single">Single</SelectItem>
              <SelectItem key="married">Married</SelectItem>
              <SelectItem key="divorced">Divorced</SelectItem>
              <SelectItem key="widowed">Widowed</SelectItem>
            </Select>
          )}
        />

        <Controller
          name="fatherName"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              label="Father's Full Name"
              placeholder="Enter father's name"
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
          name="motherName"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              label="Mother's Full Name"
              placeholder="Enter mother's name"
              variant="bordered"
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              classNames={{
                inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
              }}
            />
          )}
        />

        {/* Email with simulated OTP verification */}
        <div className="space-y-2">
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                type="email"
                disabled={emailVerified}
                label="Email Address"
                placeholder="Enter email address"
                variant="bordered"
                isInvalid={!!fieldState.error || !!emailOtpError}
                errorMessage={fieldState.error?.message || emailOtpError}
                endContent={
                  emailVerified ? (
                    <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                      ✓ Verified
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      color="primary"
                      onClick={handleSendEmailOtp}
                      disabled={!email || emailOtpSent}
                      className="bg-blue-600 text-white rounded-lg px-3 text-xs"
                    >
                      {emailOtpSent ? 'OTP Sent' : 'Verify'}
                    </Button>
                  )
                }
                classNames={{
                  inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
                }}
              />
            )}
          />

          {emailOtpSent && !emailVerified && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex gap-2 items-end">
              <Input
                type="text"
                label="Email OTP"
                placeholder="Enter 123456"
                value={emailOtp}
                onValueChange={setEmailOtp}
                variant="bordered"
                classNames={{
                  inputWrapper: 'h-10 border-slate-200',
                }}
              />
              <Button
                color="success"
                onClick={handleConfirmEmailOtp}
                isLoading={emailOtpVerifying}
                disabled={emailOtp.length !== 6}
                className="h-10 text-white font-semibold rounded-lg bg-green-600"
              >
                Confirm
              </Button>
            </div>
          )}
        </div>

        {/* Mobile with simulated OTP verification */}
        <div className="space-y-2">
          <Controller
            name="mobileNumber"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                disabled={mobileVerified}
                label="Mobile Number"
                placeholder="Enter mobile number"
                variant="bordered"
                isInvalid={!!fieldState.error || !!mobileOtpError}
                errorMessage={fieldState.error?.message || mobileOtpError}
                startContent={<span className="text-slate-400 font-semibold">+91</span>}
                endContent={
                  mobileVerified ? (
                    <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                      ✓ Verified
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      color="primary"
                      onClick={handleSendMobileOtp}
                      disabled={!mobileNumber || mobileOtpSent}
                      className="bg-blue-600 text-white rounded-lg px-3 text-xs"
                    >
                      {mobileOtpSent ? 'OTP Sent' : 'Verify'}
                    </Button>
                  )
                }
                classNames={{
                  inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
                }}
              />
            )}
          />

          {mobileOtpSent && !mobileVerified && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex gap-2 items-end">
              <Input
                type="text"
                label="Mobile OTP"
                placeholder="Enter 123456"
                value={mobileOtp}
                onValueChange={setMobileOtp}
                variant="bordered"
                classNames={{
                  inputWrapper: 'h-10 border-slate-200',
                }}
              />
              <Button
                color="success"
                onClick={handleConfirmMobileOtp}
                isLoading={mobileOtpVerifying}
                disabled={mobileOtp.length !== 6}
                className="h-10 text-white font-semibold rounded-lg bg-green-600"
              >
                Confirm
              </Button>
            </div>
          )}
        </div>

        <Controller
          name="alternateMobile"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              label="Alternate Mobile Number (Optional)"
              placeholder="Enter alternate number"
              variant="bordered"
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              startContent={<span className="text-slate-400 font-semibold">+91</span>}
              classNames={{
                inputWrapper: 'h-12 border-slate-200 focus-within:border-blue-500',
              }}
            />
          )}
        />
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-100">
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
          disabled={!emailVerified || !mobileVerified}
          className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md rounded-xl h-12"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}

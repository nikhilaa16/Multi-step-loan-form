import { z } from 'zod';

// ==========================================
// 🧮 Verhoeff Checksum Algorithm
// ==========================================
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

export function validateVerhoeff(aadhaar: string): boolean {
  if (!aadhaar || aadhaar.length !== 12 || !/^\d+$/.test(aadhaar)) {
    return false;
  }
  let c = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(aadhaar.charAt(11 - i), 10);
    c = d[c][p[i % 8][digit]];
  }
  return c === 0;
}

// ==========================================
// 💳 PAN Verification
// ==========================================
export function validatePAN(pan: string, loanType: string): boolean {
  if (!pan) return false;
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!regex.test(pan)) return false;
  const entityType = pan.charAt(3);
  if (loanType === 'personal' || loanType === 'home') {
    return entityType === 'P';
  }
  if (loanType === 'business') {
    return entityType === 'P' || entityType === 'C' || entityType === 'F';
  }
  return false;
}

// ==========================================
// 📅 Date/Age Helper
// ==========================================
export function getAge(dobString: string): number {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// ==========================================
// 🧱 Schemas for each form step
// ==========================================

export const step1Schema = z
  .object({
    loanType: z.enum(['personal', 'home', 'business'], {
      required_error: 'Loan type is required',
    }),
    loanAmount: z.coerce
      .number({ invalid_type_error: 'Loan amount must be a number' })
      .min(50000, 'Minimum loan amount is INR 50,000'),
    loanTenure: z.coerce
      .number({ invalid_type_error: 'Loan tenure must be a number' }),
    loanPurpose: z.string().min(1, 'Loan purpose is required'),
    referralCode: z
      .string()
      .optional()
      .refine(
        (val) => !val || (val.length >= 6 && val.length <= 10 && /^[a-zA-Z0-9]+$/.test(val)),
        'Referral code must be 6-10 alphanumeric characters'
      ),
  })
  .superRefine((data, ctx) => {
    // Validate Max Amount
    if (data.loanType === 'personal' && data.loanAmount > 1000000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Personal Loan amount cannot exceed INR 10,00,000',
        path: ['loanAmount'],
      });
    } else if (data.loanType === 'home' && data.loanAmount > 10000000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Home Loan amount cannot exceed INR 1,00,00,000',
        path: ['loanAmount'],
      });
    } else if (data.loanType === 'business' && data.loanAmount > 5000000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Business Loan amount cannot exceed INR 50,00,000',
        path: ['loanAmount'],
      });
    }

    // Validate Tenure Ranges
    const tenure = data.loanTenure;
    if (data.loanType === 'personal' && (tenure < 12 || tenure > 60)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Personal Loan tenure must be between 12 and 60 months',
        path: ['loanTenure'],
      });
    } else if (data.loanType === 'home' && (tenure < 60 || tenure > 360)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Home Loan tenure must be between 60 and 360 months',
        path: ['loanTenure'],
      });
    } else if (data.loanType === 'business' && (tenure < 12 || tenure > 120)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Business Loan tenure must be between 12 and 120 months',
        path: ['loanTenure'],
      });
    }
  });

export const step2Schema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be under 100 characters')
      .regex(/^[a-zA-Z\s.]+$/, 'Only letters, spaces, and periods are allowed'),
    dob: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['male', 'female', 'other'], {
      required_error: 'Gender is required',
    }),
    maritalStatus: z.string().min(1, 'Marital status is required'),
    fatherName: z
      .string()
      .min(2, "Father's name must be at least 2 characters")
      .max(100, "Father's name must be under 100 characters")
      .regex(/^[a-zA-Z\s.]+$/, 'Only letters, spaces, and periods are allowed'),
    motherName: z
      .string()
      .min(2, "Mother's name must be at least 2 characters")
      .max(100, "Mother's name must be under 100 characters")
      .regex(/^[a-zA-Z\s.]+$/, 'Only letters, spaces, and periods are allowed'),
    email: z.string().email('Invalid email address'),
    emailVerified: z.boolean().refine((val) => val === true, 'Email verification is required'),
    mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
    mobileVerified: z.boolean().refine((val) => val === true, 'Mobile verification is required'),
    alternateMobile: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit mobile number')
      .optional()
      .or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    // Check if alternate mobile matches mobile number
    if (data.alternateMobile && data.alternateMobile === data.mobileNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Alternate mobile number must differ from primary mobile number',
        path: ['alternateMobile'],
      });
    }

    // Check age limits (21-65 years)
    const age = getAge(data.dob);
    if (age < 21 || age > 65) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Applicant must be between 21 and 65 years of age',
        path: ['dob'],
      });
    }
  });

export const step3Schema = z
  .object({
    panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN must be in format AAAAA9999A'),
    panVerified: z.boolean().refine((val) => val === true, 'PAN verification is required'),
    aadhaarNumber: z.string().regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits'),
    aadhaarVerified: z.boolean().refine((val) => val === true, 'Aadhaar verification is required'),
    aadhaarConsent: z.boolean().refine((val) => val === true, 'Explicit consent is required to proceed'),
    voterId: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine((val) => !val || /^[A-Z]{3}\d{7}$/.test(val), 'Voter ID must be 3 letters followed by 7 digits'),
    passport: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine((val) => !val || /^[A-Z]\d{7}$/.test(val), 'Passport must be 1 letter followed by 7 digits'),
  });

export const step4Schema = z
  .object({
    currentAddressLine1: z.string().min(5, 'Address line 1 must be at least 5 characters').max(200),
    currentAddressLine2: z.string().optional(),
    pinCode: z.string().regex(/^\d{6}$/, 'PIN Code must be exactly 6 digits'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    residenceType: z.enum(['owned', 'rented', 'company', 'family'], {
      required_error: 'Residence type is required',
    }),
    rentAmount: z.coerce.number().optional(),
    yearsAtCurrentAddress: z.coerce
      .number({ invalid_type_error: 'Years must be a number' })
      .min(0, 'Cannot be negative')
      .max(50, 'Max 50 years'),

    // Previous address fields (Required if yearsAtCurrentAddress < 1)
    prevAddressLine1: z.string().optional(),
    prevAddressLine2: z.string().optional(),
    prevPinCode: z.string().optional(),
    prevCity: z.string().optional(),
    prevState: z.string().optional(),

    sameAsPermanent: z.boolean(),

    // Permanent address fields (Required if sameAsPermanent is false)
    permAddressLine1: z.string().optional(),
    permAddressLine2: z.string().optional(),
    permPinCode: z.string().optional(),
    permCity: z.string().optional(),
    permState: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Residence validation (rent amount is required if rented)
    if (data.residenceType === 'rented' && (!data.rentAmount || data.rentAmount <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Rent amount is required for rented properties',
        path: ['rentAmount'],
      });
    }

    // Previous address validation
    if (data.yearsAtCurrentAddress < 1) {
      if (!data.prevAddressLine1 || data.prevAddressLine1.length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Previous address line 1 is required (min 5 chars)',
          path: ['prevAddressLine1'],
        });
      }
      if (!data.prevPinCode || !/^\d{6}$/.test(data.prevPinCode)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Valid 6-digit previous PIN Code is required',
          path: ['prevPinCode'],
        });
      }
      if (!data.prevCity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Previous city is required',
          path: ['prevCity'],
        });
      }
      if (!data.prevState) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Previous state is required',
          path: ['prevState'],
        });
      }
    }

    // Permanent address validation
    if (!data.sameAsPermanent) {
      if (!data.permAddressLine1 || data.permAddressLine1.length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Permanent address line 1 is required (min 5 chars)',
          path: ['permAddressLine1'],
        });
      }
      if (!data.permPinCode || !/^\d{6}$/.test(data.permPinCode)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Valid 6-digit permanent PIN Code is required',
          path: ['permPinCode'],
        });
      }
      if (!data.permCity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Permanent city is required',
          path: ['permCity'],
        });
      }
      if (!data.permState) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Permanent state is required',
          path: ['permState'],
        });
      }
    }
  });

export const step5Schema = z
  .object({
    employmentType: z.enum(['salaried', 'self-employed', 'business-owner'], {
      required_error: 'Employment type is required',
    }),
    yearsOfExperience: z.coerce.number().optional(),

    // Salaried fields
    companyName: z.string().optional(),
    designation: z.string().optional(),
    monthlyNetSalary: z.coerce.number().optional(),

    // Self-employed & Business Owner fields
    businessName: z.string().optional(),
    businessType: z.string().optional(),
    annualTurnover: z.coerce.number().optional(),
    yearsInBusiness: z.coerce.number().optional(),

    // Self-employed specific
    monthlyIncome: z.coerce.number().optional(),

    // Business owner specific
    gstNumber: z.string().optional(),
    businessAddress: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const isSalaried = data.employmentType === 'salaried';
    const isSelfEmployed = data.employmentType === 'self-employed';
    const isBusinessOwner = data.employmentType === 'business-owner';

    // Years of experience is required for salaried
    if (isSalaried) {
      if (data.yearsOfExperience === undefined || data.yearsOfExperience < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Years of experience is required',
          path: ['yearsOfExperience'],
        });
      }
      if (!data.companyName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Company name is required',
          path: ['companyName'],
        });
      }
      if (!data.designation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Designation is required',
          path: ['designation'],
        });
      }
      if (!data.monthlyNetSalary || data.monthlyNetSalary < 15000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Minimum monthly net salary is INR 15,000',
          path: ['monthlyNetSalary'],
        });
      }
    }

    if (isSelfEmployed || isBusinessOwner) {
      if (!data.businessName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Business name is required',
          path: ['businessName'],
        });
      }
      if (!data.businessType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Business type is required',
          path: ['businessType'],
        });
      }
      if (!data.annualTurnover || data.annualTurnover < 300000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Minimum annual turnover is INR 3,00,000',
          path: ['annualTurnover'],
        });
      }
      if (!data.yearsInBusiness || data.yearsInBusiness < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Minimum 2 years in business is required',
          path: ['yearsInBusiness'],
        });
      }
    }

    if (isSelfEmployed) {
      if (!data.monthlyIncome || data.monthlyIncome <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Monthly income is required',
          path: ['monthlyIncome'],
        });
      }
    }

    if (isBusinessOwner) {
      const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/;
      if (!data.gstNumber || !gstRegex.test(data.gstNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Valid 15-character GSTIN is required (e.g. 22AAAAA1111A1Z5)',
          path: ['gstNumber'],
        });
      }
      if (!data.businessAddress || data.businessAddress.length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Valid business address is required',
          path: ['businessAddress'],
        });
      }
    }
  });

export const step6Schema = z.object({
  coApplicantName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be under 100 characters')
    .regex(/^[a-zA-Z\s.]+$/, 'Only letters, spaces, and periods are allowed'),
  relationship: z.enum(['spouse', 'parent', 'sibling', 'business-partner'], {
    required_error: 'Relationship is required',
  }),
  coApplicantPAN: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN must be in format AAAAA9999A'),
  coApplicantPANVerified: z.boolean().refine((val) => val === true, 'PAN verification is required'),
  coApplicantIncome: z.coerce.number().min(0, 'Income cannot be negative'),
  coApplicantConsent: z.boolean().refine((val) => val === true, 'Consent is required'),
  coApplicantSignature: z.string().min(1, 'Co-applicant signature is required'),
});

export const step7Schema = z.object({
  panCardFile: z.string().min(1, 'PAN Card copy is required'),
  aadhaarFrontFile: z.string().min(1, 'Aadhaar Card Front is required'),
  aadhaarBackFile: z.string().min(1, 'Aadhaar Card Back is required'),
  bankStatementFile: z.string().min(1, 'Bank statement (last 6 months) is required'),
  photoFile: z.string().min(1, 'Passport photograph is required'),
  primarySignature: z.string().min(1, 'E-Signature is required'),
  
  // Employment specific uploads
  salarySlipsFile: z.string().optional(),
  itrFile: z.string().optional(),
  
  // Product specific uploads
  propertyDocsFile: z.string().optional(),
  businessRegFile: z.string().optional(),
  gstReturnsFile: z.string().optional(),
}).superRefine((data, ctx) => {
  // Let external variables or parent context validations handle conditional files,
  // or we can handle them inside our custom component validation triggers.
});

export const bankDetailsSchema = z
  .object({
    bankName: z.string().min(1, 'Bank name is required'),
    accountType: z.enum(['savings', 'current'], {
      required_error: 'Account type is required',
    }),
    accountNumber: z.string().regex(/^\d{9,18}$/, 'Account number must be between 9 and 18 digits'),
    confirmAccountNumber: z.string().min(1, 'Please confirm your account number'),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format (e.g. SBIN0001234)'),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: 'Account numbers do not match',
    path: ['confirmAccountNumber'],
  });

export const step8Schema = z.object({
  confirmAccurate: z.boolean().refine((val) => val === true, 'You must confirm accuracy'),
  authoriseCreditCheck: z.boolean().refine((val) => val === true, 'You must authorise credit check'),
  agreeTerms: z.boolean().refine((val) => val === true, 'You must agree to the Terms and Conditions'),
  consentComms: z.boolean().refine((val) => val === true, 'You must consent to communications'),
});

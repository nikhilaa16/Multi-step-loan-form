// ==========================================
// 🇮🇳 PIN Code Lookup Database & Simulation
// ==========================================
const pinCodeDatabase: Record<string, { city: string; state: string }> = {
  '110001': { city: 'New Delhi', state: 'Delhi' },
  '110011': { city: 'New Delhi', state: 'Delhi' },
  '110020': { city: 'Okhla', state: 'Delhi' },
  '400001': { city: 'Mumbai', state: 'Maharashtra' },
  '400020': { city: 'Marine Lines', state: 'Maharashtra' },
  '400050': { city: 'Bandra', state: 'Maharashtra' },
  '560001': { city: 'Bengaluru', state: 'Karnataka' },
  '560037': { city: 'Marathahalli', state: 'Karnataka' },
  '560103': { city: 'Outer Ring Road', state: 'Karnataka' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu' },
  '600018': { city: 'Alwarpet', state: 'Tamil Nadu' },
  '700001': { city: 'Kolkata', state: 'West Bengal' },
  '700091': { city: 'Salt Lake', state: 'West Bengal' },
  '500001': { city: 'Hyderabad', state: 'Telangana' },
  '500081': { city: 'Madhapur', state: 'Telangana' },
  '380001': { city: 'Ahmedabad', state: 'Gujarat' },
  '380015': { city: 'Satellite', state: 'Gujarat' },
};

export function lookupPinCode(pin: string): { city: string; state: string } | null {
  if (!pin || pin.length !== 6 || !/^\d+$/.test(pin)) {
    return null;
  }
  
  // Direct match
  if (pinCodeDatabase[pin]) {
    return pinCodeDatabase[pin];
  }

  // Prefix based fallbacks for major Indian states
  const prefix = pin.substring(0, 2);
  switch (prefix) {
    case '11':
      return { city: 'Delhi NCR', state: 'Delhi' };
    case '12':
      return { city: 'Gurugram', state: 'Haryana' };
    case '13':
      return { city: 'Faridabad', state: 'Haryana' };
    case '14':
    case '15':
    case '16':
      return { city: 'Chandigarh', state: 'Punjab' };
    case '20':
    case '21':
    case '22':
    case '23':
    case '24':
    case '25':
    case '26':
    case '27':
    case '28':
      return { city: 'Lucknow', state: 'Uttar Pradesh' };
    case '30':
    case '31':
    case '32':
    case '33':
    case '34':
      return { city: 'Jaipur', state: 'Rajasthan' };
    case '36':
    case '37':
    case '38':
    case '39':
      return { city: 'Surat', state: 'Gujarat' };
    case '40':
    case '41':
    case '42':
    case '43':
    case '44':
      return { city: 'Pune', state: 'Maharashtra' };
    case '45':
    case '46':
    case '47':
    case '48':
      return { city: 'Indore', state: 'Madhya Pradesh' };
    case '50':
    case '51':
    case '52':
    case '53':
      return { city: 'Vijayawada', state: 'Andhra Pradesh' };
    case '56':
    case '57':
    case '58':
    case '59':
      return { city: 'Bengaluru Rural', state: 'Karnataka' };
    case '60':
    case '61':
    case '62':
    case '63':
    case '64':
      return { city: 'Coimbatore', state: 'Tamil Nadu' };
    case '67':
    case '68':
    case '69':
      return { city: 'Kochi', state: 'Kerala' };
    case '70':
    case '71':
    case '72':
    case '73':
    case '74':
      return { city: 'Kolkata Suburban', state: 'West Bengal' };
    default:
      return { city: 'Indian City', state: 'India' };
  }
}

// ==========================================
// 💸 Indian Currency Formatting
// ==========================================
export function formatIndianCurrency(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ==========================================
// 🚀 Verification Simulations (1.5s delay)
// ==========================================
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function simulatePANVerification(
  pan: string,
  loanType: string
): Promise<{ success: boolean; message: string }> {
  await delay(1500);
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!regex.test(pan)) {
    return { success: false, message: 'Invalid PAN structure. Must match AAAAA9999A.' };
  }
  
  const fourthChar = pan.charAt(3);
  if (loanType === 'personal' || loanType === 'home') {
    if (fourthChar !== 'P') {
      return {
        success: false,
        message: 'For personal and home loans, PAN must belong to an Individual (4th character must be "P").',
      };
    }
  } else if (loanType === 'business') {
    if (fourthChar !== 'P' && fourthChar !== 'C' && fourthChar !== 'F') {
      return {
        success: false,
        message: 'For business loans, PAN must belong to an Individual, Company, or Firm (4th character: P, C, or F).',
      };
    }
  }
  
  return { success: true, message: 'PAN Verified Successfully' };
}

import { validateVerhoeff } from './step-schemas';

export async function simulateAadhaarVerification(
  aadhaar: string
): Promise<{ success: boolean; message: string }> {
  await delay(1500);
  if (aadhaar.length !== 12 || !/^\d+$/.test(aadhaar)) {
    return { success: false, message: 'Aadhaar must be exactly 12 digits.' };
  }
  
  const isValidChecksum = validateVerhoeff(aadhaar);
  if (!isValidChecksum) {
    return { success: false, message: 'Aadhaar failed Verhoeff checksum validation.' };
  }
  
  return { success: true, message: 'Aadhaar Verified Successfully' };
}

export async function simulateOTPVerification(
  target: string, // email or mobile
  otp: string
): Promise<{ success: boolean; message: string }> {
  await delay(1200);
  if (otp === '123456') {
    return { success: true, message: 'OTP Verified Successfully' };
  }
  return { success: false, message: 'Incorrect OTP. Use "123456" for simulation.' };
}

import { useEffect, useRef, useState } from 'react';

const PASSPHRASE = 'lendswift-secret-passphrase-secure-2026';
const SALT_STRING = 'lendswift-static-salt-bytes';

// ==========================================
// 🔐 Web Crypto API Helper Functions
// ==========================================
async function getEncryptionKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const rawKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(PASSPHRASE),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  const salt = enc.encode(SALT_STRING);

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    rawKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data: unknown): Promise<string> {
  const enc = new TextEncoder();
  const key = await getEncryptionKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = enc.encode(JSON.stringify(data));

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoded
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  // Convert to binary string, then base64
  let binary = '';
  for (let i = 0; i < combined.byteLength; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}

export async function decryptData(encryptedBase64: string): Promise<unknown> {
  const key = await getEncryptionKey();
  const binary = atob(encryptedBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const iv = bytes.slice(0, 12);
  const ciphertext = bytes.slice(12);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    ciphertext
  );

  const dec = new TextDecoder();
  return JSON.parse(dec.decode(decrypted));
}

// ==========================================
// 🎣 Custom Hook: useAutoSave
// ==========================================
export interface AutoSaveDraft {
  version: string;
  timestamp: string;
  step: string;
  loanType: string;
  data: Record<string, unknown>;
}

export function useAutoSave(
  formValues: Record<string, unknown>,
  currentStep: string,
  interval = 30000
) {
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const formValuesRef = useRef(formValues);
  const currentStepRef = useRef(currentStep);

  // Sync refs to avoid re-triggering timer on every keystroke
  useEffect(() => {
    formValuesRef.current = formValues;
    currentStepRef.current = currentStep;
  }, [formValues, currentStep]);

  const saveDraft = async () => {
    const loanType = (formValuesRef.current.loanType as string) || 'unknown';
    if (loanType === 'unknown') return;

    try {
      const encryptedData = await encryptData(formValuesRef.current);
      const metadata = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        step: currentStepRef.current,
        loanType,
      };

      localStorage.setItem(`lendswift_draft_${loanType}`, encryptedData);
      localStorage.setItem(`lendswift_draft_meta_${loanType}`, JSON.stringify(metadata));

      const timeString = new Date().toLocaleTimeString();
      setLastSaved(timeString);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error('Failed to auto-save draft:', err);
    }
  };

  // Set up debounced auto-save on change
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      saveDraft();
    }, interval);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [formValues, currentStep, interval]);

  return {
    lastSaved,
    showToast,
    saveDraft,
  };
}

export function clearDraft(loanType: string) {
  localStorage.removeItem(`lendswift_draft_${loanType}`);
  localStorage.removeItem(`lendswift_draft_meta_${loanType}`);
}

export function checkSavedDrafts(): { loanType: string; step: string; timestamp: string }[] {
  const loanTypes = ['personal', 'home', 'business'];
  const drafts: { loanType: string; step: string; timestamp: string }[] = [];

  loanTypes.forEach((type) => {
    const metaStr = localStorage.getItem(`lendswift_draft_meta_${type}`);
    if (metaStr) {
      try {
        const meta = JSON.parse(metaStr);
        const timestamp = new Date(meta.timestamp).getTime();
        const now = new Date().getTime();
        const diffHours = (now - timestamp) / (1000 * 60 * 60);

        if (diffHours < 72) {
          drafts.push({
            loanType: type,
            step: meta.step,
            timestamp: meta.timestamp,
          });
        } else {
          // Purge draft older than 72 hours
          clearDraft(type);
        }
      } catch {
        clearDraft(type);
      }
    }
  });

  return drafts;
}

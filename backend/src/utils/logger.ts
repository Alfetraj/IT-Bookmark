/**
 * Secure logging utility
 * Ensures that sensitive information (JWTs, passwords, API keys) are not leaked into logs.
 */

const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'secret', 'key'];

function maskSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(maskSensitiveData);
  }

  const maskedObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive))) {
        maskedObj[key] = '[REDACTED]';
      } else {
        maskedObj[key] = maskSensitiveData(obj[key]);
      }
    }
  }
  return maskedObj;
}

export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta ? maskSensitiveData(meta) : '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta ? maskSensitiveData(meta) : '');
  },
  error: (message: string, error?: any) => {
    // Only log the stack or message, do not log the entire error object if it might contain config
    const safeError = error instanceof Error 
      ? { message: error.message, stack: error.stack } 
      : maskSensitiveData(error);
    console.error(`[ERROR] ${message}`, safeError || '');
  }
};

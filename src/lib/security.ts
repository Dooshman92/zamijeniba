export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
};

export const validateURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.+/g, '.')
    .substring(0, 255);
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Samo JPEG, PNG i WebP slike su dozvoljene' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Slika je prevelika (maksimalno 5MB)' };
  }

  return { valid: true };
};

export const validateTextLength = (text: string, minLength: number, maxLength: number): { valid: boolean; error?: string } => {
  const length = text.trim().length;

  if (length < minLength) {
    return { valid: false, error: `Tekst mora imati najmanje ${minLength} karaktera` };
  }

  if (length > maxLength) {
    return { valid: false, error: `Tekst ne može biti duži od ${maxLength} karaktera` };
  }

  return { valid: true };
};

export const validateNumber = (value: number, min: number, max: number): { valid: boolean; error?: string } => {
  if (isNaN(value)) {
    return { valid: false, error: 'Nevažeća vrijednost' };
  }

  if (value < min) {
    return { valid: false, error: `Vrijednost mora biti najmanje ${min}` };
  }

  if (value > max) {
    return { valid: false, error: `Vrijednost ne može biti veća od ${max}` };
  }

  return { valid: true };
};

export const rateLimiter = (() => {
  const requests = new Map<string, number[]>();

  return (key: string, maxRequests: number, windowMs: number): boolean => {
    const now = Date.now();
    const timestamps = requests.get(key) || [];

    const validTimestamps = timestamps.filter(t => now - t < windowMs);

    if (validTimestamps.length >= maxRequests) {
      return false;
    }

    validTimestamps.push(now);
    requests.set(key, validTimestamps);

    return true;
  };
})();

export const hashString = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
};

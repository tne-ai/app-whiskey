import type { ValidationOptions, ValidationResult } from './types';

/**
 * Validates a file against size and type constraints
 */
export function validateFile(file: File, options: ValidationOptions): ValidationResult {
  const errors: string[] = [];

  // Check file size
  if (file.size > options.maxSize) {
    const maxSizeMB = (options.maxSize / 1024 / 1024).toFixed(1);
    errors.push(`File exceeds ${maxSizeMB}MB limit`);
  }

  // Check file type
  const isTypeAllowed = options.allowedTypes.some(allowedType => {
    if (allowedType.endsWith('/*')) {
      // Handle wildcard types like 'image/*'
      const baseType = allowedType.slice(0, -2);
      return file.type.startsWith(baseType);
    }
    return file.type === allowedType;
  });

  if (!isTypeAllowed) {
    errors.push('Unsupported file type');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Default validation options for delivery documents
 */
export const DEFAULT_VALIDATION_OPTIONS: ValidationOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/png',
    'image/jpeg', 
    'application/pdf',
    'text/csv'
  ]
};

/**
 * Get human-readable file type description
 */
export function getFileTypeDescription(file: File): string {
  const type = file.type;
  if (type.startsWith('image/')) return 'Image';
  if (type === 'application/pdf') return 'PDF Document';
  if (type === 'text/csv') return 'CSV File';
  return 'Unknown';
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export interface ValidationOptions {
  maxSize: number;
  allowedTypes: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FileValidationResult {
  file: File;
  isValid: boolean;
  errors: string[];
}

export interface PreviewData {
  type: 'image' | 'pdf' | 'csv' | 'text' | 'none';
  url?: string;
  data?: any;
  metadata?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    rows?: number;
    columns?: number;
    pages?: string | number;
    preview?: boolean;
    previewRows?: number;
  };
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadState {
  status: 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';
  progress: number;
  error?: string;
  errorMessage?: string;
}

export interface FileUploadResult {
  file: File;
  success: boolean;
  data?: any;
  error?: string;
  response?: any;
}

export interface UploadOptions {
  endpoint: string;
  onProgress?: (progress: UploadProgress) => void;
  timeout?: number;
}

export interface UploadResponse {
  success: boolean;
  data?: any;
  error?: string;
}

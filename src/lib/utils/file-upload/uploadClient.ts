import type { UploadOptions, UploadResponse, UploadProgress } from './types';

/**
 * Upload a file with progress tracking
 */
export async function uploadFile(file: File, options: UploadOptions): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Create XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();

    // Set up progress tracking
    if (options.onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress: UploadProgress = {
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100)
          };
          options.onProgress!(progress);
        }
      });
    }

    // Set timeout if specified
    if (options.timeout) {
      xhr.timeout = options.timeout;
    }

    // Perform upload
    const response = await new Promise<any>((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.response);
            resolve(data);
          } catch (err) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };
      
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.ontimeout = () => reject(new Error('Upload timeout'));
      
      xhr.open('POST', options.endpoint);
      xhr.send(formData);
    });

    return {
      success: true,
      data: response
    };

  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed'
    };
  }
}

/**
 * Upload multiple files sequentially
 */
export async function uploadFiles(
  files: File[], 
  options: UploadOptions
): Promise<UploadResponse[]> {
  const results: UploadResponse[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Create per-file progress callback
    const fileOptions: UploadOptions = {
      ...options,
      onProgress: options.onProgress ? (progress) => {
        // Adjust progress to account for multiple files
        const overallProgress: UploadProgress = {
          loaded: (i * 100) + progress.percentage,
          total: files.length * 100,
          percentage: Math.round(((i * 100) + progress.percentage) / files.length)
        };
        options.onProgress!(overallProgress);
      } : undefined
    };
    
    const result = await uploadFile(file, fileOptions);
    results.push(result);
    
    // Stop on first failure if desired
    if (!result.success) {
      break;
    }
  }
  
  return results;
}

/**
 * Default upload options
 */
export const DEFAULT_UPLOAD_OPTIONS: Partial<UploadOptions> = {
  endpoint: '/api/upload/delivery-document',
  timeout: 600000 // 10 minutes
};

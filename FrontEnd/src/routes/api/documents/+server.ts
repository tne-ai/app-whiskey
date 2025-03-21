import { json, error } from '@sveltejs/kit';
import { MODEL_API_KEY, MODEL_API_URL } from '$env/static/private';
import type { PdfPageImage } from '$lib/utils/pdfUtils';

// Constants for timeouts
const TIMEOUT_DURATION = 600000; // 10 minutes in milliseconds

interface PdfImagesData {
  type: 'pdf-images';
  images: PdfPageImage[];
  originalName: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'application/pdf',
  'text/csv'
]);

export async function POST({ request, fetch }) {
  console.log('1. Starting file upload process');
  
  const formData = await request.formData();
  const fileData = formData.get('file');
  
  // Check if this is PDF images data
  let isPdfImages = false;
  let pdfImagesData: PdfImagesData | null = null;
  
  if (typeof fileData === 'string') {
    try {
      const parsed = JSON.parse(fileData);
      if (parsed.type === 'pdf-images') {
        isPdfImages = true;
        pdfImagesData = parsed as PdfImagesData;
      }
    } catch {
      // Not PDF images data, continue with normal file processing
    }
  }

  if (!isPdfImages && (!fileData || typeof fileData === 'string')) {
    throw error(400, 'No file uploaded');
  }

  const file = isPdfImages ? null : fileData as File;
  
  // Log what we received
  console.log('2. Received:', isPdfImages ? {
    type: 'pdf-images',
    originalName: pdfImagesData?.originalName,
    pageCount: pdfImagesData?.images.length,
    // also print the imageData
    images: pdfImagesData?.images.map(img => ({
      pageNumber: img.pageNumber,
      imageData: img.imageData,
      dimensions: {
        width: img.width,
        height: img.height
      }
    }))
  } : {
    name: file?.name,
    type: file?.type,
    size: file?.size
  });

  // Validation for non-PDF-images
  if (!isPdfImages) {
    if (!file) throw error(400, 'No file uploaded');
    if (file.size > MAX_FILE_SIZE) throw error(413, 'File exceeds 10MB limit');
    if (!ALLOWED_TYPES.has(file.type)) throw error(415, 'Unsupported file type');
  }

  try {
    // Prepare content for the model
    let modelContent;
    try {
      if (isPdfImages && pdfImagesData) {
        // For PDF images, we send all pages as an array
        modelContent = pdfImagesData.images.map(img => ({
          pageNumber: img.pageNumber,
          imageData: img.imageData,
          dimensions: {
            width: img.width,
            height: img.height
          }
        }));
      } else if (file?.type === 'text/csv') {
        modelContent = await file.text();
      } else if (file) {
        // Handle other binary files as base64
        const arrayBuffer = await file.arrayBuffer();
        modelContent = Buffer.from(arrayBuffer).toString('base64');
      } else {
        throw error(400, 'Invalid file data');
      }
    } catch (err) {
      console.error('4. Failed to process file:', err);
      throw error(500, 'Failed to process file');
    }

    // Process with model
    console.log('5. Preparing to send to model at:', MODEL_API_URL);
    
    let modelResponse;
    try {
      // Create AbortController with a longer timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);
      
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MODEL_API_KEY}`
        },
        body: JSON.stringify({
          model: 'wastex-document---json',
          messages: [
            {
              role: 'system',
              content: 'Extract the data from the delivery document and return it in a JSON format as specified above.'
            },
            {
              role: 'user',
              content: isPdfImages ? 
                // For PDF images, create an array of image_url objects
                pdfImagesData?.images.map(img => ({
                  type: 'image_url',
                  image_url: {
                    // url: `data:image/jpeg;base64,${img.imageData}`
                    url: img.imageData
                  }
                })) :
                // For other files, use regular content
                modelContent,
              ...((!isPdfImages && file?.type !== 'text/csv') && {
                file: {
                  name: file?.name,
                  mime_type: file?.type,
                  data: modelContent
                }
              }),
              ...(isPdfImages && {
                file: {
                  name: pdfImagesData?.originalName,
                  mime_type: 'application/pdf',
                  data: modelContent
                }
              })
            }
          ],
          max_tokens: 2000
        }),
        signal: controller.signal,
        // Add Undici specific timeout configurations
        headersTimeout: TIMEOUT_DURATION,
        bodyTimeout: TIMEOUT_DURATION,
        keepalive: true
      } as const;
      
      modelResponse = await fetch(MODEL_API_URL, fetchOptions);
      
      // Clear the timeout if the request completes
      clearTimeout(timeoutId);
      
      console.log('6. Received model response:', {
        status: modelResponse.status,
        ok: modelResponse.ok
      });
    } catch (err) {
      console.error('7. Model processing failed:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        throw error(504, 'Request timed out - the PDF may be too large or complex');
      }
      throw error(500, 'Failed to process with model');
    }

    if (!modelResponse.ok) {
      const errorText = await modelResponse.text();
      console.error('8. Model response not OK:', {
        status: modelResponse.status,
        error: errorText
      });
      throw error(modelResponse.status, `Model processing failed: ${errorText}`);
    }

    // Return model results
    console.log('9. Processing model response...');
    const modelData = await modelResponse.json();
    console.log('10. Returning results to client');
    
    return json({
      modelAnalysis: modelData.choices?.[0]?.message?.content || modelData
    });

  } catch (err) {
    console.error('Final error handler:', err);
    if (err instanceof Error) {
      throw error(500, err.message);
    }
    throw error(500, 'Failed to process file');
  }
} 
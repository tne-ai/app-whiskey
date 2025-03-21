import * as pdfjs from 'pdfjs-dist';

// Only initialize PDF.js worker in browser environment
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
}

export interface PdfPageImage {
  pageNumber: number;
  imageData: string;  // base64 encoded image
  width: number;
  height: number;
}

export async function convertPdfToImages(file: File, scale: number = 2.0): Promise<PdfPageImage[]> {
  // Ensure we're in browser environment
  if (typeof window === 'undefined') {
    throw new Error('PDF conversion can only be performed in browser environment');
  }

  const images: PdfPageImage[] = [];
  
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      // Set canvas dimensions
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport
      }).promise;
      
      // Convert canvas to base64 image
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      
      images.push({
        pageNumber: pageNum,
        imageData,
        width: viewport.width,
        height: viewport.height
      });
    }
    
    // Clean up
    pdf.destroy();
    
    return images;
  } catch (err) {
    console.error('Error converting PDF to images:', err);
    throw err;
  }
} 
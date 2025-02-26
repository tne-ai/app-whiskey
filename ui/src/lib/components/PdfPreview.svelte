<script lang="ts">
  import * as pdfjs from 'pdfjs-dist';
  import workerUrl from 'pdfjs-dist/build/pdf.worker.js?url';
  
  // Configure worker properly
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  
  const { file } = $props<{ file: File }>();
  let previewUrl = $state<string | null>(null);

  $effect(() => {
    let active = true;
    
    const loadPdf = async () => {
      if (!file) return;

      try {
        // Read file directly instead of fetching URL
        const arrayBuffer = await file.arrayBuffer();
        
        // Load PDF from ArrayBuffer
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context!,
          viewport
        }).promise;
        
        if (active) {
          previewUrl = canvas.toDataURL();
        }
        
        pdf.destroy();
      } catch (err) {
        console.error('Error loading PDF:', err);
      }
    };

    loadPdf();
    
    return () => {
      active = false;
    };
  });
</script>

{#if previewUrl}
  <img
    src={previewUrl}
    alt="PDF first page preview"
    class="max-h-48 w-auto mx-auto border"
  />
{:else}
  <div class="h-48 flex items-center justify-center">
    <div class="text-gray-400">Loading preview...</div>
  </div>
{/if} 
# Transferring Document Ingestion Functionality

This guide provides step-by-step instructions for transferring the document ingestion, preview, and analysis functionality from the existing application to a new application.

## 1. Project Setup

Create a new SvelteKit project with TypeScript and install required dependencies:

```bash
# Create new SvelteKit project
npm create svelte@latest my-new-app
cd my-new-app

# Install required dependencies
npm install pdfjs-dist flowbite-svelte tailwindcss daisyui
npm install -D @types/node
```

## 2. File Structure

Create the following directory structure:
```
src/
├── lib/
│   ├── components/
│   │   ├── FileUpload.svelte
│   │   ├── PdfPreview.svelte
│   │   ├── CsvPreview.svelte
│   │   └── ModelResponse.svelte
│   ├── utils/
│   │   └── pdfUtils.ts
│   ├── types/
│   │   └── index.ts
│   └── stores/
│       └── index.ts
├── routes/
│   └── api/
│       └── upload/
│           └── +server.ts
```

## 3. File Copying

Copy these files from the original app to your new app:
- `src/lib/utils/pdfUtils.ts` - PDF processing utilities
- `src/lib/components/PdfPreview.svelte` - PDF preview component
- `src/lib/components/CsvPreview.svelte` - CSV preview component
- `src/lib/components/ModelResponse.svelte` - Model response display
- `src/lib/components/FileUpload.svelte` - Main file upload component
- `src/routes/api/upload/+server.ts` - Upload endpoint handler

## 4. Type Definitions

Create `src/lib/types/index.ts` with the following content:

```typescript
export interface ModelAnalysis {
  source_document?: {
    type?: string;
    provider?: string;
    date?: string;
    extraction_confidence?: {
      score: number;
    };
  };
  extraction_metadata?: {
    processing_timestamp?: string;
    extraction_version?: string;
    overall_confidence?: {
      score: number;
      review_flags: string[];
    };
  };
  ordered_items: Array<{
    item_name: string;
    material_classification?: {
      material?: string;
      sub_material?: string;
      confidence?: {
        score: number;
      };
    };
    dimensions?: {
      length_mm?: number;
      width_mm?: number;
      height_mm?: number;
    };
    quantity_specification?: {
      count?: {
        value: number;
      };
    };
    mass_calculation?: {
      requires_review?: boolean;
    };
  }>;
}

export interface PartialModelAnalysis {
  ordered_items: Array<any>;
}
```

## 5. Store Setup

Create `src/lib/stores/index.ts`:

```typescript
import { writable } from 'svelte/store';

interface AppState {
  data: any | null;
  error: string | null;
}

export const appState = writable<AppState>({
  data: null,
  error: null
});
```

## 6. Environment Configuration

Create a `.env` file in your project root:

```env
MODEL_API_KEY=your_api_key_here
MODEL_API_URL=your_model_api_url_here
```

## 7. TailwindCSS and DaisyUI Configuration

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: true,
  }
}
```

## 8. App Entry Point

Update `src/routes/+page.svelte`:

```svelte
<script lang="ts">
  import FileUpload from '$lib/components/FileUpload.svelte';
  import ModelResponse from '$lib/components/ModelResponse.svelte';
  import { appState } from '$lib/stores';
</script>

<div class="container mx-auto px-4 py-8">
  <FileUpload />
  
  {#if $appState.data}
    <div class="mt-8">
      <ModelResponse data={$appState.data} />
    </div>
  {/if}
</div>
```

## 9. Vite Configuration

Add to `vite.config.ts`:

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  optimizeDeps: {
    include: ['pdfjs-dist']
  }
});
```

## 10. Security Considerations

- Configure CORS if your model API is on a different domain
- Add appropriate headers in frontend requests
- Never expose API keys in client-side code
- Implement appropriate file size and type validations

## 11. Testing Checklist

Test the application with:
- PDF files (single and multi-page)
- CSV files
- Image files (PNG, JPEG)

Verify that the application:
1. Accepts file uploads
2. Shows appropriate previews based on file type
3. Processes files (especially PDFs) before sending to the API
4. Handles the API response and displays results
5. Shows appropriate error messages when things go wrong

## Component Functionality Overview

### FileUpload.svelte
- Handles file selection via drag-and-drop or file picker
- Validates file types and sizes
- Shows appropriate preview component based on file type
- Processes files before API submission
- Handles upload progress and errors

### PdfPreview.svelte
- Renders first page of PDF as preview
- Uses PDF.js for rendering
- Handles PDF processing errors

### CsvPreview.svelte
- Parses and displays first few rows of CSV files
- Handles quoted fields and common CSV formats
- Shows table preview with headers

### ModelResponse.svelte
- Displays formatted API response
- Shows confidence scores and review flags
- Handles different response formats
- Provides detailed item breakdowns

### pdfUtils.ts
- Converts PDF pages to images
- Handles PDF.js initialization
- Provides type definitions for PDF processing 
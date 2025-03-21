import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	optimizeDeps: {
		include: ['pdfjs-dist']
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// pdfjs: ['pdfjs-dist']
				}
			}
		}
	},
	preview: {
		allowedHosts: ['wastex.dev.tne.ai', 'wastex.tne.ai']
	}
});

import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	optimizeDeps: {
		exclude: ['fix-tprotocol-service-worker']
	},
	preview: {
		allowedHosts: ['whiskey.dev.tne.ai', 'whiskey.tne.ai']
	}
});

import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			runtime: 'nodejs18.x', // Asegura que use Node.js 18
			maxDuration: 60 // Aumenta el timeout a 30 segundos
		})
	}
};

export default config;

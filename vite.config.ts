import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import laravel from 'laravel-vite-plugin'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            publicDirectory: 'public_html', // Add this line
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    build: {
        // 🛠️ prevent multi-thread crashes
        minify: 'esbuild', // use esbuild instead of terser/lightningcss
        cssMinify: false,  // disable parallel css minification
        sourcemap: false,  // lighter build
        target: 'esnext',
        outDir: 'public_html/build',
        // emptyOutDir: true
        chunkSizeWarningLimit: 2000, // increases limit to 2MB
    },
    optimizeDeps: {
        esbuildOptions: {
            // disable multi-threading
            define: {
                global: 'globalThis',
            },
        },
    },
});

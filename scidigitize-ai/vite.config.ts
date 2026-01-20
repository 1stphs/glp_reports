import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/mineru-api': {
          target: 'https://mineru.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/mineru-api/, '')
        },
        '/mineru-oss': {
          target: 'https://mineru.oss-cn-shanghai.aliyuncs.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/mineru-oss/, '')
        }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.mineru_token': JSON.stringify(env.mineru_token)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    // Fix for "Top-level await is not available" error caused by pdfjs-dist
    build: {
      target: 'esnext'
    },
    esbuild: {
      target: 'esnext'
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext'
      }
    }
  };
});

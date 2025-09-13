import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables for current mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        // Proxy API requests to the backend server during development
        '/api': {
          target: `http://localhost:${env.PORT || 5000}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});

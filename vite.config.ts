import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'security-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('X-Frame-Options', 'DENY');
          res.setHeader('X-XSS-Protection', '1; mode=block');
          res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
          res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
          res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: https: blob:; " +
            "font-src 'self' data:; " +
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co; " +
            "frame-src https://www.google.com; " +
            "object-src 'none'; " +
            "base-uri 'self';"
          );
          next();
        });
      }
    }
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

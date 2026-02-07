// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    {
      name: "security-headers",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader("X-Content-Type-Options", "nosniff");
          res.setHeader("X-Frame-Options", "DENY");
          res.setHeader("X-XSS-Protection", "1; mode=block");
          res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
          res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
          res.setHeader(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src https://www.google.com; object-src 'none'; base-uri 'self';"
          );
          next();
        });
      }
    }
  ],
  optimizeDeps: {
    exclude: ["lucide-react"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHtcbiAgICAgIG5hbWU6ICdzZWN1cml0eS1oZWFkZXJzJyxcbiAgICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdYLUNvbnRlbnQtVHlwZS1PcHRpb25zJywgJ25vc25pZmYnKTtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdYLUZyYW1lLU9wdGlvbnMnLCAnREVOWScpO1xuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ1gtWFNTLVByb3RlY3Rpb24nLCAnMTsgbW9kZT1ibG9jaycpO1xuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ1JlZmVycmVyLVBvbGljeScsICdzdHJpY3Qtb3JpZ2luLXdoZW4tY3Jvc3Mtb3JpZ2luJyk7XG4gICAgICAgICAgcmVzLnNldEhlYWRlcignUGVybWlzc2lvbnMtUG9saWN5JywgJ2dlb2xvY2F0aW9uPSgpLCBtaWNyb3Bob25lPSgpLCBjYW1lcmE9KCknKTtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKFxuICAgICAgICAgICAgJ0NvbnRlbnQtU2VjdXJpdHktUG9saWN5JyxcbiAgICAgICAgICAgIFwiZGVmYXVsdC1zcmMgJ3NlbGYnOyBcIiArXG4gICAgICAgICAgICBcInNjcmlwdC1zcmMgJ3NlbGYnICd1bnNhZmUtaW5saW5lJyAndW5zYWZlLWV2YWwnIGh0dHBzOi8vd3d3Lmdvb2dsZS5jb20gaHR0cHM6Ly93d3cuZ3N0YXRpYy5jb207IFwiICtcbiAgICAgICAgICAgIFwic3R5bGUtc3JjICdzZWxmJyAndW5zYWZlLWlubGluZSc7IFwiICtcbiAgICAgICAgICAgIFwiaW1nLXNyYyAnc2VsZicgZGF0YTogaHR0cHM6IGJsb2I6OyBcIiArXG4gICAgICAgICAgICBcImZvbnQtc3JjICdzZWxmJyBkYXRhOjsgXCIgK1xuICAgICAgICAgICAgXCJjb25uZWN0LXNyYyAnc2VsZicgaHR0cHM6Ly8qLnN1cGFiYXNlLmNvIHdzczovLyouc3VwYWJhc2UuY287IFwiICtcbiAgICAgICAgICAgIFwiZnJhbWUtc3JjIGh0dHBzOi8vd3d3Lmdvb2dsZS5jb207IFwiICtcbiAgICAgICAgICAgIFwib2JqZWN0LXNyYyAnbm9uZSc7IFwiICtcbiAgICAgICAgICAgIFwiYmFzZS11cmkgJ3NlbGYnO1wiXG4gICAgICAgICAgKTtcbiAgICAgICAgICBuZXh0KCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgXSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFFbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ047QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLGdCQUFnQixRQUFRO0FBQ3RCLGVBQU8sWUFBWSxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVM7QUFDekMsY0FBSSxVQUFVLDBCQUEwQixTQUFTO0FBQ2pELGNBQUksVUFBVSxtQkFBbUIsTUFBTTtBQUN2QyxjQUFJLFVBQVUsb0JBQW9CLGVBQWU7QUFDakQsY0FBSSxVQUFVLG1CQUFtQixpQ0FBaUM7QUFDbEUsY0FBSSxVQUFVLHNCQUFzQiwwQ0FBMEM7QUFDOUUsY0FBSTtBQUFBLFlBQ0Y7QUFBQSxZQUNBO0FBQUEsVUFTRjtBQUNBLGVBQUs7QUFBQSxRQUNQLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsRUFDMUI7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=

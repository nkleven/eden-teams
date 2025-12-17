import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          fluent: ["@fluentui/react-components"],
          "fluent-icons": ["@fluentui/react-icons"],
          "fluent-datepicker": ["@fluentui/react-datepicker-compat"],
          msal: ["@azure/msal-react", "@azure/msal-browser"]
        }
      }
    }
  }
})

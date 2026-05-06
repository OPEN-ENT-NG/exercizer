// vite.config.ts
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'loadtest/index.ts'),
      name: 'exercizer-k6-tests',
      fileName: 'index',
    },
    rollupOptions: {
        external: [
            "k6",
            "k6/http"
        ]
    }
  },
  plugins: [
    dts({
      insertTypesEntry: true, // Ensures a types entry is added to package.json
      outDir: 'dist', // Directory for type definitions
    }),
  ],
})
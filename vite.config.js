// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from 'path'

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: { '@': path.resolve(__dirname, './src') },
//   },
//   server: {
//     host: true,      // permite acesso via IP
//     port: 4175,      // certifique-se de liberar essa porta no firewall
//     // strictPort: true
//   }
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // ✅ garante que @ aponta pra ./src
    }
  },
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: '0.0.0.0', // ✅ isso faz o preview escutar na rede
    port: 4173 ,      // ✅ porta fixa
    allowedHosts: ['technomotion.zapto.org'] // ✅ libera seu domínio
  }
})

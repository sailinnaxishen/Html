import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd());
  
  return {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    server: {
      host: "0.0.0.0",
      port: 3001,
      allowedHosts: [
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
      ],
      proxy: {
        '/api': {
          target: 'http://192.168.92.64:3000',
          changeOrigin: true
        }
      }
    },
    production: {
      host: "0.0.0.0",
      port: parseInt(env.VITE_production_PORT) || 4173,
      proxy: {
        '/api': {
          target: 'http://192.168.92.64:3000',
          changeOrigin: true
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          logger: {
            debug: () => {},
            warn: () => {},
          },
        },
      },
    },
    define: {
      'process.env': env
    }
  };
});

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
      port: 41737,
      allowedHosts: ["localhost", "127.0.0.1", "0.0.0.0", ".sealoshzh.site"],
      proxy: {
        "/api": {
          target: "http://192.168.127.64:3000",
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: "0.0.0.0",
      port: parseInt(env.VITE_production_PORT) || 3000,
      proxy: {
        "/api": {
          target: "",
          changeOrigin: true,
        },
      },
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
      "process.env": env,
    },
  };
});

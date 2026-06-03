import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const optionalPort = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const port = Number(value);
  return Number.isFinite(port) ? port : undefined;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const hmrHost = env.VITE_HMR_HOST;
  const hmrProtocol = env.VITE_HMR_PROTOCOL === "ws" || env.VITE_HMR_PROTOCOL === "wss" ? env.VITE_HMR_PROTOCOL : undefined;
  const hmrPort = optionalPort(env.VITE_HMR_PORT);
  const hmrClientPort = optionalPort(env.VITE_HMR_CLIENT_PORT);

  return {
    plugins: [react],
    server: {
      port: 5173,
      allowedHosts: [
        'lungai.deployment.sh'
      ],
      ...(hmrHost
        ? {
            hmr: {
              host: hmrHost,
              protocol: hmrProtocol,
              ...(hmrPort !== undefined ? { port: hmrPort } : {}),
              ...(hmrClientPort !== undefined ? { clientPort: hmrClientPort } : {})
            }
          }
        : {})
    }
  };
});

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function requireEnv(
  env: Record<string, string>,
  variableName: string,
): string {
  const value = env[variableName]?.trim();

  if (!value) {
    throw new Error(
      `Не задана переменная окружения ${variableName}. Проверьте DND_frontend/.env`,
    );
  }

  return value;
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const server =
    command === 'serve'
      ? {
          proxy: {
            '/api/auth': {
              target: requireEnv(env, 'AUTH_PROXY_TARGET'),
              changeOrigin: true,
              rewrite: (path: string) =>
                path.replace(/^\/api\/auth/, '/auth'),
            },
            '/api/rooms': {
              target: requireEnv(env, 'ROOMS_PROXY_TARGET'),
              changeOrigin: true,
              rewrite: (path: string) =>
                path.replace(/^\/api\/rooms/, '/rooms'),
            },
            '/api/content': {
              target: requireEnv(env, 'CONTENT_PROXY_TARGET'),
              changeOrigin: true,
              rewrite: (path: string) =>
                path.replace(/^\/api\/content/, ''),
            },
            '/api/characters': {
              target: requireEnv(env, 'CHARACTER_PROXY_TARGET'),
              changeOrigin: true,
              rewrite: (path: string) =>
                path.replace(/^\/api\/characters/, ''),
            },
            '/media': {
              target: requireEnv(env, 'CONTENT_PROXY_TARGET'),
              changeOrigin: true,
            },
          },
        }
      : undefined;

  return {
    plugins: [react(), tailwindcss()],
    server,
  };
});
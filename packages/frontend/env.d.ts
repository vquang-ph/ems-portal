/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

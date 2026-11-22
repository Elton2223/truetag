/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DB_HOST: string;
  readonly DB_PORT: string;
  readonly DB_USER: string;
  readonly DB_PASSWORD: string;
  readonly DB_NAME: string;
  readonly SESSION_SECRET: string;
  readonly PUBLIC_SITE_URL: string;
  readonly WHATSAPP_TOKEN?: string;
  readonly SMS_PROVIDER_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

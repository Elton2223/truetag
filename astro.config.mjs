import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://www.truetag.co.za',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
});

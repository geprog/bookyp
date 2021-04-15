import fs from 'fs/promises';
import path from 'path';
import { Plugin } from 'vite';

/**
 * This plugin serves the `/assets/app-config.js` file with proper environment variables
 */

function renderTemplateWithEnvVars(content: string): string {
  let result = content;
  const regex = /\$\{([a-zA-Z_]+[a-zA-Z0-9_]*?)\}/g;

  let matched: RegExpExecArray;
  while ((matched = regex.exec(content))) {
    result = result.replace(`\${${matched[1]}}`, process.env[matched[1]] || '');
  }

  return result;
}

export default function appConfigPlugin(): Plugin {
  return {
    name: 'vite-plugin-app-config',
    configureServer(server) {
      let appConfigContent = '';
      const TEMPLATE_PATH = path.join(__dirname, 'src', 'assets', 'app-config.template.js');

      void (async () => {
        const content = (await fs.readFile(TEMPLATE_PATH)).toString();
        appConfigContent = renderTemplateWithEnvVars(content);
      })();

      server.middlewares.use((req, res, next) => {
        if (req.url === '/assets/app-config.js') {
          // standard headers
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Content-Length', Buffer.byteLength(appConfigContent, 'utf8'));

          // body
          res.end(appConfigContent, 'utf8');
          return;
        }
        next();
      });
    },
  };
}

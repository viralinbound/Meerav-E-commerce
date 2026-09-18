import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Resolve tailwind.config.js by absolute path instead of relying on
// tailwindcss's own cwd-based lookup — some launchers spawn this process
// from a different working directory, which otherwise makes Tailwind
// silently fall back to an empty config (no content sources, no styles).
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    tailwindcss: { config: path.join(__dirname, 'tailwind.config.js') },
    autoprefixer: {},
  },
}

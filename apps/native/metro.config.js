/**
 * Metro configuration for a pnpm monorepo.
 *
 * Metro needs to:
 *  1. Watch all workspace packages (watchFolders)
 *  2. Resolve node_modules from both the project root and the monorepo root
 *  3. Remap .js extension imports to their .ts/.tsx counterparts so that
 *     workspace packages (shared, config, i18n) built for Node ESM
 *     (which use explicit .js extensions in imports) work in Metro.
 */
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// --- 1. Watch the entire monorepo so Metro picks up changes in packages/ ---
config.watchFolders = [monorepoRoot];

// --- 2. Tell Metro where to look for node_modules ---
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// --- 3. Remap explicit .js imports to TypeScript sources ---
// Workspace packages authored as ESM use `import ... from './foo.js'`
// which Metro cannot resolve to `./foo.ts` on its own.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Delegate to any previously set resolver first
  const baseResolver = originalResolveRequest ?? context.resolveRequest;

  if (moduleName.endsWith('.js')) {
    try {
      return baseResolver(context, moduleName.slice(0, -3), platform);
    } catch {
      // Fall through — maybe the .js file actually exists
    }
  }
  return baseResolver(context, moduleName, platform);
};

// --- 4. Cache location inside the project (ignored by .gitignore) ---
config.cacheStores = [
  new FileStore({ root: path.join(projectRoot, '.metro-cache') }),
];

module.exports = config;

import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_evExugT-.mjs';
import { manifest } from './manifest_DP54bJlh.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/_slug_.astro.mjs');
const _page2 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["../../node_modules/.pnpm/astro@5.14.8_typescript@5.9.3/node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/[slug].astro", _page1],
    ["src/pages/index.astro", _page2]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "4db39237-c2fe-4acf-82ee-88190dc028f9",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };

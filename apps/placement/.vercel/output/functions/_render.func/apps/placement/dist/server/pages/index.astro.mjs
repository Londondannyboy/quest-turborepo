import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, l as Fragment } from '../chunks/astro/server_BhI68pf5.mjs';
import { i as initializeSql, a as getRecentArticles, $ as $$Base } from '../chunks/index_Cj0auneX.mjs';
export { renderers } from '../renderers.mjs';

const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  initializeSql(undefined                            );
  const siteName = "placement";
  const recentArticles = await getRecentArticles(siteName, 10);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$Base, { "title": "Placement", "description": "Navigate the evolving landscape" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mx-auto max-w-6xl px-4 py-8"> <section class="mb-12 text-center"> <h1 class="mb-4 text-5xl font-bold text-gray-900 dark:text-white"> ${"Placement"} </h1> <p class="text-xl text-gray-600 dark:text-gray-400"> ${"Navigate the evolving landscape"} </p> </section> ${recentArticles && recentArticles.length > 0 && renderTemplate`<section> <h2 class="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Recent Articles</h2> <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"> ${recentArticles.map((article) => renderTemplate`<article class="rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow dark:border-gray-700"> <a${addAttribute(`/${article.slug}`, "href")} class="group"> ${article.featured_image_url && renderTemplate`<img${addAttribute(article.featured_image_url, "src")}${addAttribute(article.title || article.headline_title, "alt")} class="mb-4 w-full h-48 rounded object-cover">`} <h3 class="mb-2 text-xl font-semibold group-hover:text-blue-600 dark:text-white"> ${article.title || article.headline_title} </h3> ${article.excerpt && renderTemplate`<p class="mb-4 text-gray-600 line-clamp-3 dark:text-gray-400"> ${article.excerpt} </p>`} <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500"> ${article.created_at && renderTemplate`<time${addAttribute(article.created_at, "datetime")}> ${new Date(article.created_at).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })} </time>`} ${article.reading_time_minutes && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <span>•</span> <span>${article.reading_time_minutes} min read</span> ` })}`} </div> </a> </article>`)} </div> </section>`} </div> ` })}`;
}, "/Users/dankeegan/turbo-clean/apps/placement/src/pages/index.astro", void 0);
const $$file = "/Users/dankeegan/turbo-clean/apps/placement/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

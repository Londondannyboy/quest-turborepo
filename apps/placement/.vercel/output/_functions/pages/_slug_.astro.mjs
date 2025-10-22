import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, u as unescapeHTML, h as addAttribute, l as Fragment } from '../chunks/astro/server_BhI68pf5.mjs';
import { i as initializeSql, g as getArticleBySlug, $ as $$Base } from '../chunks/index_Cj0auneX.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  initializeSql(undefined                            );
  const { slug } = Astro2.params;
  const siteName = "placement";
  const article = await getArticleBySlug(siteName, slug || "");
  if (!article) {
    return Astro2.redirect("/404");
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$Base, { "title": article.title || article.headline_title, "description": article.meta_description || article.excerpt || "" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<article class="mx-auto max-w-4xl px-4 py-8"> <header class="mb-8"> <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white"> ${article.title || article.headline_title} </h1> ${article.excerpt && renderTemplate`<p class="text-xl text-gray-600 dark:text-gray-400 mb-4"> ${article.excerpt} </p>`} ${article.featured_image_url && renderTemplate`<img${addAttribute(article.featured_image_url, "src")}${addAttribute(article.title || article.headline_title, "alt")} class="w-full rounded-lg">`} <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500 mt-4"> ${article.created_at && renderTemplate`<time${addAttribute(article.created_at, "datetime")}> ${new Date(article.created_at).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })} </time>`} ${article.reading_time_minutes && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <span>•</span> <span>${article.reading_time_minutes} min read</span> ` })}`} </div> </header> <div class="prose prose-lg dark:prose-invert max-w-none">${unescapeHTML(article.article_body || article.content)}</div> </article> ` })}`;
}, "/Users/dankeegan/turbo-clean/apps/placement/src/pages/[slug].astro", void 0);
const $$file = "/Users/dankeegan/turbo-clean/apps/placement/src/pages/[slug].astro";
const $$url = "/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

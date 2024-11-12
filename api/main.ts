
import { Application } from "https://deno.land/x/oak/mod.ts";
import MarkdownIt from 'https://esm.sh/markdown-it@14.1.0';
import MarkdownItFootnote from 'https://esm.sh/markdown-it-footnote@4.0.0';
import hljs from "https://esm.sh/highlight.js@11.9.0";


async function renderPage(path: string): Promise<String> {
  const src = await Deno.readTextFile(`${Deno.cwd()}/${path}`);
  const md = new MarkdownIt({
    html: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<div class="w3-panel w3-padding-16 w3-border w3-round" style="overflow-x:auto;">${hljs.highlight(str, { language: lang }).value}</div>`;
        } catch (__) {}
      }
      return ''; // use external default escaping
    }
  }).use(MarkdownItFootnote);
  return md.render(src);
}

const app = new Application()
.use(async (context, next) => {
  try {
    await context.send({
      root: `${Deno.cwd()}/docs`,
      index: "index.html",
    });
  } catch {
    await next();
  }
})
.use(async (context) => {
  const mypath = context.request.url.pathname ? context.request.url.pathname : "README.md";
  const page = await renderPage(mypath);
  context.response.type = "html";
  context.response.body = `<!doctype html><html lang="en"><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/assets/styles/w3.css">
  <title>🦅 Pahlawan Di Tengah Badai - ${context.request.url.pathname}</title>
  </head>
  <body>
  <main class="w3-container w3-main" id="main">
    <div class="w3-container w3-content" id="page_content">
      <div class="w3-panel w3-border w3-round-large">${page}</div>
    </div>
  </main>
  </body>
  </html>`;
});

console.log("Listening on PORT 3000");
await app.listen({ port: 3000 });


/**
 * Next оставляет в metadata ссылки вида href="/icon.svg" — на file:// это ломается.
 * После `next build` приводим иконки к относительным путям и убираем ссылку на отсутствующий favicon.ico.
 */
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "out");

function walkHtml(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walkHtml(p, acc);
    else if (name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

for (const file of walkHtml(outDir)) {
  let html = fs.readFileSync(file, "utf8");
  const patched = html
    .replace(
      /<link rel="icon" href="\/favicon\.ico[^"]*"[^>]*\/>/g,
      "",
    )
    .replace(
      /href="\/(icon\.svg[^"]*)"/g,
      'href="./$1"',
    );
  if (patched !== html) {
    fs.writeFileSync(file, patched, "utf8");
  }
}

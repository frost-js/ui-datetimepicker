import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';

const css = 'text/css; charset=utf-8';
const html = 'text/html; charset=utf-8';
const javaScript = 'text/javascript; charset=utf-8';
const resolveModule = (specifier) => new URL(import.meta.resolve(specifier));

const routes = new Map([
    ['/', { contentType: html, file: new URL('../app/index.html', import.meta.url) }],
    ['/esm', { contentType: html, file: new URL('../app/esm.html', import.meta.url) }],
    ['/assets/frost-ui-datetimepicker.css', { contentType: css, file: new URL('../../../dist/frost-ui-datetimepicker.css', import.meta.url) }],
    ['/assets/frost-ui-bundle.js', { contentType: javaScript, file: resolveModule('@fr0st/ui/dist/frost-ui-bundle.js') }],
    ['/assets/frost-ui.css', { contentType: css, file: resolveModule('@fr0st/ui/dist/frost-ui.css') }],
    ['/assets/frost-datetime.js', { contentType: javaScript, file: resolveModule('@fr0st/datetime/dist/frost-datetime.js') }],
    ['/assets/frost-core.esm.js', { contentType: javaScript, file: resolveModule('@fr0st/core') }],
    ['/assets/fquery.esm.js', { contentType: javaScript, file: resolveModule('@fr0st/query') }],
    ['/assets/frost-ui.esm.js', { contentType: javaScript, file: resolveModule('@fr0st/ui') }],
    ['/assets/frost-datetime.esm.js', { contentType: javaScript, file: resolveModule('@fr0st/datetime') }],
]);

for (const suffix of ['', '.min', '.esm', '.esm.min']) {
    const filename = `frost-ui-datetimepicker${suffix}.js`;
    routes.set(`/assets/${filename}`, {
        contentType: javaScript,
        file: new URL(`../../../dist/${filename}`, import.meta.url),
    });
}

const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const route = routes.get(url.pathname);

    if (!route) {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Not found');
        return;
    }

    try {
        let data = await readFile(route.file);
        if (url.pathname === '/' && url.searchParams.has('min')) {
            data = data.toString().replace('frost-ui-datetimepicker.js', 'frost-ui-datetimepicker.min.js');
        }

        response.writeHead(200, { 'Content-Type': route.contentType });
        response.end(data);
    } catch {
        response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Internal server error');
    }
});

server.listen(Number(process.env.PORT ?? 3001));

import { JSDOM } from 'jsdom';

export function normalizeURL(url: string): string {
    if (url === '' || url.includes(' ')) throw Error('Empty string not valid')
    const urlObj = new URL(url);
    let path = `${urlObj.host}${urlObj.pathname}`;
    if (path.endsWith('/')) {
        path = path.slice(0, -1);
    }
    return path
}

export function getH1FromHTML(html: string): string {
    const frag = JSDOM.fragment(html);
    return frag.querySelector("h1")?.textContent || '';
}

export function getFirstParagraphFromHTML(html: string): string {
    const frag = JSDOM.fragment(html);
    return frag.querySelector("main > p")?.textContent || frag.querySelector("p")?.textContent || '';
}

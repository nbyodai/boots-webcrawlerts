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
    try {
        const frag = JSDOM.fragment(html);
        return frag.querySelector("h1")?.textContent || "";
    } catch (error) {
        return "";
    }
}

export function getFirstParagraphFromHTML(html: string): string {
    try {
        const frag = JSDOM.fragment(html);
        return frag.querySelector("main > p")?.textContent || frag.querySelector("p")?.textContent || '';
    } catch (error) {
        return "";
    }
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
    try {
        const frag = JSDOM.fragment(html)
        const links = frag.querySelectorAll('a')
        const results: string[] = []
        Array.from(links).forEach((link) => {
            const href = link.getAttribute('href')
            if (href && !(href.startsWith('https') || href.startsWith('http'))) {
                results.push(`${baseURL}${href}`)
            } else if(href) {
                results.push(href)
            }
        })
    return results
    } catch (error) {
        return [ error as string]
    }
}

export function getImagesFromHTML(html: string, baseURL: string): string[] {
    try {
        const frag = JSDOM.fragment(html)
        const links = frag.querySelectorAll('img')
        const results: string[] = []
        Array.from(links).forEach((link) => {
            const src = link.getAttribute('src')
            if (src && !(src.startsWith('https') || src.startsWith('http'))) {
                results.push(`${baseURL}${src}`)
            } else if(src) {
                results.push(src)
            }
        })
        return results
    } catch (error) {
        return [ error as string]
    }
}

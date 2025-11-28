export function normalizeURL(url: string): string {
    if (url === '' || url.includes(' ')) throw Error('Empty string not valid')
    const urlObj = new URL(url);
    let path = `${urlObj.host}${urlObj.pathname}`;
    if (path.endsWith('/')) {
        path = path.slice(0, -1);
    }
    return path
}

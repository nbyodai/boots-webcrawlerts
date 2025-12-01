import { JSDOM } from "jsdom";
import pLimit, { LimitFunction } from 'p-limit';

export async function getHTML(url: string) {
  console.log(`Now crawling "${url}"`);
  let res;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent": "BootCrawler/1.0",
      },
    });
  } catch (err) {
    throw new Error(`Got Network error: ${(err as Error).message}`);
  }

  if (res.status > 399) {
    console.log(`Got HTTP error: ${res.status} ${res.statusText}`);
    return;
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("text/html")) {
    console.log(`Got non-HTML response: ${contentType}`);
    return;
  }
  return res.text();
}

export function normalizeURL(url: string): string {
  if (url === "" || url.includes(" ")) throw Error("Empty string not valid");
  const urlObj = new URL(url);
  let path = `${urlObj.host}${urlObj.pathname}`;
  if (path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  return path;
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
    return (
      frag.querySelector("main > p")?.textContent ||
      frag.querySelector("p")?.textContent ||
      ""
    );
  } catch (error) {
    return "";
  }
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
  try {
    const frag = JSDOM.fragment(html);
    const links = frag.querySelectorAll("a");
    const results: string[] = [];
    Array.from(links).forEach((link) => {
      const href = link.getAttribute("href");
      if (href && !(href.startsWith("https") || href.startsWith("http"))) {
        results.push(`${baseURL}${href}`);
      } else if (href) {
        results.push(href);
      }
    });
    return results;
  } catch (error) {
    return [error as string];
  }
}

export function getImagesFromHTML(html: string, baseURL: string): string[] {
  try {
    const frag = JSDOM.fragment(html);
    const links = frag.querySelectorAll("img");
    const results: string[] = [];
    Array.from(links).forEach((link) => {
      const src = link.getAttribute("src");
      if (src && !(src.startsWith("https") || src.startsWith("http"))) {
        results.push(`${baseURL}${src}`);
      } else if (src) {
        results.push(src);
      }
    });
    return results;
  } catch (error) {
    return [error as string];
  }
}

type ExtractedPageData = {
  url: string;
  h1: string;
  first_paragraph: string;
  image_urls: string[];
  outgoing_links: string[];
};

export function extractPageData(
  html: string,
  pageURL: string
): ExtractedPageData {
  const url = normalizeURL(pageURL);
  const h1 = getH1FromHTML(html);
  const firstParagraph = getFirstParagraphFromHTML(html);
  const imageUrls = getImagesFromHTML(html, pageURL);
  const outgoingLinks = getURLsFromHTML(html, pageURL);

  return {
    url: pageURL,
    h1,
    first_paragraph: firstParagraph,
    image_urls: imageUrls,
    outgoing_links: outgoingLinks,
  };
}

export async function _crawlPage(
  baseURL: string,
  currentURL: string = baseURL,
  pages: Record<string, number> = {}
) {
  const baseUrlObj = new URL(baseURL);
  const currentUrlObj = new URL(currentURL);
  if (baseUrlObj.hostname !== currentUrlObj.hostname) {
    console.log(`not exploring ${currentURL}`);
    return pages;
  }

  const normalizedCurrentURL = normalizeURL(currentURL);
  if (pages[normalizedCurrentURL]) {
    pages[normalizedCurrentURL] += 1;
    return pages;
  }

  pages[normalizedCurrentURL] = 1;

  console.log(`crawling ${currentURL}`);
  let html = "";
  try {
    html = (await getHTML(currentURL)) as string;
  } catch (err) {
    console.log(`${(err as Error).message}`);
    return pages;
  }

  const nextUrls = getURLsFromHTML(html, baseURL);
  console.log(`found ${nextUrls.length} number of outgoing links`);
  for (const nextURL of nextUrls) {
    pages = await _crawlPage(baseURL, nextURL, pages);
  }
  return pages;
}

class ConcurrentCrawler {
    baseURL: string;
    pages: Record<string, number>;
    limit: <T>(fn: () => Promise<T>) => Promise<T>;

    constructor(baseURL: string, maxConcurrency = 1, ) {
        this.baseURL = baseURL
        this.pages = {}
        this.limit = pLimit(maxConcurrency) as LimitFunction
    }

    private addPageVisit(normalizedURL: string): boolean {
        if (this.pages[normalizedURL]) {
            this.pages[normalizedURL] += 1;
            return false;
        } else {
            this.pages[normalizedURL] = 1
            return true
        }
    }

    private async getHTML(url: string): Promise<string> {
        return await this.limit(async() => {
            let res;
            try {
                res = await fetch(url, {
                    headers: {
                        "User-Agent": "BootCrawler/1.0",
                    },
                });
            } catch (err) {
                throw new Error(`Got Network error: ${(err as Error).message}`);
            }

            if (res.status > 399) {
                throw new Error(`Got HTTP error: ${res.status} ${res.statusText}`);
            }

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("text/html")) {
                throw new Error(`Got non-HTML response: ${contentType}`);
            }

            return res.text();
        })
    }
    private async crawlPage(currentURL: string): Promise<void> {
        const baseUrlObj = new URL(this.baseURL);
        const currentUrlObj = new URL(currentURL);
        if (baseUrlObj.hostname !== currentUrlObj.hostname) {
            console.log(`not exploring ${currentURL}`);
            return;
        }

        const normalizedCurrentURL = normalizeURL(currentURL);

        if(!this.addPageVisit(normalizedCurrentURL)) {
            return;
        };

        console.log(`crawling ${currentURL}`);
        let html = "";
        try {
            html = (await this.getHTML(currentURL)) as string;
        } catch (err) {
            console.log(`${(err as Error).message}`);
            return;
        }

        const nextUrls = getURLsFromHTML(html, this.baseURL);

        const crawlPromises = nextUrls.map((nextURl) => this.crawlPage(nextURl))

        await Promise.all(crawlPromises)
    }

    async crawl(): Promise<Record<string, number>> {
        await this.crawlPage(this.baseURL);
        return this.pages
    }
}

export async function crawlSiteAsync(baseURL: string, maxConcurrency: number = 5) {
    const crawler = new ConcurrentCrawler(baseURL, maxConcurrency)
    return await crawler.crawl()
}

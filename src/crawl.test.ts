import { expect, test } from 'vitest'
import { getFirstParagraphFromHTML, getH1FromHTML, getImagesFromHTML, getURLsFromHTML, normalizeURL } from "./crawl";

test.each([
    'https://blog.boot.dev/path/',
    'https://blog.boot.dev/path',
    'http://blog.boot.dev/path/',
    'http://blog.boot.dev/path',
])('normalizeURL', (input) => {
    expect(normalizeURL(input)).toBe('blog.boot.dev/path')
});
// edge cases
test('normalizeURl should not process an empty string', () => {
    expect(() => normalizeURL('')).toThrow('Empty string not valid');
})

test('normalizeURl should  error if space exists within the string', () => {
    expect(() => normalizeURL('http ://blog .boot .dev')).toThrow('Empty string not valid')
});


test("getH1FromHTML basic", () => {
  const inputBody = `<html><body><h1>Test Title</h1></body></html>`;
  const actual = getH1FromHTML(inputBody);
  const expected = "Test Title";
  expect(actual).toEqual(expected);
});

test("getH1FromHTML no H1", () => {
  const inputBody = `<html><body><p>Test Paragraph</p></body></html>`;
  const actual = getH1FromHTML(inputBody);
  const expected = "";
  expect(actual).toEqual(expected);
});

test("getH1FromHTML multiple H1 titles", () => {
  const inputBody = `<html><body><h1>Test Title</h1><div> <h1> Another Test Title</h1> </div></body></html>`;
  const actual = getH1FromHTML(inputBody);
  const expected = "Test Title";
  expect(actual).toEqual(expected);
});


test("getFirstParagraphFromHTML", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <div>
        <em>Emphasis</em>
      </div>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "Outside paragraph.";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML empty string with p tags", () => {
  const inputBody = `
    <html><body>
      <h1>Test title</h1>
      <div>
        <em>Emphasis</em>
      </div>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "";
  expect(actual).toEqual(expected);
});

test("getFirstParagraphFromHTML main priority", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <main>
        <p>Main paragraph.</p>
      </main>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "Main paragraph.";
  expect(actual).toEqual(expected);
});

test("getURLsFromHTML absolute", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><a href="https://blog.boot.dev"><span>Boot.dev</span></a></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://blog.boot.dev"];

  expect(actual).toEqual(expected);
});

test('getURLsFromHTML no links', () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><p>Boot dot dev</p></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected: string[] = [];

  expect(actual).toEqual(expected);
})

test("getURLsFromHTML multiple", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body>
    <a href="https://blog.boot.dev"><span>Boot.dev</span></a>
    <a href="/profile.png"><span>My Profile pic</span></a>
  </body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://blog.boot.dev", "https://blog.boot.dev/profile.png"];

  expect(actual).toEqual(expected);
});

test("getImagesFromHTML relative", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://blog.boot.dev/logo.png"];

  expect(actual).toEqual(expected);
});


test('getImagesFromHTML no imgs', () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><p>Boot dot dev</p></body></html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected: string[] = [];

  expect(actual).toEqual(expected);
})

test("getImagesFromHTML multiple", () => {
  const inputURL = "https://blog.boot.dev";
  const inputBody = `<html><body><img src="/logo.png" alt="Logo"> <div>Another image <img src="/profile.png" alt="Profile"></div></body></html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://blog.boot.dev/logo.png", "https://blog.boot.dev/profile.png"];

  expect(actual).toEqual(expected);
});

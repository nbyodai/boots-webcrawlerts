import { expect, test } from 'vitest'
import { normalizeURL } from "./crawl";

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

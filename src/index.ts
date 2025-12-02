import { argv } from 'node:process';
import { crawlSiteAsync } from './crawl';

async function main() {
    if (argv.length < 5) {
        console.log('too few arguments')
        process.exit(1);
    }
    if (argv.length > 5){
        console.log('too many arguments');
        process.exit(1);
    }
    const baseURL = argv[2];
    const maxConcurrency = Number(argv[3]);
    const maxPages = Number(argv[4]);

    const pages = await crawlSiteAsync(baseURL, maxConcurrency, maxPages);

    console.log(pages)

    process.exit(0);
}

main();

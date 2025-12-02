import { argv } from 'node:process';
import { crawlSiteAsync } from './crawl';
import { writeCSVReport } from './report';

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


    if (!Number.isFinite(maxConcurrency) || maxConcurrency <= 0) {
        console.log("invalid maxConcurrency");
        process.exit(1);
    }
    if (!Number.isFinite(maxPages) || maxPages <= 0) {
        console.log("invalid maxPages");
        process.exit(1);
    }

    const pages = await crawlSiteAsync(baseURL, maxConcurrency, maxPages);
    writeCSVReport(pages, 'reports.csv');

    process.exit(0);
}

main();

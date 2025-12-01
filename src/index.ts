import { argv } from 'node:process';
import { crawlSiteAsync } from './crawl';

async function main() {
    if (argv.length < 3) {
        console.log('too few arguments')
        process.exit(1);
    }
    if (argv.length > 3){
        console.log('too many arguments');
        process.exit(1);
    }
    const baseURL = argv[2];

    const pages = await crawlSiteAsync(baseURL);

    console.log(pages)

    process.exit(0);
}

main();

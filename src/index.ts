import { argv } from 'node:process';
import { crawlPage } from './crawl';

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

    const pages = await crawlPage(baseURL);
    console.log(pages)
    process.exit(0);
}

main();

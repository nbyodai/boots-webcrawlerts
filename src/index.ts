import { argv } from 'node:process';

function main() {
    if (argv.length < 3) {
        console.log('too few arguments')
        process.exit(1);
    }
    if (argv.length > 3){
        console.log('too many arguments');
        process.exit(1);
    }
    const baseURL = argv[2];

    console.log(`Now crawling "${baseURL}" ...`);
    process.exit(0);
}

main();

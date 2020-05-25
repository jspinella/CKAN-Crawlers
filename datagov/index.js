const puppeteer = require('puppeteer');
const amqp = require('amqplib/callback_api');
const lineReader = require('line-reader');

const exchange = 'scrapers';
const routingKey = 'datagov'; // scrapers.datagov queue
const connection = 'amqp://usdk:usdk@ckan.dev.datajax.org';

const MAX_PAGE = 2;
const URL_FILE = './targetUrls.txt';

(async () => {
    console.log('enqueueing');
    let urls = readFile(URL_FILE);
    const browser = await puppeteer.launch()

    for (let url of urls)
    {
        console.log(`Crawling ${url}`)
        const page = await browser.newPage()
        await page.goto(url)
      
        let results = await page.evaluate(() => {
            try {
                return Array.from(document.querySelectorAll('div > h3 > a'), el => el.href)
            }
            catch (e) {
                console.log(e);
                return null;
            }
        });

        console.log(results)
        await page.close()

        //consider writing URLs to a txt file for "caching" so that future test runs can run virtually instantly

        //send to rabbit
        for (let result of results)
            sendMessage(result)
    }

    await browser.close()
})();

// send scraped URL list to scrapers
function sendMessage(msg) {
    amqp.connect(connection, function (error0, connection) {
        if (error0)
            console.log(error0);
        connection.createChannel(function (error1, channel) {
            if (error1)
                console.log(error1);
            channel.publish(exchange, routingKey, Buffer.from(msg));
            console.log(" [x] Sent %s", msg);
        });
    })
}

function readFile(path) {
    var results = []
    lineReader.eachLine(path, function(line) {
        results.push(line)
        // enqueue all pages in catalog -> eventually this will probably find number of datasets on the top of the page, divide by 20, round up to nearest whole to get MAX_PAGE
        for (i = 2; i <= MAX_PAGE; i++) {
            results.push(`${line}?page=${i}`)
        }
    })

    return results
}
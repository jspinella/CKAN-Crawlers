# ExecutiveCrawlers

Crawlers use [Apify's Puppeteer Scraper](https://apify.com/apify/puppeteer-scraper) to recursively crawl entire websites to determine URLs for scrapers to scrape.

To run the data.gov crawler, `cd` into the datagov folder, run `npm install`, and then run `apify run --purge`. The crawler will publish RabbitMQ messages to the [dev RabbitMQ instance](http://3.15.228.7:15672/#/queues/%2F/scrapers.datagov) (which is IP-restricted and password-protected so reach out to get access), to be consumed by the Data.gov scraper. 
  
### Literature
https://sdk.apify.com/docs/examples/puppeteercrawler

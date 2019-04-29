# web-scraping-framework
A distributed Web-scraping Framework Engine

Master.js is run on a central server:  
**Usage: node master.js --crawler-count=[num-of-crawlers] --url-file=[filename] --s-ip=[ip-block-first-ip] --e-ip=[ip-block-last-ip]**  

Slave.js is run on the machine intended to be used for crawling:  
**Usage: node slave.js --master-url=[e.g http://localhost] --crawler=[crawler-name]**  

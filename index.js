const { searchFacebookPosts, login } = require('./search_facebook')
const puppeteer = require('puppeteer')
const express = require('express');
const app = express();

let page;

app.listen(3000, function(){
    console.log("Server started at port 3000");

})

// localhost:3000/scrape/facebook/?topic=olympics

app.get('/scrape/facebook/', async function(req, res){
    var topic = req.query.topic
    var limit = req.query.limit

    const browser = await puppeteer.launch({ headless: false, defaultViewport: null })
    page = await browser.newPage()

    page.on('console', consoleObj => console.log(consoleObj.text()));
    
    login(page);

    const posts = await searchFacebookPosts(page, topic, limit);
    res.send(posts);
})


// localhost:3000/scrape/twitter/?user=kristinelabador&since=2021-04-19

app.get('/scrape/twitter/', function(req, res){
    var spawn = require("child_process").spawn;
    var process = spawn('python3', ["./search_tweets.py", 
                            req.query.user,
                            req.query.search,
                            req.query.since,
                            req.query.until,
                            req.query.near]);

    var tweetData = ''

    // Accumulate all 'data' chunks to tweetData
    // then join tweetData as string, parse it as JSON on close
    process.stdout.on('data', function(data){
        tweetData += data.toString();
    
    }).on('error', e => {
        console.log(e);
        res.sendStatus(500);
    
    }).on('close', () => {
        let result = tweetData;
        
        if(result.startsWith('ERROR')) {
            console.log(result);
            res.sendStatus(500);
        }else{
            res.send(JSON.parse(tweetData));
        }
    })
})
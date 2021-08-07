const express = require('express');
const app = express();

app.listen(3000, function(){
    console.log("Server started at port 3000");
})

// ex. localhost:3000/get-tweets/carlos-yulo
//     - should display json array with 100 tweets related to carlos yulo
//     - error pa pag may "No more data! Scraping will stop now."

// sample run
//localhost:3000/scrape/twitter/?user=kristinelabador&since=2021-04-19

app.get('/scrape/twitter/', function(req, res){
    var spawn = require("child_process").spawn;
    var process = spawn('bash', ["./script.sh", 
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
            // res.send(JSON.parse(tweetData));
            res.send(tweetData);
        }
    })
})
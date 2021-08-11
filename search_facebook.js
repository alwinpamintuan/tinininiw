const fs = require('fs');
const config = require('./config/config.json');
const cookies = require('./config/cookies.json');
const { Selectors } = require('./constants');

async function searchFacebookPosts(page, topic, limit = 99999){
    
    await page.goto(`https://www.facebook.com/search/latest/?q=${topic}`)
    const posts = await getPosts(page, limit);
    
    return JSON.parse(JSON.stringify(posts))
}

async function getPosts(page, limit){
    let currentHeight, previousHeight;

    do {
        // Scroll down
        previousHeight = await page.evaluate("document.body.scrollHeight")
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
        await page.waitForTimeout(getRndInt(2500, 5000));
        currentHeight = await page.evaluate("document.body.scrollHeight");

        // Count loaded articles
        const articleCount = await openPostContent(page);

        if(articleCount > limit) break;

    }while(previousHeight !== currentHeight)

    const posts = await getPageContent(page)
    return limit !== null ? posts.slice(0, limit) : posts;
}

async function openPostContent(page){
    
    // Wait until see more links are opened
    return await page.evaluate((Selectors) => {
        const see_more = document.querySelectorAll(Selectors.SEE_MORE);
        see_more.forEach(button => button.click())

        const articles = document.querySelectorAll(Selectors.POST);
        return articles.length
    }, Selectors)
}

async function getPageContent(page){

    return await page.evaluate((Selectors) => {

        // Get post content
        const articles = document.querySelectorAll(Selectors.POST);
        
        const pagePosts = []

        articles.forEach(article => {
            var post = document.createElement('div');
            post.innerHTML = article.innerHTML;

            console.log(post.innerHTML)

            const post_url = post.querySelector(Selectors.POST_URL)?.getAttribute('href').split('?')[0]
            const date = post.querySelector(Selectors.DATE)?.textContent;
            const author = post.querySelector(Selectors.AUTHOR)?.textContent;
            const content = post.querySelector(Selectors.POST_CONTENT)?.textContent
            const reactions = post.querySelector(Selectors.REACTIONS)?.textContent
            // const engagements = Array.from(post.querySelectorAll(Selectors.ENGAGEMENTS))?.map(el => el.textContent).slice(0,2)

            if(author !== undefined || content !== undefined)
                pagePosts.push({
                    post_url,
                    date,
                    author,
                    content,
                    reactions,
                    // engagements 
                })
        })
        
        return pagePosts;
    }, Selectors)
}

async function login(page){ 


    // Check if we have previously saved session
    if(Object.keys(cookies).length) {

        // Set saved cookies in the puppeteer browser page
        await page.setCookie(...cookies);
        await page.goto('https://www.facebook.com', { waitUntil: 'networkidle2'});
    
    }else{

        await page.goto('https://www.facebook.com/login', { waitUntil: 'networkidle0'});
        
        await page.waitForSelector('#email');
        await page.type('#email', config['email'], {delay: 100 });

        await page.waitForSelector('#pass')
        await page.type('#pass', config['password'], { delay: 100});

        await page.click('#loginbutton');

        await page.waitForNavigation({ waitUntil: 'networkidle0'});

        // Get current browser page session then write to file
        let currentCookies = await page.cookies();
        fs.writeFileSync('./config/cookies.json', JSON.stringify(currentCookies));
    }
}

function getRndInt(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = {
    login,
    searchFacebookPosts,
    getRndInt
};
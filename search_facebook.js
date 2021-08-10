const fs = require('fs');
const config = require('./config/config.json');
const cookies = require('./config/cookies.json');
const { document, selectors } = require('./constants');

async function searchFacebookPosts(page, topic, limit = 99999){
    
    await page.waitForNavigation({ waitUntil: 'networkidle0'});
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
        await page.waitForTimeout(2500);
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
    return await page.evaluate((selectors) => {
        const see_more = document.querySelectorAll(selectors.SEE_MORE);
        see_more.forEach(button => button.click())

        const articles = document.querySelectorAll(selectors.POST);
        return articles.length
    }, selectors)
}

async function getPageContent(page){

    return await page.evaluate((selectors) => {

        // Get post content
        const articles = document.querySelectorAll(selectors.POST);
        
        const pagePosts = []

        articles.forEach(article => {
            var post = document.createElement('div');
            post.innerHTML = article.innerHTML;

            const author = post.querySelector(selectors.AUTHOR)?.textContent;
            const content = post.querySelector(selectors.POST_CONTENT)?.textContent
            const date = post.querySelector(selectors.DATE)?.textContent
            const engagements = post.querySelector(selectors.ENGAGEMENTS)?.textContent

            pagePosts.push({
                author,
                content,
                engagements
            })
        })

        return pagePosts;
    }, selectors)
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
        await page.type('#email', config['email'], {delay: 50 });

        await page.waitForSelector('#pass')
        await page.type('#pass', config['password'], { delay: 100});

        await page.click('#loginbutton');

        // await page.waitForNavigation({ waitUntil: 'networkidle0'});

        // Get current browser page session then write to file
        let currentCookies = await page.cookies();
        fs.writeFileSync('./cookies.json', JSON.stringify(currentCookies));
    }

    return page
}

module.exports = {
    login,
    searchFacebookPosts
};
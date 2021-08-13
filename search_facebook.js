const fs = require('fs');
const config = require('./config/config.json');
const cookies = require('./config/cookies.json');
const { Selectors } = require('./constants');

async function searchFacebookPosts(browser, page, topic, limit = 99999){
    
    await page.goto(`https://www.facebook.com/search/posts/?q=${topic}`)
    const posts = await getPosts(browser, page, limit);
    console.log('Total posts scraped:', posts.length)
    
    return JSON.parse(JSON.stringify(posts))
}

async function getPosts(browser, page, limit){
    let currentHeight, previousHeight;

    do {
        // Scroll down
        previousHeight = await page.evaluate("document.body.scrollHeight")
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
        await page.waitForTimeout(getRndInt(2500, 5000));
        currentHeight = await page.evaluate("document.body.scrollHeight");

        // Count loaded articles
        const articleCount = await openSearchResultsContent(page);

        if(articleCount > limit) break;

    }while(previousHeight !== currentHeight)

    const posts = await getSearchResultsContent(browser, page)
    return limit !== null ? posts.slice(0, limit) : posts;
}

async function openSearchResultsContent(page){
    
    // Wait until see more links are opened
    return await page.evaluate((Selectors) => {
        const see_more = document.querySelectorAll(Selectors.SEE_MORE);
        see_more.forEach(button => button.click())

        // Return number of articles available
        const articles = document.querySelectorAll(`:is(${Selectors.POST_EXPANDED}, ${Selectors.POST_SEARCHRES})`);
        return articles.length
    }, Selectors)
}

async function getSearchResultsContent(browser, page){

    const articles = await page.$$(Selectors.POST_EXPANDED)

    if(articles.length){
        return await Promise.all(
            articles.map(async article => {
                return await getPostContent(page, article)
            })
        )
    }

    else{

        const searchResultsRefs = await page.$$eval(Selectors.POST_URL_SEARCHRES, el => el.map(x => x.getAttribute('href')))
        const articles = await Promise.all(
            searchResultsRefs.map(async url => {
                
                if(url.startsWith("https://www.facebook.com/")){    
                    const newTab = await browser.newPage()
                    await newTab.goto(url, {waitUntil: 'networkidle2', timeout: 0})

                    // Scrape post
                    if(newTab !== undefined){
                        const article = await newTab.$(Selectors.POST_EXPANDED)

                        if(article){
                            const postContent = await getPostContent(newTab, article)
                        
                            await newTab.waitForTimeout(getRndInt(1000, 3000));
                            await newTab.close()

                            return postContent
                        }

                        await newTab.close()
                    }
                }

                await page.waitForTimeout(getRndInt(1000, 2000));

            })
        )

        return articles.filter(e => e != null)
    }
}

async function getPostContent(page, post){

    return await page.evaluate((Selectors, post) => {
        const post_url = post.querySelector(Selectors.POST_URL_EXPANDED)?.getAttribute('href').split('?')[0]
        const date = post.querySelector(Selectors.DATE)?.textContent;
        const author = post.querySelector(Selectors.AUTHOR)?.textContent;
        const content = post.querySelector(Selectors.POST_CONTENT)?.textContent
        const reactions = post.querySelector(Selectors.REACTIONS)?.textContent
        const engagements = Array.from(post.querySelectorAll(Selectors.ENGAGEMENTS))?.map(el => el.textContent).slice(0,2)

        return {
            post_url,
            date,
            author,
            content,
            reactions,
            engagements
        }

    }, Selectors, post)
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
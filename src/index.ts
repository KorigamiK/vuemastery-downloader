import { Browser, launch, Page } from 'puppeteer';

async function get_video_link(page: Page) {
    let data = await page.evaluate(() => ({
        link: document.getElementsByTagName('iframe')[0].src
    }))
    console.log(data.link)
    return data
}

async function get_url(start_url: string, browser: Browser) {
    console.time(start_url);
    const page = await browser.newPage();
    await page.goto(start_url = start_url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000)
    const startTitle = await page.evaluate(
        () => Array.from(document.body.querySelectorAll('h1.title'), txt => txt.textContent)[0]
    );
    let allTitles = await page.evaluate(
        () => Array.from(document.body.querySelectorAll('h4.list-item-title'), txt => txt.textContent)
    );
    const startIndex = allTitles.indexOf(startTitle);
    allTitles = allTitles.map(t => {
        return t.split(". ")[1];
    });

    console.log(allTitles)
    let prevVideoTitle = '';
    let video_links = []
    try {
        for (let x = startIndex; x < 3000; x++) {
            await page.waitForTimeout(10000);
            let title = await page.evaluate(
                () => Array.from(document.body.querySelectorAll('h1.title'), txt => txt.textContent)[0]
            );
            title = title.replace("/", "-");
            console.log(title)
            if (title === prevVideoTitle) {
                console.log("\x1b[31m%s\x1b[0m", 'More videos not available - This course download aborted. \n Reason: Either you have no access to the following videos or videos have not yet been published. \n');
                break
            }
            video_links.push(await get_video_link(page));
            prevVideoTitle = title;
            await page.click('button[class="next"]')
        }
    } catch (e) {
        console.log(e)
        return video_links
    }
    console.timeEnd(start_url)
    return video_links
}

const auth = async (page: Page, email: string, password: string) => {
    await page.click('button[class="button inverted"]');
    await page.click('button[class="button link"]');

    await page.focus('input[placeholder="Account Email"]');
    await page.keyboard.type(email)
    await page.focus('input[placeholder="Password"]');
    await page.keyboard.type(password)

    await page.click('button[class="button primary -full"]')
    await page.click('button[class="button primary -full"]')
    await page.waitForTimeout(3000)
    await page.close()
}

async function get_all(urls: Array<string>, email: string, pass: string) {
    console.time('main')
    const browser = await launch({ headless: true });
    const login = await browser.newPage()
    await login.goto(home)
    await auth(login, email, pass)
    let tasks = []
    urls.forEach((element: string) => {
        tasks.push(get_url(element, browser))
    });
    const result = await Promise.all(tasks)
    await browser.close()
    console.timeEnd('main')
    return result
}

const home = 'https://www.vuemastery.com/'
let url = 'https://www.vuemastery.com/courses/build-a-gmail-clone-with-vue3/tour-the-project/'
let url2 = 'https://www.vuemastery.com/courses/intro-to-vue-3/intro-to-vue3';
let email = 'fcy12762@eoopy.com'
let pass = 'Boyimmalearnvue';

(async () => { console.log(await get_all([url2, url], email, pass)) })()
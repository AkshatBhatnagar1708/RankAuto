//node HackerRankauto.js --url=https://www.hackerrank.com --config=config.json


let minimist = require("minimist");
let args = minimist(process.argv);
let fs = require("fs");
let puppeteer = require('puppeteer');
let configJSON = fs.readFileSync(args.config,"utf-8");

let configJSO = JSON.parse(configJSON);
//config.id config.pass etc
//IIFI -> immediyely invoked function execution
//async has to be used with awaits
async function run() {
  let browser = await puppeteer.launch({
    headless:false,
    agrs:[
      '--start-maximized'
    ],
    defaultViewport : null
  });

  let pages = await browser.pages();
  let page = pages[0];

  await page.goto(args.url);
  
  await page.waitForSelector("a[data-event-action='Login']");
  await page.click("a[data-event-action='Login']");
 
  await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
  await page.click("a[href='https://www.hackerrank.com/login']");
  
  await page.waitForSelector("input[name='username']");
  await page.type("input[name='username']",configJSO.userid,{delay:30});

  await page.waitForSelector("input[name='password']");
  await page.type("input[name='password']",configJSO.password,{delay:30});

  await page.waitForSelector("button[data-analytics='LoginPassword']");
  await page.click("button[data-analytics='LoginPassword']");
  
  //ck
  await page.waitForSelector("a[data-analytics='NavBarContests']");
  await page.click("a[data-analytics='NavBarContests']");

  //click on manage contest
  await page.waitForSelector("a[href='/administration/contests/']");
  await page.click("a[href='/administration/contests/']");
   
  //find all url of same page
  //document selector all = $$eval
  await page.waitForSelector("a.backbone.block-center");
  let curls = await page.$$eval("a.backbone.block-center",function(atags){
    let urls = [];

    for(i =0;i<atags.length;i++){
      let url = atags[i].getAttribute("href");
      urls.push(url);
    }

    return urls;
    
  });
  
  
  for(let i =0 ;i<curls.length;i++){
    let ctab = await browser.newPage();
    await saveModinContest(ctab,args.url + curls[i],configJSO.moderators);

    await ctab.close();
    await page.waitFor(1000);

  }

}

async function saveModinContest(ctab,fullCurl,moderator){
    await ctab.bringToFront(); //focus
    await ctab.goto(fullCurl);
    await ctab.waitFor(3000);
    await ctab.waitForSelector("li[data-tab='moderators']");
    await ctab.click("li[data-tab='moderators']");

    await ctab.waitForSelector("input#moderator");
    await ctab.type("input#moderator",moderator,{ delay: 50 });

    await ctab.waitFor(3000);
   
    await ctab.keyboard.press("Enter");
    
}


 


run();


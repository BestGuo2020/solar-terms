import { chromium } from 'playwright-core';
const browser=await chromium.launch({executablePath:'C:/Users/He Guo/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  page.on('pageerror',err=>console.log('ERROR',err.stack));
  page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text());});
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await page.screenshot({path:'.qa/desktop.png',fullPage:true});
  console.log(await page.locator('#asset-status').textContent(),await page.locator('.cover-name').textContent());
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(550);
  await page.screenshot({path:'.qa/mobile.png',fullPage:true});
  console.log('mobile overflow',await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth));
}finally{await browser.close();}

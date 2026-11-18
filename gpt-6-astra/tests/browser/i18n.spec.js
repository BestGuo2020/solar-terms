import { test,expect } from '@playwright/test';
import { terms as englishTerms } from '../../src/data/terms.en.js';
import { yearEvents } from '../../src/astronomy.js';

async function ready(page){await page.goto('/');await expect(page.locator('.scene-status')).toHaveCount(0,{timeout:20000});}
async function english(page){await page.getByRole('button',{name:'Switch to English',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('lang','en');}
async function year(page,value){const input=page.getByLabel('Enter simulation year',{exact:true});await input.fill(String(value));await input.press('Enter');}

test('switching language preserves date, selected term, camera and renderer; preference survives reload',async({page})=>{
  await ready(page);
  await page.locator('.season-terms').getByRole('button',{name:'春分，黄经0度，跳转交节',exact:true}).click();
  const before=await page.locator('.date-status time').getAttribute('datetime');
  const canvas=await page.locator('.scene-host canvas').elementHandle();
  await page.getByRole('button',{name:'地球近景',exact:true}).click();
  await english(page);
  await expect(page.locator('.term-title-row h2')).toHaveText('Spring Equinox');
  await expect(page.locator('.date-status time')).toHaveAttribute('datetime',before);
  await expect(page.getByRole('button',{name:'Earth close-up',exact:true})).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(el=>el===document.querySelector('.scene-host canvas'),canvas)).toBe(true);
  await expect(page).toHaveTitle('Suishi · 24 Solar Terms Observatory');
  expect(await page.evaluate(()=>localStorage.getItem('suishi.locale'))).toBe('en');
  await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','en');
  await page.getByRole('button',{name:'Switch to Chinese',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
  await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
});

test('all 24 English terms, detail tabs, orbital labels and reading sections are localized',async({page})=>{
  await ready(page);await english(page);await year(page,2026);
  for(const term of englishTerms){
    await page.locator('.season-terms').getByRole('button',{name:`${term.name}, longitude ${term.longitude} degrees, jump to its starting instant`,exact:true}).click();
    await expect(page.locator('.term-title-row h2')).toHaveText(term.name);
    await expect(page.locator('.term-instant time')).toHaveAttribute('datetime',new Date(yearEvents(2026).find(e=>e.id===term.id).time).toISOString());
    await expect(page.locator('.term-meaning')).toHaveText(term.meaning);
  }
  await page.getByRole('tab',{name:'Farming',exact:true}).click();await expect(page.locator('#term-content>p')).toHaveText(englishTerms[23].farming);
  await page.getByRole('tab',{name:'Traditions',exact:true}).click();await expect(page.locator('#term-content>p')).toHaveText(englishTerms[23].culture);
  await expect(page.locator('#science h2')).toHaveText('The astronomy behind the seasons');
  await expect(page.locator('.history-timeline')).toContainText('Western Han dynasty');
  await expect(page.locator('#song h2')).toHaveText('The Solar Terms Verse');
  await expect(page.locator('#sources')).toContainText('NASA media guidelines');
  await page.getByRole('button',{name:'Orbit view',exact:true}).click();
  await page.getByRole('button',{name:'Jump to Winter Solstice, solar longitude 270 degrees',exact:true}).click();
  await expect(page.locator('.term-title-row h2')).toHaveText('Winter Solstice');
});

test('English verse and future illustration preserve mappings and translate validation errors',async({page})=>{
  await ready(page);await english(page);
  for(const [label,name] of [['Verse line 1, position 1, 春: Start of Spring','Start of Spring'],['Verse line 1, position 4, 春: Spring Equinox','Spring Equinox'],['Verse line 4, position 2, 雪: Minor Snow','Minor Snow'],['Verse line 4, position 3, 雪: Major Snow','Major Snow']]){
    await page.getByRole('button',{name:label,exact:true}).click();await expect(page.locator('.term-title-row h2')).toHaveText(name);
  }
  await page.getByRole('button',{name:'Shu: choose Minor Heat or Major Heat',exact:true}).click();
  await page.getByRole('button',{name:'Major Heat · 120°',exact:true}).click();await expect(page.locator('.term-title-row h2')).toHaveText('Major Heat');
  await year(page,4500);const before=await page.locator('.date-status time').getAttribute('datetime');
  await expect(page.locator('.calculation-notice')).toContainText('Independent illustration');
  await expect(page.locator('.unavailable-instant')).toHaveText('No reliable starting time');
  await page.getByRole('button',{name:'Play independent solar-term illustration',exact:true}).click();
  await expect(page.getByRole('button',{name:'Pause independent solar-term illustration',exact:true})).toBeVisible();
  await expect(page.locator('.date-status time')).toHaveAttribute('datetime',before);
  const input=page.getByLabel('Enter simulation year',{exact:true});await input.fill('invalid');await input.press('Enter');
  await expect(page.locator('.control-error')).toContainText('Enter a whole-number year');
  await page.getByRole('button',{name:'Switch to Chinese',exact:true}).click();await expect(page.locator('.control-error')).toContainText('请输入整数年份');
});

test('English auto-detection and blocked local storage both work',async({browser,baseURL})=>{
  const context=await browser.newContext({locale:'en-US'});
  try {
    const page=await context.newPage();
    await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});});
    await page.goto(baseURL);await expect(page.locator('html')).toHaveAttribute('lang','en');
    await page.getByRole('button',{name:'Switch to Chinese',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
    await expect(page.locator('.scene-host canvas')).toBeVisible();
  } finally {await context.close();}
});

test('English layout fits narrow and wide screens and needs no translation service',async({page,baseURL},info)=>{
  const external=[],origin=new URL(baseURL).origin;
  await page.route('**/*',route=>{if(new URL(route.request().url()).origin!==origin){external.push(route.request().url());return route.abort();}return route.continue();});
  await ready(page);await english(page);
  for(const width of info.project.name==='mobile'?[320,390]:[768,1440]){
    await page.setViewportSize({width,height:1000});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);
    const header=await page.evaluate(()=>[...document.querySelector('.site-header').children].map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right};}));
    for(let i=1;i<header.length;i++)expect(header[i].left).toBeGreaterThanOrEqual(header[i-1].right-1);
    await page.screenshot({path:`.local/english-${width}.png`,scale:'css'});
  }
  expect(external).toEqual([]);
});

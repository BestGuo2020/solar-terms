import { test, expect } from '@playwright/test';
import { yearEvents, formatDate } from '../../src/astronomy.js';
import { terms } from '../../src/data/terms.js';

async function ready(page) {
  await page.goto('/');
  await expect(page.locator('.scene-host canvas')).toBeVisible();
  await expect(page.locator('.scene-status')).toHaveCount(0,{timeout:20000});
}
async function selectYear(page,year) {const input=page.getByLabel('输入模拟年份',{exact:true});await input.fill(String(year));await input.press('Enter');}
async function selectList(page,name) {await page.locator('.season-terms').getByRole('button',{name:new RegExp(`^${name}，`)}).click();}
test('render, assets, all 24 terms and responsive layout',async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await ready(page);
  await expect(page.locator('.live-status')).toBeVisible();
  await expect(page.locator('.orbit-label')).toHaveCount(24);
  await expect(page.locator('.season-terms button')).toHaveCount(24);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);expect(overflow).toBe(false);
  await page.screenshot({path:`.local/${info.project.name}-initial.png`,fullPage:info.project.name==='desktop',scale:'css'});
  expect(errors).toEqual([]);
});
test('all term selections update date, interval, longitude and stop playback',async({page})=>{
  await ready(page);
  await selectYear(page,2026);
  for(const term of terms){
    await selectList(page,term.name);
    await expect(page.locator('.term-title-row h2')).toHaveText(term.name);
    await expect(page.locator('.term-instant time')).toHaveText(formatDate(yearEvents(2026).find(e=>e.id===term.id).time,true));
    await expect(page.locator('.scene-angle strong')).toHaveText(`${term.longitude.toFixed(2)}°`);
    await expect(page.getByRole('button',{name:'播放公转演示',exact:true})).toBeVisible();
  }
  await page.getByRole('tab',{name:'时令农事'}).click();await expect(page.locator('#term-content')).toContainText('越冬作物');
  await page.getByRole('tab',{name:'风物习俗'}).click();await expect(page.locator('#term-content')).toContainText('春节');
});
test('date boundary, timeline, year and live return stay synchronized',async({page})=>{
  await ready(page);
  const date=page.getByLabel('选择北京时间',{exact:true});
  await date.fill('2026-03-20T22:44');await date.dispatchEvent('change');await expect(page.locator('.term-title-row h2')).toHaveText('惊蛰');
  await date.fill('2026-03-20T22:47');await date.dispatchEvent('change');await expect(page.locator('.term-title-row h2')).toHaveText('春分');
  await date.fill('2026-01-01T00:00');await date.dispatchEvent('change');await expect(page.locator('.term-title-row h2')).toHaveText('冬至');await expect(page.locator('.term-instant time')).toContainText('2025.12');
  const timeline=page.getByLabel('拖动年度时间轴');await timeline.scrollIntoViewIfNeeded();const box=await timeline.boundingBox();await timeline.click({position:{x:box.width*.51,y:box.height/2}});await expect(date).toHaveValue(/^2026-07/);
  await selectYear(page,2024);await expect(date).toHaveValue(/^2024-07/);
  await page.getByRole('button',{name:'播放公转演示',exact:true}).click();await expect(page.getByRole('button',{name:'暂停公转演示',exact:true})).toBeVisible();
  await selectList(page,'夏至');await expect(page.getByRole('button',{name:'播放公转演示',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'回到今天',exact:true}).click();await expect(page.locator('.live-status')).toBeVisible();
});
test('camera presets, helper switches, independent rotation and orbit marker click work',async({page},info)=>{
  await ready(page);
  await page.getByRole('button',{name:'轨道总览',exact:true}).click();
  await page.getByRole('button',{name:'跳转到夏至交节时刻，太阳黄经90度',exact:true}).click();
  await expect(page.locator('.term-title-row h2')).toHaveText('夏至');
  await page.getByRole('button',{name:'地球近景',exact:true}).click();
  await page.getByLabel('显示辅助标识与画质设置').click();
  await page.getByLabel('赤道',{exact:true}).check();await page.getByLabel('南北回归线',{exact:true}).check();
  await page.getByLabel('地轴',{exact:true}).uncheck();
  await expect(page.locator('.north-label')).toBeHidden();
  await page.getByLabel('地轴',{exact:true}).check();
  await expect(page.locator('.north-label')).toBeVisible();
  await page.getByLabel('自转演示',{exact:false}).uncheck();
  await expect(page.getByLabel('自转演示',{exact:false})).not.toBeChecked();
  await page.locator('.scene-shell').screenshot({path:`.local/${info.project.name}-earth-close.png`,scale:'css'});
  await page.getByRole('button',{name:'恢复默认',exact:true}).click();
  await expect(page.locator('.orbit-label').first()).toBeVisible();
  const canvas=page.locator('.scene-host canvas');await canvas.focus();await canvas.press('ArrowLeft');await canvas.press('+');
});
test('song repeat characters and paired 暑 map to distinct correct terms',async({page})=>{
  await ready(page);
  const checks=[['歌诀第1句第1处春：立春','立春'],['歌诀第1句第4处春：春分','春分'],['歌诀第2句第1处夏：立夏','立夏'],['歌诀第2句第4处夏：夏至','夏至'],['歌诀第4句第2处雪：小雪','小雪'],['歌诀第4句第3处雪：大雪','大雪']];
  for(const [label,term] of checks){await page.getByRole('button',{name:label,exact:true}).click();await expect(page.locator('.term-title-row h2')).toHaveText(term);}
  await page.getByRole('button',{name:'暑：分别选择小暑或大暑',exact:true}).click();
  await page.getByRole('button',{name:'小暑 · 105°',exact:true}).click();await expect(page.locator('.term-title-row h2')).toHaveText('小暑');
  await page.getByRole('button',{name:'大暑 · 120°',exact:true}).click();await expect(page.locator('.term-title-row h2')).toHaveText('大暑');
});
test('texture failures show fallback without breaking astronomy or controls',async({page})=>{
  await page.route('**/textures/**',route=>route.abort());await page.goto('/');
  await expect(page.locator('.scene-status')).toContainText('地表纹理加载失败',{timeout:20000});
  await selectList(page,'冬至');await expect(page.locator('.term-title-row h2')).toHaveText('冬至');await expect(page.locator('.scene-angle strong')).toHaveText('270.00°');
});

test('tablet and narrow screens retain controls without overflow; year 2050 is no longer an endpoint',async({page},info)=>{
  test.skip(info.project.name!=='desktop','Viewport sweep runs once.');
  await ready(page);
  for(const width of [320,768,1024]){
    await page.setViewportSize({width,height:1000});
    await expect(page.locator('.season-terms button')).toHaveCount(24);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);
    await page.locator('.scene-shell').screenshot({path:`.local/viewport-${width}.png`,scale:'css'});
  }
  await selectYear(page,2050);
  await selectList(page,'冬至');await expect(page.locator('.next-term')).toBeEnabled();
  await page.locator('.next-term').click();await expect(page.getByLabel('输入模拟年份',{exact:true})).toHaveValue('2051');
});

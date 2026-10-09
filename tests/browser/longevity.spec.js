import { test,expect } from '@playwright/test';

async function ready(page){await page.goto('/');await expect(page.locator('.scene-status')).toHaveCount(0,{timeout:20000});}
async function year(page,value){const input=page.getByLabel('输入模拟年份',{exact:true});await input.fill(String(value));await input.press('Enter');await expect(input).toHaveValue(String(value));}
const date=page=>page.getByLabel('选择北京时间',{exact:true});

test('real current date in 2060 is never clamped to 2050',async({page})=>{
  await page.clock.setFixedTime(new Date('2060-06-21T04:00:00Z'));await ready(page);
  await expect(page.locator('.live-status')).toBeVisible();await expect(date(page)).toHaveValue('2060-06-21T12:00');
  await expect(page.locator('.calculation-notice')).toContainText('预测计算值');
  await year(page,2100);await page.getByRole('button',{name:'回到今天',exact:true}).click();
  await expect(page.getByLabel('输入模拟年份',{exact:true})).toHaveValue('2060');
  await expect(page.locator('.live-status')).toBeVisible();
});

test('far future retains its date while term clicks and playback become independent illustration',async({page},info)=>{
  await ready(page);await year(page,4500);
  const original=await date(page).inputValue();
  await expect(page.locator('.calculation-notice')).toContainText('独立节气示意');
  await expect(page.locator('.term-instant time')).toHaveCount(0);
  await expect(page.locator('.term-progress')).toHaveCount(0);
  await expect(page.locator('.timeline-events i')).toHaveCount(0);
  await page.locator('.season-terms').getByRole('button',{name:'冬至，黄经270度，独立示意',exact:true}).click();
  await expect(page.locator('.term-title-row h2')).toHaveText('冬至');await expect(page.locator('.scene-angle')).toContainText('示意黄经');
  await expect(page.locator('.scene-angle strong')).toHaveText('270.00°');await expect(date(page)).toHaveValue(original);
  await page.getByRole('button',{name:'播放独立节气示意',exact:true}).click();
  await expect.poll(()=>page.locator('.scene-angle strong').textContent()).not.toBe('270.00°');
  await expect(date(page)).toHaveValue(original);
  await page.getByRole('button',{name:'暂停独立节气示意',exact:true}).click();
  await page.locator('.observatory-intro').scrollIntoViewIfNeeded();
  await expect(page.locator('.orbit-label.selected')).toHaveText('冬至');
  await page.screenshot({path:`.local/${info.project.name}-year-4500.png`,scale:'css'});
  await year(page,2100);await expect(page.locator('.calculation-notice')).toContainText('预测计算值');
  await expect(page.locator('.term-instant time')).toHaveCount(1);await expect(date(page)).toHaveValue(/^2100-/);
});

test('year zero, large years and invalid input preserve a usable calendar',async({page})=>{
  await ready(page);await year(page,0);await expect(date(page)).toHaveValue(/^0000-/);await expect(page.locator('.calendar-note')).toContainText('公元前 1 年');
  await page.getByRole('button',{name:'上一年',exact:true}).click();await expect(date(page)).toHaveValue(/^-000001-/);
  await year(page,10000);await expect(date(page)).toHaveValue(/^10000-/);await expect(page.locator('.calculation-notice')).toContainText('独立节气示意');
  const original=await date(page).inputValue();const input=page.getByLabel('输入模拟年份',{exact:true});
  await input.fill('9999999999');await input.press('Enter');await expect(page.locator('.control-error')).toBeVisible();await expect(date(page)).toHaveValue(original);
  await page.getByRole('button',{name:'回到今天',exact:true}).click();await expect(page.locator('.control-error')).toHaveCount(0);await expect(page.locator('.live-status')).toBeVisible();
});

test('all runtime assets including the full font load with external networking blocked',async({page,baseURL})=>{
  const external=[];const origin=new URL(baseURL).origin;
  await page.route('**/*',route=>{const url=route.request().url();if(new URL(url).origin!==origin){external.push(url);return route.abort();}return route.continue();});
  await ready(page);
  const fontLoaded=await page.evaluate(async()=>{const fonts=await document.fonts.load('400 18px "Noto Serif SC"','岁时节气');return fonts.length>0&&fonts.every(font=>font.status==='loaded');});
  expect(fontLoaded).toBe(true);expect(external).toEqual([]);
  await year(page,2200);await expect(page.locator('.calculation-notice')).toContainText('预测计算值');
});

test('live clock beyond model coverage is still live while the scene is explicitly illustrative',async({page})=>{
  await page.clock.setFixedTime(new Date('4500-06-21T04:00:00Z'));await ready(page);
  await expect(page.locator('.live-status')).toBeVisible();await expect(date(page)).toHaveValue('4500-06-21T12:00');
  await expect(page.locator('.calculation-notice')).toContainText('独立节气示意');await expect(page.locator('.term-instant time')).toHaveCount(0);
});

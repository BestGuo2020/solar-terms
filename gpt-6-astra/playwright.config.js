import { defineConfig, devices } from '@playwright/test';
const baseURL=process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:5174';
export default defineConfig({
  testDir:'./tests/browser',
  timeout:45000,
  workers:1,
  use:{baseURL,locale:'zh-CN',timezoneId:'America/New_York',trace:'retain-on-failure',screenshot:'only-on-failure',launchOptions:{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--enable-unsafe-swiftshader']}},
  projects:[{name:'desktop',use:{viewport:{width:1440,height:1080}}},{name:'mobile',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}}],
  webServer:process.env.PLAYWRIGHT_BASE_URL?undefined:{command:'npm run dev -- --port 5174',url:baseURL,reuseExistingServer:true},
});

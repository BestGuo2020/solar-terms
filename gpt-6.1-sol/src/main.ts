import './style.css';
import { terms, seasons, seasonColors, history, culture, science, song, sources, type Lang } from './data';
import { eventsForYear, intervalAt, solarLongitude, longitudeText, subsolarLatitude, formatTime, inputDate, parseInputDate, yearStart, MIN_YEAR, MAX_YEAR } from './astronomy';
import { Simulation } from './time';
import { Observatory } from './scene';

let lang: Lang = localStorage.getItem('sui-language') === 'en' ? 'en' : 'zh';
const sim = new Simulation();
let scene: Observatory | undefined;
let textureStatus = 'loading';
let selectedTab = 0;
let shownTerm = -1;
let shownEvent = NaN;
let shownYear = -1;
let lastUi = -Infinity;
let previousFrame = 0;
let frame = 0;
let disposed = false;
let visible = true;
let showHelpers = true;
let viewportObserver: IntersectionObserver | undefined;
const t = (zh: string, en: string) => lang === 'zh' ? zh : en;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const icon = (name: string, size=18) => {
 const paths: Record<string,string> = {
  play:'<path d="m8 5 11 7-11 7z"/>', pause:'<path d="M8 5v14M16 5v14"/>',
  reset:'<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>', arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  orbit:'<ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-30 12 12)"/><circle cx="12" cy="12" r="2"/>',
  earth:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>',
  chevron:'<path d="m8 4 8 8-8 8"/>', sound:'<path d="M8 8H4v8h4l5 4V4L8 8m9 0c3 2 3 6 0 8"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>', down:'<path d="m6 9 6 6 6-6"/>'
 };
 return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.orbit}</svg>`;
};
function botanical(season:number) {
 const shape = season===3
 ? '<path d="M58 105Q94 75 114 25M78 83l-18-22m28 7 27-5M97 52l-15-20m23 6 20-7"/><g fill="currentColor" stroke="none"><circle cx="60" cy="61" r="4"/><circle cx="114" cy="63" r="4"/><circle cx="82" cy="32" r="4"/><circle cx="125" cy="31" r="4"/></g><path d="m36 39 12 12m-12 0 12-12m-6-4v20m-10-10h20" opacity=".5"/>'
 : season===2
 ? '<path d="M60 113Q78 70 98 28M83 64Q42 41 36 65q4 26 38 24m11-23q40-26 47-10-3 27-40 31M71 91l-27-20m48 11 28-18"/><path d="M96 31q-24-28-27-6 0 16 22 20"/>'
 : season===1
 ? '<path d="M83 114V65M83 86q-47 1-43-22 28-2 43 22m0 12q41-4 39-26-25-3-39 26"/><path d="M83 67q-29-13-23-32 15 1 23 20 6-23 20-24 10 21-20 36Z"/><path d="M60 51Q39 31 43 18q23 1 32 26m18-1q17-30 32-29 0 26-23 38"/>'
 : '<path d="M62 114Q81 70 108 28M82 77Q49 75 43 51q28-3 39 26m9-18q31 2 39-25-23-5-39 25M72 94q-34 6-39-13 23-11 39 13"/><g fill="currentColor" fill-opacity=".2"><path d="M82 77Q49 75 43 51q28-3 39 26m9-18q31 2 39-25-23-5-39 25"/></g>';
 return `<svg class="botanical" viewBox="0 0 170 140" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><circle cx="87" cy="65" r="53" stroke-opacity=".15"/><circle cx="87" cy="65" r="42" stroke-opacity=".08"/>${shape}<path d="M38 116h94" stroke-opacity=".25"/></svg>`;
}
function announce(message:string) {$('announcement').textContent=message;}
function selectTerm(id:number) {
 const event=eventsForYear(sim.year).find(e=>e.term.id===id)!;
 sim.set(event.time);update(true);announce(`${terms[id].name[lang]} · ${formatTime(sim.time,lang)}`);
}
function statusText() {
 const messages:Record<string,string>={
  loading:t('正在载入地球纹理…','Loading Earth imagery…'),ready:t('NASA 地球影像已载入','NASA Earth imagery loaded'),
  fallback:t('地球纹理未载入，使用蓝色球体替代','Earth imagery unavailable; showing a blue sphere'),
  webgl:t('3D 显示不可用，节气与时间交互仍可使用','3D is unavailable; the calendar and time controls still work')
 };return messages[textureStatus];
}
function render() {
 scene?.dispose();scene=undefined;shownTerm=-1;shownEvent=NaN;shownYear=-1;
 document.documentElement.lang=lang==='zh'?'zh-CN':'en';
 document.title=t('岁时 · 二十四节气 | 循天时，知四季','SUISHI · 24 Solar Terms | A Year Around the Sun');
 $('app').innerHTML=`
 <a class="skip-link" href="#explore">${t('跳至互动场景','Skip to the observatory')}</a>
 <header class="header wrap">
  <a href="#" class="brand" aria-label="${t('岁时首页','Suishi home')}"><span class="brand-symbol">${icon('orbit',32)}</span><span class="brand-word">岁时<small>SUISHI</small></span><span class="brand-divider"></span><span class="brand-note">${t('二十四节气','THE 24 SOLAR TERMS')}</span></a>
  <nav aria-label="${t('主导航','Main navigation')}"><a href="#explore" class="active">${t('星轨四时','Observatory')}</a><a href="#almanac">${t('节气历','Almanac')}</a><a href="#heritage">${t('岁时人文','Heritage')}</a><a href="#song">${t('节气歌','Solar-term song')}</a></nav>
  <button id="language" class="language" aria-label="${t('Switch to English','切换为中文')}"><span class="${lang==='zh'?'chosen':''}">中</span><i>/</i><span class="${lang==='en'?'chosen':''}">EN</span></button>
 </header>
 <main>
  <section id="explore" class="wrap intro">
   <div><p class="eyebrow"><span></span> A YEAR AROUND THE SUN</p><h1>${t('循天时，<em>知四季。</em>','One orbit. <br><em>A world of seasons.</em>')}</h1></div>
   <div class="intro-note"><span class="intro-number">24</span><p>${t('地球的一次公转，<br>是中国人读懂自然的二十四个刻度。','One journey around the Sun. <br>Twenty-four ways to read the rhythms of nature.')}<small>${t('转动星轨，探索天文与人文的交汇。','Explore where astronomy meets a living tradition.')}</small></p></div>
  </section>
  <section class="wrap observatory" aria-label="${t('二十四节气互动观测台','Interactive solar-term observatory')}">
   <div class="universe">
    <div class="scene-heading"><span><i class="live-dot"></i>${t('日地运行观测','THE SUN–EARTH OBSERVATORY')}</span><span class="scene-index">01 / 03</span></div>
    <div class="scene-readout"><div><span class="micro">${t('太阳地心视黄经','APPARENT SOLAR LONGITUDE')}</span><strong id="longitude">—</strong></div><p>${t('每行15°，一节气','Every 15° marks a new solar term')}</p><p id="declination"></p></div>
    <div id="scene" class="scene"></div>
    <div class="sun-caption">${t('太阳','SUN')}<span>${t('四时之源','OUR SEASONAL CLOCK')}</span></div>
    <div class="scene-key"><span style="--key:#8db9a0">${t('春','Spring')}</span><span style="--key:#d4b975">${t('夏','Summer')}</span><span style="--key:#d58e6c">${t('秋','Autumn')}</span><span style="--key:#91aebb">${t('冬','Winter')}</span></div>
    <div class="closeup-key"><span style="--key:#c8dfdc">${t('地轴倾角 23.44°','Axis tilt 23.44°')}</span><span style="--key:#f0d390">${t('赤道','Equator')}</span><span style="--key:#8fc9c3">${t('南北回归线','Tropics ±23.44°')}</span></div>
    <div class="scene-bottom"><span id="asset-status" role="status">${statusText()}</span><span>${t('尺寸与距离不按实际比例','Sizes and distances are not to scale')}</span></div>
    <div class="scene-toolbar" aria-label="${t('视角控制','Camera controls')}"><button data-view="overview">${icon('orbit')}${t('轨道总览','Orbit')}</button><button data-view="earth">${icon('earth')}${t('地球近景','Earth')}</button><button data-view="default" aria-label="${t('恢复默认视角','Reset view')}" title="${t('恢复默认视角','Reset view')}">${icon('reset')}</button></div>
   </div>
   <aside id="detail" class="detail" aria-label="${t('当前已进入的节气区间详情','Details of the solar-term interval entered')}"></aside>
   <div class="time-panel">
    <div class="time-top"><div class="clock"><span id="time-mode" class="time-mode"></span><time id="date-display"></time><small>${t('北京时间','Beijing time')} · UTC+8</small></div><div class="time-options"><label class="year-select"><span class="sr-only">${t('模拟年份','Simulation year')}</span><select id="year">${Array.from({length:MAX_YEAR-MIN_YEAR+1},(_,i)=>`<option ${MIN_YEAR+i===sim.year?'selected':''}>${MIN_YEAR+i}</option>`).join('')}</select></label><button id="today" class="subtle-button">${icon('reset',15)}${t('回到今天','Today')}</button></div></div>
    <div class="timeline-box"><input id="timeline" type="range" min="0" max="1000000" step="1" aria-label="${t('年度时间轴，左右方向键调整时间','Annual timeline; use arrow keys to adjust time')}"/><div id="timeline-events" class="timeline-events"></div><div class="months">${Array.from({length:12},(_,i)=>`<span>${lang==='zh'?`${i+1}月`:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}</span>`).join('')}</div></div>
    <div class="time-bottom"><div class="playback"><button id="play" class="play-button"></button><label class="speed"><span>${t('公转','Orbit')}</span><select id="speed" aria-label="${t('公转速度','Orbital speed')}">${[.25,1,3,10,30].map(n=>`<option value="${n}" ${n===sim.daysPerSecond?'selected':''}>${n} ${t('天/秒','days/s')}</option>`).join('')}</select></label><span class="control-divider"></span><label class="checkbox"><input id="spin" type="checkbox" ${sim.spinning?'checked':''}/>${t('自转演示','Spin demo')}</label></div><label class="date-picker">${t('选择日期时间','Choose date & time')}<input id="datetime" type="datetime-local" step="1" min="2000-01-01T00:00:00" max="2050-12-31T23:59:59" aria-label="${t('北京时间日期与时间','Date and time in Beijing time')}"/></label></div>
   </div>
  </section>
  <div class="wrap under-controls"><p>${icon('info',14)}${t('拖动旋转 · 滚轮缩放 · 触屏双指缩放 · 也可使用视角按钮','Drag to orbit · Scroll to zoom · Pinch on touchscreens · Camera buttons also work; mobile numbers follow the almanac order')}</p><div><label class="checkbox"><input id="helpers" type="checkbox" ${showHelpers?'checked':''}/>${t('地轴、纬线与公转方向','Axis, latitude circles & orbital direction')}</label><label class="quality"><span class="sr-only">${t('画质','Quality')}</span><select id="quality"><option value="auto">${t('自适应画质','Adaptive quality')}</option><option value="low">${t('低功耗','Low power')}</option><option value="high">${t('高画质','High quality')}</option></select></label></div></div>
  <section class="wrap science-section" id="science"><div class="section-heading"><div><p class="eyebrow">THE SCIENCE OF SEASONS</p><h2>${t('一场公转，何以四季？','What turns an orbit into seasons?')}</h2></div><span class="section-aside">${t('把天文，讲得明白一点。','A little astronomy, made clear.')}</span></div><div class="science-grid">${science.map(s=>`<article><span class="article-number">${s.no}</span><h3>${s.title[lang]}</h3><p>${s.body[lang]}</p></article>`).join('')}</div><p class="hemisphere-note">${icon('earth',15)}${t('这里的传统四季以中国所在的北半球为背景；南半球的季节相反。赤道附近与高海拔地区的季节体验也有不同。','Traditional seasons here describe the Northern Hemisphere, where China lies. Southern Hemisphere seasons are reversed; equatorial and high-elevation climates have different rhythms.')}</p></section>
  <section id="almanac" class="wrap almanac"><div class="section-heading"><div><p class="eyebrow">TWENTY-FOUR MOMENTS</p><h2>${t('二十四节，四时有序。','Twenty-four moments. One unfolding year.')}</h2></div><p class="section-aside">${t('点击节气，抵达它开始的那一刻。','Choose a term to visit its starting instant.')}<br><span id="almanac-year"></span> · ${t('北京时间','Beijing time')}</p></div><div class="term-seasons">${seasons.map((s,i)=>`<div class="season-column" style="--season:${seasonColors[i]}"><h3><span>${s[lang]}</span><small>${['SPRING','SUMMER','AUTUMN','WINTER'][i]}</small></h3><div>${terms.filter(term=>term.season===i).map(term=>`<button class="term-item" data-term="${term.id}"><span class="term-index">${String(term.id+1).padStart(2,'0')}</span><span class="term-title">${term.name[lang]}<small>${lang==='zh'?term.pinyin:term.name.zh}</small></span><span class="term-date" id="term-date-${term.id}"></span><span class="term-degree">${term.longitude}°</span></button>`).join('')}</div></div>`).join('')}</div></section>
  <section id="heritage" class="heritage"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">A LIVING HERITAGE</p><h2>${t('仰观天时，俯察万物。','Watching the sky. Listening to the land.')}</h2></div><span class="heritage-seal">${t('天人<br>之际','SKY<br>& LAND')}</span></div><p class="heritage-lead">${t('节气是时间的刻度，也是人与自然相处的语言。<br>从黄河流域走来的观察与智慧，至今仍在田野、餐桌与诗行间流转。','Solar terms measure time and express a relationship with nature.<br>Knowledge rooted in the Yellow River region still lives in fields, kitchens and poetry.')}</p><div class="history-timeline">${history.map((h,i)=>`<article><span class="history-dot"></span><small>${h.date[lang]}</small><h3>${h.title[lang]}</h3><p>${h.body[lang]}</p><span class="history-num">0${i+1}</span></article>`).join('')}</div><div class="culture-grid">${culture.map(c=>`<article><span class="culture-glyph">${c.glyph}</span><div><h3>${c.title[lang]}</h3><p>${c.body[lang]}</p></div></article>`).join('')}</div><p class="culture-note">${t('习俗是多样的文化实践；物候是有地域差异的自然观察。两者都不应当作全国统一的天气预报或健康建议。','Customs are diverse cultural practices; phenology records local natural patterns. Neither is a nationwide weather forecast or health prescription.')}</p></div></section>
  <section id="song" class="wrap song-section"><div class="song-intro"><p class="eyebrow">THE SONG OF THE SEASONS</p><h2>${t('把一年，<br>轻轻念给你。','A whole year, <br>in four short lines.')}</h2><p>${t('一首广为流传的节气歌，<br>将二十四个名字藏进四句韵文。','A widely shared mnemonic holds<br>twenty-four names in four rhythmic lines.')}</p><span class="song-instruction">${icon('arrow',16)}${t('点击简称，与星轨相逢','Select a character to explore its term')}</span></div><div class="song-lines">${song.map((line,row)=>`<div class="song-row"><span class="song-num">0${row+1}</span><div><p class="verse">${line.chars.map((char,j)=>{const id=line.ids[j];return row===1&&j===4?`<button id="shu" aria-expanded="false" aria-controls="shu-choices" aria-label="${t('暑：选择小暑或大暑','Heat: choose Minor Heat or Major Heat')}">${char}</button>`:id!==null?`<button data-term="${id}" aria-label="${terms[id].name[lang]}">${char}</button>`:`<span>${char}</span>`;}).join('')}<span class="verse-stop">${row===3?'。':'，'}</span></p><p class="song-explanation">${(row===1?[6,7,8,9,10,11]:line.ids.filter((id):id is number=>id!==null)).map(id=>terms[id].name[lang]).join(' · ')}</p>${row===1?`<div id="shu-choices" class="shu-choices" hidden>${t('“暑”合指两个节气：','“Heat” represents two terms: ')}<button data-term="10">${terms[10].name[lang]}</button><button data-term="11">${terms[11].name[lang]}</button></div>`:''}</div></div>`).join('')}<p class="song-footnote">${t('民间通行四句版。“天”“相连”连接韵文；“霜降”是完整节气名；“暑”合指小暑、大暑，“小大寒”合指小寒、大寒。重复的字按位置分别对应。','A common folk version. “天” and “相连” link the verse; “霜降” is a full name. “暑” combines Minor and Major Heat; “小大寒” combines Minor and Major Cold. Repeated characters refer to different terms by position.')}</p></div></section>
  <section class="wrap methodology" id="sources"><details><summary><span>${icon('info',18)}${t('关于历法、模型与参考来源','About the calendar, model & sources')}</span>${icon('down')}</summary><div class="method-body"><div><h3>${t('我们如何计算？','How is it calculated?')}</h3><p>${t('开放年份：2000—2050。Astronomy Engine 2.1.19 根据太阳的地心视黄经（当日真黄道与春分点）求解交节时刻，包括光行时与章动等修正。时区固定为 Asia/Shanghai，全年 UTC+8。时间显示至秒以便观察交节前后；这仅是显示位数，不代表秒级天文精度。内部使用未取整时刻判定节气。','Supported years: 2000–2050. Astronomy Engine 2.1.19 solves crossings of apparent geocentric solar longitude in the true ecliptic and equinox of date, with light-time and nutation corrections. All dates use Asia/Shanghai (UTC+8). Times include seconds to reveal transitions; displayed digits do not imply second-level astronomical accuracy. Interval boundaries use unrounded times.')}</p><p>${t('算法总体角位置精度目标约1角分，不能把求根收敛精度当成历书精度。2026年12个中气与香港天文台年表核对，计算值距其印刷分钟值最大38.7秒；这不代表全年份精度保证。本站用于科普，不作为法定历书。远期 UTC 还取决于未来地球自转与闰秒安排。','The engine targets overall angular accuracy of about one arcminute; root convergence is not almanac accuracy. For the 12 major terms in 2026, computed instants differ from the HKO printed minute by at most 38.7 seconds; this does not guarantee accuracy for all years. This is an educational model, not an official almanac. Future UTC also depends on Earth rotation and leap-second decisions.')}</p></div><div><h3>${t('为了看清，做了哪些简化？','What has been simplified?')}</h3><p>${t('天体尺寸、日地距离与大气厚度均经放大或压缩；轨道以圆形近似，真实偏心率约0.0167。公转角速度仍由实时黄经计算。场景坐标角不等同于太阳黄经：地球位于地心所见太阳方向的反向。固定地轴倾角23.44°，忽略一年内微小的岁差章动。','Bodies, distance and atmosphere thickness are rescaled. A circle approximates the real orbit (eccentricity about 0.0167), while angular speed follows the computed longitude. Scene angles are distinct from solar longitude: Earth is placed opposite the geocentrically viewed Sun. The axis is fixed at 23.44°, omitting small changes within the year.')}</p><p>${t('自转为独立的24秒一圈演示，不对应所选时刻的真实经线朝向。NASA Blue Marble 2048×1024纹理是历史遥感拼合影像，并非实时天气；额外云层、太阳表面、光晕与植物线描均为原创程序化示意。NASA影像按其使用规范署名使用；算法与Three.js为MIT许可。','Rotation is an independent 24-second demonstration, not the real meridian orientation at the selected instant. NASA Blue Marble at 2048×1024 is historical composite imagery, not live weather. Extra clouds, the Sun, halo and botanical drawings are original procedural illustrations. NASA imagery is credited under its usage guidelines; Astronomy Engine and Three.js use MIT licenses.')}</p></div><div class="source-links"><h3>${t('延伸阅读 · 参考资料','Further reading · References')}</h3>${sources.map(([name,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${name}<span>↗</span></a>`).join('')}<a href="https://agri-history.ihns.ac.cn/history/chapter111.htm" target="_blank" rel="noopener noreferrer">${t('中国科学院自然科学史研究所 · 节气史','IHNS, Chinese Academy of Sciences · History')}<span>↗</span></a><a href="https://threejs.org/docs/#OrbitControls" target="_blank" rel="noopener noreferrer">Three.js · OrbitControls<span>↗</span></a></div></div></details></section>
 </main><footer class="wrap footer"><a class="footer-brand" href="#">岁时 <span>SUISHI</span></a><p>${t('以天文为尺，以文化为诗。','Measured by astronomy. Remembered through culture.')}</p><a href="#explore">${t('再看一圈星轨','Back to the observatory')} ↑</a></footer><div id="announcement" class="sr-only" role="status" aria-live="polite"></div>`;
 bind();
 try {scene=new Observatory($('scene'),selectTerm,key=>{textureStatus=key;$('asset-status').textContent=statusText();});scene.setLang(lang);scene.setHelpers(showHelpers);}catch(error){textureStatus='webgl';$('asset-status').textContent=statusText();$('scene').innerHTML=`<div class="webgl-fallback">${icon('orbit',70)}<h3>${t('星轨暂未显现','The observatory could not start')}</h3><p>${t('浏览器未能开启 WebGL。下方节气历、时间轴与详情仍可探索。','WebGL could not start in this browser. The calendar, timeline and details remain available.')}</p></div>`;console.warn('WebGL unavailable',error);}
 viewportObserver?.disconnect();viewportObserver?.observe(document.querySelector('.observatory')!);visible=true;
 update(true);
}
function renderDetail() {
 const {current,next}=intervalAt(sim.time),term=current.term;
 const season=seasons[term.season];
 $('detail').style.setProperty('--season',seasonColors[term.season]);
 $('detail').innerHTML=`<div class="detail-kicker"><span>${t('当前已进入的节气区间','CURRENT SOLAR-TERM INTERVAL')}</span><span>${String(term.id+1).padStart(2,'0')} / 24</span></div><div class="detail-title"><div><p class="pinyin">${term.pinyin.toUpperCase()}</p><h2>${term.name[lang]}</h2><p class="english-name">${lang==='zh'?term.name.en:term.name.zh}</p></div><span class="season-tag">${season[lang]}${lang==='zh'?'季':''}</span></div><p class="meaning">${term.meaning[lang]}</p><div class="term-art">${botanical(term.season)}<div class="art-caption"><span>${t('太阳黄经','SOLAR LONGITUDE')}</span><strong>${term.longitude}<small>°</small></strong></div></div><div class="event-time"><span>${t('交节计算时刻 · 北京时间','COMPUTED START · UTC+8')}</span><strong>${formatTime(current.time,lang)}</strong><small>${t('交节是一个时刻；节气区间持续到下一节气。','A term begins at an instant and lasts until the next begins.')}</small></div><div class="detail-tabs" role="tablist" aria-label="${t('节气内容','Term content')}">${[t('气候物候','Nature'),t('农事活动','Farming'),t('人文习俗','Culture')].map((label,i)=>`<button id="tab-${i}" role="tab" aria-controls="tab-panel" aria-selected="${selectedTab===i}" tabindex="${selectedTab===i?0:-1}" data-tab="${i}">${label}</button>`).join('')}</div><p id="tab-panel" class="detail-copy" role="tabpanel" tabindex="0" aria-labelledby="tab-${selectedTab}">${[term.nature,term.farming,term.culture][selectedTab][lang]}</p><div class="next-term"><div><span>${t('下一节气','UP NEXT')}</span><strong>${next.term.name[lang]} ${icon('arrow',14)}</strong><small>${formatTime(next.time,lang,false)}</small></div><div class="term-arrows"><button id="previous-term" aria-label="${t('跳转至上一节气','Go to previous term')}">${icon('chevron',15)}</button><button id="next-term" aria-label="${t('跳转至下一节气','Go to next term')}">${icon('chevron',15)}</button></div></div>`;
 $('previous-term').onclick=()=>{sim.set(intervalAt(current.time-1).current.time);update(true);};
 $('next-term').onclick=()=>{sim.set(next.time);update(true);};
 $<HTMLButtonElement>('previous-term').disabled=intervalAt(current.time-1).current.time<yearStart(MIN_YEAR);
 $<HTMLButtonElement>('next-term').disabled=next.time>=yearStart(MAX_YEAR+1);
 $('detail').querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(button=>{
  button.onclick=()=>{selectedTab=Number(button.dataset.tab);renderDetail();$(`tab-${selectedTab}`).focus();};
  button.onkeydown=event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();selectedTab=event.key==='Home'?0:event.key==='End'?2:(selectedTab+(event.key==='ArrowRight'?1:2))%3;renderDetail();$(`tab-${selectedTab}`).focus();}};
 });
}
function update(force=false) {
 const now=performance.now();if(!force&&now-lastUi<110)return;lastUi=now;
 const {current}=intervalAt(sim.time);const year=sim.year;
 if(shownEvent!==current.time||force){shownEvent=current.time;shownTerm=current.term.id;renderDetail();document.querySelectorAll<HTMLButtonElement>('.term-item').forEach(button=>{const selected=Number(button.dataset.term)===shownTerm&&current.time>=yearStart(year);button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});}
 $('date-display').textContent=formatTime(sim.time,lang);$('date-display').setAttribute('datetime',new Date(sim.time).toISOString());
 $('time-mode').textContent=sim.live?t('实时时间','LIVE TIME'):t('模拟时间','SIMULATION');$('time-mode').classList.toggle('simulating',!sim.live);
 $('longitude').innerHTML=`${longitudeText(solarLongitude(sim.time))}<span>°</span>`;
 const latitude=subsolarLatitude(solarLongitude(sim.time));$('longitude').title=t(`太阳直射纬度约 ${latitude.toFixed(2)}°（北纬为正）`,`Subsolar latitude approx. ${latitude.toFixed(2)}° (north positive)`);
 $('declination').textContent=t(`直射点：${Math.abs(latitude)<.005?'赤道':`${latitude>=0?'北纬':'南纬'}${Math.abs(latitude).toFixed(2)}°`}`,`Subsolar point: ${Math.abs(latitude).toFixed(2)}°${latitude>=0?'N':'S'}`);
 const progress=(sim.time-yearStart(year))/(yearStart(year+1)-yearStart(year));
 const timeline=$<HTMLInputElement>('timeline');timeline.value=String(Math.round(progress*1e6));timeline.style.setProperty('--progress',`${progress*100}%`);timeline.setAttribute('aria-valuetext',formatTime(sim.time,lang));
 const date=$<HTMLInputElement>('datetime');if(document.activeElement!==date)date.value=inputDate(sim.time);
 $<HTMLSelectElement>('year').value=String(year);
 $('play').innerHTML=icon(sim.playing?'pause':'play',17)+t(sim.playing?'暂停':'播放公转',sim.playing?'Pause':'Play orbit');$('play').setAttribute('aria-pressed',String(sim.playing));
 if(shownYear!==year||force){shownYear=year;$('almanac-year').textContent=String(year);
  document.querySelectorAll<HTMLElement>('.months span').forEach((span,month)=>{
    span.style.left=`${(Date.UTC(year,month,1)-8*3_600_000-yearStart(year))/(yearStart(year+1)-yearStart(year))*100}%`;
  });
  const events=eventsForYear(year);
  for(const event of events){$(`term-date-${event.term.id}`).textContent=new Intl.DateTimeFormat(lang==='zh'?'zh-CN':'en-GB',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit'}).format(new Date(event.time));}
  $('timeline-events').innerHTML=events.map(event=>`<button style="left:${(event.time-yearStart(year))/(yearStart(year+1)-yearStart(year))*100}%" data-timeline-term="${event.term.id}" title="${event.term.name[lang]} · ${formatTime(event.time,lang)}" aria-label="${event.term.name[lang]}"><span style="background:${seasonColors[event.term.season]}"></span></button>`).join('');
  $('timeline-events').querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.onclick=()=>selectTerm(Number(b.dataset.timelineTerm)));
 }
}
function bind() {
 $('language').onclick=()=>{lang=lang==='zh'?'en':'zh';localStorage.setItem('sui-language',lang);render();};
 document.querySelectorAll<HTMLButtonElement>('[data-term]').forEach(button=>button.onclick=()=>{selectTerm(Number(button.dataset.term));if(button.closest('#song')||button.closest('#almanac'))$('explore').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
 document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(button=>button.onclick=()=>{scene?.view(button.dataset.view as 'overview'|'earth'|'default');document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('selected',b===button));announce(button.textContent||t('视角已恢复','View reset'));});
 $('play').onclick=()=>{sim.toggle();update(true);};
 $('today').onclick=()=>{sim.today();update(true);announce(t('已回到当前北京时间','Returned to the current Beijing time'));};
 $<HTMLSelectElement>('speed').onchange=event=>{sim.daysPerSecond=Number((event.target as HTMLSelectElement).value);};
 $<HTMLInputElement>('spin').onchange=event=>{sim.spinning=(event.target as HTMLInputElement).checked;};
 $<HTMLInputElement>('helpers').onchange=event=>{showHelpers=(event.target as HTMLInputElement).checked;scene?.setHelpers(showHelpers);};
 $<HTMLSelectElement>('quality').onchange=event=>{const value=(event.target as HTMLSelectElement).value;scene?.setQuality(value==='low'||value==='auto'&&innerWidth<700);};
 $<HTMLInputElement>('timeline').oninput=event=>{const year=sim.year;sim.set(yearStart(year)+Number((event.target as HTMLInputElement).value)/1e6*(yearStart(year+1)-yearStart(year)-1));update();};
 $<HTMLInputElement>('datetime').onchange=event=>{const el=event.target as HTMLInputElement;if(!el.value||!el.validity.valid){announce(t('请选择2000至2050年间的日期时间','Choose a date between 2000 and 2050'));return;}sim.set(parseInputDate(el.value));update(true);};
 $<HTMLSelectElement>('year').onchange=event=>{const year=Number((event.target as HTMLSelectElement).value);const old=new Date(sim.time+8*3_600_000);const day=Math.min(old.getUTCDate(),new Date(Date.UTC(year,old.getUTCMonth()+1,0)).getUTCDate());sim.set(Date.UTC(year,old.getUTCMonth(),day,old.getUTCHours(),old.getUTCMinutes(),old.getUTCSeconds())-8*3_600_000);update(true);};
 $('shu').onclick=()=>{const show=$('shu-choices').hidden;$('shu-choices').hidden=!show;$('shu').setAttribute('aria-expanded',String(show));};
}
function animate(now:number) {
 if(disposed)return;
 if(!document.hidden){const dt=previousFrame?Math.min((now-previousFrame)/1000,.15):0;sim.advance(dt);if(visible){const interval=intervalAt(sim.time);scene?.render(solarLongitude(sim.time),sim.spin,interval.current.term.id);update();}}
 previousFrame=now;frame=requestAnimationFrame(animate);
}
render();
// Stop GPU work when the observatory leaves the viewport; the single simulation clock remains authoritative.
viewportObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;previousFrame=0;},{rootMargin:'150px'});
viewportObserver.observe(document.querySelector('.observatory')!);
document.addEventListener('visibilitychange',()=>{previousFrame=0;});
window.addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(frame);viewportObserver?.disconnect();scene?.dispose();});
window.addEventListener('pageshow',event=>{if(event.persisted){disposed=false;render();frame=requestAnimationFrame(animate);}});
frame=requestAnimationFrame(animate);

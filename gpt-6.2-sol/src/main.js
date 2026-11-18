import './style.css';
import { terms, seasons, song } from './terms.js';
import { history, culture, science, sources } from './reading.js';
import {
  DAY, MIN_YEAR, MAX_YEAR, minTime, maxTime, clampTime, yearOf, yearStart, formatTime,
  localInput, parseLocalInput, snapshot, solarDeclination,
} from './astronomy.js';
import { createOrbit } from './orbit.js';

const paths = {
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9Z"/>',
  orbit: '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="5.5" transform="rotate(-32 12 12)"/><circle cx="19.5" cy="5" r="1.7" fill="currentColor" stroke="none"/>',
  zoom: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5m-12-9.5h5m-2.5-2.5v5"/>',
  reset: '<path d="M4 11a8 8 0 1 1 1.8 6.2M4 5v6h6"/>',
  sliders: '<path d="M5 3v3m0 4v11m7-18v10m0 4v4m7-18v5m0 4v9M2.5 8h5m2 7h5m2-5h5"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  calendar: '<rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M7.5 3v5m9-5v5m-13 2.5h17"/>',
  play: '<path d="M8 5.5 19 12 8 18.5Z" fill="currentColor" stroke-linejoin="round"/>',
  pause: '<path d="M9 5v14m6-14v14" stroke-width="2.5"/>',
  climate: '<path d="M4 13h13a2.5 2.5 0 1 0-2.5-2.5M3 9h6a2 2 0 1 0-2-2m0 10h9a2 2 0 1 1-2 2"/>',
  farm: '<path d="M12 21v-9M4 5c6 0 8 3 8 7-6 0-8-3-8-7Zm16-2c0 6-2 9-8 9 0-5 2-9 8-9Z"/>',
  scroll: '<path d="M7 19h12a2 2 0 0 0 2-2v-2h-3V5a2 2 0 0 0-2-2H5m2 16a2 2 0 0 1-2-2V7H2V5a2 2 0 0 1 4 0m2 3h6m-6 3h6"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.7 8.3-2.1 5.3-5.3 2.1 2.1-5.3Z"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  external: '<path d="M13 5h6v6m0-6-9 9m7-2v6H6V7h6"/>',
  sparkle: '<path d="M12 2c0 6-4 10-10 10 6 0 10 4 10 10 0-6 4-10 10-10-6 0-10-4-10-10Z"/>',
};
const icon = (name, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
const tr = (zh, en) => lang === 'zh' ? zh : en;
const message = (pair) => pair[lang === 'zh' ? 0 : 1];
const label = (zh, en) => `data-zh="${zh}" data-en="${en}"`;
const textLabel = (zh, en) => `<span ${label(zh, en)}>${zh}</span>`;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const pad = (number) => String(number).padStart(2, '0');
let lang = 'zh';
try {
  if (localStorage.getItem('almanac-language') === 'en') lang = 'en';
} catch { /* Storage can be unavailable in private browsing. */ }
const startingTime = Date.now();
let time = clampTime(startingTime);
let mode = time === startingTime ? 'live' : 'simulation';
let playing = false;
let spin = true;
let activeView = 'default';
let current;
let renderLang;
let lastPulse = performance.now();
let visualStatus = 'loading';
let sourceMode = '';

$('#app').innerHTML = `
  <a class="skip" href="#explore" ${label('跳至节气探索', 'Skip to the explorer')}></a>
  <header class="header">
    <div class="shell header-inner">
      <a class="brand" href="#top"><span class="brand-mark">${icon('orbit', 29)}</span><span><strong ${label('岁时星图', 'Solar Almanac')}></strong><small ${label('THE SOLAR ALMANAC', '岁时星图')}></small></span></a>
      <nav class="nav" ${label('章节导航', 'Sections')} data-aria>
        <a href="#explore" class="is-current" ${label('轨道探索', 'Orbit explorer')}></a>
        <a href="#history" ${label('历史与文化', 'History & culture')}></a>
        <a href="#song" ${label('节气歌', 'Solar term song')}></a>
      </nav>
      <button class="language" id="language" type="button">${icon('globe', 15)}<span>中文</span><i></i><span>EN</span></button>
    </div>
  </header>
  <main class="shell" id="top">
    <section class="intro" aria-labelledby="title">
      <div>
        <div class="eyebrow"><span></span> THE CYCLE OF THE SUN</div>
        <h1 id="title" ${label('二十四节气', 'The Twenty-Four Solar Terms')}></h1>
        <p ${label('沿着地球的公转轨道，看见四季流转，读懂中国人的岁时历法。', 'Follow Earth around the Sun to see the seasons change and explore China’s traditional solar calendar.')}></p>
      </div>
      <div class="intro-clock">
        <span class="status" id="time-mode"></span>
        <time id="hero-date"></time>
        <span class="time-zone">${icon('clock', 13)} ${textLabel('北京时间', 'Beijing time')} <span>UTC+08:00</span></span>
      </div>
    </section>
    <section class="workspace" id="explore" ${label('节气轨道探索', 'Solar term orbit explorer')} data-aria>
      <article class="card stage">
        <div class="stage-head">
          <div class="card-title">${icon('compass', 21)}<h2 ${label('公转轨道', 'Earth’s Orbit')}></h2></div>
          <div class="view-tools" id="view-tools" ${label('视角控制', 'Camera controls')} data-aria>
            <button type="button" class="quiet" data-view="overview">${icon('orbit', 16)} ${textLabel('轨道总览', 'Orbit view')}</button>
            <button type="button" class="quiet" data-view="earth">${icon('zoom', 15)} ${textLabel('地球近景', 'Earth close-up')}</button>
            <button type="button" class="quiet icon-button" data-view="default" ${label('恢复默认视角', 'Reset camera')} data-title>${icon('reset', 16)}</button>
            <div class="guide-wrap">
              <button type="button" class="quiet icon-button" id="guide-button" aria-expanded="false" aria-controls="guides" ${label('辅助标识', 'Scene guides')} data-title>${icon('sliders', 16)}</button>
              <div id="guides" class="guide-popover" hidden>
                <strong ${label('辅助标识 · 3D', 'Scene guides · 3D')}></strong>
                <label><input type="checkbox" name="axis" checked>${textLabel('地轴 · 23.4°', 'Axis · 23.4°')}</label>
                <label><input type="checkbox" name="equator">${textLabel('赤道', 'Equator')}</label>
                <label><input type="checkbox" name="tropics">${textLabel('南北回归线', 'Tropics')}</label>
                <label><input type="checkbox" name="direction" checked>${textLabel('公转方向', 'Orbital direction')}</label>
              </div>
            </div>
          </div>
        </div>
        <div id="orbit-scene" class="orbit-scene" tabindex="0" ${label('公转场景。方向键旋转，正负键缩放。', 'Orbit scene. Use arrow keys to rotate and plus or minus to zoom.')} data-aria>
          <div class="orbit-labels" id="orbit-labels"></div>
          <span id="sun-label" class="body-label sun-label" ${label('太阳', 'Sun')}></span>
          <span id="earth-label" class="body-label earth-label" ${label('地球', 'Earth')}></span>
          <span class="declination" id="declination"></span>
          <span class="scale-note" ${label('尺寸与距离不按实际比例', 'Sizes and distances shown out of scale')}></span>
          <span id="visual-status" class="visual-status" role="status"></span>
        </div>
        <div class="stage-foot">
          <div class="legend" id="legend"></div>
          <span class="controls-hint" ${label('拖动旋转 · 滚动或双指缩放', 'Drag to orbit · Scroll or pinch to zoom')}></span>
        </div>
      </article>
      <aside class="card term-card" aria-labelledby="term-name">
        <div class="term-head">
          <span class="term-watermark" id="term-watermark" aria-hidden="true"></span>
          <div class="term-index"><span class="current-signal"></span><span id="term-state"></span><span class="index-count" id="term-index"></span></div>
          <div class="name-line"><h2 id="term-name"></h2><span id="term-tag"></span></div>
          <div class="term-translit" id="term-translit"></div>
          <p class="term-meaning" id="term-meaning"></p>
        </div>
        <div class="term-inner">
          <div class="term-metrics">
            <div><span ${label('此刻太阳黄经', 'Solar longitude now')}></span><strong id="longitude"></strong></div>
            <div><span ${label('交节黄经', 'Longitude at start')}></span><strong id="term-longitude"></strong></div>
          </div>
          <div class="term-event">${icon('calendar', 15)}<div><span id="event-title"></span><time id="event-time"></time></div><a class="event-precision" href="#sources" ${label('模型计算', 'Calculated')}></a></div>
          <div class="term-topics">
            <div>${icon('climate', 16)}<div><h3 ${label('气候与物候', 'Weather & nature')}></h3><p id="term-weather"></p></div></div>
            <div>${icon('farm', 16)}<div><h3 ${label('农事活动', 'Farming')}></h3><p id="term-farming"></p></div></div>
            <div>${icon('scroll', 16)}<div><h3 ${label('风俗与文学', 'Traditions & literature')}></h3><p id="term-culture"></p></div></div>
          </div>
          <button type="button" class="next-term" id="next-term"></button>
        </div>
      </aside>
      <section class="card timeline" aria-labelledby="timeline-title">
        <div class="timeline-head">
          <div class="card-title">${icon('clock', 20)}<h2 id="timeline-title" ${label('时间控制', 'Time Controls')}></h2></div>
          <div class="time-controls">
            <button type="button" class="primary" id="play"></button>
            <label class="control speed-control"><span ${label('速度', 'Speed')}></span><select id="speed" ${label('公转播放速度', 'Orbital playback speed')} data-aria>
              <option value="1" ${label('1 天/秒', '1 day/s')}></option><option value="3" selected ${label('3 天/秒', '3 days/s')}></option>
              <option value="7" ${label('7 天/秒', '7 days/s')}></option><option value="15" ${label('15 天/秒', '15 days/s')}></option>
            </select></label>
            <label class="control spin-control"><input type="checkbox" id="spin" checked><span ${label('地球自转', 'Earth spin')}></span></label>
            <label class="control date-control">${icon('calendar', 15)}<input type="datetime-local" id="date-input" step="1" ${label('选择北京时间', 'Choose a date and time in Beijing')} data-aria></label>
            <button type="button" class="quiet today" id="today">${icon('reset', 15)} ${textLabel('回到今天', 'Back to today')}</button>
          </div>
        </div>
        <div class="timeline-track">
          <label class="year-picker"><span class="sr-only" ${label('选择年份', 'Select year')}></span><select id="year"></select></label>
          <div class="slider-wrap">
            <div class="time-ticks" id="time-ticks" aria-hidden="true"></div>
            <input type="range" min="0" step="1" id="scrubber" ${label('年度时间轴（以秒为步长）', 'Annual timeline (one-second steps)')} data-aria>
            <div class="months" id="months" aria-hidden="true"></div>
          </div>
        </div>
        <div id="time-error" class="time-error" role="alert"></div>
      </section>
    </section>
    <section class="term-directory" id="directory"></section>
    <div id="reading"></div>
  </main>
  <footer class="footer"><div class="shell"><a class="brand" href="#top"><span class="brand-mark">${icon('orbit', 25)}</span><span><strong ${label('岁时星图', 'Solar Almanac')}></strong></span></a><a href="#sources" ${label('数据与参考来源', 'Data & Sources')}></a></div></footer>
  <div id="announcement" class="sr-only" role="status"></div>`;

const dateInput = $('#date-input');
dateInput.min = localInput(minTime);
dateInput.max = localInput(maxTime);
$('#year').innerHTML = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, index) => {
  const year = MIN_YEAR + index;
  return `<option value="${year}">${year}</option>`;
}).join('');

$('#orbit-labels').innerHTML = terms.map((term) => `
  <button type="button" class="orbit-label${term.cardinal ? ' cardinal' : ''}" data-term="${term.index}" style="--ink:${seasons[term.season].color}">
    <span class="term-dot"></span><span class="orbit-name"></span>
  </button>`).join('');
const orbitLabels = $$('.orbit-label');
const objects = { sun: $('#sun-label'), earth: $('#earth-label') };
const orbit = createOrbit($('#orbit-scene'), orbitLabels, objects, (status) => {
  visualStatus = status;
  showVisualStatus();
});

function showVisualStatus() {
  $('#visual-status').textContent = ({
    loading: tr('正在载入天体纹理…', 'Loading textures…'),
    fallback: tr('WebGL 不可用 · 轨道示意', 'WebGL unavailable · orbit diagram'),
    textureFallback: tr('部分纹理不可用 · 已切换简化材质', 'Some textures unavailable · simplified materials'),
    ready: '',
  })[visualStatus];
}

function linkToSource(id) {
  const source = sources.find(([key]) => key === id);
  return `<a class="source-link" href="${source[3]}" target="_blank" rel="noopener">${tr(source[1], source[2])} ${icon('external', 13)}</a>`;
}

function termButton(term, content = term[lang], className = '') {
  const name = term[lang] + ' · ' + term.longitude + '°';
  return `<button type="button" data-term="${term.index}" class="${className}" aria-label="${name}" title="${name}">${content}</button>`;
}

function readingHeading(eyebrow, title, detail = '') {
  return `<div class="section-heading"><span class="eyebrow"><span></span>${eyebrow}</span><h2>${title}</h2>${detail ? '<p>' + detail + '</p>' : ''}</div>`;
}

function renderReading() {
  $('#directory').innerHTML = readingHeading('THE SOLAR TERMS', tr('节气一览', 'Explore All 24 Terms'),
    tr('按传统节序排列，以立春为首。选择节气，跳转到所选年份的交节时刻。', 'Beginning of Spring opens the traditional sequence. Select a term to jump to its start in the selected year.')) +
    `<div class="directory-grid">${seasons.map((season, index) => `
      <section class="season-directory" style="--ink:${season.color}">
        <h3><span>${season[lang]}</span><small>${tr('北半球', 'Northern Hemisphere')}</small></h3>
        <div>${terms.slice(index * 6, index * 6 + 6).map((term) => termButton(term,
          `<span>${term[lang]}</span><small>${term.longitude}°</small>`, 'term-choice')).join('')}</div>
      </section>`).join('')}</div>`;

  $('#reading').innerHTML = `
    <section class="reading-section" id="history">
      ${readingHeading('ORIGINS', tr('从日影到历法', 'From Shadows to Calendars'))}
      <div class="history-grid">${history.map(([year, title, description, source]) => `
        <article><span class="era">${message(year)}</span><h3>${message(title)}</h3><p>${message(description)}</p>${linkToSource(source)}</article>`).join('')}</div>
    </section>
    <section class="reading-section" id="culture">
      ${readingHeading('LIVING HERITAGE', tr('风物与人间', 'Seasons in Everyday Life'))}
      <div class="culture-grid">${culture.map(([title, description], index) => `
        <article class="card culture-card">${icon(['farm', 'sparkle', 'scroll'][index], 25)}<h3>${message(title)}</h3><p>${message(description)}</p></article>`).join('')}</div>
    </section>
    <section class="reading-section" id="song">
      ${readingHeading('THE SEASONAL RHYME', tr('二十四节气歌', 'The Solar Terms Song'),
        tr('每句记一季。点选简称或全名，即可回到轨道上的对应节气。', 'Each line remembers one season. Select a Chinese shorthand or its full name to jump to that term.'))}
      <div class="song-grid">${song.map((line, i) => `
        <article class="song-card" style="--ink:${seasons[i].color}">
          <span class="song-season">${seasons[i][lang]}</span>
          <div class="song-line" lang="zh-CN">${line.map(([part, mapped]) => {
            if (Array.isArray(mapped)) return `<details class="shared-syllable"><summary title="${tr('暑：小暑与大暑', 'Heat: Minor Heat and Major Heat')}">${part}</summary><div>${mapped.map((index) => termButton(terms[index])).join('')}</div></details>`;
            return mapped === undefined ? `<span>${part}</span>` : termButton(terms[mapped], part);
          }).join('')}</div>
          <div class="song-mapping">${terms.slice(i * 6, i * 6 + 6).map((term) => termButton(term)).join('')}</div>
          <p>${[
            tr('两个“春”依次是立春、春分。', 'The first 春 marks Beginning of Spring; the second marks the spring equinox.'),
            tr('两个“夏”依次是立夏、夏至；“暑”指小暑、大暑。', 'The two 夏 characters are Beginning of Summer and the summer solstice. 暑 stands for both Heat terms.'),
            tr('两个“秋”依次是立秋、秋分；“霜降”使用全名。', 'The first 秋 opens autumn and the second marks the equinox. 霜降 is written in full.'),
            tr('两个“雪”依次是小雪、大雪；末尾“小大寒”指小寒、大寒。', 'The two 雪 characters are Minor Snow and Major Snow. 小大寒 combines Minor Cold and Major Cold.'),
          ][i]}</p>
        </article>`).join('')}</div>
    </section>
    <section class="reading-section science" id="science">
      ${readingHeading('THE SCIENCE', tr('节气背后的天文', 'The Astronomy of the Solar Terms'))}
      <div class="science-list">${science.map(([question, answer, source], index) => `
        <details ${index === 0 ? 'open' : ''}><summary>${message(question)}${icon('down', 16)}</summary><p>${message(answer)} ${linkToSource(source)}</p></details>`).join('')}</div>
    </section>
    <section class="reading-section sources" id="sources">
      ${readingHeading('REFERENCES', tr('数据与参考来源', 'Data & Sources'))}
      <div class="sources-layout">
        <div>
          <p>${tr('支持 2000–2050 年。显示时间为北京时间（Asia/Shanghai，UTC+08:00）。交节是太阳中心的地心视黄经达到指定角度的瞬间；节气区间从该次交节持续到下一次。Astronomy Engine 逐年求根，显示到秒是为了观察交节前后。该模型的通用角度精度约为 ±1 角分，2026 年的 24 个交节时刻与香港天文台年历相差均小于 1 分钟。',
            'Supported years: 2000–2050. Times are shown in Beijing time (Asia/Shanghai, UTC+08:00). A term begins when the Sun’s center, as seen from Earth’s center, reaches its prescribed apparent ecliptic longitude. Its interval lasts until the next crossing. Astronomy Engine solves for each crossing. Seconds are shown to make interval boundaries visible. The engine’s general angular accuracy is about ±1 arcminute, and all 24 results for 2026 were within one minute of the Hong Kong Observatory almanac.')}</p>
          <p>${tr('模型以春分点为太阳黄经 0°。3D 场景中地球的位置沿指向太阳的视线反向放置，两者相差 180°。示意轨道为圆形，沿轨道的速度来自天文计算，地轴倾角固定为 23.4°。尺寸与距离不按实际比例。关闭自转可暂时固定陆海纹理朝向；暂停在模拟时刻时，可独立演示自转。',
            'Solar longitude starts at 0° at the March equinox. The 3D scene puts Earth in the direction opposite the Earth-to-Sun sightline, a difference of 180°. The display uses a circular orbit with ephemeris-driven motion and a fixed axial tilt of 23.4°. Body sizes and distances are out of scale. Turn spin off to freeze the globe textures or pause at a simulated time to demonstrate spin independently.')}</p>
          <p>${tr('纹理由 Solar System Scope 提供，经 WebP 转码，采用 CC BY 4.0 许可。气候与农事为中国部分地区的典型例子，随地点和年份变化。',
            'Textures by Solar System Scope, converted to WebP under CC BY 4.0. Weather and farming examples describe selected regions of China and vary with location and year.')}</p>
        </div><ul>${sources.map(([id]) => `<li>${linkToSource(id)}</li>`).join('')}</ul>
      </div>
    </section>`;
}

function applyLanguage() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = tr('二十四节气 · 岁时星图', 'The Twenty-Four Solar Terms · Solar Almanac');
  $$('[data-zh]').forEach((element) => {
    const translation = element.dataset[lang];
    if (element.hasAttribute('data-title')) {
      element.setAttribute('aria-label', translation);
      element.title = translation;
    } else if (element.hasAttribute('data-aria')) {
      element.setAttribute('aria-label', translation);
    } else {
      element.textContent = translation;
    }
  });
  $('#language').setAttribute('aria-label', tr('Switch to English', '切换到中文'));
  $('#language').dataset.lang = lang;
  $('#year').setAttribute('aria-label', tr('选择年份', 'Select year'));
  dateInput.lang = document.documentElement.lang;
  $('#legend').innerHTML = seasons.map((season) => `<span style="--ink:${season.color}"><i></i>${season[lang]}</span>`).join('');
  orbitLabels.forEach((button, i) => {
    const term = terms[i];
    button.lastElementChild.textContent = lang === 'zh' ? term.zh : term.short;
    button.setAttribute('aria-label', term[lang] + ' · ' + term.longitude + '°');
  });
  renderReading();
  showVisualStatus();
  render(true);
}

function updateDetails(state) {
  const { term } = state.active;
  const season = seasons[term.season];
  $('.term-card').style.setProperty('--term-color', season.color);
  $('#term-state').textContent = mode === 'live' ? tr('当前节气', 'CURRENT TERM') : tr('模拟节气', 'SIMULATED TERM');
  $('#term-watermark').textContent = season.zh;
  $('#term-index').textContent = pad(term.index + 1) + ' / 24';
  $('#term-name').textContent = term[lang];
  $('#term-tag').textContent = tr('北半球 · ' + season.zh, 'NORTH · ' + season.en.toUpperCase());
  $('#term-translit').textContent = lang === 'zh' ? term.en + '  /  ' + term.pinyin : term.zh + '  /  ' + term.pinyin;
  for (const field of ['meaning', 'weather', 'farming', 'culture']) $('#term-' + field).textContent = message(term[field]);
  $('#term-longitude').textContent = term.longitude + '°';
  $('#event-title').textContent = tr('交节时刻 · 北京时间', 'TERM BEGAN · BEIJING TIME');
  $('#event-time').dateTime = new Date(state.active.time).toISOString();
  $('#event-time').textContent = formatTime(state.active.time, lang);
  const next = $('#next-term');
  next.disabled = state.next.time > maxTime;
  next.innerHTML = `<span>${tr('下一节气', 'NEXT TERM')}</span><strong>${state.next.term[lang]}</strong><time datetime="${new Date(state.next.time).toISOString()}">${formatTime(state.next.time, lang, { dateOnly: true })}</time>${icon('arrow', 15)}`;
  $$('[data-term]').forEach((button) => {
    const selected = Number(button.dataset.term) === term.index;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function renderYear(state) {
  const beginning = yearStart(state.year);
  const duration = yearStart(state.year + 1) - beginning;
  $('#year').value = state.year;
  $('#scrubber').max = duration / 1000 - 1;
  $('#time-ticks').innerHTML = state.events.map(({ term, time: eventTime }) =>
    `<i style="--left:${(eventTime - beginning) / duration * 100}%;--ink:${seasons[term.season].color}"></i>`).join('');
  $('#months').innerHTML = Array.from({ length: 12 }, (_, month) => {
    const value = Date.UTC(state.year, month, 1);
    const left = (value - Date.UTC(state.year, 0, 1)) / duration * 100;
    return `<span style="--left:${left}%">${tr((month + 1) + '月', new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(value))}</span>`;
  }).join('');
}

function render(force = false) {
  const state = snapshot(time);
  const languageChanged = renderLang !== lang;
  if (force || languageChanged || state.year !== current?.year) renderYear(state);
  if (force || languageChanged || state.active !== current?.active || sourceMode !== mode) updateDetails(state);
  current = state;
  renderLang = lang;
  sourceMode = mode;
  const declination = solarDeclination(state.longitude);
  const declinationLabel = Math.abs(declination) < .05
    ? tr('太阳直射点：赤道附近', 'Overhead Sun: near the equator')
    : tr('太阳直射点：' + (declination > 0 ? '北纬 ' : '南纬 '), 'Overhead Sun: ')
      + Math.abs(declination).toFixed(1) + '°' + (lang === 'en' ? (declination > 0 ? ' N' : ' S') : '');
  $('#longitude').textContent = (Math.floor(state.longitude * 100 + 1e-9) / 100).toFixed(2) + '°';
  $('#declination').textContent = declinationLabel;
  const live = mode === 'live';
  $('#time-mode').textContent = live ? tr('真实时间', 'LIVE TIME') : tr('模拟时间', 'SIMULATED TIME');
  $('#time-mode').classList.toggle('is-live', live);
  const date = $('#hero-date');
  date.dateTime = new Date(time).toISOString();
  date.textContent = formatTime(time, lang, { minute: true });
  const scrubber = $('#scrubber');
  scrubber.value = Math.floor((time - yearStart(state.year)) / 1000);
  scrubber.style.setProperty('--progress', (Number(scrubber.value) / Number(scrubber.max) * 100) + '%');
  scrubber.setAttribute('aria-valuetext', formatTime(time, lang) + ' · ' + state.active.term[lang]);
  if (document.activeElement !== dateInput || force) dateInput.value = localInput(time);
  orbit.update(state, spin, !playing && !live);
}

function renderPlayButton() {
  $('#play').innerHTML = icon(playing ? 'pause' : 'play', 16) + '<span>' +
    (playing ? tr('暂停公转', 'Pause orbit') : tr('播放公转', 'Play orbit')) + '</span>';
  $('#play').setAttribute('aria-pressed', String(playing));
}

function changeTime(value, nextMode = 'simulation', announce = false) {
  time = clampTime(value);
  mode = nextMode;
  playing = false;
  $('#time-error').textContent = '';
  render(true);
  renderPlayButton();
  if (announce) {
    $('#announcement').textContent = current.active.term[lang] + ' · ' + formatTime(time, lang);
  }
}

function goToTerm(index, scroll) {
  const event = current.events.find(({ term }) => term.index === index);
  if (!event) return;
  changeTime(event.time, 'simulation', true);
  if (scroll) {
    $('#explore').scrollIntoView({ block: 'start' });
    const target = activeView === 'earth' || orbitLabels[index].hidden ? $('#orbit-scene') : orbitLabels[index];
    target.focus({ preventScroll: true });
  }
}

function chooseView(view) {
  activeView = view;
  $$('[data-view]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.view === view));
  });
  orbit.setView(view);
}

$('#language').addEventListener('click', () => {
  lang = lang === 'zh' ? 'en' : 'zh';
  try { localStorage.setItem('almanac-language', lang); } catch { /* Language stays in memory. */ }
  applyLanguage();
  renderPlayButton();
});

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-term], [data-view]');
  if (button?.dataset.term !== undefined) {
    button.closest('details.shared-syllable')?.removeAttribute('open');
    goToTerm(Number(button.dataset.term), !button.classList.contains('orbit-label'));
  }
  if (button?.dataset.view) chooseView(button.dataset.view);
  if (event.target.closest('.nav a')) {
    $$('.nav a').forEach((link) => link.classList.toggle('is-current', link === event.target.closest('.nav a')));
  }
  if (!event.target.closest('.guide-wrap')) setGuidePopover(false);
});

function setGuidePopover(open) {
  $('#guides').hidden = !open;
  $('#guide-button').setAttribute('aria-expanded', String(open));
}

$('#guide-button').addEventListener('click', () => setGuidePopover($('#guides').hidden));
$('.guide-wrap').addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setGuidePopover(false);
    $('#guide-button').focus();
  }
});
$('#guides').addEventListener('change', () => {
  orbit.setGuides(Object.fromEntries($$('#guides input').map((input) => [input.name, input.checked])));
});

$('#play').addEventListener('click', () => {
  if (!playing && time === maxTime) time = minTime;
  playing = !playing;
  mode = 'simulation';
  lastPulse = performance.now();
  renderPlayButton();
  render();
});
$('#today').addEventListener('click', () => {
  const now = Date.now();
  changeTime(now, now === clampTime(now) ? 'live' : 'simulation', true);
});
$('#next-term').addEventListener('click', () => changeTime(current.next.time, 'simulation', true));
$('#spin').addEventListener('change', (event) => {
  spin = event.target.checked;
  orbit.update(current, spin, !playing && mode !== 'live');
});
$('#scrubber').addEventListener('input', (event) => {
  changeTime(yearStart(current.year) + Number(event.target.value) * 1000);
});
$('#year').addEventListener('change', (event) => {
  const year = Number(event.target.value);
  const value = localInput(time);
  const sameDate = parseLocalInput(year + value.slice(4));
  const resolved = Number.isFinite(sameDate) ? sameDate : parseLocalInput(year + '-02-28' + value.slice(10));
  changeTime(resolved, 'simulation', true);
});
dateInput.addEventListener('change', (event) => {
  if (!event.target.value) return;
  const value = parseLocalInput(event.target.value);
  if (!Number.isFinite(value) || value !== clampTime(value)) {
    $('#time-error').textContent = tr('请选择 2000–2050 年内的有效日期和时间。', 'Choose a valid date and time from 2000 to 2050.');
    event.target.value = localInput(time);
    return;
  }
  changeTime(value, 'simulation', true);
});

let ticker;
function startTicker() {
  clearInterval(ticker);
  if (document.hidden) return;
  lastPulse = performance.now();
  ticker = setInterval(() => {
    const now = performance.now();
    if (playing) {
      time = clampTime(time + Math.min(now - lastPulse, 120) / 1000 * Number($('#speed').value) * DAY);
      if (time === maxTime) {
        playing = false;
        renderPlayButton();
      }
      render();
    } else if (mode === 'live' && Math.floor(Date.now() / 1000) !== Math.floor(time / 1000)) {
      time = clampTime(Date.now());
      render();
    }
    lastPulse = now;
  }, 33);
}

document.addEventListener('visibilitychange', () => {
  startTicker();
  if (!document.hidden) orbit.show();
});
window.addEventListener('pagehide', (event) => {
  clearInterval(ticker);
  if (!event.persisted) orbit.dispose();
});
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    startTicker();
    orbit.show();
  }
});

applyLanguage();
renderPlayButton();
chooseView('default');
startTicker();

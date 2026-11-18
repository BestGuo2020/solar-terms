import "./style.css";
import { icon } from "./icons.js";
import { terms } from "./content.js";
import { termsForYear, yearBounds, MIN_YEAR, MAX_YEAR } from "./astronomy.js";
import { createScene } from "./scene.js";
import {
  ms,
  model,
  live,
  playing,
  minimum,
  maximum,
  seek,
  setPlayback,
  setSpeed,
  advance,
  shanghaiISO,
  clockText,
  dayText,
  minuteStamp,
} from "./time.js";
import {
  chapters,
  chapterHTML,
  sourceHTML,
  detailHTML,
  artwork,
  seasonNames,
} from "./reading.js";

const $ = (s) => document.querySelector(s),
  $$ = (s) => Array.from(document.querySelectorAll(s));
const at = (z, e) => (lang ? e : z);
const bi = (z, e) =>
  '<span class="trans" data-zh="' +
  z +
  '" data-en="' +
  e +
  '">' +
  at(z, e) +
  "</span>";
const named = (z, e) =>
  'data-name-zh="' +
  z +
  '" data-name-en="' +
  e +
  '" title="' +
  at(z, e) +
  '" aria-label="' +
  at(z, e) +
  '"';
const seasonSymbols = ["leaf", "sun", "leaf", "snow"];
const app = $("#app");
let lang = 0;
try {
  lang = localStorage.getItem("sishi-language") === "en" ? 1 : 0;
} catch {}
let selectedChapter = -1,
  panel = null;
let scene,
  raf = 0,
  lastFrame = 0,
  lastUpdated = 0,
  cardKey = "",
  resources = "loading",
  theater = false;

app.innerHTML = `
<header class="topbar"><div class="header-inner">
  <a class="brand" href="#observatory" aria-label="四时天文台 · Sishi Observatory"><img src="${import.meta.env.BASE_URL}sun.svg" alt=""><span><b>四时天文台</b><small>SISHI OBSERVATORY</small></span></a>
  <nav class="primary-nav" aria-label="Main"><a class="nav-link current" id="nav-sky" href="#observatory">${bi("天象观测", "Observatory")}</a><button class="nav-link" data-open="atlas">${bi("节气图鉴", "Term atlas")}</button><a class="nav-link" id="nav-culture" href="#reading">${bi("人文历法", "Culture")}</a></nav>
  <div class="header-actions"><button id="language" class="language" ${named("切换中英文", "Switch language")}>${icon("globe", 16)}<span class="lang-zh">中</span><i>/</i><span class="lang-en">EN</span></button><button class="help-button" data-open="sources" ${named("观测说明与参考资料", "Guide and sources")}>${icon("info", 17)}</button></div>
</div></header>
<main class="page"><section id="observatory">
  <div class="hero"><div><div class="eyebrow"><span class="gold-rule"></span> THE TWENTY-FOUR SOLAR TERMS</div>
    <div class="title-line"><h1>${bi("二十四节气观测台", "Solar Term Observatory")}</h1><span class="seal" aria-hidden="true">观<br>象</span></div>
    <p class="intro">${bi("循地球公转之迹，观太阳黄经之变，读懂四时节律。", "Follow Earth’s orbit to discover the astronomy behind the twenty-four solar terms.")}</p></div>
    <div class="time-summary"><div class="time-status"><i class="status-dot"></i><b id="time-mode"></b><span class="timezone">UTC+8</span></div><div class="display-date" id="display-date"></div><div class="beijing-label">${bi("北京时间", "Beijing time")}<span id="display-clock"></span></div></div>
  </div>
  <div class="observation-grid">
    <section class="sky-panel bordered" id="sky-panel" aria-label="Orbital observatory">
      <canvas class="starfield" id="stars" aria-hidden="true"></canvas>
      <div class="sky-head"><div class="panel-name"><span class="orb-icon">${icon("orbit", 23)}</span><h2>${bi("黄道轨道图", "Ecliptic orbit")}</h2><span class="scene-dim">3D</span></div>
        <button id="guide-toggle" class="guide-toggle" aria-controls="guide-menu" aria-expanded="false">${icon("sliders", 15)}${bi("辅助标识", "Guides")}${icon("chevron", 12)}</button>
      </div>
      <div id="guide-menu" class="guide-menu" hidden></div><div id="current-lon" class="longitude-readout"><span>λ</span> ${bi("太阳黄经", "Solar longitude")} <strong id="lon-value"></strong></div>
      <div id="scene-host" class="scene-host" tabindex="0" ${named("交互星图，方向键旋转，加减键缩放", "Interactive orbit. Arrow keys rotate, plus and minus zoom.")}><div id="labels" class="label-layer"></div></div>
      <div class="sky-annotations"><div class="legend">${seasonNames.map((s, i) => '<span><i class="season-dot s' + i + '"></i>' + bi(s[0][0], s[1]) + "</span>").join("")}</div><span>${bi("尺寸与距离不按实际比例", "Sizes and distances are illustrative")}</span></div>
      <div class="sky-controls"><div class="view-group"><button data-view="overview" class="on">${icon("orbit", 15)}${bi("轨道总览", "Orbit view")}</button><button data-view="close">${icon("globe", 15)}${bi("地球近景", "Earth view")}</button></div>
        <div class="view-utils"><button id="restore" ${named("恢复默认视角", "Reset view")}>${icon("reset", 16)}</button><i></i><button id="expand" ${named("展开或收起星图", "Expand or collapse chart")}>${icon("expand", 16)}</button></div>
      </div><span id="asset-status" class="asset-status" role="status"></span>
    </section>
    <aside class="term-card bordered" id="term-card" aria-label="Solar term details"></aside>
  </div>
  <section class="time-panel bordered" aria-label="Time controls">
    <div class="transport"><div class="transport-title">${icon("clock", 18)}<h2>${bi("时间控制", "Time controls")}</h2></div>
      <div class="playback"><button id="play" class="play">${icon("play", 14)}<span></span></button><div class="speed-field"><select id="speed" ${named("模拟速度，天每秒", "Playback speed in days per second")}><option value=".25">0.25×</option><option value="1" selected>1×</option><option value="5">5×</option><option value="15">15×</option></select>${icon("chevron", 12)}</div><span class="speed-unit">${bi("1× = 1 天/秒", "1× = 1 day/s")}</span></div>
      <div class="time-tools"><button data-open="date" class="small-btn">${icon("calendar", 14)}<span id="tool-date"></span>${icon("chevron", 12)}</button><button id="today" class="today-btn">${icon("reset", 14)}${bi("回到今天", "Today")}</button></div>
    </div>
    <div class="timeline-row"><div class="year-field"><select id="year" ${named("选择公历年", "Choose year")}>${Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => "<option>" + (i + MIN_YEAR) + "</option>").join("")}</select>${icon("chevron", 12)}</div><div class="year-track"><div class="range-wrap"><div id="month-ticks" class="month-ticks"></div><input id="timeline" type="range" step="1" ${named("年度时间轴", "Annual timeline")}></div><div id="months" class="months"></div></div></div>
  </section>
</section>
<section id="reading" class="reading"><div class="reading-heading"><span class="heading-mark"></span><h2>${bi("四时人文志", "The seasonal almanac")}</h2><span class="section-english">CULTURAL ALMANAC</span><i></i><button data-open="sources">${bi("资料来源", "Sources")} ${icon("arrow", 14)}</button></div><div id="chapter-menu" class="chapter-menu"></div><div id="article" hidden></div></section>
</main><footer><span>四时天文台 <b>·</b> SISHI OBSERVATORY</span><button data-open="sources">${bi("历算、影像与使用说明", "Calculation, imagery and credits")} ${icon("info", 13)}</button></footer>
<dialog id="dialog"><div class="dialog-head"><div><div class="eyebrow" id="modal-kicker"></div><h2 id="modal-title"></h2></div><button id="dismiss" ${named("关闭", "Close")}>${icon("close", 20)}</button></div><div id="modal-body"></div></dialog>`;

function guideMenu() {
  $("#guide-menu").innerHTML = [
    ["axis", "地轴", "Earth’s axis"],
    ["equator", "赤道", "Equator"],
    ["tropics", "南北回归线", "Tropics"],
    ["direction", "公转方向", "Orbit direction"],
    ["spin", "地球自转", "Daily rotation"],
  ]
    .map(
      ([key, z, e]) =>
        '<label><input type="checkbox" data-setting="' +
        key +
        '" ' +
        (scene.settings[key] ? "checked" : "") +
        "><span>" +
        at(z, e) +
        "</span></label>",
    )
    .join("");
}
function status(value) {
  resources = value;
  const labels = {
    loading: ["正在载入地球影像…", "Loading Earth imagery…"],
    ready: ["", ""],
    canvas: ["二维投影模式", "2D projection mode"],
    "texture-fallback": [
      "影像加载失败 · 示意纹理",
      "Imagery unavailable · schematic texture",
    ],
  };
  $("#asset-status").textContent = labels[value][lang];
  $("#asset-status").hidden = value === "ready";
}
function updateCard() {
  const t = terms[model.index],
    key = [model.index, model.start, lang].join("-");
  if (cardKey === key) return;
  cardKey = key;
  $("#term-card").innerHTML =
    `<div class="term-cover" style="background-image:url('${artwork[t.season]}')"><div class="cover-shade"></div><div class="cover-top"><span class="archive-flag"><i></i>${at("当前节气", "Active term")}</span><span class="term-count">${String(model.index + 1).padStart(2, "0")} / 24</span></div><div class="cover-name"><div><h2>${lang ? t.en : t.zh}</h2><p>${lang ? t.zh : t.en}</p></div><span class="season-chip">${icon(seasonSymbols[t.season], 13)}${seasonNames[t.season][lang]}</span></div></div>
  <div class="term-info"><div class="data-line"><span>${icon("sun", 15)}${at("起始太阳黄经", "Starting longitude")}</span><strong>${t.longitude}°</strong></div>
  <div class="data-line"><span>${icon("clock", 15)}${at("交节时刻", "Term begins")}</span><b>${minuteStamp(model.start)}</b></div>
  <section class="nature"><h3>${icon("leaf", 15)}${at("物候观察", "Field notes")}</h3><p>${t.nature[lang]}</p></section>
  <button class="detail-link" data-open="detail"><span>${icon("book", 15)}${at("阅读节气详解", "Explore this term")}</span>${icon("arrow", 16)}</button></div>`;
}
function updateTime() {
  const displayed = shanghaiISO(ms);
  const year = model.year;
  $("#time-mode").textContent = live
    ? at("实时天象", "Live sky")
    : at("模拟时间", "Simulated time");
  $(".time-status").classList.toggle("sim", !live);
  $("#display-date").textContent = displayed.slice(0, 10).replaceAll("-", ".");
  $("#display-clock").textContent = clockText(ms);
  $("#tool-date").textContent = dayText(ms) + " " + clockText(ms);
  $("#play").innerHTML =
    icon(playing ? "pause" : "play", 14) +
    "<span>" +
    (playing ? at("暂停", "Pause") : at("播放", "Play")) +
    "</span>";
  $("#play").setAttribute("aria-pressed", String(playing));
  $("#year").value = year;
  const [first, last] = yearBounds(year),
    range = $("#timeline");
  range.min = first;
  range.max = last - 1;
  range.value = ms;
  range.setAttribute("aria-valuetext", minuteStamp(ms));
  range.style.setProperty(
    "--progress",
    ((ms - first) / (last - first)) * 100 + "%",
  );
  $("#lon-value").textContent =
    (Math.floor(model.longitude * 100) / 100).toFixed(2) + "°";
  if ($("#months").dataset.key !== year + "-" + lang) {
    $("#months").dataset.key = year + "-" + lang;
    const names = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    $("#months").innerHTML = names
      .map((name, i) => {
        const pct =
          ((Date.UTC(year, i, 1) - 28800000 - first) / (last - first)) * 100;
        return (
          '<span style="left:' +
          pct +
          '%">' +
          (lang ? name : i + 1 + "月") +
          "</span>"
        );
      })
      .join("");
  }
  updateCard();
}
function setTime(value, real = false) {
  seek(value, real);
  scene.setState(model);
  updateTime();
}
function chooseTerm(index, scroll = true) {
  const event = termsForYear(model.year).find((t) => t.index === index);
  setTime(event.ms);
  closeDialog();
  if (scroll)
    $("#observatory").scrollIntoView({ behavior: "instant", block: "start" });
}
function setView(view) {
  scene.view(view);
  $$("[data-view]").forEach((b) => {
    const selected = b.dataset.view === view;
    b.classList.toggle("on", selected);
    b.setAttribute("aria-pressed", selected);
  });
}
function renderChapters() {
  $("#chapter-menu").innerHTML = chapters
    .map(
      ([z, e, en, ic], i) =>
        '<button class="chapter ' +
        (i === selectedChapter ? "active" : "") +
        '" data-chapter="' +
        i +
        '" aria-expanded="' +
        (i === selectedChapter) +
        '" style="--cover:url(' +
        artwork[[2, 1, 0, 3][i]] +
        ')"><span class="chapter-words"><small>' +
        en +
        "</small><b>" +
        at(z, e) +
        '</b></span><span class="chapter-arrow">' +
        icon("arrow", 17) +
        "</span></button>",
    )
    .join("");
  const reader = $("#article");
  reader.hidden = selectedChapter < 0;
  if (selectedChapter >= 0)
    reader.innerHTML =
      '<div class="article-heading"><h2>' +
      chapters[selectedChapter][lang] +
      "</h2><button data-collapse " +
      named("收起文章", "Collapse article") +
      ">" +
      icon("close", 16) +
      "</button></div>" +
      chapterHTML(selectedChapter, lang);
}
function closeDialog() {
  if ($("#dialog").open) $("#dialog").close();
  panel = null;
}
function openPanel(which) {
  if (playing) {
    setPlayback(false);
    updateTime();
  }
  panel = which;
  const term = terms[model.index];
  const titles = {
    detail: [term.zh, term.en],
    date: ["选择模拟时间", "Choose simulation time"],
    atlas: ["节气图鉴", "Solar term atlas"],
    sources: ["观测与资料说明", "Observation guide and sources"],
    heat: ["两暑相连", "The two heat terms"],
  };
  const kickers = {
    detail: "SOLAR TERM NOTES",
    date: "BEIJING TIME · UTC+8",
    atlas: "THE TWENTY-FOUR SOLAR TERMS",
    sources: "OBSERVATORY NOTES",
    heat: "THE SOLAR TERMS SONG",
  };
  $("#modal-title").textContent = titles[which][lang];
  $("#modal-kicker").textContent = kickers[which];
  let body = "";
  if (which === "detail")
    body = detailHTML(
      term,
      model.index,
      lang,
      shanghaiISO(model.start).slice(0, 19).replace("T", " "),
    );
  if (which === "date")
    body = `<form id="date-form"><label for="date-input">${at("北京时间", "Beijing date and time")}</label><input required type="datetime-local" id="date-input" min="2000-01-01T00:00" max="2050-12-31T23:59" value="${shanghaiISO(ms).slice(0, 16)}"><p>${at("支持 2000—2050 年。选择后将暂停公转演示。", "Years 2000–2050. Applying a time pauses orbital playback.")}</p><button class="primary" type="submit">${at("查看此时天象", "Show this instant")} ${icon("arrow", 16)}</button></form>`;
  if (which === "atlas") {
    const events = termsForYear(model.year);
    body =
      '<div class="atlas-intro">' +
      model.year +
      " · " +
      at(
        "北京时间 · 选择节气跳转至交节时刻",
        "Beijing time · Select a term to visit its beginning",
      ) +
      '</div><div class="atlas-grid">' +
      seasonNames
        .map(
          (name, s) =>
            '<section><h3><i class="season-dot s' +
            s +
            '"></i>' +
            name[lang] +
            "</h3>" +
            terms
              .map((t, i) =>
                t.season !== s
                  ? ""
                  : '<button data-term="' +
                    i +
                    '" class="' +
                    (i === model.index ? "selected" : "") +
                    '"><span>' +
                    t[lang ? "en" : "zh"] +
                    "</span><small>" +
                    dayText(events.find((e) => e.index === i).ms).slice(5) +
                    " · " +
                    t.longitude +
                    "°</small></button>",
              )
              .join("") +
            "</section>",
        )
        .join("") +
      "</div>";
  }
  if (which === "sources") body = sourceHTML(lang);
  if (which === "heat")
    body =
      '<div class="heat-picker">' +
      [10, 11]
        .map(
          (i) =>
            '<button class="primary" data-term="' +
            i +
            '">' +
            terms[i][lang ? "en" : "zh"] +
            " " +
            terms[i].longitude +
            "°</button>",
        )
        .join("") +
      "</div>";
  $("#modal-body").innerHTML = body;
  $("#dialog").classList.toggle("wide", which === "atlas");
  $("#dialog").setAttribute("aria-labelledby", "modal-title");
  if (!$("#dialog").open) $("#dialog").showModal();
  $("#dialog").scrollTop = 0;
}
function translate() {
  document.documentElement.lang = lang ? "en" : "zh-CN";
  document.body.classList.toggle("english", !!lang);
  document.title = at(
    "四时天文台 · 二十四节气观测台",
    "Solar Term Observatory · Sishi",
  );
  $$(".trans").forEach(
    (el) => (el.textContent = el.dataset[lang ? "en" : "zh"]),
  );
  $$("[data-name-zh]").forEach((el) => {
    el.title = el.dataset[lang ? "nameEn" : "nameZh"];
    el.setAttribute("aria-label", el.title);
  });
  guideMenu();
  scene.setLanguage(lang);
  status(resources);
  renderChapters();
  updateTime();
  if (panel) openPanel(panel);
}
scene = createScene({
  host: $("#scene-host"),
  starCanvas: $("#stars"),
  labelLayer: $("#labels"),
  terms,
  pick: (i) => chooseTerm(i, false),
  status,
});
scene.setState(model);
setView("overview");
translate();
$("#guide-toggle").onclick = () => {
  const menu = $("#guide-menu");
  menu.hidden = !menu.hidden;
  $("#guide-toggle").setAttribute("aria-expanded", String(!menu.hidden));
};
document.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!e.target.closest("#guide-toggle,#guide-menu")) {
    $("#guide-menu").hidden = true;
    $("#guide-toggle").setAttribute("aria-expanded", "false");
  }
  if (!button) return;
  if (button.dataset.open) openPanel(button.dataset.open);
  if (button.hasAttribute("data-term")) chooseTerm(Number(button.dataset.term));
  if (button.hasAttribute("data-heat")) openPanel("heat");
  if (button.dataset.view) setView(button.dataset.view);
  if (button.hasAttribute("data-chapter")) {
    const i = Number(button.dataset.chapter);
    selectedChapter = selectedChapter === i ? -1 : i;
    renderChapters();
    if (selectedChapter >= 0)
      $("#article").scrollIntoView({ behavior: "instant", block: "start" });
  }
  if (button.hasAttribute("data-collapse")) {
    selectedChapter = -1;
    renderChapters();
    $("#reading").scrollIntoView();
  }
});
$("#guide-menu").addEventListener("change", (e) => {
  scene.settings[e.target.dataset.setting] = e.target.checked;
});
$("#language").onclick = () => {
  lang = 1 - lang;
  try {
    localStorage.setItem("sishi-language", lang ? "en" : "zh");
  } catch {}
  translate();
};
$("#dismiss").onclick = closeDialog;
$("#dialog").addEventListener("close", () => {
  panel = null;
});
$("#dialog").addEventListener("click", (e) => {
  if (e.target !== $("#dialog")) return;
  const r = e.target.getBoundingClientRect();
  if (
    e.clientX < r.left ||
    e.clientX > r.right ||
    e.clientY < r.top ||
    e.clientY > r.bottom
  )
    closeDialog();
});
$("#modal-body").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("#date-input");
  if (!input.reportValidity()) return;
  const stamp = Date.parse(input.value + ":00+08:00");
  if (!Number.isFinite(stamp) || stamp < minimum || stamp >= maximum) return;
  setTime(stamp);
  closeDialog();
});
$("#timeline").addEventListener("input", (e) =>
  setTime(Number(e.target.value)),
);
$("#timeline").addEventListener("keydown", (e) => {
  const days = {
    ArrowLeft: -1,
    ArrowDown: -1,
    ArrowRight: 1,
    ArrowUp: 1,
    PageUp: 30,
    PageDown: -30,
  };
  if (days[e.key]) {
    e.preventDefault();
    const [a, b] = yearBounds(model.year);
    setTime(Math.max(a, Math.min(b - 1, ms + days[e.key] * 86400000)));
  }
});
$("#year").onchange = (e) => {
  const y = Number(e.target.value),
    d = new Date(ms + 28800000),
    m = d.getUTCMonth();
  const day = Math.min(
    d.getUTCDate(),
    new Date(Date.UTC(y, m + 1, 0)).getUTCDate(),
  );
  d.setUTCFullYear(y, m, day);
  setTime(+d - 28800000);
};
$("#today").onclick = () => setTime(Date.now(), true);
$("#restore").onclick = () => setView("overview");
$("#speed").onchange = (e) => setSpeed(Number(e.target.value));
$("#play").onclick = () => {
  setPlayback(!playing);
  lastUpdated = performance.now();
  updateTime();
};
function expand() {
  theater = !theater;
  $("#sky-panel").classList.toggle("theater", theater);
  document.body.classList.toggle("expanded", theater);
  $("#expand").setAttribute("aria-pressed", String(theater));
}
$("#expand").onclick = expand;
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (theater) expand();
    $("#guide-menu").hidden = true;
    $("#guide-toggle").setAttribute("aria-expanded", "false");
  }
});
$("#scene-host").addEventListener("keydown", (e) => {
  if (e.target !== $("#scene-host")) return;
  if (e.key === "Home") {
    e.preventDefault();
    setView("overview");
  } else if (scene.keyboard(e.key)) e.preventDefault();
});
const navObserver = new IntersectionObserver(
  ([entry]) => {
    $("#nav-culture").classList.toggle(
      "current",
      entry.isIntersecting && entry.boundingClientRect.top < innerHeight * 0.6,
    );
    $("#nav-sky").classList.toggle(
      "current",
      !$("#nav-culture").classList.contains("current"),
    );
  },
  { threshold: [0, 0.5, 1] },
);
navObserver.observe($("#reading"));
function loop(now) {
  if (document.hidden) return;
  if ((live || playing) && now - lastUpdated >= (playing ? 85 : 1000)) {
    advance(now - lastUpdated);
    scene.setState(model);
    updateTime();
    lastUpdated = now;
  }
  if (now - lastFrame >= (innerWidth < 650 ? 38 : 30)) {
    scene.update(now);
    lastFrame = now;
  }
  raf = requestAnimationFrame(loop);
}
function resume() {
  cancelAnimationFrame(raf);
  lastUpdated = performance.now();
  lastFrame = 0;
  if (!document.hidden) raf = requestAnimationFrame(loop);
}
document.addEventListener("visibilitychange", resume);
resume();
window.addEventListener("pagehide", (e) => {
  cancelAnimationFrame(raf);
  if (!e.persisted) {
    navObserver.disconnect();
    scene.dispose();
  }
});
window.addEventListener("pageshow", (e) => {
  if (e.persisted) resume();
});

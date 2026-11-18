import { terms, history, culture, science, song, sources } from "./content.js";
import { icon } from "./icons.js";

export const seasonNames = [
  ["春季", "Spring"],
  ["夏季", "Summer"],
  ["秋季", "Autumn"],
  ["冬季", "Winter"],
];
export const artwork = ["spring", "summer", "landscape", "winter"].map(
  (name) => `${import.meta.env.BASE_URL}art/${name}.webp`,
);
export const chapters = [
  ["历史渊源", "Origins", "HISTORY", "book"],
  ["文化价值", "Living traditions", "CULTURE", "leaf"],
  ["二十四节气歌", "The solar terms song", "VERSE", "music"],
  ["天文解读", "The astronomy", "SCIENCE", "orbit"],
];
export function chapterHTML(id, lang) {
  const at = (pair) => pair[lang];
  if (id === 0)
    return (
      '<ol class="history-list">' +
      history
        .map(
          (h) =>
            "<li><h3>" + at(h.date) + "</h3><p>" + at(h.text) + "</p></li>",
        )
        .join("") +
      "</ol>"
    );
  if (id === 1 || id === 3)
    return (
      '<div class="essays">' +
      (id === 1 ? culture : science)
        .map(
          (e) =>
            "<article><h3>" +
            at(e.title) +
            "</h3><p>" +
            at(e.text) +
            "</p></article>",
        )
        .join("") +
      "</div>"
    );
  return (
    '<p class="song-note">' +
    at([
      "点选诗句中的节气简称，可在轨道上查看该节气。第二句的“暑”合指小暑和大暑。",
      "Choose a character to visit its term. In the second line, 暑 represents both Minor Heat and Major Heat.",
    ]) +
    '</p><div class="verses">' +
    song
      .map((row, i) => {
        const indexes = row.flatMap(
          (x) => x.indices || (x.index === null ? [] : [x.index]),
        );
        return (
          '<article><span class="verse-season">' +
          at(seasonNames[i]) +
          '</span><div class="verse">' +
          row
            .map((x) =>
              x.index === null
                ? "<span>" + x.char + "</span>"
                : "<button " +
                  (x.indices ? "data-heat" : 'data-term="' + x.index + '"') +
                  ' title="' +
                  (x.indices
                    ? at(["小暑 / 大暑", "Minor / Major Heat"])
                    : terms[x.index][lang ? "en" : "zh"]) +
                  '">' +
                  x.char +
                  "</button>",
            )
            .join("") +
          '</div><div class="verse-key">' +
          indexes
            .map(
              (index) =>
                '<button data-term="' +
                index +
                '">' +
                terms[index][lang ? "en" : "zh"] +
                "</button>",
            )
            .join("<i>·</i>") +
          "</div></article>"
        );
      })
      .join("") +
    "</div>"
  );
}
export function sourceHTML(lang) {
  const at = (pair) => pair[lang];
  return (
    '<section class="source-notes"><h3>' +
    at(["时间与历算", "Time and calculation"]) +
    "</h3><p>" +
    at([
      "可选年份为 2000—2050 年。全部时间均为北京时间（Asia/Shanghai，UTC+8）。以 Astronomy Engine 计算太阳地心视黄经，每过 15° 求一次交节。区间从交节瞬间开始，到下一次交节前结束。卡片显示交节所在分钟，详解补充模型预报的秒数，内部按毫秒判断边界。",
      "Selectable years are 2000–2050. All times use Beijing time (Asia/Shanghai, UTC+8). Astronomy Engine solves for each 15° crossing of apparent geocentric solar longitude. Each interval starts at its crossing and ends just before the next. The card shows the minute containing the crossing. The detail view includes the predicted seconds. Internal comparisons use milliseconds.",
    ]) +
    "</p><p>" +
    at([
      "2026 年全部 24 项与香港天文台公布的分钟时刻逐项相差不足 1 分钟。这个核验结果适用于该年，模型在其他年份的误差可能不同。",
      "All 24 computed crossings for 2026 differ by less than one minute from the Hong Kong Observatory’s published minute values. Differences can vary in other years.",
    ]) +
    "</p><h3>" +
    at(["模型与视角", "Model and camera"]) +
    "</h3><p>" +
    at([
      "从地球看太阳的方向与从太阳看地球的方向相反。黄经加 180° 后映射到日心轨道，再整体旋转以便观察。模型以圆近似地球轨道，位置随真实黄经非匀速变化。地轴固定倾斜 23.44°，地球自转采用慢速示意。尺寸与距离不按实际比例。星空和太阳纹理为程序绘制。",
      "Earth’s heliocentric direction is opposite the Sun’s direction seen from Earth. The scene adds 180° to solar longitude and applies a fixed viewing rotation. A circle approximates the orbit, with nonuniform motion from calculated longitude. The axis tilts 23.44° in a fixed direction. Daily rotation is slowed for observation. Sizes and distances are illustrative. Stars and the solar texture are procedural.",
    ]) +
    "</p><p>" +
    at([
      "拖动旋转，滚轮或双指捏合缩放。聚焦星图后可用方向键旋转、加减键缩放，Home 键恢复视角。",
      "Drag to orbit. Scroll or pinch to zoom. With the chart focused, use arrow keys to rotate, +/− to zoom, and Home to reset.",
    ]) +
    "</p><h3>" +
    at(["影像与资料", "Imagery and references"]) +
    "</h3><p>" +
    at([
      "地表与云层影像取自 NASA GSFC Blue Marble（2002），作者 Reto Stöckli、Robert Simmon，依 NASA 媒体使用准则作教育展示。云图为历史卫星合成影像。四季山水插画由本项目使用 ImageGen 生成。",
      "Surface and cloud imagery comes from NASA GSFC’s Blue Marble (2002), by Reto Stöckli and Robert Simmon, used for education under NASA media guidelines. The clouds are a historical satellite composite. The seasonal landscape illustrations were generated for this project with ImageGen.",
    ]) +
    '</p></section><ul class="source-links">' +
    [
      ...sources,
      {
        title: [
          "香港天文台 · 交节时刻",
          "Hong Kong Observatory · Annual solar terms",
        ],
        url: "https://www.hko.gov.hk/en/gts/astronomy/Solar_Term.htm",
      },
      {
        title: ["Astronomy Engine · 天文算法", "Astronomy Engine · Algorithms"],
        url: "https://github.com/cosinekitty/astronomy/tree/master/source/js",
      },
      {
        title: ["NASA · 蓝色弹珠", "NASA · Blue Marble"],
        url: "https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/",
      },
      {
        title: ["NASA · 媒体使用准则", "NASA · Media usage guidelines"],
        url: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
      },
      {
        title: ["Three.js · 视角控制", "Three.js · OrbitControls"],
        url: "https://threejs.org/docs/#OrbitControls",
      },
    ]
      .map(
        (s) =>
          '<li><a href="' +
          s.url +
          '" target="_blank" rel="noreferrer">' +
          at(s.title) +
          " ↗</a></li>",
      )
      .join("") +
    "</ul>"
  );
}
export function detailHTML(term, index, lang, when) {
  const at = (p) => p[lang];
  return (
    '<div class="detail-cover" style="background-image:url(' +
    artwork[term.season] +
    ')"></div><div class="detail-meta"><span>' +
    at(seasonNames[term.season]) +
    " · " +
    String(index + 1).padStart(2, "0") +
    " / 24</span><span>" +
    term.longitude +
    '°</span></div><p class="crossing-note">' +
    icon("clock") +
    at(["交节时刻", "Begins"]) +
    " " +
    when +
    " (UTC+8)</p>" +
    ["meaning", "nature", "farm", "custom"]
      .map(
        (key, i) =>
          '<section class="detail-text"><h3>' +
          at(
            [
              ["名称含义", "Meaning"],
              ["气候与物候", "Weather and nature"],
              ["时令农事", "In the fields"],
              ["风俗与生活", "Customs and daily life"],
            ][i],
          ) +
          "</h3><p>" +
          term[key][lang] +
          "</p></section>",
      )
      .join("")
  );
}

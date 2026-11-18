# 岁时星图 · The Solar Almanac

在地球公转轨道上浏览二十四节气，观察四季、太阳黄经与日照的关系，并阅读节气的历史、风俗与歌谣。站点支持简体中文和英文。纹理、字体、节气数据与计算代码均随项目提供。

## 本地运行

需要 Node.js 20.19+ 或 22.12+。

```sh
npm ci
npm run dev
```

打开终端打印的本地地址，默认为 http://127.0.0.1:5173/。

- `npm test` 验证节气顺序、所有支持年份的交节计算、交节前后和跨年判断、四个分至点的受光关系，以及节气歌的映射。
- `npm run build` 生成 `dist/`。可用 `npm run preview` 本地预览构建产物。

## 交互与实现

- **统一时间状态**。`src/main.js` 维护真实或模拟时间。拖动年度时间轴、输入北京时间、播放公转、选择节气或点击“回到今天”都会更新同一状态。任意节气标记、节气一览及节气歌的链接都会暂停公转并定位到交节。
- **公转与自转**。`src/orbit.js` 使用 Three.js 和 OrbitControls。地图自转可独立开关。在模拟时间暂停时，可演示独立自转。用鼠标拖动、滚轮或触屏手势控制视角，也可聚焦场景后用方向键及加减键。
- **地轴与日照**。地轴与轨道法线成固定的 23.4°。模型地球的位置取太阳视线的反方向，春分对应场景的 +X。夏至时北半球朝向太阳，冬至时南半球朝向太阳。昼夜着色来自地球相对太阳的方向，昼面由海陆和云层纹理表现，夜面可见城市灯光。
- **渲染与降级**。移动端降低分辨率上限与球体细分。页面隐藏或轨道离开视口时减少渲染，并在退出页面时清理资源。纹理失败时使用简化材质，WebGL 不可用时显示保留时间联动和节气标记的二维轨道图。
- **双语内容**。`src/terms.js` 包含 24 个节气的名称、黄经、气候物候、农事和传统文化。历史、文化、科学问答及来源在 `src/reading.js`。

## 数据精度与模型简化

支持 **2000–2050 年**，时间统一以 **Asia/Shanghai（UTC+08:00）** 显示。节气区间由最近一次交节开始，并持续到下一次交节。年初尚未到小寒时，区间始于上一年冬至。

`src/astronomy.js` 通过 Astronomy Engine 的 `SearchSunLongitude` 逐一求解太阳中心地心视黄经到达目标值的时刻。相邻节气相隔 15°，时间间隔随地球运动而变化。程序将求解结果取整到秒，用于演示交节前后的变化。Astronomy Engine 的通用角度精度约为 ±1 角分。2026 年全部 24 个结果与香港天文台公布的分钟值相差不到 1 分钟。这个实测差值适用于所核对的年份。[Astronomy Engine](https://github.com/cosinekitty/astronomy) · [香港天文台 2026 年年历](https://www.hko.gov.hk/en/gts/astron2026/almanac2026_index.htm)

场景采用圆形轨道，并用天文计算得到的黄经驱动其非匀速运动。模型将轴倾角固定为 23.4°，天体尺寸和日地距离经过放大或压缩，以便观察。节序采用北半球传统分季，地方气候、物候和农时因地域与年份而异。[NASA 地球资料](https://science.nasa.gov/earth/facts/) · [香港天文台节气定义](https://www.hko.gov.hk/en/gts/time/24solarterms.htm)

## 素材与参考来源

- 地球昼面、夜面、云层和太阳纹理由 [Solar System Scope](https://www.solarsystemscope.com/textures/) 提供。项目将 2048×1024 纹理转码为 WebP，采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可。
- Noto Serif SC 和 Cormorant Garamond 字体采用 SIL Open Font License 1.1，许可文本见 `public/fonts/`。
- 历史与文化参考 [《淮南子·天文训》](https://ctext.org/huainanzi/tian-wen-xun)、[中国非物质文化遗产网](https://www.ihchina.cn/project_details/25576) 与 [UNESCO 代表作名录](https://ich.unesco.org/en/RL/the-twenty-four-solar-terms-knowledge-of-time-and-practices-developed-in-china-through-observation-of-the-suns-annual-motion-00647)。
- 视角交互使用 [Three.js OrbitControls](https://threejs.org/docs/#OrbitControls)。

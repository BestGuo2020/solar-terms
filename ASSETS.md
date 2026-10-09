# 纹理来源与使用说明

## 本地字体（2026-10-09 新增）

运行时已移除 Google Fonts 网络请求，改用 `public/fonts/NotoSerifSC-Variable.woff2`。这是 Google Fonts 官方 Noto Serif SC 完整可变字体的 WOFF2 压缩版本（10.52 MiB，字重 200–900），未按当前页面文字裁切。字体采用 SIL OFL 1.1；原始来源、处理方法及 SHA-256 见 `public/fonts/SOURCE.md`、`font-metadata.json`，完整许可见 `public/fonts/OFL.txt`。使用 `font-display: swap`，加载期间或文件失败时使用系统字体。

运行库许可证另见 [THIRD_PARTY.md](THIRD_PARTY.md)。所有运行素材均随源码与静态产物保存。

核验日期：2026-10-08。运行时从本项目本地加载纹理，不依赖远程图片服务。

| 本地文件 | 用途 | 尺寸 | 文件大小 |
| --- | --- | --- | --- |
| `public/textures/earth-day-2048.jpg` | 地球海陆、海冰表面颜色 | 2048 × 1024 | 266,599 字节 |
| `public/textures/earth-clouds-2048.jpg` | 云层亮度／透明度遮罩 | 2048 × 1024 | 829,367 字节 |

两张图均为全球等距圆柱投影，直接下载自 NASA，未裁剪、重采样、调色或重新压缩。合计约 1.05 MiB；解码后的 GPU 占用高于文件大小。

## 地球表面

- 名称：Blue Marble — Land Surface, Ocean Color, and Sea Ice。
- 原始文件：<https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_2048.jpg>
- 官方项目介绍：<https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/>
- 来源与署名：NASA Goddard Space Flight Center；影像 Reto Stöckli，增强处理 Robert Simmon；MODIS 科学团队等提供数据支持。
- SHA-256：`d4dc80a6ef571939d0abe04a9bed3d3d1e6cd63e59514be1c5e43a6b069e6f1e`。

这是一张卫星观测合成的静态地表纹理，并非所选日期的实时地表、积雪或植被状况。昼夜明暗由场景太阳光照计算，不烘焙在该纹理内。

## 云层

- 名称：Blue Marble: Clouds。
- 原始文件：<https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg>
- 原始目录记录：<https://visibleearth.nasa.gov/images/57747/blue-marble-clouds/77558l>（旧站已迁移，可能重定向）。
- 当前官方项目介绍：<https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/>
- 来源与署名：NASA Goddard Space Flight Center；Reto Stöckli（云层影像），Robert Simmon（增强处理）。
- SHA-256：`daddaad84d7a33bbbc86cdda3f591099f57cee8607b7bcf3b67eb7e4f7a1c793`。

NASA 说明此云层图合成了两天的可见光影像，以及极地区域另一天的热红外影像。它用于呈现云层的视觉细节，不是实时天气，不随模拟日期更新。黑色代表透明区域，亮部用于白色云层的透明度遮罩。

## 使用条款

NASA [Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) 说明，NASA 图像及用于三维模型的纹理等媒体一般不受美国版权保护，可用于教育、信息传播、计算机图形模拟及网页；应注明 NASA 来源，不暗示 NASA 背书，并留意另行标注的第三方权利。本项目所选 Blue Marble 官方介绍明确向教育工作者、科学家、博物馆和公众开放这些图像，所选文件没有另行标注的第三方版权限制。

建议页面署名：**地球与云层纹理：NASA Goddard Space Flight Center / Reto Stöckli、Robert Simmon（Blue Marble）；依据 NASA 媒体使用规则用于科普展示。**

本项目不使用 NASA 标志，也不暗示 NASA 审核或认可本项目。太阳表面、光晕、星空和辅助线如由项目代码生成，属于示意视觉效果，不能称作太阳的实测影像。

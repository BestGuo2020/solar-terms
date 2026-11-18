# Noto Serif SC 本地字体

获取与核验日期：2026-10-09。

## 文件

- `NotoSerifSC-Variable.woff2`：可离线加载的可变字体，11,032,420 字节（约 10.52 MiB），字重轴 `wght` 为 200–900，含 400、500、600。
- `OFL.txt`：官方 SIL Open Font License 1.1 许可证原文，随字体一同分发。
- `font-metadata.json`：原始文件和压缩文件的 SHA-256、大小、字体版本、字符数、字形数及字重轴记录。

## 官方来源

字体来自 Google Fonts 官方仓库的 `ofl/notoserifsc/NotoSerifSC[wght].ttf`：

- [官方字体目录](https://github.com/google/fonts/tree/main/ofl/notoserifsc)
- [固定版本的原始 TTF](https://raw.githubusercontent.com/google/fonts/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf)
- [固定版本的许可证](https://raw.githubusercontent.com/google/fonts/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/notoserifsc/OFL.txt)
- [固定版本的官方元数据](https://github.com/google/fonts/blob/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/notoserifsc/METADATA.pb)
- [上游 Noto CJK 仓库](https://github.com/notofonts/noto-cjk)

Google Fonts 提交：`8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5`。官方元数据指定上游 Noto CJK 提交为 `985fa52c81c1d6692ccdd82bc3656e8fb932fd89`。

## 处理与覆盖范围

官方目录提供完整 TTF，未提供单文件 WOFF2。本地文件使用 fontTools 4.65.0 将该 TTF 转为 WOFF2 容器，未按页面文字提取子集、未删减字符或字形、未固定或缩减字重轴、未改变字体名称。该文件保留官方 Noto Serif SC 发行文件的全部 30,928 个 Unicode 字符映射和 31,058 个字形；这不等于宣称包含所有 Unicode 字符或所有 CJK 地区的独立字体。字体版本为 2.003-H1。

压缩完成后，重新读取 WOFF2，逐项确认其最佳 Unicode 字符映射、完整字形顺序、可变字重轴与原始 TTF 一致。原始 TTF 只在处理时读入内存，不额外占用发布目录。

## 许可与署名

字体采用 SIL Open Font License 1.1。允许嵌入网页、修改和随软件分发；须保留版权与许可，字体本身不得单独售卖，不得将字体改授其他许可证。完整条款以随附 `OFL.txt` 为准。

官方许可证文件载有 `Copyright 2012 Google Inc. All Rights Reserved.`；官方字体元数据另载 `(c) 2017-2024 Adobe (http://www.adobe.com/).`。两者均原样保留，并在 `font-metadata.json` 记录字体内部版权信息。

建议页面或素材清单署名：**Noto Serif SC · Google / Adobe · SIL OFL 1.1**。

## 集成提示

本地字体为正常样式，可在 `@font-face` 中声明 `font-weight: 200 900`、`font-style: normal` 和 `font-display: swap`，来源使用本项目相对路径 `fonts/NotoSerifSC-Variable.woff2`。保留中文宋体等系统回退字体，完整字体首次载入较大，适合缓存使用。

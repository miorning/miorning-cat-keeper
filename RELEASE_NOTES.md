# 喵咛·收纳猫 / Miorning Cat Keeper v0.3.2

2026-10-28 · [简体中文](README.md) · [English](README.en.md)

## 中文

**修复把网站自带头像、消息等控件误当成扩展图标收纳的问题。** 本版收紧识别规则，只收纳浏览器扩展注入网页的小型悬浮入口。

- 移除仅凭尺寸、位置或悬浮样式判断“这是扩展入口”的规则。
- 只有命中已知适配规则，或入口本身具有可确认的扩展资源来源，才参与收纳。
- 自动扫描、手动点选与已保存规则都需要符合来源要求。网站自己的头像、消息、客服、导航等控件不作为收纳目标。
- 无法确认来源时跳过，包括只有内联图形、无法辨认来源的未知扩展入口。支持不限五款，但不承诺覆盖所有扩展。

拄拐慢走、分段追逃、电动车与翻滚、上下贴边、拖尾巴拔猫、跨页同步、逐项显示、两个快捷键和五连点彩蛋保持原有行为。原插件继续运行并处理自己的快捷键。

**下载：** [MiorningCatKeeper-v0.3.2-Chrome-Edge.zip](https://github.com/miorning/miorning-cat-keeper/releases/download/v0.3.2/MiorningCatKeeper-v0.3.2-Chrome-Edge.zip)。校验值见同一发布页 `SHA256SUMS.txt`。安装包仅包含插件运行文件及中英说明、隐私和许可证文档，图片采用无损压缩；无需编译，未上架扩展商店。

**已有安装：** 用新版 `extension` 内文件覆盖原安装目录，在 Chrome / Edge 扩展管理页重新加载原扩展，然后刷新受影响的网页。不要先卸载。首次安装则开启开发者模式，选择「加载已解压的扩展程序」，加载包内直接包含 `manifest.json` 的 `extension` 文件夹。默认 `Alt + Shift + K` 收纳 / 释放，`Alt + Shift + H` 隐藏 / 显示。

地址栏旁的浏览器工具栏图标不在收纳范围，需手动取消固定。跨域 iframe、canvas 内部及受保护页面仍有访问限制。兼容性检查使用隔离浏览器与本地提供的页面，不代表所有网站或第三方扩展已验收；本版优先跳过来源不明的控件。

`extension/` 提供完整、可直接加载的运行源码及本地资源。无服务器、上传接口或遥测，偏好保存在本机。自有内容在适用版权范围内采用 GPL-3.0-only；分发受约束版本时应提供对应源码并保留声明。详见 [隐私说明](PRIVACY.md) 与 [LICENSE](LICENSE)。

## English

**Fixes website-owned avatars, messaging buttons and other controls being mistaken for extension launchers.** This release tightens discovery so collection targets only small floating launchers injected into webpages by browser extensions.

- Removes classification based solely on size, position or floating style.
- Requires a known adapter match or identifiable extension resources on the launcher itself before collection.
- Applies provenance checks to automatic discovery, manual picks and saved rules. Website-owned avatars, messaging buttons, support widgets and navigation are not collection targets.
- Skips uncertain provenance, including unknown extension launchers made only from inline graphics without identifiable origin. Support is not limited to five extensions, but coverage of every extension is not guaranteed.

The cane walk, staged cursor chase, scooter and rolling escapes, edge contact, tail dragging and pop-out, shared page state, per-icon visibility, two shortcuts and five-click Easter egg keep their existing behavior. Original extensions continue running and handling their own shortcuts.

**Download:** [MiorningCatKeeper-v0.3.2-Chrome-Edge.zip](https://github.com/miorning/miorning-cat-keeper/releases/download/v0.3.2/MiorningCatKeeper-v0.3.2-Chrome-Edge.zip). Checksums are attached as `SHA256SUMS.txt`. The package contains only the plugin runtime and bilingual guides, privacy and license documents. Images use lossless compression; no build is required. This is not a browser-store listing.

**Existing installation:** replace files in the original installation directory with the new `extension` contents, reload the existing extension in Chrome / Edge, then refresh affected webpages. Do not uninstall first. For a first installation, enable Developer mode, choose **Load unpacked**, and select the included `extension` folder directly containing `manifest.json`. Defaults: `Alt + Shift + K` collects / releases and `Alt + Shift + H` hides / shows.

Browser toolbar icons beside the address bar remain outside collection scope and must be unpinned manually. Cross-origin iframe and canvas internals, and protected pages, still have access limitations. Compatibility checks use isolated browsers and locally supplied pages; they do not establish compatibility with every website or extension. This release deliberately skips controls whose provenance is uncertain.

`extension/` provides the complete, directly loadable runtime source and local assets. There is no server, upload endpoint or telemetry; preferences stay on the device. First-party content uses GPL-3.0-only to the extent copyright applies. Provide corresponding source and preserve required notices when distributing covered versions. See [Privacy](PRIVACY.en.md) and [LICENSE](LICENSE).

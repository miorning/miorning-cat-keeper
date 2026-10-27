# 喵咛·收纳猫 / Miorning Cat Keeper v0.3.1

2026-10-27 · [简体中文](README.md) · [English](README.en.md)

## 中文

**平时像老爷爷，被追才露出真面目。** 底部跑步改为拄拐杖龟速小步走；鼠标靠近先警觉稍加速，再逼近就随机骑电动车或翻滚逃跑，安全后恢复慢步。桌面警觉 / 逃跑距离扩大到约 480 / 300 像素，窄窗口自动缩小，隔得更远也会触发追逃。电动车、滚动和漂浮保留原有画面；猫和上下尾巴贴住网页内容区边缘。

本次从 0.2.0 升级还包括：

- 拖尾巴沿边移位；向页面内拉可弹性拔猫，松手后三秒恢复活动。尾巴单击不吞吐。
- 同一浏览器资料跨页面、刷新后保存并同步收纳状态、藏尾和相对位置。
- 设置中勾选某个入口的“显示”，立即放回并在以后收纳时保留。
- 顶部漂浮速度比 0.2.0 慢 50%，仍一圈后藏尾；底部改为抓住后三秒不点才藏。
- 连续五次短点尾巴打开喵咛 B 站主页彩蛋。右键仍只有快捷键设置、收纳 / 释放、隐藏 / 显示三项。
- 图片无损压缩，安装包仅保留插件运行文件及中英说明、隐私和许可证文档。

**下载：** [MiorningCatKeeper-v0.3.1-Chrome-Edge.zip](https://github.com/miorning/miorning-cat-keeper/releases/download/v0.3.1/MiorningCatKeeper-v0.3.1-Chrome-Edge.zip)。校验值见同一发布页 `SHA256SUMS.txt`。中英界面按浏览器语言选择，无需编译，未上架扩展商店。

解压后，在 Chrome / Edge 扩展管理页开启开发者模式，加载包内 `extension` 文件夹，再刷新普通网页。已有安装请覆盖原安装目录、重新加载原扩展并刷新页面，**不要先卸载**。默认 `Alt + Shift + K` 收纳 / 释放，`Alt + Shift + H` 隐藏 / 显示。

收纳不限五款，但对象是**网页内的小型悬浮入口**，不包括地址栏旁的浏览器工具栏图标。原插件继续运行并处理自己的快捷键。跨域 iframe、canvas 内部及受保护页面有访问限制，不能保证所有入口都能收纳。

扩大追逃范围后的交互检查 13/13 通过；验证也覆盖隔离 Chrome / Edge 中的同步、拖拽、菜单、双语界面和贴边行为。测试使用本地提供的页面，不代表所有网站兼容或实体键盘调度已验收。

`extension/` 提供完整、可直接加载的运行源码及本地资源。无服务器、上传接口或遥测，偏好保存在本机。自有内容在适用版权范围内采用 GPL-3.0-only；分发受约束版本时应提供对应源码并保留声明。详见 [隐私说明](PRIVACY.md) 与 [LICENSE](LICENSE)。

## English

**An elderly stroll—until you give chase.** Bottom running becomes a very slow, short-step cane walk. Cursor proximity first causes alert walking, then a random scooter or rolling escape. The cat resumes strolling when safe. Desktop warning / escape distances are enlarged to approximately 480 / 300 pixels, with smaller ranges in narrow windows, so the chase starts from farther away. Existing scooter, roll and float visuals are retained. The cat and both tails touch the webpage viewport edges.

This update from 0.2.0 also includes:

- Drag a tail along its edge, or pull inward to pop out the cat with elastic motion. It rests for three seconds after release. A single tail click does not collect or release icons.
- Collection, hidden state and relative tail position persist and synchronize across pages and reloads within the same browser profile.
- Check Show beside a launcher in settings to restore it and keep it visible during future collections.
- Ceiling movement is 50% slower than in 0.2.0 and still hides after a lap. The bottom cat now hides after being caught for three seconds without a click.
- Five quick short tail clicks open MIORNING's Bilibili profile as an Easter egg. The menu still has only shortcut settings, collect / release and hide / show.
- Losslessly compressed images and a package containing only the plugin runtime and bilingual guides, privacy and license documents.

**Download:** [MiorningCatKeeper-v0.3.1-Chrome-Edge.zip](https://github.com/miorning/miorning-cat-keeper/releases/download/v0.3.1/MiorningCatKeeper-v0.3.1-Chrome-Edge.zip). Checksums are attached as `SHA256SUMS.txt`. The interface follows the browser language, in Chinese or English. No build is required. This is not a browser-store listing.

Extract, enable Developer mode in Chrome / Edge, load the included `extension` folder and refresh ordinary webpages. To update, replace files in the original installation directory, reload the existing extension and refresh pages; **do not uninstall first**. Defaults: `Alt + Shift + K` collects / releases and `Alt + Shift + H` hides / shows.

Discovery is not limited to five extensions, but it handles **small floating launchers inside webpages**, not browser toolbar icons beside the address bar. Original extensions keep running and handling their own shortcuts. Cross-origin iframe and canvas internals, and protected pages, have access limitations; collection of every launcher is not guaranteed.

The enlarged chase-range behavior passed 13/13 interaction checks. Verification also covers synchronization, dragging, menus, bilingual UI and edge contact in isolated Chrome / Edge environments. Locally supplied pages do not establish universal compatibility or physical operating-system shortcut dispatch.

`extension/` provides the complete, directly loadable runtime source and local assets. There is no server, upload endpoint or telemetry; preferences stay on the device. First-party content uses GPL-3.0-only to the extent copyright applies. Provide corresponding source and preserve required notices when distributing covered versions. See [Privacy](PRIVACY.en.md) and [LICENSE](LICENSE).

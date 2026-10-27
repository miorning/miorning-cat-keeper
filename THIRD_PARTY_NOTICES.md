# 第三方与美术说明 / Third-party and artwork notices

## 运行时 / Runtime

本扩展无内置第三方 JavaScript 运行库，不加载 CDN 脚本或远程字体。界面、动画及整理逻辑为本项目代码，使用浏览器原生 API 与系统字体。

The extension bundles no third-party JavaScript runtime library and loads no CDN scripts or remote fonts. Product-specific UI, animation and organization use browser-native APIs and system fonts.

Chrome、Microsoft Edge、GitHub、bilibili 及适配插件名称仅说明兼容性或发布方式，不表示官方关联或背书。浏览器与其他插件不随包分发。

Chrome, Microsoft Edge, GitHub, Bilibili and adapted extension names identify compatibility or distribution, without implying affiliation or endorsement. Browser binaries and other extensions are not bundled.

## 黑猫素材 / Black-cat artwork

角色参考由 MIORNING 提供；透明动作表由内置 Image 按参考生成。安装包与当前仓库仅包含运行所需的 PNG，原始生图和开发资料由作者留存在本地。运行时播放本地 PNG，以位移、缩放与尾巴弯曲完成动作，不通过代码重画角色。围巾 MIORNING 与衣服「并不 / 优秀」为角色连续性标识。

The reference was supplied by MIORNING; transparent action sheets were generated from it with the built-in Image tool. The package and current repository contain runtime PNGs; the author keeps original generated images and development materials locally. Runtime playback uses local PNGs, positioning, scaling and tail bending rather than redrawing the cat. The MIORNING scarf and 并不 / 优秀 shirt lettering preserve character continuity.

随包原创资源在适用版权范围内依照 [NOTICE.md](NOTICE.md) 与 [LICENSE](LICENSE) 提供；生成流程不是第三方素材授权，不声称授予法律未赋予的权利。

Original bundled resources are provided under [NOTICE.md](NOTICE.md) and [LICENSE](LICENSE), to the extent copyright applies. Generation is not represented as a third-party stock-art license or a grant of rights that applicable law does not provide.

## 仅开发验证工具 / Development-only tools

裁剪使用 Pillow 与 NumPy，浏览器检查使用 Playwright 及本机 Chrome / Edge。这些工具由开发者自行提供，不包含在扩展包内，使用插件不需要安装它们。各工具许可证由上游提供。五款优先适配仅引用名称和入口选择器，不分发其代码、美术或安装包。

Crop tools use Pillow and NumPy; checks use Playwright and locally installed Chrome / Edge. Developers supply them separately. They are not bundled and are not needed to use the extension; their licenses are supplied upstream. Priority adapters reference five extensions' names and launcher selectors, without distributing their code, art or packages.

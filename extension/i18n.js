(() => {
  'use strict';
  if (globalThis.CatKeeperI18n) return;
  const browserLanguage = globalThis.chrome?.i18n?.getUILanguage?.() || globalThis.navigator?.language || 'en';
  // Content scripts also run on arbitrary sites. Only our explicitly marked local
  // preview / extension guide may change document language, copy, or navigation.
  const ownDocument = typeof document !== 'undefined'
    && /^(?:file:|chrome-extension:)$/.test(globalThis.location?.protocol || '')
    && ['preview','welcome'].includes(document.documentElement?.dataset.catkeeperDocument);
  let requested = '';
  try {
    const here = new URL(globalThis.location.href);
    if (ownDocument) requested = here.searchParams.get('lang') || '';
  } catch {}
  const locale = /^(zh)(?:-|$)/i.test(requested || browserLanguage) ? 'zh' : 'en';
  const messages = {
    '黑猫右键菜单':'Cat Keeper menu',
    '快捷键设置':'Keyboard shortcuts',
    '释放图标':'Release icons',
    '收纳图标':'Collect icons',
    '显示黑猫':'Show cat',
    '隐藏黑猫':'Hide cat',
    '未绑定':'Unassigned',
    '操作未完成，请重试':'The action could not finish. Please try again.',
    '关闭设置':'Close settings',
    '不用追猫，也能随时收纳和唤回。':'Collect icons and call the cat back without chasing it.',
    '右键猫或尾巴，都能打开这个菜单。':'Right-click the cat or its tail to open this menu.',
    '收纳 / 释放图标':'Collect / release icons',
    '隐藏 / 显示黑猫':'Hide / show cat',
    '收纳范围与其他设置':'Collection and other settings',
    '启用黑猫':'Enable Cat Keeper',
    '点选其他悬浮图标':'Pick another floating icon',
    '紧急放回全部图标':'Restore all icons now',
    '只收纳网页里的入口，不停用原插件。点选时按 Esc 取消。':'Only in-page launchers are hidden. Extensions stay enabled. Press Esc to cancel picking.',
    '更改浏览器快捷键':'Change browser shortcuts',
    '点击后打开浏览器原生快捷键设置。快捷键冲突时，请在那里重新指定。':'Open your browser’s shortcut settings to assign keys or resolve conflicts.',
    '修改收纳快捷键':'Edit collect shortcut',
    '修改隐藏快捷键':'Edit hide shortcut',
    '请按新快捷键…':'Press a new shortcut…',
    '试玩快捷键已保存，仅在此试玩页生效。':'Saved for this demo page only.',
    '已取消修改。':'Shortcut change cancelled.',
    '无法打开快捷键设置':'Could not open shortcut settings.',
    '已打开浏览器快捷键设置。返回网页后再右键黑猫，即可看到新的绑定。':'Browser shortcut settings opened. Return here and right-click the cat to see the updated keys.',
    '请在扩展管理页打开键盘快捷键设置。':'Open Keyboard shortcuts from your browser’s extension manager.',
    '黑猫已启用':'Cat Keeper enabled.',
    '已停用黑猫，并放回图标。':'Cat Keeper disabled; icons restored.',
    '悬浮入口':'Floating launcher',
    '移除':'Remove',
    '已移除这条自选规则。':'Custom rule removed.',
    '这一页暂时没有已识别的悬浮入口。':'No floating launchers found on this page yet.',
    '所有图标已回到原位。':'All icons restored to their places.',
    '收纳悬浮图标；右键打开三个选项':'Collect floating icons; right-click for three options',
    '释放悬浮图标；右键打开三个选项':'Release floating icons; right-click for three options',
    '快速抓住再点；右键打开菜单':'Move quickly to catch and click; right-click for the menu',
    'MIORNING 黑猫':'MIORNING black cat',
    '点我收纳 · 右键设置':'Click to collect · right-click for settings',
    '点我释放 · 右键设置':'Click to release · right-click for settings',
    '暂未发现悬浮入口。右键黑猫 → 快捷键设置 → 收纳管理，可以点选补收。':'No floating launchers found yet. Right-click the cat → Keyboard shortcuts → Collection and other settings to pick one manually.',
    '收好了 {count} 个图标 · 原插件快捷键仍可使用':'Collected {count} icons · original extension shortcuts still work',
    '都吐出来啦 · 回到各自的位置':'All icons released back to their places.',
    '动画中断，已恢复所有图标。':'Animation interrupted; all icons restored.',
    '请先开启收纳猫。':'Enable Cat Keeper first.',
    '点此加入收纳 · Esc 取消':'Click to collect · Esc to cancel',
    '请点击要收纳的悬浮小图标；不要选择功能面板。按 Esc 取消。':'Click a small floating launcher, rather than a whole panel. Press Esc to cancel.',
    '已取消点选':'Picking cancelled.',
    '无法保存这个图标的位置，请换一个入口。':'This launcher could not be saved. Please choose another.',
    '这个图标已经在收纳名单里了':'This icon is already in the collection list.',
    '自选图标':'Custom icon',
    '已加入本站的收纳名单':'Added to the collection list for this site.',
    '等黑猫完成动作后再试。':'Wait for the cat to finish moving, then try again.',
    '等黑猫完成这个动作后再试。':'Wait for the cat to finish this move, then try again.',
    '所有图标已恢复':'All icons restored.',
    '未知操作':'Unknown action.',
    '请先打开一个普通网页':'Open a regular web page first.',
    '未知快捷键操作':'Unknown shortcut action.',
    '网页暂时没有回应':'The page is not responding yet.',
    '喵咛·收纳猫 — 右键猫或尾巴打开菜单':'Miorning Cat Keeper — right-click the cat or tail for the menu',
    '喵咛·收纳猫':'Miorning Cat Keeper',
    '页面暂时没有回应，请刷新后重试':'The page is not responding yet. Refresh it and try again.',
    '收纳猫：{error}':'Cat Keeper: {error}',
    '收纳猫：{error}。点击查看。':'Cat Keeper: {error}. Click for help.',
    'MIORNING 喵咛':'MIORNING Prompt Guard',
    '喵咛页笺':'Miorning PagePin',
    '喵咛文本窗':'Miorning Text Float',
    '喵咛选片台':'Miorning Select',
    'bilibili 好友分组':'Bilibili Friend Groups',
    '悬浮图标 {number}':'Floating icon {number}',
    '跨域 iframe 内的按钮不能从父页面逐项访问。':'Individual controls inside cross-origin iframes cannot be accessed from the parent page.',
    '同一个 canvas 内绘制的多个图标不能自动拆分。':'Multiple icons drawn in one canvas cannot be separated automatically.',
    '未知页面可能使用特殊浮层结构，未识别时仍可手动点选。':'Some pages use unusual floating layers. You can manually pick a visible launcher when it is missed.',
    '喵咛·收纳猫 — 动画试玩':'Miorning Cat Keeper — Animation Demo',
    '不用安装，先和你的收纳猫玩一会儿。试试吸入图标、鼓成圆球、逐个吐出和尾巴半隐藏。':'Try Cat Keeper without installing it: collect icons, inflate, release them one by one, and hide with a waving tail.',
    '动画试玩':'Animation demo',
    '安装到浏览器':'Install in your browser',
    '一只黑猫的收纳日常':'A black cat’s daily cleanup',
    '页面挤了，':'Too much clutter?',
    '让猫':'Let the cat ',
    '吃吧。':'eat it.',
    '贴着底边巡游，吃饱就顶着天花板。':'Patrol the floor, then float up to the ceiling.',
    '走完一圈，咚一下，只剩尾巴。':'One round, one thump — only a tail remains.',
    '黑猫已经在下面了。':'Your cat is already down below.',
    '慢慢靠近，它会躲开你。':'Approach slowly and it slips away.',
    '试玩方式':'How to try it',
    '观察笔记':'Field notes',
    '手要快一点。':'Be quick.',
    '快速移到猫身上，再点一下。':'Move quickly onto the cat, then click.',
    '右键猫或尾巴，三个选项都在。':'Right-click the cat or tail for all three options.',
    '吃饱会变圆。':'A full belly floats.',
    '鼓起来，撞到上沿，挤扁又弹回。':'Inflate, bump the ceiling, squash and bounce.',
    '再点一次，逐个吐出，砸地回弹。':'Click again to release, fall and bounce.',
    '走一圈，就藏起来。':'One round, then hide.',
    '下边跳起砸进地里；上边继续飘走。':'Dive into the floor or float beyond the ceiling.',
    '只留两种尾巴，定期晃一晃。':'A long or stubby tail keeps waving.',
    '黑猫 PNG 动作帧，由 Image 生成。':'Cat animation frames generated with Image.',
    '当前收纳状态':'Collection status',
    '猫肚子里的入口':'Icons in the cat’s belly',
    '正在散步':'Out for a stroll',
    '所有操作，右键黑猫。':'Right-click the cat for every action.',
    '不追猫，也有办法。':'No chase required.',
    '收纳 / 释放':'Collect / release',
    '隐藏 / 显示':'Hide / show',
    '这是动画试玩。':'This is an animation demo. ',
    '这里的五个图标是演示道具，正式插件通用扫描插件和网站的小型悬浮入口，也可手动补收。':'These five icons are props. The extension scans small floating launchers from extensions and websites, with manual picking for extras.',
    '快捷键仍由原插件运行。':'Original extension shortcuts keep working.',
    '五个演示悬浮入口':'Five demo floating launchers',
    '演示图标':'Demo icons',
    '灵感便签':'Idea notes','文字浮窗':'Text window','画面采集':'Video picker','同好分组':'Friend groups','页面图钉':'Page pin',
    '灵感便签（演示图标）':'Idea notes (demo icon)','文字浮窗（演示图标）':'Text window (demo icon)','画面采集（演示图标）':'Video picker (demo icon)','同好分组（演示图标）':'Friend groups (demo icon)','页面图钉（演示图标）':'Page pin (demo icon)',
    '便签':'Notes','文字':'Text','画面':'Video','同好':'Groups','图钉':'Pin',
    '文件不完整，请解压完整安装包':'Files are missing. Extract the complete download package.',
    '上沿，只留胖尾巴':'Ceiling: stubby tail only',
    '底边，只留尾巴':'Floor: tail only',
    '黑猫忙着呢…':'The cat is busy…',
    '吃饱，顶着上沿巡游':'Full belly, ceiling patrol',
    '贴着底边巡游':'Patrolling the floor',
    '啊呜，正在收纳…':'Munch! Collecting…',
    '慢慢吐，一个不少…':'Releasing, one by one…',
    '吃饱了，冲顶！':'Full belly — to the ceiling!',
    '清空肚子，准备砸地…':'Empty belly — prepare to land…',
    '准备放回来…':'Ready to release…',
    '张嘴，准备好…':'Open wide, ready…',
    '图标已放回，黑猫归位中…':'Icons restored; the cat is returning…',
    '这组按键已经用于另一个操作，换一组吧。':'That shortcut is already used by the other action. Try another.',
    '（演示）':' (demo)',
    '点击上方快捷键，再按 Alt + Shift 加一个字母；Esc 取消。修改仅影响这个动画试玩页，正式插件使用浏览器原生快捷键。':'Click a shortcut above, then press Alt + Shift + a letter; Esc cancels. Changes apply only to this demo. The installed extension uses native browser shortcuts.',
    '“{name}”是演示道具。左键黑猫收纳，右键猫或尾巴打开菜单。':'“{name}” is a demo prop. Click the cat to collect; right-click the cat or tail for the menu.',
    '喵咛·收纳猫 — 使用说明':'Miorning Cat Keeper — Getting Started',
    '让黑猫收好浏览器页面里的悬浮图标。Chrome、Edge 本地安装与使用说明。':'Let a black cat collect floating icons on your pages. Local installation and usage guide for Chrome and Edge.',
    '小小的收纳，大大的肚子。':'Small cat. Big appetite.',
    '给你的浏览器，养一只黑猫。':'A black cat for your browser.',
    '图标太多？':'Too many icons?',
    '让它':'Let the cat ',
    '一口收好。':'tidy up.',
    '贴边巡游，吃饱撞顶。':'Patrol the edges. Bounce off the ceiling.',
    '那些悬浮着的小入口，暂时住进它肚子里。':'Give your floating launchers a temporary home in its belly.',
    '带它回家':'Bring it home',
    '装得下图标，藏不住尾巴。':'Hides the icons. Can’t hide the tail.',
    '吃饱后鼓成圆球的黑猫，戴着红围巾漂浮':'An inflated black cat with a red scarf, floating after a meal',
    '并不努力，优秀收纳。':'Unbothered cat. Excellent storage.',
    '两种浏览器，同一只猫。':'Two browsers. One cat.',
    '先解压下载包':'Extract the download',
    '保留整个文件夹。安装时选择其中的':'Keep the whole folder. During installation, select its',
    '文件夹，里面可以看到':'folder, which contains',
    '。':'.',
    '打开扩展管理':'Open extension management',
    '复制':'Copy',
    '开启开发者模式，加载扩展':'Enable Developer mode and load the extension',
    '点击“加载已解压的扩展程序”，选择':'Click “Load unpacked” and select the',
    '文件夹。然后打开或刷新一个普通网页。':'folder. Then open or refresh a regular web page.',
    '固定这一只猫':'Pin this cat',
    '在浏览器的扩展菜单里，固定“喵咛·收纳猫”，方便唤出黑猫右键菜单。其他插件的工具栏图标可以手动取消固定。':'Pin Miorning Cat Keeper in your browser’s extensions menu for easy menu access. You can manually unpin the toolbar icons of other extensions.',
    '右键猫，只有三件事。':'Right-click. Three choices.',
    '右键黑猫或露出的尾巴：':'Right-click the cat or its visible tail: ',
    '、':', ',
    '。打开菜单时黑猫会停下来，两项动作旁显示当前快捷键。':'. The cat pauses while the menu is open. Both actions show their current shortcuts.',
    '抓到它，收好图标':'Catch the cat, collect the icons',
    '慢慢靠近，黑猫会闪开。快速把鼠标移到它身上再点击，它会吸入已识别的图标，鼓成圆球撞到浏览器上沿，压扁又弹回来。':'Approach slowly and the cat dodges you. Move the pointer onto it quickly and click: it inhales detected icons, inflates, bumps the top edge, squashes and springs back.',
    '再抓一次，逐个放回':'Catch it again, release each icon',
    '吃饱的黑猫也会躲。再次点击，它会把图标一个个吐回原来的位置，再掉落、砸成饼、回弹，朝屏幕做个不服气的手势后接着走。':'The full cat still dodges. Click again to spit each icon back to its place, fall, flatten into a pancake, bounce and make a defiant middle-finger gesture before walking on.',
    '只剩尾巴，也能待命':'Only a tail, still on duty',
    '左右巡游一圈后自动隐藏。底下会跳起砸进画面外，上面会继续向上漂走，只留下各自的尾巴定期摆动。':'After one left-right patrol, it hides automatically: jumping into the floor or drifting beyond the ceiling, with a long or stubby tail waving in view.',
    '不想追猫的时候':'When you don’t feel like chasing',
    '吸收 / 释放':'Collect / release',
    '如快捷键未绑定或冲突，在浏览器扩展管理的“键盘快捷键”中修改。右键猫或尾巴即可操作；菜单里恰好三个选项。':'If a shortcut is unassigned or conflicts, change it in your browser’s Keyboard shortcuts settings. Right-click the cat or tail; the menu has exactly three choices.',
    '让它认识其他图标。':'Introduce it to other icons.',
    '黑猫会通用扫描网页里的小型浮动入口，包括其他插件和网站自己的悬浮按钮；五款现有插件只是优先适配。未自动识别的图标，可以右键黑猫 → “快捷键设置” → 展开“收纳范围与其他设置” → 点击“点选其他悬浮图标”，再到网页里点选那个小按钮；按 Esc 取消。自选规则按网站保存，随时可以从列表移除。跨域 iframe 内部按钮与自绘 canvas 图标不能保证自动识别，可尝试点选可见的小型入口补收。':'The cat scans small floating launchers from other extensions and websites. The five known extensions are priority adapters, not a limit. For missed icons, right-click the cat → Keyboard shortcuts → Collection and other settings → Pick another floating icon, then click the small launcher. Esc cancels. Custom rules are saved per site and can be removed. Cross-origin iframe controls and individual icons drawn inside a canvas cannot be reliably detected or separated.',
    '黑猫整理的是':'The cat organizes ',
    '网页里面的悬浮按钮':'floating buttons inside web pages',
    '。地址栏旁边的浏览器工具栏图标，需要你手动取消固定。收纳不会卸载或停用其他插件；原来的快捷键、面板功能仍由原插件负责。':'. Toolbar icons beside the address bar must be unpinned manually. Collecting does not uninstall or disable extensions; their shortcuts and panels remain under their control.',
    '浏览器内置页面、扩展商店及部分受保护页面不能放猫。要在本地 HTML 页面使用，请在扩展详情里开启“允许访问文件网址”。':'The cat cannot run on browser settings, extension stores and some protected pages. For local HTML pages, enable “Allow access to file URLs” in the extension details.',
    '如果误选了网页元素，在右键设置里点“紧急放回全部图标”，再移除那条自选规则。关闭黑猫也会放回图标；刷新页面后默认重新散步。':'If you pick the wrong element, use “Restore all icons now” in the settings and remove that rule. Disabling the cat also restores icons. Refreshing a page starts a new stroll.',
    'MIORNING / 让页面喘口气。':'MIORNING / Give the page some room.',
    '所有动作帧随插件保存在本地，运行无需联网。':'All animation frames are included locally. No network connection is needed.',
    '已复制地址，请粘贴到浏览器地址栏。':'Address copied. Paste it into your browser’s address bar.',
    '请选中并复制：{address}':'Select and copy: {address}',
    '未绑定，请到扩展设置指定':'Unassigned — set it in extension settings'
  };
  function t(text, values = {}) {
    const translated = locale === 'en' ? (messages[text] ?? text) : text;
    return translated.replace(/\{(\w+)\}/g, (whole, key) => values[key] === undefined ? whole : String(values[key]));
  }
  Object.assign(messages, {
    '拄着拐杖慢慢走，吃饱贴着顶边飘。':'Shuffle with a cane, then float along the ceiling when full.',
    '慢慢靠近，它会警觉。':'Approach slowly and it perks up.',
    '慢，是装的。':'Slow. Until you get close.',
    '平时拄拐慢走；靠近先警觉。':'A slow cane walk; approach and it perks up.',
    '再逼近，就骑车或滚走。':'Get closer and it rides or rolls away.',
    '松手后等三秒，再慢慢走。':'After pulling it out, wait three seconds for a slow stroll.',
    '平时拄着拐杖慢慢走。鼠标靠近会先警觉、加快脚步，再逼近就随机骑电动车或翻滚逃走。快速抓到后点击，仍会吸入图标、鼓成圆球撞顶回弹。':'It normally shuffles slowly with a cane. Approaching makes it perk up and walk a little faster; getting closer triggers a random scooter or rolling escape. Catch it quickly and click to collect icons, inflate and bounce against the ceiling.',
    '显示':'Show',
    '始终显示 {name}':'Always show {name}',
    '已保留显示，以后收纳会跳过它。':'Kept visible. Future collections will skip this icon.',
    '已取消保留，收纳时会将它吞入。':'No longer kept visible. The cat can collect this icon.',
    '勾选“显示”会立即放回该图标，并在以后收纳时跳过。':'Check “Show” to restore an icon now and skip it in future collections.',
    '保存失败，请重试。':'Could not save. Please try again.',
    '正在准备黑猫，请稍候再试。':'Getting the cat ready. Please try again in a moment.',
    '这个图标已经离开页面，请重新打开设置。':'This icon has left the page. Please reopen settings.',
    '拖尾巴，把猫拔出来。':'Pull the tail. Pop the cat out.',
    '如果误选了网页元素，在右键设置里点“紧急放回全部图标”，再移除那条自选规则。关闭黑猫也会放回图标。':'If you pick the wrong element, use “Restore all icons now” in settings, then remove that rule. Disabling the cat also restores icons.',
    '按住尾巴左右拖动，向页面里拉就能拔猫。':'Drag the tail along the edge; pull inward to pop the cat out.',
    '底下抓住三秒不点，它就藏；上面一圈后藏。':'Catch it below without clicking for three seconds and it hides; above, it hides after a lap.',
    '抓住三秒，它就藏起来。':'Catch it for three seconds and it hides.',
    '松手后等三秒，再接着跑。':'After pulling it out, wait three seconds for it to run.',
    '刷新或换页会沿用收纳状态、藏尾位置和显示偏好。':'Collection, tail position and visibility preferences carry across pages and reloads.',
    '勾选图标旁的“显示”，它会立即放回，以后也不再被吞。':'Check “Show” beside an icon to restore it and keep it out of future collections.',
    '拖动尾巴移位 · 向内拔出':'Drag to move · Pull inward to pop out',
    '拖动尾巴移位，向页面内拉出黑猫；右键设置':'Drag the tail along the edge or pull inward to pop the cat out; right-click for settings'
  });
  function localizeDOM(root = document) {
    if (!root || locale !== 'en') return;
    const doc = root.ownerDocument || root;
    const walker = doc.createTreeWalker(root, 4);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (node.parentElement?.closest('script,style')) continue;
      const before = node.nodeValue, trimmed = before.trim();
      if (messages[trimmed] !== undefined) node.nodeValue = before.replace(trimmed, messages[trimmed]);
    }
    for (const element of root.querySelectorAll?.('[aria-label],[title],[alt],[data-demo],meta[name="description"]') || []) {
      for (const attr of ['aria-label','title','alt','data-demo',...(element.tagName === 'META' ? ['content'] : [])]) {
        const value = element.getAttribute(attr);
        if (value && messages[value] !== undefined) element.setAttribute(attr, messages[value]);
      }
    }
  }
  globalThis.CatKeeperI18n = {locale, t, localizeDOM};
  if (ownDocument) {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    const run = () => {
      localizeDOM(document);
      for (const link of document.querySelectorAll('a[href]')) {
        const href = link.getAttribute('href');
        if (/^(?:preview\.html|(?:extension\/)?welcome\.html)(?:\?|$)/.test(href)) {
          const target = new URL(href, location.href); target.searchParams.set('lang', locale);
          link.href = target.href;
        }
      }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true}); else run();
  }
})();

(() => {
  'use strict';
  const t = (text, values) => globalThis.CatKeeperI18n?.t(text, values) ?? text;
  globalThis.CatKeeperAdapters = [
    { key: 'prompt-guard', name: t('MIORNING 喵咛'), selector: '#mpg-floating-dock' },
    { key: 'pagepin', name: t('喵咛页笺'), host: '#pagepin-root', selector: '.dock-launcher' },
    { key: 'text-float', name: t('喵咛文本窗'), host: '.miorning-text-float-dock', selector: '.launcher' },
    { key: 'select', name: t('喵咛选片台'), host: '#miorning-select-launcher, #miorning-select-host', selector: '.msd-launch, .dock' },
    { key: 'bilibili-friends', name: t('bilibili 好友分组'), host: 'miorning-friend-dock', selector: '.launch' }
  ];
})();

'use strict';
const t = (text, values) => globalThis.CatKeeperI18n?.t(text, values) ?? text;

let toastTimer;
document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const status = document.getElementById('copy-status');
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      status.textContent = t('已复制地址，请粘贴到浏览器地址栏。');
    } catch {
      status.textContent = t('请选中并复制：{address}',{address:button.dataset.copy});
    }
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { status.textContent = ''; }, 3500);
  });
});

if (globalThis.chrome?.commands) {
  chrome.commands.getAll().then(commands => {
    const collect = commands.find(command => command.name === 'toggle-collect');
    const half = commands.find(command => command.name === 'toggle-half');
    document.getElementById('key-collect').textContent = collect?.shortcut || t('未绑定，请到扩展设置指定');
    document.getElementById('key-half').textContent = half?.shortcut || t('未绑定，请到扩展设置指定');
  }).catch(() => {});
}

'use strict';
if (typeof importScripts === 'function') importScripts('i18n.js');
const t = (text, values) => globalThis.CatKeeperI18n?.t(text, values) ?? text;

const SCRIPTS = ['i18n.js', 'adapters.js', 'discovery.js', 'assets/v2/metrics.js', 'assets/v3/metrics.js', 'assets/v4/metrics.js', 'controls.js', 'engine.js', 'content.js'];
const isPage = url => /^(https?:|file:)/i.test(url || '');
const SHARED_KEY = 'catkeeperShared';
let stateQueue = Promise.resolve();
function normalizedState(value = {}) {
  const stored = value.stored === true;
  return {
    stored,
    hidden: ['top','bottom'].includes(value.hidden) ? (stored ? 'top' : 'bottom') : 'none',
    xRatio: Number.isFinite(value.xRatio) ? Math.max(0, Math.min(1, value.xRatio)) : .5,
    alwaysVisible: Object.fromEntries(Object.entries(value.alwaysVisible || {}).filter(([key, shown]) => key.length <= 1024 && shown === true)),
    revision: Number.isSafeInteger(value.revision) && value.revision >= 0 ? value.revision : 0,
    source: typeof value.source === 'string' ? value.source : ''
  };
}
function sharedRequest(message) {
  const task = stateQueue.then(async () => {
    const data = await chrome.storage.local.get(SHARED_KEY);
    const state = normalizedState(data[SHARED_KEY]);
    if (message.action === 'get') return {ok:true,state};
    if (message.action !== 'update') return {ok:false,error:t('未知操作')};
    // A late pose or recovery must not overwrite a newer action in another tab.
    if (Number.isSafeInteger(message.expectedRevision) && message.expectedRevision !== state.revision) return {ok:true,applied:false,state};
    const patch = message.patch || {}, next = {...state,alwaysVisible:{...state.alwaysVisible}};
    if (typeof patch.stored === 'boolean') next.stored = patch.stored;
    if (['none','top','bottom'].includes(patch.hidden)) next.hidden = patch.hidden;
    if (Number.isFinite(patch.xRatio)) next.xRatio = Math.max(0, Math.min(1, patch.xRatio));
    const visibility = patch.visibility;
    if (visibility && typeof visibility.key === 'string' && visibility.key.length > 0 && visibility.key.length <= 1024 && typeof visibility.shown === 'boolean') {
      if (visibility.shown) next.alwaysVisible[visibility.key] = true;
      else delete next.alwaysVisible[visibility.key];
    }
    next.revision = state.revision + 1;
    next.source = typeof message.source === 'string' ? message.source.slice(0,120) : '';
    const saved = normalizedState(next);
    await chrome.storage.local.set({[SHARED_KEY]:saved});
    return {ok:true,applied:true,state:saved};
  });
  stateQueue = task.catch(() => {});
  return task;
}

async function inject(tabId) {
  return chrome.scripting.executeScript({ target: { tabId, frameIds: [0] }, files: SCRIPTS });
}

async function send(tab, action) {
  if (!tab?.id || !isPage(tab.url)) throw new Error(t('请先打开一个普通网页'));
  const message = { type: 'catkeeper', action };
  try {
    return await chrome.tabs.sendMessage(tab.id, message, { frameId: 0 });
  } catch {
    await inject(tab.id);
    return chrome.tabs.sendMessage(tab.id, message, { frameId: 0 });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  (async () => {
    const saved = await chrome.storage.local.get('catkeeperSettings');
    await chrome.storage.local.set({ catkeeperSettings: { ...saved.catkeeperSettings, enabled: saved.catkeeperSettings?.enabled !== false } });
    const tabs = await chrome.tabs.query({});
    await Promise.allSettled(tabs.filter(tab => tab.id && isPage(tab.url)).map(tab => inject(tab.id)));
  })().catch(error => console.warn('Cat Keeper initialization:', error.message));
});

async function commandKeys() {
  const commands=await chrome.commands.getAll();
  return {
    collect:commands.find(item=>item.name==='toggle-collect')?.shortcut||'',
    hide:commands.find(item=>item.name==='toggle-half')?.shortcut||''
  };
}

chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if(message?.type==='catkeeper-shared'){
    sharedRequest(message).then(reply).catch(error=>reply({ok:false,error:error.message}));return true;
  }
  if(message?.type==='catkeeper-easter-egg'){
    chrome.tabs.create({url:'https://space.bilibili.com/353186187'}).then(()=>reply({ok:true})).catch(error=>reply({ok:false,error:error.message}));return true;
  }
  if(message?.type!=='catkeeper-shortcuts')return false;
  (async()=>{
    if(message.action==='get')return commandKeys();
    if(message.action==='open'){
      const scheme=/Edg\//.test(navigator.userAgent)?'edge':'chrome';
      await chrome.tabs.create({url:`${scheme}://extensions/shortcuts`});
      return {ok:true};
    }
    return {ok:false,error:t('未知快捷键操作')};
  })().then(reply).catch(error=>reply({ok:false,error:error.message}));
  return true;
});

chrome.action.onClicked.addListener(tab => {
  (async()=>{
    const result=await send(tab,'menu');
    if(!result||result.ok===false)throw Error(result?.error||t('网页暂时没有回应'));
    await chrome.action.setBadgeText({text:'',tabId:tab.id});
    await chrome.action.setTitle({title:t('喵咛·收纳猫 — 右键猫或尾巴打开菜单'),tabId:tab.id});
  })().catch(async error=>{
    if(tab?.id){await chrome.action.setTitle({title:t('收纳猫：{error}',{error:error.message}),tabId:tab.id});}
    await chrome.tabs.create({url:chrome.runtime.getURL('welcome.html')});
  });
});

chrome.commands.onCommand.addListener(command => {
  const action = command === 'toggle-collect' ? 'toggle' : command === 'toggle-half' ? 'half' : null;
  if (!action) return;
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const result = await send(tab, action);
    if (!result || result.ok === false) throw new Error(result?.error || t('页面暂时没有回应，请刷新后重试'));
    await chrome.action.setBadgeText({ text: '', tabId: tab.id });
    await chrome.action.setTitle({ title: t('喵咛·收纳猫'), tabId: tab.id });
  })().catch(async error => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    await chrome.action.setBadgeBackgroundColor({ color: '#A52D27', tabId: tab.id });
    await chrome.action.setBadgeText({ text: '!', tabId: tab.id });
    await chrome.action.setTitle({ title: t('收纳猫：{error}。点击查看。',{error:error.message}), tabId: tab.id });
  });
});

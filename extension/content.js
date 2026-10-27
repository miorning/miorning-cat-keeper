(() => {
  'use strict';
  const t = (text, values) => globalThis.CatKeeperI18n?.t(text, values) ?? text;
  if (window.top!==window || globalThis.__miorningCatKeeper || !globalThis.CatKeeperEngine) return;
  if(location.protocol==='file:'&&document.documentElement.dataset.catkeeperPreview==='true')return;
  const runtime=globalThis.chrome?.runtime;
  if(!runtime?.id)return;
  const shadowOf=el=>{try{return chrome.dom?.openOrClosedShadowRoot(el)||el.shadowRoot;}catch{return el.shadowRoot;}};
  const records=new Map(); let rules=[],settings={enabled:true},shortcuts={collect:'Alt+Shift+K',hide:'Alt+Shift+H'};
  let stored=false,busy=false,picking=false,scanTimer=0,dead=false,pickAbort=null,pickBox=null,pickTarget=null,operation=0,ready=false,applyingShared=false;
  const uniqueId=()=>crypto.randomUUID?.()||[...crypto.getRandomValues(new Uint32Array(4))].map(value=>value.toString(16).padStart(8,'0')).join('-');
  const source=uniqueId();
  let shared={stored:false,hidden:'none',xRatio:.5,alwaysVisible:{},revision:-1,source:''};
  const rootObservers=new Map();
  const engine=new CatKeeperEngine({url:path=>runtime.getURL(path),onActivate:()=>toggle()});
  engine.onPoseCommit=pose=>{if(ready&&!dead&&!busy&&!applyingShared)void publishShared(pose,shared.revision).catch(reportSyncError);};
  engine.onEasterEgg=()=>runtime.sendMessage({type:'catkeeper-easter-egg'}).catch(error=>engine.toast(error.message));
  const discovery=globalThis.CatKeeperDiscovery?new CatKeeperDiscovery({exclude:engine.host,onChange:()=>scheduleScan()}):null;
  engine.controls=new CatKeeperControls(engine,{
    getState:()=>({...status(),shortcuts}),
    onToggle:()=>toggle(),onHide:()=>handle({type:'catkeeper',action:'half'}),onSettings:()=>showSettings()
  });
  async function refreshShortcuts(){try{shortcuts=await runtime.sendMessage({type:'catkeeper-shortcuts',action:'get'})||shortcuts;}catch{}return shortcuts;}
  async function showSettings(){
    await refreshShortcuts();scan();
    engine.controls.showSettings({shortcuts,targets:status().targets,enabled:settings.enabled,
      onPick:()=>{engine.controls.close();return handle({type:'catkeeper',action:'pick'});},
      onForget:key=>handle({type:'catkeeper',action:'forget',key}),
      onVisibility:(key,shown)=>handle({type:'catkeeper',action:'visibility',key,shown}),
      onEnabled:value=>handle({type:'catkeeper',action:'enabled',value}),
      onRestore:()=>handle({type:'catkeeper',action:'restore'}),
      onShortcutSettings:()=>runtime.sendMessage({type:'catkeeper-shortcuts',action:'open'})
    });
  }
  window.addEventListener('focus',refreshShortcuts);void refreshShortcuts();
  const origin=location.protocol==='file:'?location.href.split(/[?#]/)[0]:location.origin;
  const alwaysVisible=rec=>shared.alwaysVisible?.[rec.preferenceKey]===true;
  function reportSyncError(error){if(!dead){engine.toast(t('保存失败，请重试。'));console.warn('[CatKeeper] State save failed:',error.message);}}
  function applyShared(value,{force=false}={}){
    if(!value||dead||value.revision<shared.revision||!force&&value.revision===shared.revision)return;
    const poseChanged=['stored','hidden','xRatio'].some(key=>value[key]!==shared[key]),previousVisibility=shared.alwaysVisible||{};
    shared=value;
    if(!force&&value.source===source)return;
    if(!force&&!poseChanged){
      for(const rec of records.values())if(!!previousVisibility[rec.preferenceKey]!==alwaysVisible(rec)){if(alwaysVisible(rec))restore(rec);else if(stored&&settings.enabled)hide(rec);}
      scan();return;
    }
    applyingShared=true;
    try{
      operation++;busy=false;engine.cancel();cancelPick();stored=!!value.stored;
      engine.applySharedPose?.(value,{immediate:true});
      if(!engine.applySharedPose){engine.hidden=value.hidden||'none';engine.surface=stored?'top':'bottom';engine.phase=engine.half?'hidden':stored?'full':'walk';engine.restPosition();}
      scan();
    }finally{applyingShared=false;}
  }
  async function publishShared(patch,expectedRevision){
    const response=await runtime.sendMessage({type:'catkeeper-shared',action:'update',patch,source,expectedRevision});
    if(!response?.ok||!response.state)throw Error(response?.error||'State unavailable');
    applyShared(response.state,{force:response.applied===false});
    return response;
  }
  // Identity is independent of discovery order, screen position, and auto:N session keys.
  function preferenceKey(node){
    const clean=value=>String(value||'').trim().replace(/\s+/g,' ').slice(0,180);
    const stableId=el=>el.id&&!/^(?:[a-f0-9]{12,}|\d{6,}|react[-:]|radix[-:])|[-_:](?:[a-f0-9]{10,}|\d{6,})$|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}/i.test(el.id)?el.id:'';
    const hosts=[];let root=node.getRootNode();
    while(root instanceof ShadowRoot){hosts.unshift(stableId(root.host)||root.host.localName);root=root.host.getRootNode();}
    const image=node.matches('img')?node:node.querySelector('img');
    let src='';try{if(image?.src){const url=new URL(image.src,location.href);src=url.protocol==='data:'?'inline-image':url.origin+url.pathname;}}catch{}
    const label=clean(node.getAttribute('aria-label')||node.getAttribute('title')||node.textContent);
    const id=stableId(node),classes=[...node.classList].filter(c=>!/(?:active|open|closed|hidden|selected|hover|focus|\d{6,})/i.test(c)).sort().join('.');
    const identity=id?[hosts.join('/'),node.localName,id]:[hosts.join('/'),node.localName,label,classes,src];
    if(!id&&!label&&!src)identity.push((locator(node)||[]).join(' / '));
    const signature=identity.join('|');let hash=2166136261;
    for(let i=0;i<signature.length;i++)hash=Math.imul(hash^signature.charCodeAt(i),16777619);
    return `site:${origin}:${(hash>>>0).toString(36)}`;
  }
  const safeQuery=(root,s)=>{try{return [...root.querySelectorAll(s)];}catch{return [];}};
  function meaningful(el){
    if(!(el instanceof Element)||!el.isConnected||el===engine.host)return false;
    const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
    return r.width>=4&&r.height>=4&&r.width<=360&&r.height<=360&&cs.display!=='none';
  }
  function resolvePath(path){
    let scope=document,el=null;
    for(let i=0;i<path.length;i++){
      el=safeQuery(scope,path[i])[0];if(!el)return null;
      if(i<path.length-1){scope=shadowOf(el);if(!scope)return null;}
    }
    return el;
  }
  function selector(el,scope){
    if(el.id){const s='#'+CSS.escape(el.id);if(safeQuery(scope,s).length===1)return s;}
    const parts=[];let node=el;
    while(node&&node!==scope&&node.nodeType===1){
      const name=node.localName;
      if(!name)return null;
      let part=name;
      if(node.id){part='#'+CSS.escape(node.id);parts.unshift(part);break;}
      const peers=node.parentElement?[...node.parentElement.children].filter(n=>n.localName===name):[];
      if(peers.length>1)part+=`:nth-of-type(${peers.indexOf(node)+1})`;
      parts.unshift(part);node=node.parentElement;
    }
    const s=parts.join(' > ');return safeQuery(scope,s)[0]===el?s:null;
  }
  function locator(el){
    const path=[];let node=el;
    while(node){const scope=node.getRootNode();const s=selector(node,scope);if(!s)return null;path.unshift(s);node=scope instanceof ShadowRoot?scope.host:null;}
    return path;
  }
  function watchRoot(root){
    if(rootObservers.has(root))return;
    const observer=new MutationObserver(changes=>{
      if(changes.some(c=>c.target!==engine.host&&!engine.root.contains(c.target)))scheduleScan();
    });
    observer.observe(root,{childList:true,subtree:true});rootObservers.set(root,observer);
  }
  function scheduleScan(){if(scanTimer||dead)return;scanTimer=setTimeout(()=>{scanTimer=0;scan();},260);}
  function scan(){
    if(dead)return;
    const found=new Map();
    for(const adapter of CatKeeperAdapters){
      const scopes=adapter.host?safeQuery(document,adapter.host).map(host=>shadowOf(host)).filter(Boolean):[document];
      scopes.forEach(watchRoot);
      let index=0;
      for(const scope of scopes)for(const node of safeQuery(scope,adapter.selector)){
        if(meaningful(node))found.set(`${adapter.key}:${index++}`,{node,name:adapter.name,key:`${adapter.key}:${index-1}`,preferenceKey:`adapter:${adapter.key}`,custom:false});
      }
    }
    for(const rule of rules){
      const node=resolvePath(rule.path);
      if(meaningful(node)&&![...found.values()].some(item=>item.node===node)){
        let r=node.getRootNode();while(r instanceof ShadowRoot){watchRoot(r);r=r.host.getRootNode();}
        found.set(rule.key,{node,key:rule.key,name:rule.name,preferenceKey:rule.preferenceKey||preferenceKey(node),custom:true});
      }
    }
    for(const item of discovery?.discover()||[]){
      const overlap=[...found.values()].some(existing=>existing.node===item.node||existing.node.contains(item.node)||item.node.contains(existing.node));
      if(!overlap&&meaningful(item.node))found.set(item.key,{...item,preferenceKey:preferenceKey(item.node)});
    }
    for(const [key,rec] of records){
      if(!found.has(key)||found.get(key).node!==rec.node){restore(rec);records.delete(key);}
    }
    for(const [key,item] of found){
      if(!records.has(key))records.set(key,{...item,hidden:false});
      if(!busy){const rec=records.get(key);if(stored&&settings.enabled&&!alwaysVisible(rec))hide(rec);else restore(rec);}
    }
    for(const [root,observer] of rootObservers){if(root instanceof ShadowRoot&&!root.host.isConnected){observer.disconnect();rootObservers.delete(root);}}
    engine.controls?.refreshVisibility?.(status().targets);
  }
  function hide(rec){
    if(rec.hidden||alwaysVisible(rec))return;
    rec.original={opacity:rec.node.style.getPropertyValue('opacity'),opacityPriority:rec.node.style.getPropertyPriority('opacity'),pointer:rec.node.style.getPropertyValue('pointer-events'),pointerPriority:rec.node.style.getPropertyPriority('pointer-events'),inert:rec.node.inert};
    rec.node.style.setProperty('opacity','0','important');
    rec.node.style.setProperty('pointer-events','none','important');
    rec.node.inert=true;rec.hidden=true;
  }
  function restore(rec){
    if(!rec.hidden||!rec.original)return;
    const s=rec.node.style,o=rec.original;
    // Restore only the two properties owned by this extension. Keep changes made by the owner.
    if(s.getPropertyValue('opacity')==='0'&&s.getPropertyPriority('opacity')==='important'){
      if(o.opacity)s.setProperty('opacity',o.opacity,o.opacityPriority);else s.removeProperty('opacity');
    }
    if(s.getPropertyValue('pointer-events')==='none'&&s.getPropertyPriority('pointer-events')==='important'){
      if(o.pointer)s.setProperty('pointer-events',o.pointer,o.pointerPriority);else s.removeProperty('pointer-events');
    }
    if(rec.node.inert)rec.node.inert=o.inert;
    rec.hidden=false;delete rec.original;
  }
  function snapshot(node){
    let budget=100;
    function copy(el){
      if(--budget<0||!(el instanceof Element))return document.createElement('span');
      if(['script','style','iframe','object','embed','link','audio','video'].includes(el.localName))return document.createElement('span');
      let clone;
      if(el.localName==='canvas'){
        clone=document.createElement('img');try{clone.src=el.toDataURL();}catch{}
      }else clone=el.cloneNode(false);
      for(const attr of [...clone.attributes])if(attr.name.startsWith('on')||['id','href','srcdoc','popover','autofocus','tabindex'].includes(attr.name))clone.removeAttribute(attr.name);
      const cs=getComputedStyle(el);for(const prop of cs){try{clone.style.setProperty(prop,cs.getPropertyValue(prop));}catch{}}
      clone.style.setProperty('animation','none','important');clone.style.setProperty('transition','none','important');clone.style.setProperty('pointer-events','none','important');
      if(el.localName!=='canvas'){
        for(const child of el.childNodes){if(child.nodeType===3)clone.append(document.createTextNode(child.textContent));else if(child.nodeType===1)clone.append(copy(child));}
        const sh=shadowOf(el);if(sh)for(const child of sh.children)if(child.localName!=='style')clone.append(copy(child));
      }
      return clone;
    }
    const clone=copy(node);
    for(const p of ['position','inset','top','left','right','bottom','margin','transform','opacity','visibility'])clone.style.removeProperty(p);
    clone.style.setProperty('position','relative','important');clone.style.setProperty('margin','0','important');clone.style.setProperty('transform','none','important');clone.style.setProperty('opacity','1','important');clone.style.setProperty('visibility','visible','important');clone.inert=false;
    return clone;
  }
  async function toggle(){
    if(!ready)return notReady();
    if(dead||busy||!settings.enabled)return status();
    cancelPick();scan();
    const collecting=!stored,list=[...records.values()].filter(r=>meaningful(r.node)&&!alwaysVisible(r));
    busy=true;const current=++operation;
    try{
      // Publish the intent first. Other pages reach the final state immediately while this page animates.
      await publishShared({...engine.getSharedPose?.(),stored:collecting,hidden:'none'});
      if(current!==operation)return status();
      stored=collecting;
      await engine.begin(collecting?'inhale':'spit');
      if(current!==operation)return status();
      if(collecting){
        for(const rec of list){
          if(!rec.node.isConnected||alwaysVisible(rec))continue;
          const rect=rec.node.getBoundingClientRect(),visual=snapshot(rec.node);
          hide(rec);await engine.fly(visual,rect,engine.mouth(),true);
          if(current!==operation)return status();
        }
        engine.toast(t('收好了 {count} 个图标 · 原插件快捷键仍可使用',{count:[...records.values()].filter(rec=>rec.hidden).length}));
        await engine.finish(true);
        if(current!==operation)return status();
      }else{
        for(const rec of [...records.values()]){
          if(!rec.hidden)continue;
          if(rec.node.isConnected){
            // Opacity does not alter layout, so the live box follows responsive changes.
            const rect=rec.node.getBoundingClientRect(),visual=snapshot(rec.node);
            await engine.fly(visual,rect,engine.mouth(),false);
            if(current!==operation)return status();
          }
          restore(rec);
        }
        await engine.finish(false);if(current!==operation)return status();engine.toast(t('都吐出来啦 · 回到各自的位置'));
      }
      if(current===operation)await publishShared({...engine.getSharedPose?.(),stored},shared.revision);
    }catch(error){
      if(current!==operation)return status();
      releaseAll();
      try{await publishShared({stored:false,hidden:'none'},shared.revision);}catch{}
      engine.toast(t('动画中断，已恢复所有图标。'));
      console.warn('[CatKeeper] Restored after interrupted animation:',error.message);
    }finally{if(current===operation){busy=false;scan();}}
    return status();
  }
  function releaseAll(){
    operation++;busy=false;engine.cancel();
    for(const rec of records.values())restore(rec);
    stored=false;engine.busy=false;engine.setPhase('walk');engine.restPosition();
  }
  function status(){return {ok:true,ready,count:records.size,stored,half:engine.half,hidden:engine.hidden,enabled:settings.enabled,busy:!ready||busy||engine.busy,picking,shortcuts,revision:shared.revision,shared:{stored:shared.stored,hidden:shared.hidden,xRatio:shared.xRatio},targets:[...records.values()].map(rec=>({key:rec.key,name:rec.name,custom:rec.custom,auto:rec.auto,preferenceKey:rec.preferenceKey,alwaysVisible:alwaysVisible(rec)}))};}
  function notReady(){const error=t('正在准备黑猫，请稍候再试。');engine.toast(error);return {...status(),ok:false,error};}
  async function setVisibility(key,shown){
    if(busy||engine.busy)return {ok:false,error:t('等黑猫完成动作后再试。')};
    scan();const rec=records.get(key);
    if(!rec||typeof shown!=='boolean')return {ok:false,error:t('这个图标已经离开页面，请重新打开设置。')};
    await publishShared({visibility:{key:rec.preferenceKey,shown}});
    for(const item of records.values())if(item.preferenceKey===rec.preferenceKey){if(shown)restore(item);else if(stored&&settings.enabled)hide(item);}
    engine.controls?.refreshVisibility?.(status().targets);
    return status();
  }
  function deepAt(x,y){
    let el=document.elementFromPoint(x,y),depth=0;
    while(el&&depth++<12){const root=shadowOf(el);const next=root?.elementFromPoint(x,y);if(!next||next===el)break;el=next;}
    return el;
  }
  function pickCandidate(el){
    if(!el||el===engine.host||engine.root.contains(el))return null;
    let node=el,best=el;
    for(let i=0;node&&i<7;i++){
      const r=node.getBoundingClientRect();
      if(r.width>240||r.height>240)break;
      if(node.matches('button,[role="button"],a')){best=node;break;}
      if(getComputedStyle(node).position==='fixed'){best=node;break;}
      if(r.width>=24&&r.height>=24)best=node;
      node=node.parentElement;
    }
    return meaningful(best)&&best.getBoundingClientRect().width<=240&&best.getBoundingClientRect().height<=240?best:null;
  }
  function cancelPick(){picking=false;pickAbort?.abort();pickAbort=null;pickBox?.remove();pickBox=null;pickTarget=null;}
  function startPick(){
    cancelPick();if(!settings.enabled)return {ok:false,error:t('请先开启收纳猫。')};
    picking=true;pickAbort=new AbortController();const signal=pickAbort.signal;
    pickBox=document.createElement('div');pickBox.className='picker-box';pickBox.style.display='none';
    const label=document.createElement('span');label.className='picker-label';label.textContent=t('点此加入收纳 · Esc 取消');pickBox.append(label);engine.root.append(pickBox);
    engine.toast(t('请点击要收纳的悬浮小图标；不要选择功能面板。按 Esc 取消。'));
    document.addEventListener('pointermove',e=>{
      pickTarget=pickCandidate(deepAt(e.clientX,e.clientY));
      if(!pickTarget){pickBox.style.display='none';return;}
      const r=pickTarget.getBoundingClientRect();Object.assign(pickBox.style,{display:'block',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
      label.style.bottom=r.top<60?'auto':'calc(100% + 10px)';label.style.top=r.top<60?'calc(100% + 10px)':'auto';
    },{capture:true,passive:true,signal});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();cancelPick();engine.toast(t('已取消点选'));}},{capture:true,signal});
    // Block pointer handlers as well as clicks, so choosing an icon never activates its original action.
    for(const type of ['pointerdown','pointerup','mousedown','mouseup'])document.addEventListener(type,e=>{if(pickCandidate(deepAt(e.clientX,e.clientY))){e.preventDefault();e.stopImmediatePropagation();}},{capture:true,signal});
    document.addEventListener('click',async e=>{
      const target=pickCandidate(deepAt(e.clientX,e.clientY));if(!target)return;
      e.preventDefault();e.stopImmediatePropagation();
      const path=locator(target);if(!path){engine.toast(t('无法保存这个图标的位置，请换一个入口。'));return;}
      const existing=[...records.values()].find(r=>r.node===target);
      if(existing){cancelPick();engine.toast(t('这个图标已经在收纳名单里了'));return;}
      const title=target.getAttribute('aria-label')||target.getAttribute('title')||target.textContent?.trim()||t('自选图标');
      const rule={key:'custom:'+uniqueId(),name:title.slice(0,36),path,preferenceKey:preferenceKey(target)};
      const all=(await chrome.storage.local.get('catkeeperRules')).catkeeperRules||{};
      const current=Array.isArray(all[origin])?all[origin]:[];
      all[origin]=[...current,rule].slice(-40);
      await chrome.storage.local.set({catkeeperRules:all});rules=all[origin];cancelPick();scan();engine.toast(t('已加入本站的收纳名单'));
    },{capture:true,signal});
    return status();
  }
  async function handle(message){
    if(message?.type!=='catkeeper')return undefined;
    if(!ready&&['toggle','pick','restore','half','enabled','visibility','forget'].includes(message.action))return notReady();
    if(message.action==='status'){scan();return status();}
    if(message.action==='menu'){await refreshShortcuts();engine.openMenu();return status();}
    if(message.action==='toggle')return toggle();
    if(message.action==='pick'){if(busy)return {ok:false,error:t('等黑猫完成动作后再试。')};return startPick();}
    if(message.action==='restore'){
      cancelPick();releaseAll();await publishShared({stored:false,hidden:'none',...engine.getSharedPose?.()});engine.toast(t('所有图标已恢复'));return status();
    }
    if(message.action==='half'){
      if(busy||engine.busy)return {ok:false,error:t('等黑猫完成这个动作后再试。')};
      await engine.setHalf(typeof message.value==='boolean'?message.value:!engine.half);return status();
    }
    if(message.action==='enabled'){
      settings.enabled=typeof message.value==='boolean'?message.value:!settings.enabled;
      if(!settings.enabled){cancelPick();releaseAll();await publishShared({stored:false,hidden:'none'});}
      await chrome.storage.local.set({catkeeperSettings:settings});engine.setEnabled(settings.enabled);return status();
    }
    if(message.action==='visibility')return setVisibility(message.key,message.shown);
    if(message.action==='forget'&&typeof message.key==='string'&&message.key.startsWith('custom:')){
      if(busy)return {ok:false,error:t('等黑猫完成动作后再试。')};
      const all=(await chrome.storage.local.get('catkeeperRules')).catkeeperRules||{};
      rules=rules.filter(r=>r.key!==message.key);all[origin]=rules;
      await chrome.storage.local.set({catkeeperRules:all});scan();return status();
    }
    return {ok:false,error:t('未知操作')};
  }
  const listener=(message,sender,respond)=>{
    if(message?.type!=='catkeeper')return false;
    handle(message).then(respond).catch(error=>respond({ok:false,error:error.message}));return true;
  };
  runtime.onMessage.addListener(listener);
  const storageListener=(changes,area)=>{
    if(area!=='local')return;
    if(changes.catkeeperSettings){
      settings={...changes.catkeeperSettings.newValue,enabled:changes.catkeeperSettings.newValue?.enabled!==false};
      if(!settings.enabled){cancelPick();releaseAll();}
      engine.setEnabled(settings.enabled);
    }
    if(changes.catkeeperRules){rules=changes.catkeeperRules.newValue?.[origin]||[];scan();}
    if(changes.catkeeperShared)applyShared(changes.catkeeperShared.newValue);
  };
  chrome.storage.onChanged.addListener(storageListener);
  const interval=setInterval(()=>{if(!runtime.id){cleanup();return;}if(!document.hidden)scan();},2500);
  function cleanup(){dead=true;cancelPick();releaseAll();discovery?.destroy();window.removeEventListener('focus',refreshShortcuts);clearInterval(interval);clearTimeout(scanTimer);rootObservers.forEach(o=>o.disconnect());runtime.onMessage.removeListener(listener);chrome.storage.onChanged.removeListener(storageListener);engine.destroy();delete globalThis.__miorningCatKeeper;}
  globalThis.__miorningCatKeeper={status,cleanup,inspect:()=>engine.inspect()};
  Promise.all([chrome.storage.local.get(['catkeeperSettings','catkeeperRules']),runtime.sendMessage({type:'catkeeper-shared',action:'get'})]).then(([data,response])=>{
    settings={...data.catkeeperSettings,enabled:data.catkeeperSettings?.enabled!==false};rules=data.catkeeperRules?.[origin]||[];
    engine.setEnabled(settings.enabled);if(response?.state&&response.state.revision>=shared.revision)applyShared(response.state,{force:true});
    ready=true;watchRoot(document.documentElement);scan();
  }).catch(error=>{ready=true;watchRoot(document.documentElement);scan();reportSyncError(error);});
})();

(() => {
  'use strict';
  const t = (text, values) => globalThis.CatKeeperI18n?.t(text, values) ?? text;
  if (globalThis.CatKeeperControls) return;
  const isHidden = value => !!value && value !== 'none';
  const defaultKeys = {collect:'Alt+Shift+K', hide:'Alt+Shift+H'};
  class CatKeeperControls {
    constructor(engine, actions = {}) {
      this.engine=engine;this.actions=actions;this.abort=new AbortController();this.settingsOpen=false;
      this.style=document.createElement('style');
      this.style.textContent=`
        .ck-menu,.ck-settings{font:13px/1.5 "Microsoft YaHei UI",system-ui,sans-serif;color:#302923;letter-spacing:0;box-sizing:border-box;pointer-events:auto;text-align:left;color-scheme:light}
        .ck-menu *,.ck-settings *{box-sizing:border-box;font-family:inherit}
        .ck-menu[hidden],.ck-settings[hidden],.ck-menu [hidden],.ck-settings [hidden]{display:none!important}
        .ck-menu{position:fixed;z-index:10;width:278px;max-width:calc(100vw - 16px);padding:6px;margin:0;border:1px solid #d8cbb8;border-radius:15px;background:#fffaf1;box-shadow:0 14px 48px #34231230,0 3px 9px #34231213;transform-origin:bottom center}
        .ck-menu button{appearance:none;display:flex;align-items:center;justify-content:space-between;gap:18px;width:100%;min-height:46px;margin:0;padding:11px 12px;border:0;border-radius:9px;background:transparent;color:#302923;text-align:left;font-size:13px;line-height:1.5;cursor:pointer;white-space:nowrap}
        .ck-menu button:hover,.ck-menu button:focus-visible{background:#f0e5d6;outline:none}.ck-menu button:disabled{opacity:.42;cursor:default}.ck-menu button:disabled:hover{background:transparent}
        .ck-menu button:first-child{border-bottom:1px solid #eadfd0;border-radius:9px 9px 0 0;margin-bottom:3px;padding-bottom:13px}
        .ck-menu kbd{color:#9a7962;font:10px/1.4 "Segoe UI",system-ui,sans-serif;letter-spacing:.2px;background:none;padding:0;border:0;white-space:nowrap}
        .ck-settings{position:fixed;inset:0;z-index:11;display:grid;grid-template-columns:minmax(0,1fr);place-items:center;background:#21170b2b;padding:16px;backdrop-filter:blur(4px)}
        .ck-card{position:relative;width:min(440px,calc(100vw - 32px));min-width:0;max-height:calc(100vh - 32px);overflow:auto;border:1px solid #d8cbb8;border-radius:20px;background:#fffaf1;box-shadow:0 22px 80px #3423123b;padding:28px}
        .ck-overline{color:#ab3929;font-size:9px;letter-spacing:2.4px;font-weight:700;margin:0 0 10px}.ck-card h2{font-size:25px;letter-spacing:-.7px;line-height:1.25;margin:0 30px 10px 0;color:#302923}.ck-intro{font-size:12px;color:#867464;margin:0 0 22px;line-height:1.8}
        .ck-close{position:absolute;right:17px;top:17px;border:0;background:none;border-radius:50%;width:30px;height:30px;color:#95806b;font:23px/1 system-ui;cursor:pointer}.ck-close:hover{background:#efe3d2;color:#ab3929}
        .ck-key-row{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:15px 0;border-top:1px solid #eadfd0;font-size:13px}.ck-key-row kbd,.ck-key-edit{font:11px/1.5 system-ui,sans-serif;white-space:nowrap;padding:5px 8px;border:1px solid #d8cbb8;border-bottom-width:2px;border-radius:6px;background:#f8f0e3;color:#6a5140}.ck-key-edit{cursor:pointer}.ck-key-edit:hover{background:#efdfc9}
        .ck-primary{display:block;width:100%;border:0;border-radius:9px;background:#ac392a;color:#fff9ef;padding:12px 16px;font-size:12px;line-height:1.5;cursor:pointer;margin:14px 0 0}.ck-primary:hover{background:#8c281d}.ck-primary:disabled{opacity:.55;cursor:default}
        .ck-small{font-size:10px;color:#9b8977;line-height:1.7;margin:10px 0 0}.ck-settings button:focus-visible,.ck-settings summary:focus-visible,.ck-settings input:focus-visible{outline:2px solid #ac392a;outline-offset:3px}
        .ck-advanced{margin-top:22px;border-top:1px solid #eadfd0;padding-top:17px}.ck-advanced summary{cursor:pointer;font-size:11px;color:#7b6250;list-style:none;display:flex;justify-content:space-between}.ck-advanced summary::-webkit-details-marker{display:none}.ck-advanced summary::after{content:'＋'}.ck-advanced[open] summary::after{content:'−'}
        .ck-enabled{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:12px;padding:16px 0 13px}.ck-enabled input{accent-color:#ac392a;width:16px;height:16px;cursor:pointer}.ck-targets{list-style:none;padding:0;margin:0;border-top:1px solid #eadfd0}.ck-targets li{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;font-size:11px;border-bottom:1px solid #f0e7da}.ck-targets span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ck-secondary,.ck-forget{border:1px solid #ddcbb7;color:#7a5139;background:#fffaf1;border-radius:7px;padding:7px 10px;font-size:10px;line-height:1.4;cursor:pointer}.ck-secondary:hover,.ck-forget:hover{background:#f0e3d0}.ck-forget{padding:4px 7px;flex:0 0 auto}.ck-settings button:disabled{opacity:.5;cursor:default}.ck-utility{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.ck-status{font-size:11px;color:#ac392a;line-height:1.7;margin:12px 0 0;min-height:1em}
        @media(max-width:390px){.ck-card{padding:23px 20px}.ck-card h2{font-size:23px}.ck-key-row{font-size:12px}.ck-key-row kbd{font-size:10px}}
        @media(prefers-reduced-motion:reduce){.ck-settings{backdrop-filter:none}}
        .ck-targets .ck-target-name{min-width:0;flex:1}.ck-target-actions{display:flex;align-items:center;gap:10px;flex:0 0 auto}.ck-visibility{display:flex;align-items:center;gap:5px;white-space:nowrap;cursor:pointer;color:#7a5139}.ck-visibility input{margin:0;width:16px;height:16px;accent-color:#ac392a;cursor:pointer}.ck-visibility:has(input:checked){color:#ac392a}
      `;
      this.menu=document.createElement('div');this.menu.className='ck-menu';this.menu.setAttribute('role','menu');this.menu.setAttribute('aria-label',t('黑猫右键菜单'));this.menu.hidden=true;
      this.panel=document.createElement('div');this.panel.className='ck-settings';this.panel.hidden=true;
      engine.root.append(this.style,this.menu,this.panel);
      document.addEventListener('pointerdown',event=>{
        const path=event.composedPath();
        if(this.settingsOpen){if(path[0]===this.panel)this.close();return;}
        if(!this.menu.hidden&&!path.includes(this.menu))this.close();
      },{capture:true,signal:this.abort.signal});
      window.addEventListener('resize',()=>{if(!this.menu.hidden)this.position(this.anchor.x,this.anchor.y);},{passive:true,signal:this.abort.signal});
      this.menu.addEventListener('keydown',e=>this.menuKey(e));
      this.panel.addEventListener('keydown',e=>this.panelKey(e));
    }
    read(){return {stored:false,hidden:false,busy:false,...this.actions.getState?.()};}
    async invoke(fn){try{const result=await fn?.();if(result?.ok===false)throw Error(result.error||t('操作未完成，请重试'));}catch(error){this.engine.toast?.(error.message||t('操作未完成，请重试'));}}
    position(x,y){
      this.anchor={x,y};const width=this.menu.offsetWidth,height=this.menu.offsetHeight;
      this.menu.style.left=Math.max(8,Math.min(x,innerWidth-width-8))+'px';
      this.menu.style.top=Math.max(8,Math.min(y,innerHeight-height-8))+'px';
    }
    open(x,y){
      this.close();const state=this.read(),keys={...defaultKeys,...state.shortcuts};
      this.engine.menuOpen=true;this.menu.hidden=false;this.menu.replaceChildren();
      const items=[
        {label:t('快捷键设置'),key:'',action:this.actions.onSettings},
        {label:state.stored?t('释放图标'):t('收纳图标'),key:keys.collect||t('未绑定'),action:this.actions.onToggle,disabled:state.busy},
        {label:isHidden(state.hidden)?t('显示黑猫'):t('隐藏黑猫'),key:keys.hide||t('未绑定'),action:this.actions.onHide,disabled:state.busy}
      ];
      for(const item of items){
        const button=document.createElement('button');button.type='button';button.setAttribute('role','menuitem');button.disabled=!!item.disabled;
        const label=document.createElement('span');label.textContent=item.label;const key=document.createElement('kbd');key.textContent=item.key;
        button.append(label,key);button.addEventListener('click',()=>{this.close();this.invoke(item.action);});this.menu.append(button);
      }
      this.position(x,y);this.menu.querySelector('button').focus({preventScroll:true});
    }
    menuKey(event){
      const buttons=[...this.menu.querySelectorAll('button:not(:disabled)')],index=buttons.indexOf(this.engine.root.activeElement);
      if(event.key==='Escape'){event.preventDefault();this.close();this.engine.button.focus({preventScroll:true});return;}
      if(['ArrowDown','ArrowUp','Home','End','Tab'].includes(event.key)){
        event.preventDefault();let next=index;
        if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;
        else next=(index+((event.key==='ArrowUp'||event.key==='Tab'&&event.shiftKey)?-1:1)+buttons.length)%buttons.length;
        buttons[next]?.focus();
      }
    }
    close(){this.menu.hidden=true;this.panel.hidden=true;this.settingsOpen=false;this.engine.menuOpen=false;this.onClose?.();}
    refreshVisibility(targets=[]){
      if(!this.settingsOpen)return;
      const current=new Map(targets.map(target=>[target.key,!!target.alwaysVisible]));
      for(const input of this.panel.querySelectorAll('[data-visibility]'))if(current.has(input.dataset.visibility)&&!input.disabled)input.checked=current.get(input.dataset.visibility);
    }
    async showSettings(config={}){
      this.close();this.engine.menuOpen=true;this.settingsOpen=true;this.panel.hidden=false;
      const keys={...defaultKeys,...config.shortcuts};
      this.panel.innerHTML=`<section class="ck-card" role="dialog" aria-modal="true" aria-labelledby="ck-settings-title"><button type="button" class="ck-close" aria-label="关闭设置">×</button><p class="ck-overline">MIORNING / CAT KEEPER</p><h2 id="ck-settings-title">快捷键设置</h2><p class="ck-intro">不用追猫，也能随时收纳和唤回。<br>右键猫或尾巴，都能打开这个菜单。</p><div class="ck-key-row"><span>收纳 / 释放图标</span><kbd data-key="collect"></kbd></div><div class="ck-key-row"><span>隐藏 / 显示黑猫</span><kbd data-key="hide"></kbd></div><button type="button" class="ck-primary" data-action="shortcuts"></button><p class="ck-small" data-description></p><details class="ck-advanced"><summary>收纳范围与其他设置</summary><label class="ck-enabled"><span>启用黑猫</span><input type="checkbox" data-enabled aria-label="启用黑猫"></label><ul class="ck-targets"></ul><div class="ck-utility"><button type="button" class="ck-secondary" data-action="pick">点选扩展悬浮图标</button><button type="button" class="ck-secondary" data-action="restore">紧急放回全部图标</button></div><p class="ck-small">只收纳已确认的扩展悬浮入口，网站按钮保持原样。点选时按 Esc 取消。</p></details><p class="ck-status" role="status" aria-live="polite"></p></section>`;
      globalThis.CatKeeperI18n?.localizeDOM(this.panel);
      const find=s=>this.panel.querySelector(s),notify=text=>find('.ck-status').textContent=text;
      find('[data-key="collect"]').textContent=keys.collect||t('未绑定');find('[data-key="hide"]').textContent=keys.hide||t('未绑定');
      find('[data-action="shortcuts"]').textContent=config.shortcutButtonLabel||t('更改浏览器快捷键');
      find('[data-description]').textContent=config.shortcutDescription||t('点击后打开浏览器原生快捷键设置。快捷键冲突时，请在那里重新指定。');
      if(config.onEditShortcut){
        find('[data-action="shortcuts"]').hidden=true;
        for(const key of ['collect','hide']){
          const original=find(`[data-key="${key}"]`),edit=document.createElement('button');edit.type='button';edit.className='ck-key-edit';edit.dataset.key=key;edit.textContent=original.textContent;edit.setAttribute('aria-label',key==='collect'?t('修改收纳快捷键'):t('修改隐藏快捷键'));original.replaceWith(edit);
          edit.addEventListener('click',async()=>{const before=edit.textContent;edit.textContent=t('请按新快捷键…');try{const result=await config.onEditShortcut(key);edit.textContent=result||before;notify(result?t('试玩快捷键已保存，仅在此试玩页生效。'):t('已取消修改。'));}catch(error){edit.textContent=before;notify(error.message);}});
        }
      }
      find('.ck-close').addEventListener('click',()=>this.close());
      find('[data-action="shortcuts"]').addEventListener('click',async()=>{
        try{const result=await config.onShortcutSettings?.();if(result?.ok===false)throw Error(result.error||t('无法打开快捷键设置'));if(result?.collect!==undefined||result?.hide!==undefined){find('[data-key="collect"]').textContent=result.collect||t('未绑定');find('[data-key="hide"]').textContent=result.hide||t('未绑定');}else notify(config.shortcutMessage||t('已打开浏览器快捷键设置。返回网页后再右键黑猫，即可看到新的绑定。'));}catch(error){notify(error.message||t('请在扩展管理页打开键盘快捷键设置。'));}
      });
      const enabled=find('[data-enabled]');enabled.checked=config.enabled!==false;
      if(!config.onEnabled)find('.ck-enabled').hidden=true;
      enabled.addEventListener('change',async()=>{const desired=enabled.checked;enabled.disabled=true;try{const result=await config.onEnabled?.(desired);if(result?.ok===false)throw Error(result.error);notify(desired?t('黑猫已启用'):t('已停用黑猫，并放回图标。'));}catch(error){enabled.checked=!desired;notify(error.message);}finally{enabled.disabled=false;}});
      const targets=find('.ck-targets');
      for(const target of config.targets||[]){
        const li=document.createElement('li'),name=document.createElement('span'),actions=document.createElement('div');name.className='ck-target-name';name.textContent=target.name||t('悬浮入口');name.title=name.textContent;actions.className='ck-target-actions';li.append(name,actions);
        if(config.onVisibility){
          const label=document.createElement('label'),input=document.createElement('input'),caption=document.createElement('span');label.className='ck-visibility';input.type='checkbox';input.checked=!!target.alwaysVisible;input.dataset.visibility=target.key;input.setAttribute('aria-label',t('始终显示 {name}',{name:name.textContent}));caption.textContent=t('显示');label.append(input,caption);actions.append(label);
          input.addEventListener('change',async()=>{const desired=input.checked;input.disabled=true;try{const result=await config.onVisibility(target.key,desired);if(result?.ok===false)throw Error(result.error);notify(desired?t('已保留显示，以后收纳会跳过它。'):t('已取消保留，收纳时会将它吞入。'));}catch(error){input.checked=!desired;notify(error.message||t('保存失败，请重试。'));}finally{input.disabled=false;}});
        }
        if(target.custom&&config.onForget){const remove=document.createElement('button');remove.type='button';remove.className='ck-forget';remove.textContent=t('移除');remove.addEventListener('click',async()=>{remove.disabled=true;try{const result=await config.onForget(target.key);if(result?.ok===false)throw Error(result.error);li.remove();notify(t('已移除这条自选规则。'));}catch(error){notify(error.message);remove.disabled=false;}});actions.append(remove);}
        targets.append(li);
      }
      if(!targets.children.length){const li=document.createElement('li');li.textContent=t('这一页暂时没有已识别的悬浮入口。');targets.append(li);}
      if(config.onVisibility&&targets.children.length){const help=document.createElement('p');help.className='ck-small';help.textContent=t('勾选“显示”会立即放回该图标，并在以后收纳时跳过。');targets.after(help);}
      const pick=find('[data-action="pick"]');if(!config.onPick)pick.hidden=true;else pick.addEventListener('click',()=>{this.close();this.invoke(config.onPick);});
      const restore=find('[data-action="restore"]');if(!config.onRestore)restore.hidden=true;else restore.addEventListener('click',async()=>{restore.disabled=true;try{const result=await config.onRestore();if(result?.ok===false)throw Error(result.error);notify(t('所有图标已回到原位。'));}catch(error){notify(error.message);}finally{restore.disabled=false;}});
      if(!config.onEnabled&&!config.onPick&&!config.onRestore&&!(config.targets||[]).length)find('.ck-advanced').hidden=true;
      find('.ck-close').focus({preventScroll:true});
    }
    panelKey(event){
      if(event.key==='Escape'){event.preventDefault();this.close();this.engine.button.focus({preventScroll:true});return;}
      if(event.key!=='Tab')return;
      const focusable=[...this.panel.querySelectorAll('button:not(:disabled),input:not(:disabled),summary')].filter(el=>el.getClientRects().length);
      const index=focusable.indexOf(this.engine.root.activeElement),next=(index+(event.shiftKey?-1:1)+focusable.length)%focusable.length;
      event.preventDefault();focusable[next]?.focus();
    }
    destroy(){this.close();this.abort.abort();this.style.remove();this.menu.remove();this.panel.remove();}
  }
  globalThis.CatKeeperControls=CatKeeperControls;
})();

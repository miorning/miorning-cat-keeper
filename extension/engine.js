(() => {
  'use strict';
  const t = (text, values) => globalThis.CatKeeperI18n?.t(text, values) ?? text;
  if(globalThis.CatKeeperEngine?.version==='0.3.1')return;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const easing={linear:t=>t,in:t=>t*t*t,out:t=>1-(1-t)**3,inout:t=>t<.5?4*t*t*t:1-(-2*t+2)**3/2};
  const walk=d=>Array.from({length:12},(_,i)=>`v2/walk-${d}-${i}`);
  const cycles={run:8,float:6,scooter:6,roll:4};
  const modern=Object.entries(cycles).flatMap(([mode,count])=>['left','right'].flatMap(dir=>Array.from({length:count},(_,i)=>`v3/${mode}-${dir}-${i}`)));
  const elder=['left','right'].flatMap(dir=>Array.from({length:12},(_,i)=>`v4/walk-${dir}-${i}`));
  const names=[...walk('right'),...walk('left'),'v2/crouch','v2/jump','v2/drop','v2/pancake','v2/rebound','v2/gesture','v2/ceiling','v2/ball-rebound','v2/tail-bottom-1','v2/tail-top-1','inhale-0','inhale-1','full-0','full-1','spit-0','spit-1'];
  class CatKeeperEngine {
    static version='0.3.1';
    constructor({url,onActivate}){
      Object.assign(this,{url,onActivate,phase:'walk',surface:'bottom',anchor:'bottom',hidden:'none',enabled:true,busy:false,menuOpen:false,x:innerWidth*.62,anchorY:innerHeight,vx:0,dir:1,walkCycle:0,last:0,clock:0,run:0,catchUntil:0,focused:false,raf:0,destroyed:false,frameOverride:null});
      Object.assign(this,{caughtMs:0,revealWaitMs:0,locomotion:'walk',modeClock:0,modeTransition:0,rollSpin:0,tailClicks:0,tailClickAt:0,drag:null,tailStretch:0,ignoreClickUntil:0,lastWidth:innerWidth,lean:0,leanVelocity:0,proximity:'calm',pointerPosition:null,proximityDistance:Infinity,alertAt:0,alertPulse:0,escapeUntil:0,escapeCooldown:0,escapeDir:1});
      this.pose={sx:1,sy:1,angle:0};this.images=new Map();this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.abort=new AbortController();const signal=this.abort.signal;
      this.host=document.createElement('miorning-cat-keeper');this.host.id='miorning-cat-keeper';this.host.setAttribute('popover','manual');
      this.host.style.cssText='all:initial!important;position:fixed!important;inset:0!important;margin:0!important;padding:0!important;border:0!important;width:100vw!important;height:100vh!important;max-width:none!important;max-height:none!important;overflow:hidden!important;background:transparent!important;pointer-events:none!important;z-index:2147483647!important;color-scheme:light!important;';
      this.root=this.host.attachShadow({mode:'open'});this.root.innerHTML=`<style>
        :host{font-family:system-ui,"Microsoft YaHei",sans-serif}*,*::before,*::after{box-sizing:border-box}
        .cat{position:absolute;left:0;top:0;width:120px;height:120px;padding:0;border:0;border-radius:38%;background:none;cursor:pointer;pointer-events:auto;touch-action:none;outline:none;will-change:transform;-webkit-tap-highlight-color:transparent}.cat.tail{cursor:grab}.cat.dragging{cursor:grabbing}
        .cat:focus-visible{outline:2px solid #b53122;outline-offset:-2px}.sprite{display:block;width:100%;height:100%;pointer-events:none;user-select:none}.sprite-source{display:none}
        .hint{position:absolute;left:50%;bottom:102%;transform:translateX(-50%);background:#272422;color:#fffaf2;border-radius:9px;padding:6px 10px;font:11px/1.5 system-ui,sans-serif;white-space:nowrap;opacity:0;pointer-events:none}.cat.caught .hint,.cat:focus-visible .hint{opacity:1}.cat.top .hint{bottom:auto;top:100%}
        .toast{position:absolute;left:50%;bottom:110px;transform:translateX(-50%);background:#292522;color:#fffaf2;border:1px solid #ffffff20;border-radius:14px;box-shadow:0 8px 28px #0002;padding:11px 18px;font:13px/1.6 system-ui,"Microsoft YaHei",sans-serif;max-width:min(90vw,520px);text-align:center;opacity:0;transition:opacity .15s;pointer-events:none}.toast.visible{opacity:1}
        .fly{position:fixed;left:0;top:0;pointer-events:none;will-change:transform,opacity;transform-origin:center;overflow:visible}
        .picker-box{position:fixed;pointer-events:none;border:2px solid #bb3827;border-radius:12px;background:#bb38271a;box-shadow:0 0 0 4px #fff8}.picker-label{position:absolute;bottom:calc(100% + 10px);right:0;white-space:nowrap;padding:7px 10px;background:#292522;color:#fffaf2;border-radius:8px;font:12px/1.4 system-ui,sans-serif}
        @media(prefers-reduced-motion:reduce){.toast{transition:none}}
      </style><button type="button" class="cat" aria-label="收纳悬浮图标；右键打开三个选项" title="快速抓住再点；右键打开菜单"><canvas class="sprite" width="256" height="256" aria-hidden="true"></canvas><img class="sprite-source" alt="MIORNING 黑猫" draggable="false"><span class="hint">点我收纳 · 右键设置</span></button><div class="toast" role="status" aria-live="polite"></div>`;
      globalThis.CatKeeperI18n?.localizeDOM(this.root);
      this.button=this.root.querySelector('.cat');this.sprite=this.root.querySelector('.sprite');this.source=this.root.querySelector('.sprite-source');this.ctx=this.sprite.getContext('2d');this.ctx.imageSmoothingQuality='high';this.hint=this.root.querySelector('.hint');this.toastEl=this.root.querySelector('.toast');document.documentElement.append(this.host);try{this.host.showPopover();}catch{}
      this.button.addEventListener('click',e=>{if(this.half||performance.now()<this.ignoreClickUntil)return;if(!this.busy&&!this.menuOpen){this.caughtMs=0;this.revealWaitMs=0;this.catchUntil=0;this.onActivate?.();}},{signal});
      this.button.addEventListener('pointerdown',e=>this.pointerDown(e),{signal});
      this.button.addEventListener('pointerup',e=>this.pointerUp(e),{signal});
      this.button.addEventListener('pointercancel',e=>this.pointerUp(e,true),{signal});
      this.button.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();this.openMenu(e.clientX,e.clientY);},{signal});
      this.button.addEventListener('keydown',e=>{if((e.shiftKey&&e.key==='F10')||e.key==='ContextMenu'){e.preventDefault();this.openMenu();}},{signal});
      this.button.addEventListener('focus',()=>{this.focused=this.button.matches(':focus-visible');},{signal});this.button.addEventListener('blur',()=>{this.focused=false;},{signal});
      document.addEventListener('pointermove',e=>this.pointer(e),{passive:true,signal});window.addEventListener('resize',()=>this.resize(),{passive:true,signal});
      document.addEventListener('pointerout',e=>{if(!e.relatedTarget)this.pointerPosition=null;},{passive:true,signal});
      document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(this.raf);this.raf=0;}else{this.last=0;this.start();}},{signal});
      this.motion.addEventListener('change',()=>{this.cancel();this.restPosition();this.resetPatrol();this.start();},{signal});
      this.ready=Promise.all([...names,...modern,...elder].filter(name=>globalThis.CatKeeperSpriteMetrics?.[name]).map(name=>new Promise(resolve=>{const im=new Image();im.onload=()=>{this.images.set(name,im);resolve();};im.onerror=resolve;im.src=this.url(`assets/${name}.png`);}))).then(()=>this.render());
      this.resetPatrol();this.render();this.start();
    }
    get reduced(){return this.motion.matches;}
    get half(){return this.hidden!=='none';}
    get size(){return this.half?(this.hidden==='top'?88:80):(this.surface==='top'?144:120);}
    get y(){return this.drawBox?.top||0;}
    get targetY(){return this.anchorY;}set targetY(v){this.anchorY=v;}
    notify(){if(this.hint){const full=this.surface==='top';this.hint.textContent=this.half?t('拖动尾巴移位 · 向内拔出'):full?t('点我释放 · 右键设置'):t('点我收纳 · 右键设置');this.button.setAttribute('aria-label',t(this.half?'拖动尾巴移位，向页面内拉出黑猫；右键设置':full?'释放悬浮图标；右键打开三个选项':'收纳悬浮图标；右键打开三个选项'));}this.onStateChange?.(this.inspect());}
    metric(n){return globalThis.CatKeeperSpriteMetrics?.[n]||{left:16,top:16,right:240,bottom:256,width:224,height:240};}
    openMenu(x=this.x,y=this.surface==='top'?30:innerHeight-18){if(this.revealWaitMs>0)this.revealWaitMs=3000;this.controls?.open(x,y);this.start();}
    getSharedPose(){return {hidden:this.hidden,xRatio:clamp(this.x/innerWidth,0,1)};}
    commitPose(){this.onPoseCommit?.(this.getSharedPose());}
    applySharedPose(state={},{immediate=true}={}){
      this.controls?.close();this.cancel();this.lastWidth=innerWidth;this.surface=state.stored?'top':'bottom';this.anchor=this.surface;
      this.hidden=state.hidden===this.surface?this.surface:'none';this.phase=this.half?'hidden':state.stored?'full':'walk';
      const margin=this.half?20:Math.min(62,innerWidth*.2);this.x=clamp(Number.isFinite(state.xRatio)?state.xRatio*innerWidth:this.x,margin,innerWidth-margin);
      this.resetPatrol();this.restPosition();this.render();this.notify();this.start();
    }
    start(){if(!this.raf&&!this.destroyed&&!document.hidden&&this.enabled)this.raf=requestAnimationFrame(t=>this.tick(t));}
    tick(t){
      this.raf=0;const dt=Math.min(.035,(t-(this.last||t))/1000);this.last=t;
      if(!this.menuOpen){
        this.clock+=dt;
        if(this.tween){const a=this.tween;a.elapsed+=dt*1000;const p=clamp(a.elapsed/a.ms,0,1),q=(easing[a.ease]||easing.out)(p);for(const k of Object.keys(a.to)){const v=a.from[k]+(a.to[k]-a.from[k])*q;if(['sx','sy','angle'].includes(k))this.pose[k]=v;else this[k]=v;}if(p===1){this.tween=null;a.resolve(true);}}
        else if(!this.busy&&!this.half&&!this.drag){
          if(this.revealWaitMs>0){this.revealWaitMs=Math.max(0,this.revealWaitMs-dt*1000);this.vx=0;}
          else if(this.caughtMs>0){this.caughtMs=Math.max(0,this.caughtMs-dt*1000);this.catchUntil=t+this.caughtMs;this.vx=0;if(this.caughtMs===0&&this.surface==='bottom')void this.setHalf(true);}
          else if(!this.reduced&&!this.focused)this.patrolStep(dt,t);
        }
      }
      this.render();if(!this.reduced||this.tween||this.caughtMs>0||this.revealWaitMs>0)this.start();
    }
    resetPatrol(){const min=this.half?20:Math.min(62,innerWidth*.2),max=Math.max(min,innerWidth-min);this.x=clamp(this.x,min,max);this.route=[max,min,this.x];this.routeIndex=0;this.patrol={distance:0,goal:(max-min)*2,turns:0};this.vx=0;this.fleeUntil=0;this.catchUntil=0;this.caughtMs=0;this.revealWaitMs=0;this.modeClock=0;this.locomotion='walk';this.modeTransition=0;this.proximity='calm';this.alertPulse=0;this.alertAt=0;this.escapeUntil=0;this.escapeCooldown=0;this.notify();}
    baseSpeed(){return this.surface==='top'?clamp((innerWidth-124)/3.5,70,420)*.5:18;}
    travelSpeed(){return this.surface==='top'?this.baseSpeed():this.proximity==='escape'?clamp((innerWidth-124)/3.5,70,420)*1.5*(this.locomotion==='scooter'?1.65:1.45):this.proximity==='alert'?36:18;}
    modeMultiplier(){return this.travelSpeed()/this.baseSpeed();}
    proximityRanges(){const alert=clamp(innerWidth*.5,260,480);return {alert,escape:alert*.625,calm:alert+Math.max(45,alert*.1),settle:alert+Math.max(70,alert*.1875)};}
    updateProximity(dt,t){
      this.modeClock+=dt;this.modeTransition=Math.max(0,this.modeTransition-dt);this.alertPulse=Math.max(0,this.alertPulse-dt);
      const pointer=this.pointerPosition,cy=this.painted?Math.max(innerHeight-78,(this.painted.top+innerHeight)/2):innerHeight-52;
      const dist=pointer?Math.hypot(this.x-pointer.x,cy-pointer.y):Infinity,ranges=this.proximityRanges();this.proximityDistance=dist;
      if(this.proximity==='escape'){
        if(t>=this.escapeUntil&&dist>ranges.settle){
          this.proximity='calm';this.locomotion='walk';this.modeClock=0;this.modeTransition=.22;this.escapeCooldown=t+450;
          const min=Math.min(62,innerWidth*.2),max=innerWidth-min;this.route=this.dir>0?[max,min]:[min,max];this.routeIndex=0;
        }
        return;
      }
      if(t<this.escapeCooldown)return;
      if(this.proximity==='calm'&&dist<ranges.alert){this.proximity='alert';this.alertAt=t;this.alertPulse=.32;}
      if(this.proximity==='alert'){
        if(dist>ranges.calm){this.proximity='calm';this.alertPulse=0;}
        else if(dist<ranges.escape&&t-this.alertAt>=110){
          this.proximity='escape';this.locomotion=Math.random()<.5?'scooter':'roll';this.modeClock=0;this.modeTransition=.28;this.escapeUntil=t+1000;
          this.escapeDir=this.x>=pointer.x?1:-1;const margin=Math.min(62,innerWidth*.2);if(this.x<margin+16)this.escapeDir=1;if(this.x>innerWidth-margin-16)this.escapeDir=-1;
        }
      }
    }
    patrolStep(dt,t){
      if(this.surface==='bottom')this.updateProximity(dt,t);
      let target=this.route[this.routeIndex];if(target===undefined){if(this.surface==='top'){void this.setHalf(true);return;}this.route=[innerWidth-62,62];this.routeIndex=this.dir>0?1:0;target=this.route[this.routeIndex];}
      const dx=target-this.x;this.dir=dx>=0?1:-1;const escaping=this.surface==='bottom'&&this.proximity==='escape',fleeing=this.surface==='top'&&t<(this.fleeUntil||0),speed=this.travelSpeed();
      const edge=Math.min(62,innerWidth*.2);if(escaping){if(this.x<=edge+1&&this.escapeDir<0)this.escapeDir=1;if(this.x>=innerWidth-edge-1&&this.escapeDir>0)this.escapeDir=-1;this.dir=this.escapeDir;}else if(fleeing)this.dir=this.fleeDir;
      const desired=this.dir*(fleeing?speed*1.9:speed),reaction=escaping?13:this.surface==='top'?11:this.proximity==='alert'?9:7;
      this.vx+=(desired-this.vx)*(1-Math.exp(-reaction*dt));let step=this.vx*dt;
      if(!fleeing&&!escaping&&Math.sign(step)===Math.sign(dx)&&Math.abs(step)>=Math.abs(dx)){step=dx;this.routeIndex++;this.patrol.turns++;this.vx*=.25;}
      this.x=clamp(this.x+step,Math.min(60,innerWidth/3),Math.max(60,innerWidth-60));this.patrol.distance+=Math.abs(step);
      this.walkCycle+=this.surface==='bottom'&&this.locomotion==='walk'?dt*(this.proximity==='alert'?13:10):Math.abs(step)*(this.locomotion==='scooter'?6/180:this.locomotion==='roll'?4/240:8/145);
      if(this.surface==='bottom'&&this.locomotion==='roll')this.rollSpin+=step*360/240;
      const desiredLean=clamp(this.vx/(escaping?speed:this.baseSpeed()),-1.8,1.8);this.leanVelocity+=(desiredLean-this.lean)*95*dt;this.leanVelocity*=Math.exp(-17*dt);this.lean+=this.leanVelocity*dt;
      if(Math.abs(dx)<.7&&!fleeing&&!escaping&&this.routeIndex<this.route.length&&this.route[this.routeIndex]===target){this.routeIndex++;this.patrol.turns++;}
      if(this.routeIndex>=this.route.length){if(this.surface==='top')void this.setHalf(true);else{this.route=[innerWidth-62,62];this.routeIndex=this.dir>0?1:0;}}
    }
    frameInfo(){
      if(this.half)return {name:`v2/tail-${this.hidden}-1`,next:null,blend:0};
      if(this.frameOverride)return {name:this.frameOverride,next:null,blend:0};
      if(this.phase==='walk'||this.phase==='full'){
        const mode=this.surface==='top'?'float':this.locomotion,dir=this.dir>0?'right':'left',count=mode==='walk'?12:cycles[mode],v=this.reduced?0:mode==='float'?this.clock*12:mode==='scooter'?this.clock*9:this.walkCycle,i=Math.floor(v)%count;
        const name=mode==='walk'?`v4/walk-${dir}-${i}`:`v3/${mode}-${dir}-${i}`;if(this.images.has(name))return {name,next:null,blend:0};
        if(this.phase==='walk')return {name:walk(dir)[Math.floor(this.walkCycle)%12],next:null,blend:0};
      }
      return {name:this.phase==='inhale'?'inhale-1':this.phase==='spit'?'spit-0':'full-0',next:null,blend:0};
    }
    drawTail(name){
      const im=this.images.get(name);if(!im)return;const c=this.ctx,m=this.metric(name),top=this.hidden==='top',range=m.bottom-m.top;
      const wave=this.reduced?0:Math.sin(this.clock*2.65),secondary=this.reduced?0:Math.sin(this.clock*5.3+.8)*.15;
      // Deform generated image strips. The root stays fixed; no replacement character is drawn.
      for(let sy=m.top;sy<m.bottom;sy+=3){const h=Math.min(3,m.bottom-sy),u=top?(sy-m.top)/range:(m.bottom-sy)/range,shift=(wave*Math.sin(u*1.25)+secondary*u)*u*(top?24:32);c.drawImage(im,0,sy,256,h,shift,sy,256,h+.5);}
      const shift=(wave*Math.sin(1.25)+secondary)*(top?24:32)*this.size/256;const length=range*this.size/256*(1+this.tailStretch/70);this.tailTip={x:this.x+shift,y:top?length:innerHeight-length};this.tailPose=wave;
    }
    rollGeometry(name){
      const im=this.images.get(name);if(!im)return null;const m=this.metric(name);
      // Preserve the generated pixels. Use the build-time alpha outline so a
      // webpage never has to read back a cross-origin extension image canvas.
      this.rollOutlines??=new Map();let outline=this.rollOutlines.get(name);
      if(!outline){const points=m.alphaOutline?.length?m.alphaOutline:[[m.left,m.top],[m.right,m.top],[m.right,m.bottom],[m.left,m.bottom]];outline={points,cx:(m.left+m.right)/2,cy:(m.top+m.bottom)/2};this.rollOutlines.set(name,outline);}
      const nativeAngle=Number(m.nativeAngle)||(name.endsWith('-2')?180:0),degrees=(this.reduced?0:this.rollSpin)-nativeAngle,angle=degrees*Math.PI/180,co=Math.cos(angle),si=Math.sin(angle);
      let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;for(const [px,py]of outline.points){const x=px-outline.cx,y=py-outline.cy,rx=x*co-y*si,ry=x*si+y*co;left=Math.min(left,rx);right=Math.max(right,rx);top=Math.min(top,ry);bottom=Math.max(bottom,ry);}
      const scale=Math.min(210/Math.max(m.width,m.height),232/(right-left),232/(bottom-top)),width=(right-left)*scale,height=(bottom-top)*scale;
      return {image:im,angle,scale,cx:outline.cx,cy:outline.cy,dx:128-(left+right)*scale/2,dy:256-bottom*scale,metric:{left:128-width/2,right:128+width/2,top:256-height,bottom:256,width,height}};
    }
    render(){
      if(this.destroyed)return;const f=this.frameInfo();this.renderedFrame=f.name;const rolling=f.name.startsWith('v3/roll-')?this.rollGeometry(f.name):null,m=rolling?.metric||this.metric(f.name),s=this.size/256,oy=(this.half?this.hidden:this.anchor)==='top'?m.top:m.bottom,edgeBase=this.half?(this.hidden==='top'?0:innerHeight):this.anchorY;
      // Let antialiased edge pixels extend slightly beyond the viewport. The
      // visible contour touches the browser edge even at fractional zoom/DPR.
      const edgeContact=this.half||Math.abs(edgeBase-(this.anchor==='top'?0:innerHeight))<.01,base=edgeBase+(edgeContact?((this.half?this.hidden:this.anchor)==='top'?-.65:.65):0);
      const moving=!this.reduced&&!this.busy&&!this.half&&!this.menuOpen&&this.caughtMs===0&&this.revealWaitMs===0;
      const elderly=this.surface==='bottom'&&this.locomotion==='walk',alert=moving&&elderly?Math.sin(this.alertPulse/.32*Math.PI)*.045:0;
      const subtle=moving?(this.surface==='top'?Math.sin(this.clock*3.7)*.028:this.locomotion==='scooter'?Math.sin(this.clock*9)*.018:elderly?Math.sin(this.walkCycle*Math.PI/6)*.007:Math.sin(this.walkCycle*Math.PI/2)*.036):0,change=moving?Math.sin(this.modeTransition/.28*Math.PI)*.11:0;
      const stretch=this.half?1+this.tailStretch/70:1,sx=this.pose.sx*(1-subtle+change-alert*.55)/Math.sqrt(stretch),sy=this.pose.sy*(1+subtle-change+alert)*stretch,skew=moving?(this.surface==='top'?Math.sin(this.clock*2.3)*2.5:this.lean*(elderly?.7:2)):0;
      this.button.style.width=this.button.style.height=this.size+'px';this.button.style.transform=`translate3d(${(this.x-this.size/2).toFixed(3)}px,${(base-oy*s).toFixed(3)}px,0)`;this.sprite.style.transformOrigin=`50% ${oy/256*100}%`;this.sprite.style.transform=`scale(${sx.toFixed(4)},${sy.toFixed(4)}) skewX(${skew.toFixed(3)}deg) rotate(${this.pose.angle.toFixed(3)}deg)`;
      this.button.classList.toggle('top',this.surface==='top');this.button.classList.toggle('tail',this.half);this.button.classList.toggle('dragging',!!this.drag);this.button.classList.toggle('caught',(this.caughtMs>0||this.revealWaitMs>0)&&!this.busy&&!this.menuOpen&&!this.half);this.button.style.visibility=this.enabled?'visible':'hidden';
      const c=this.ctx;c.clearRect(0,0,256,256);c.globalAlpha=1;c.globalCompositeOperation='source-over';
      if(this.half)this.drawTail(f.name);else if(rolling){c.save();c.translate(rolling.dx,rolling.dy);c.rotate(rolling.angle);c.scale(rolling.scale,rolling.scale);c.drawImage(rolling.image,-rolling.cx,-rolling.cy,256,256);c.restore();}else{const im=this.images.get(f.name),next=this.images.get(f.next);if(im){c.globalAlpha=next?1-f.blend:1;c.drawImage(im,0,0,256,256);}if(next&&f.blend>0){c.globalCompositeOperation='lighter';c.globalAlpha=f.blend;c.drawImage(next,0,0,256,256);}c.globalAlpha=1;c.globalCompositeOperation='source-over';}
      if(this.source.dataset.frame!==f.name){this.source.src=this.url(`assets/${f.name}.png`);this.source.dataset.frame=f.name;}
      this.drawBox={left:this.x-this.size/2,top:base-oy*s,width:this.size,height:this.size};this.painted={left:this.x+(m.left-128)*s*sx,top:base+(m.top-oy)*s*sy,right:this.x+(m.right-128)*s*sx,bottom:base+(m.bottom-oy)*s*sy};
      if(this.half){this.painted.top=this.hidden==='top'?base:base-m.height*s*stretch;this.painted.bottom=this.hidden==='top'?base+m.height*s*stretch:base;}
    }
    inspect(){return {phase:this.phase,surface:this.surface,hidden:this.hidden,busy:this.busy,x:this.x,anchorY:this.anchorY,pose:{...this.pose},patrol:{...this.patrol},frame:this.renderedFrame,painted:{...this.painted},tailTip:this.half?{...this.tailTip}:null,tailPose:this.half?this.tailPose:null,menuOpen:this.menuOpen,locomotion:this.surface==='top'?'float':this.locomotion,baseSpeed:this.baseSpeed(),travelSpeed:this.travelSpeed(),speedMultiplier:this.modeMultiplier(),modeClock:this.modeClock,rollAngle:this.rollSpin,vx:this.vx,caughtMs:this.caughtMs,revealWaitMs:this.revealWaitMs,dragging:!!this.drag,tailStretch:this.tailStretch,tailClicks:this.tailClicks,xRatio:this.x/innerWidth,proximity:this.proximity,proximityDistance:Number.isFinite(this.proximityDistance)?this.proximityDistance:null,alertPulse:this.alertPulse,escapeUntil:this.escapeUntil};}
    pointerDown(e){
      this.focused=false;if(this.revealWaitMs>0)this.revealWaitMs=3000;
      if(e.button===2){this.tailClicks=0;this.openMenu(e.clientX,e.clientY);return;}
      if(e.button!==0||this.busy||this.menuOpen)return;
      if(this.half){
        e.preventDefault();this.drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x:this.x,at:performance.now(),maxMove:0,pull:0};this.ignoreClickUntil=performance.now()+1000;
        try{this.button.setPointerCapture(e.pointerId);}catch{}this.start();
      }else{this.caughtMs=3000;this.catchUntil=performance.now()+3000;this.vx=0;this.start();}
    }
    pointerUp(e,cancelled=false){
      const d=this.drag;if(!d||d.id!==e.pointerId)return;this.drag=null;try{this.button.releasePointerCapture(e.pointerId);}catch{}
      this.ignoreClickUntil=performance.now()+500;const short=!cancelled&&d.maxMove<6&&performance.now()-d.at<350;
      if(short){const now=performance.now();this.tailClicks=now-this.tailClickAt<=700?this.tailClicks+1:1;this.tailClickAt=now;if(this.tailClicks===5){this.tailClicks=0;this.onEasterEgg?.();}this.tailStretch=0;this.render();return;}
      this.tailClicks=0;if(cancelled)this.x=d.x;if(!cancelled&&d.pull>=60){void this.yankOut();return;}
      void this.relaxTail(d.maxMove>=6&&!cancelled);
    }
    async relaxTail(commit){
      this.run++;const token=this.run;this.busy=true;
      if(await this.steps([{ms:140,stage:'tail-recoil',to:{tailStretch:Math.min(10,this.tailStretch*.16)}},{ms:110,to:{tailStretch:0}}],token)){this.phase='hidden';this.busy=false;this.render();this.notify();if(commit)this.commitPose();}
    }
    async yankOut(){
      this.run++;const token=this.run;this.busy=true;this.vx=0;this.caughtMs=0;this.catchUntil=0;
      if(!await this.steps([{ms:95,stage:'yank-tension',to:{tailStretch:Math.min(110,this.tailStretch+15)}}],token))return;
      this.hidden='none';this.tailStretch=0;this.anchor=this.surface;this.pose={sx:.66,sy:1.45,angle:0};
      const top=this.surface==='top',edge=top?0:innerHeight;this.anchorY=top?-115:edge+105;
      const sequence=top?[
        {ms:220,frame:'full-0',stage:'yank-pop',to:{anchorY:58,sx:.78,sy:1.28},easing:'out'},
        {ms:160,frame:'v2/ceiling',stage:'yank-impact',to:{anchorY:0,sx:1.22,sy:.76},easing:'in'},
        {ms:170,frame:'v2/ball-rebound',stage:'yank-rebound',to:{anchorY:18,sx:.92,sy:1.1}},
        {ms:210,frame:'full-0',stage:'yank-settle',to:{anchorY:0,sx:1,sy:1}}
      ]:[
        {ms:240,frame:'v2/jump',stage:'yank-pop',to:{anchorY:edge-70,sx:.8,sy:1.25},easing:'out'},
        {ms:190,frame:'v2/pancake',stage:'yank-impact',to:{anchorY:edge,sx:1.23,sy:.75},easing:'in'},
        {ms:170,frame:'v2/rebound',stage:'yank-rebound',to:{anchorY:edge-18,sx:.9,sy:1.13}},
        {ms:190,frame:'v2/crouch',stage:'yank-settle',to:{anchorY:edge,sx:1,sy:1}}
      ];
      if(!await this.steps(sequence,token))return;
      this.phase=top?'full':'walk';this.busy=false;this.frameOverride=null;this.resetPatrol();this.revealWaitMs=3000;this.restPosition();this.notify();this.commitPose();this.start();
    }
    pointer(e){
      const now=performance.now(),old=this.pointerPrev,dt=old?now-old.t:0,speed=old&&dt>0&&dt<180?Math.hypot(e.clientX-old.x,e.clientY-old.y)*1000/dt:0;this.pointerPrev={x:e.clientX,y:e.clientY,t:now};
      if(e.pointerType!=='touch')this.pointerPosition={x:e.clientX,y:e.clientY};
      if(this.drag&&e.pointerId===this.drag.id){const d=this.drag,dx=e.clientX-d.startX,dy=e.clientY-d.startY;d.maxMove=Math.max(d.maxMove,Math.hypot(dx,dy));d.pull=Math.max(0,(this.hidden==='top'?1:-1)*dy);this.x=clamp(d.x+dx,20,innerWidth-20);this.tailStretch=Math.min(130,d.pull*.8);this.render();return;}
      if(e.pointerType==='touch'||!this.enabled||this.busy||this.half||this.reduced||this.focused||this.menuOpen)return;
      if(this.caughtMs>0||this.revealWaitMs>0)return;
      const cy=this.surface==='top'?48:innerHeight-56,dx=this.x-e.clientX,dist=Math.hypot(dx,cy-e.clientY);
      const captureSpeed=this.surface==='top'||this.locomotion==='walk'?1000:this.locomotion==='scooter'?1650:1450;
      if(speed>captureSpeed&&dist<100){this.caughtMs=3000;this.catchUntil=now+3000;this.vx=0;this.start();return;}
      if(this.surface==='top'&&dist<125){let dir=dx>=0?1:-1;if(this.x<90)dir=1;if(this.x>innerWidth-90)dir=-1;this.fleeDir=dir;this.fleeUntil=now+240;}
    }
    resize(){const ratio=this.x/this.lastWidth;this.lastWidth=innerWidth;const margin=this.half?20:Math.min(60,innerWidth/3);this.x=clamp(ratio*innerWidth,margin,Math.max(margin,innerWidth-margin));if(this.half)this.anchorY=this.hidden==='top'?0:innerHeight;else if(!this.busy){const wait=this.revealWaitMs,caught=this.caughtMs;this.restPosition();this.resetPatrol();this.revealWaitMs=wait;this.caughtMs=caught;}this.render();}
    restPosition(){this.anchor=this.surface;this.anchorY=this.surface==='top'?0:innerHeight;this.pose={sx:1,sy:1,angle:0};this.render();this.start();}
    setPhase(v){this.phase=v;this.frameOverride=null;if(v==='walk'){this.surface='bottom';this.anchor='bottom';this.hidden='none';this.resetPatrol();}if(v==='full'){this.surface='top';this.anchor='top';}this.hint.textContent=this.surface==='top'?t('点我释放 · 右键设置'):t('点我收纳 · 右键设置');this.render();this.notify();}
    setEnabled(v){this.enabled=!!v;this.button.style.visibility=v?'visible':'hidden';if(v){try{this.host.showPopover();}catch{}this.last=0;this.start();}else{this.cancel();cancelAnimationFrame(this.raf);this.raf=0;}this.notify();}
    pause(ms){return new Promise(r=>setTimeout(r,this.reduced?Math.min(ms,15):ms));}
    tweenTo(ms,to,{frame,stage,easing='out'}={}){
      if(frame)this.frameOverride=frame;if(stage)this.phase=stage;this.notify();
      if(this.reduced){for(const [k,v]of Object.entries(to))if(['sx','sy','angle'].includes(k))this.pose[k]=v;else this[k]=v;this.render();return Promise.resolve(true);}
      return new Promise(resolve=>{this.stopTween();const from={};for(const k of Object.keys(to))from[k]=['sx','sy','angle'].includes(k)?this.pose[k]:this[k];this.tween={ms,to,from,elapsed:0,ease:easing,resolve};this.start();});
    }
    stopTween(){if(this.tween){const t=this.tween;this.tween=null;t.resolve(false);}}
    async steps(entries,token=this.run){for(const e of entries){if(token!==this.run||this.destroyed)return false;const ok=await this.tweenTo(e.ms,e.to||{},e);if(!ok||token!==this.run)return false;}return true;}
    async setHalf(v){
      const hide=!!v;if(hide===this.half&&!this.busy)return;if(this.busy)return;this.controls?.close();this.run++;const token=this.run;this.busy=true;this.catchUntil=0;this.caughtMs=0;this.revealWaitMs=0;this.vx=0;this.tailStretch=0;this.tailClicks=0;
      if(hide){
        if(this.reduced)this.hidden=this.surface;
        else if(this.surface==='bottom'){
          const h=innerHeight;if(!await this.steps([
            {ms:150,frame:'v2/crouch',stage:'hide-crouch',to:{anchorY:h,sx:1.16,sy:.8}},
            {ms:240,frame:'v2/jump',stage:'hide-jump',to:{anchorY:h-108,sx:.87,sy:1.18}},
            {ms:90,frame:'v2/jump',to:{anchorY:h-114,sx:1,sy:1}},
            {ms:210,frame:'v2/drop',stage:'hide-drop',to:{anchorY:h,sx:.87,sy:1.18},easing:'in'},
            {ms:100,frame:'v2/pancake',stage:'hide-pancake',to:{sx:1.2,sy:.78}},
            {ms:170,frame:'v2/pancake',stage:'hide-sink',to:{anchorY:h+65,sx:.75,sy:1.25},easing:'in'}
          ],token))return;this.hidden='bottom';
        }else{
          if(!await this.steps([{ms:150,frame:'v2/ceiling',stage:'hide-ceiling',to:{anchorY:0,sx:1.18,sy:.72}},{ms:180,frame:'v2/ball-rebound',stage:'hide-rebound',to:{anchorY:18,sx:.88,sy:1.08}},{ms:180,frame:'full-0',stage:'hide-rise',to:{anchorY:0,sx:1,sy:1},easing:'in'},{ms:320,frame:'full-0',to:{anchorY:-160,sx:.82,sy:1.12},easing:'in'}],token))return;this.hidden='top';
        }
        this.phase='hidden';this.pose={sx:1,sy:1,angle:0};this.anchorY=this.surface==='top'?0:innerHeight;
      }else{
        this.hidden='none';this.anchor=this.surface;this.pose={sx:1,sy:1,angle:0};
        if(this.surface==='bottom'){this.anchorY=innerHeight+110;if(!await this.steps([{ms:300,frame:'v2/jump',stage:'reveal',to:{anchorY:innerHeight-32}},{ms:180,frame:'v2/crouch',to:{anchorY:innerHeight,sx:1.1,sy:.9},easing:'in'},{ms:180,frame:'v2/walk-right-0',to:{sx:1,sy:1}}],token))return;this.phase='walk';}
        else{this.anchorY=-160;if(!await this.steps([{ms:320,frame:'full-0',stage:'reveal',to:{anchorY:0}},{ms:130,frame:'v2/ceiling',to:{sx:1.1,sy:.82}},{ms:190,frame:'full-0',to:{sx:1,sy:1}}],token))return;this.phase='full';}
        this.frameOverride=null;this.resetPatrol();this.revealWaitMs=3000;
      }
      if(token!==this.run)return;this.busy=false;this.frameOverride=null;this.render();this.notify();this.commitPose();this.start();
    }
    async begin(phase){
      this.controls?.close();this.cancel();const token=this.run;this.busy=true;const hidden=this.half;this.hidden='none';this.surface=phase==='spit'?'top':'bottom';this.anchor=this.surface;this.phase=phase;this.frameOverride=phase==='spit'?'spit-0':'inhale-0';this.pose={sx:1,sy:1,angle:0};
      this.anchorY=this.surface==='top'?(hidden?-145:0):(hidden?innerHeight+110:innerHeight);
      if(hidden&&!await this.steps([{ms:330,to:{anchorY:this.surface==='top'?0:innerHeight}}],token))return;
      await this.steps([{ms:180,frame:phase==='spit'?'spit-0':'inhale-1',to:{sx:1.08,sy:.94}},{ms:140,to:{sx:1,sy:1}}],token);this.notify();
    }
    async finish(full){
      const token=this.run;this.busy=true;this.hidden='none';
      if(full){
        this.surface='top';this.anchor='top';this.anchorY=Math.max(0,innerHeight-130);this.pose={sx:1,sy:1,angle:0};
        if(!await this.steps([{ms:820,frame:'full-0',stage:'rise',to:{anchorY:0,sx:.94,sy:1.06},easing:'inout'},{ms:120,frame:'v2/ceiling',stage:'ceiling',to:{anchorY:0,sx:1.16,sy:.72}},{ms:180,frame:'v2/ball-rebound',stage:'ceiling-rebound',to:{anchorY:24,sx:.88,sy:1.13}},{ms:180,frame:'full-0',stage:'ceiling-return',to:{anchorY:0,sx:1.08,sy:.92},easing:'in'},{ms:210,frame:'full-0',to:{sx:1,sy:1}}],token))return;this.phase='full';
      }else{
        const oldTop=this.surface==='top'?this.anchorY:Math.max(0,this.anchorY-110);this.surface='bottom';this.anchor='bottom';this.anchorY=oldTop+80;this.pose={sx:.9,sy:1.14,angle:0};
        if(!await this.steps([{ms:650,frame:'v2/drop',stage:'fall',to:{anchorY:innerHeight,sx:.86,sy:1.18},easing:'in'},{ms:140,frame:'v2/pancake',stage:'pancake',to:{sx:1.22,sy:.77}},{ms:200,frame:'v2/rebound',stage:'rebound',to:{anchorY:innerHeight-42,sx:.86,sy:1.14}},{ms:170,frame:'v2/crouch',stage:'land',to:{anchorY:innerHeight,sx:1.08,sy:.92},easing:'in'},{ms:160,frame:'v2/gesture',stage:'gesture',to:{sx:1,sy:1}},{ms:650,frame:'v2/gesture',to:{sx:1.025,sy:1.025}},{ms:150,frame:'v2/gesture',to:{sx:1,sy:1}}],token))return;this.phase='walk';
      }
      this.busy=false;this.frameOverride=null;this.pose={sx:1,sy:1,angle:0};this.resetPatrol();this.restPosition();this.notify();this.commitPose();
    }
    mouth(){return {x:this.x,y:(this.painted?.top||0)+(this.surface==='top'?36:43)};}
    toast(message){this.toastEl.textContent=message;this.toastEl.classList.add('visible');clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>this.toastEl.classList.remove('visible'),2700);}
    async fly(visual,from,to,inward){
      const el=document.createElement('div');el.className='fly';el.style.width=from.width+'px';el.style.height=from.height+'px';el.append(visual);this.root.append(el);
      const a=inward?{x:from.left,y:from.top,s:1}:{x:to.x-from.width/2,y:to.y-from.height/2,s:.04},b=inward?{x:to.x-from.width/2,y:to.y-from.height/2,s:.04}:{x:from.left,y:from.top,s:1},tr=(x,y,s,r)=>`translate3d(${x}px,${y}px,0) scale(${s}) rotate(${r}deg)`;
      try{await el.animate([{transform:tr(a.x,a.y,a.s,inward?0:-25),opacity:inward?1:0},{transform:tr((a.x+b.x)/2,Math.min(a.y,b.y)-70,.65,14),opacity:1,offset:.55},{transform:tr(b.x,b.y,b.s,inward?40:0),opacity:inward?0:1}],{duration:this.reduced?50:340,easing:'cubic-bezier(.35,0,.22,1)',fill:'forwards'}).finished;}catch{}el.remove();
    }
    cancel(){this.run++;this.stopTween();if(this.drag){try{this.button.releasePointerCapture(this.drag.id);}catch{}this.drag=null;}this.tailStretch=0;this.tailClicks=0;this.caughtMs=0;this.revealWaitMs=0;this.catchUntil=0;this.root.querySelectorAll('.fly').forEach(el=>{el.getAnimations().forEach(a=>a.cancel());el.remove();});this.busy=false;this.frameOverride=null;this.pose={sx:1,sy:1,angle:0};}
    destroy(){this.destroyed=true;this.cancel();this.controls?.destroy();cancelAnimationFrame(this.raf);clearTimeout(this.toastTimer);this.abort.abort();this.host.remove();}
  }
  globalThis.CatKeeperEngine=CatKeeperEngine;
})();



(() => {
  'use strict';
  const t = (text, values) => globalThis.CatKeeperI18n?.t(text, values) ?? text;
  if (globalThis.CatKeeperDiscovery?.version === '0.3.2') return;
  const DIRECT = 'button,[role="button"],a[href],[onclick],[tabindex]:not([tabindex="-1"])';
  const MEDIA = 'img,svg,canvas';
  const REJECT = 'input,textarea,select,option,iframe,object,embed,video,audio';
  const HINT = /float|launcher|widget|assist|(^|[-_ ])fab($|[-_ ])|dock|bubble|chat[-_ ]?button|icon[-_ ]?button/i;
  const PANEL = /(^|[-_ ])(dialog|modal|panel|sidebar|drawer|toolbar|editor|navigation|navbar|menu|rail|desk)([-_ ]|$)/i;
  const SITE_CHROME = /(^|[-_ ])(header|masthead|navbar|navigation|menubar|toolbar|breadcrumb|tabbar|footer)([-_ ]|$)/i;
  const shadow = node => {
    try { return globalThis.chrome?.dom?.openOrClosedShadowRoot(node) || node.shadowRoot; }
    catch { return node.shadowRoot; }
  };
  const parent = node => node.parentElement || (node.getRootNode() instanceof ShadowRoot ? node.getRootNode().host : null);
  const small = r => r.width >= 16 && r.height >= 16 && r.width <= 180 && r.height <= 180 && r.width / r.height < 4 && r.height / r.width < 4;
  const stripOwned = style => String(style || '').replace(/(?:^|;)\s*(?:opacity|pointer-events)\s*:[^;]*/gi, '').replace(/[;\s]+/g, '');

  class CatKeeperDiscovery {
    static version = '0.3.2';
    constructor({ exclude, onChange = () => {} } = {}) {
      this.exclude = exclude; this.onChange = onChange;
      this.roots = new Set(); this.observers = new Map();
      this.candidates = new Set(); this.potentialHosts = new Set();
      this.seen = new WeakSet(); this.ids = new WeakMap(); this.known = new WeakSet();
      this.panelCache = new WeakMap();
      this.pending = []; this.results = []; this.counter = 0; this.dirty = true;
      this.lastScan = -Infinity; this.lastRootPoll = 0; this.hostCursor = 0;
      this.stats = { examined: 0, candidateChecks: 0, scans: 0, cachedCalls: 0, truncated: false };
      this.limitations = [t('跨域 iframe 内的按钮不能从父页面逐项访问。'), t('同一个 canvas 内绘制的多个图标不能自动拆分。'), t('仅收纳能确认来源的扩展悬浮入口；来源不明的按钮会保留。')];
      this.abort = new AbortController();
      const signal = this.abort.signal;
      window.addEventListener('resize', () => this.invalidate(), { passive: true, signal });
      window.addEventListener('scroll', () => this.invalidate(), { passive: true, signal });
      this.addRoot(document);
      this.pending.push(document.documentElement);
    }
    excluded(node) {
      if (!node || node.nodeType !== 1) return false;
      let current = node;
      for (let i = 0; current && i < 40; i++, current = parent(current)) {
        if (current === this.exclude || current.localName === 'miorning-cat-keeper') return true;
      }
      return false;
    }
    addRoot(root) {
      if (!root || this.roots.has(root)) return;
      this.roots.add(root);
      const observer = new MutationObserver(changes => {
        let relevant = false;
        for (const change of changes) {
          if (this.excluded(change.target)) continue;
          if (change.type === 'childList') {
            for (const node of change.addedNodes) if (node.nodeType === 1) this.pending.push(node);
            relevant = true;
          } else {
            if (change.attributeName === 'style' && stripOwned(change.oldValue) === stripOwned(change.target.getAttribute('style'))) continue;
            this.inspectNode(change.target);
            relevant = true;
          }
        }
        if (relevant) this.invalidate();
      });
      observer.observe(root, { subtree: true, childList: true, attributes: true, attributeOldValue: true, attributeFilter: ['style','class','hidden','aria-hidden','aria-label','title','src','srcset','href','xlink:href','role','tabindex'] });
      this.observers.set(root, observer);
      if (root instanceof ShadowRoot) this.pending.push(...root.children);
    }
    invalidate() {
      this.dirty = true;
      this.panelCache = new WeakMap();
      if (this.noticeTimer || this.destroyed) return;
      this.noticeTimer = setTimeout(() => { this.noticeTimer = 0; if (!this.destroyed) this.onChange(); }, 280);
    }
    inspectNode(node) {
      if (!(node instanceof Element) || this.excluded(node)) return;
      if (node.matches(DIRECT + ',' + MEDIA) || HINT.test(node.id + ' ' + node.getAttribute('class')) || node.style.position === 'fixed' || node.style.backgroundImage) this.candidates.add(node);
      if (node.localName.includes('-') || node.localName === 'div' || node.localName === 'span') this.potentialHosts.add(node);
      const root = shadow(node);
      if (root) this.addRoot(root);
    }
    pump() {
      // Portals appended at the end of body are visited first. Work on large pages
      // is spread over callbacks instead of making every discover() scan all DOM.
      const start = performance.now(); let budget = 3600;
      while (this.pending.length && budget-- > 0) {
        const node = this.pending.pop();
        if (!(node instanceof Element) || this.excluded(node)) continue;
        // An existing portal may be rebuilt while detached, then inserted again.
        // Revisit its descendants: newly added children are not in the old cache.
        if (!this.seen.has(node)) { this.seen.add(node); this.stats.examined++; }
        this.inspectNode(node);
        this.pending.push(...node.children);
        if (budget % 32 === 0 && performance.now() - start > 12) break;
      }
      this.stats.truncated = this.pending.length > 0;
      if (this.pending.length && !this.pumpTimer) this.pumpTimer = setTimeout(() => { this.pumpTimer = 0; this.pump(); this.invalidate(); }, 80);
    }
    pollRoots(now) {
      if (now - this.lastRootPoll < 2500) return;
      this.lastRootPoll = now;
      const hosts = [...this.potentialHosts];
      for (let i = 0; i < Math.min(hosts.length, 600); i++) {
        const node = hosts[(this.hostCursor + i) % hosts.length];
        if (!node.isConnected) { this.potentialHosts.delete(node); continue; }
        const root = shadow(node); if (root && !this.roots.has(root)) { this.addRoot(root); this.dirty = true; }
      }
      this.hostCursor = hosts.length ? (this.hostCursor + 600) % hosts.length : 0;
      for (const root of [...this.roots]) if (root instanceof ShadowRoot && !root.host.isConnected) { this.observers.get(root)?.disconnect(); this.observers.delete(root); this.roots.delete(root); }
    }
    normalize(seed) {
      if (!seed.isConnected || this.excluded(seed) || seed.matches(REJECT)) return null;
      if (seed.matches('button,[role="button"],a[href]')) return seed;
      let node = seed, fallback = null;
      for (let i = 0; node && i < 5; i++, node = parent(node)) {
        if (node.matches(REJECT)) return null;
        const rect = node.getBoundingClientRect();
        if (!small(rect)) break;
        if (node.matches(DIRECT)) return node;
        const style = getComputedStyle(node);
        if (style.cursor === 'pointer' || node.onclick || style.position === 'fixed') fallback = node;
      }
      return fallback;
    }
    extensionEvidence(node) {
      if (!(node instanceof Element) || this.excluded(node)) return false;
      const ownId = globalThis.chrome?.runtime?.id;
      const resource = value => {
        if (typeof value !== 'string') return false;
        const address = value.trim().match(/^((?:chrome|moz|ms-browser)-extension):\/\/([^/?#]+)(?:[/?#]|$)/i);
        if (!address) return false;
        const protocol = address[1].toLowerCase(), host = address[2].toLowerCase();
        // Chromium's URL parser silently strips user-info for extension URLs.
        // Validate the original authority before parsing or normalizing it.
        if (host === ownId || !(protocol === 'moz-extension' ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i : /^[a-p]{32}$/i).test(host)) return false;
        try {
          const url = new URL(value.trim());
          if (url.username || url.password || url.port || url.hostname === ownId) return false;
          if (url.protocol === 'chrome-extension:' || url.protocol === 'ms-browser-extension:') return /^[a-p]{32}$/i.test(url.hostname);
          return url.protocol === 'moz-extension:' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(url.hostname);
        } catch { return false; }
      };
      const direct = element => {
        if (element.matches('img')) {
          if (resource(element.getAttribute('src'))) return true;
          // currentSrc may normalize a malformed URL (including stripping user
          // info), so accept it only when an exact valid srcset entry supplied it.
          const chosen = element.currentSrc;
          if (resource(chosen) && String(element.getAttribute('srcset') || '').split(',').some(entry => {
            const source = entry.trim().split(/\s+/)[0];
            return source === chosen && resource(source);
          })) return true;
        }
        if (element.matches('image,use') && (resource(element.getAttribute('href')) || resource(element.getAttribute('xlink:href')))) return true;
        const background = getComputedStyle(element).backgroundImage;
        for (const match of background.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi)) {
          if (resource(match[1] ?? match[2] ?? match[3])) return true;
        }
        return false;
      };
      if (direct(node)) return true;
      // Only inspect artwork owned by this launcher. Resource strings in an
      // ancestor, sibling button, data attribute or destination link prove
      // nothing about the current element's origin.
      if (!node.matches(DIRECT) && node.querySelector(DIRECT)) return false;
      const pending = [...node.children].map(child => [child, 1]);
      let examined = 0;
      while (pending.length && examined++ < 32) {
        const [child, depth] = pending.pop();
        if (child.matches(DIRECT + ',' + REJECT)) continue;
        if (direct(child)) return true;
        if (depth < 3) for (const descendant of child.children) pending.push([descendant, depth + 1]);
      }
      return false;
    }
    qualify(node, { trustedExtension = false } = {}) {
      if (!(node instanceof Element) || !node.isConnected || this.excluded(node) || node.matches(REJECT)) return null;
      const rect = node.getBoundingClientRect();
      if (!small(rect) || rect.right <= 0 || rect.bottom <= 0 || rect.left >= innerWidth || rect.top >= innerHeight) return null;
      const selfStyle = getComputedStyle(node);
      if (selfStyle.display === 'none' || selfStyle.visibility === 'hidden' || (Number(selfStyle.opacity) === 0 && !this.known.has(node))) return null;
      // Geometry alone cannot distinguish a site's avatar/message/help button
      // from an injected launcher. Unknown provenance always stays on the page.
      if (!trustedExtension && !this.extensionEvidence(node)) return null;
      let fixed = null, sticky = null, layer = null;
      for (let current = node, depth = 0; current && depth < 32; current = parent(current), depth++) {
        if (this.excluded(current) || current.matches(REJECT + ',dialog,[role="dialog"],[role="alertdialog"],[contenteditable="true"],nav,header,footer,[role="navigation"],[role="menubar"],[role="toolbar"],[role="menu"],[role="listbox"]')) return null;
        const cs = current === node ? selfStyle : getComputedStyle(current);
        if (cs.display === 'none' || cs.visibility === 'hidden' || current.hidden) return null;
        const r = current === node ? rect : current.getBoundingClientRect();
        if (current !== node && (r.width > 220 || r.height > 220) && SITE_CHROME.test(current.id + ' ' + current.getAttribute('class'))) return null;
        if (current !== node && (r.width > 220 || r.height > 220) && PANEL.test(current.id + ' ' + current.getAttribute('class'))) return null;
        if (current !== node && !current.matches('html,body') && r.width > 120 && r.height > 75) {
          if (!this.panelCache.has(current)) {
            const hint = PANEL.test(current.id + ' ' + current.getAttribute('class'));
            const opaque = cs.backgroundColor !== 'transparent' && !/rgba\([^)]*,\s*0(?:\.0+)?\s*\)/.test(cs.backgroundColor);
            const surface = r.width > 220 && r.height > 120 && (opaque || cs.boxShadow !== 'none') && (['fixed','absolute'].includes(cs.position) || current.getRootNode() instanceof ShadowRoot);
            const controls = (hint || surface) ? current.querySelectorAll('button,[role="menuitem"],a[href],textarea,input,select') : [];
            this.panelCache.set(current, (hint || surface) && controls.length > 1);
          }
          if (this.panelCache.get(current)) return null;
        }
        if (cs.position === 'fixed' && !fixed) fixed = current;
        if (cs.position === 'sticky' && !sticky) sticky = current;
        if (!layer && (cs.position === 'fixed' || cs.position === 'absolute') && r.width <= 240 && r.height <= 240) layer = { node: current, z: Number(cs.zIndex) || 0 };
      }
      if (!fixed && !sticky && !(layer && (layer.z >= 100 || layer.node.getRootNode() instanceof ShadowRoot))) return null;
      const margin = Math.min(130, Math.max(64, Math.min(innerWidth, innerHeight) * .12));
      const edge = rect.left <= margin || innerWidth - rect.right <= margin || rect.top <= margin || innerHeight - rect.bottom <= margin;
      if (sticky && !fixed && !edge) return null;
      return { node, score: 50 + (node.matches('button,[role="button"],a[href]') ? 25 : 5) + (edge ? 15 : 0) + (fixed ? 10 : 0), source: trustedExtension ? 'extension-adapter' : 'extension-resource' };
    }
    name(node, serial) {
      for (let current = node, i = 0; current && i < 4; i++, current = parent(current)) {
        const label = current.getAttribute('aria-label') || current.getAttribute('title') || current.getAttribute('alt');
        if (label?.trim()) return label.trim().replace(/\s+/g, ' ').slice(0, 32);
        const image = current.querySelector('img[alt]');
        if (image?.getAttribute('alt')?.trim()) return image.getAttribute('alt').trim().slice(0,32);
        const r = current.getBoundingClientRect(); if (r.width > 240 || r.height > 240) break;
      }
      return t('悬浮图标 {number}',{number:serial});
    }
    discover() {
      if (this.destroyed) return [];
      const now = performance.now(); this.pollRoots(now); this.pump();
      if (!this.dirty || (now - this.lastScan < 180 && this.results.length)) { this.stats.cachedCalls++; return this.results.filter(item => item.node.isConnected && this.extensionEvidence(item.node)); }
      this.lastScan = now; this.dirty = false; this.stats.scans++; this.panelCache = new WeakMap();
      const seen = new Set(), qualified = []; let count = 0;
      for (const seed of this.candidates) {
        if (!seed.isConnected) { this.candidates.delete(seed); continue; }
        if (++count > 2200) { this.stats.truncated = true; break; }
        const node = this.normalize(seed); if (!node || seen.has(node)) continue;
        seen.add(node); this.stats.candidateChecks++;
        const found = this.qualify(node); if (found) qualified.push(found);
      }
      qualified.sort((a,b) => b.score-a.score);
      const selected = [];
      for (const item of qualified) {
        // Never collect both a clickable wrapper and its image, or hide a shared
        // parent in addition to an already accepted button.
        if (selected.some(other => other.node === item.node || other.node.contains(item.node) || item.node.contains(other.node))) continue;
        selected.push(item); if (selected.length >= 80) break;
      }
      this.results = selected.map(({node,source}) => {
        if (!this.ids.has(node)) this.ids.set(node, ++this.counter);
        const serial = this.ids.get(node); this.known.add(node);
        return { key: 'auto:' + serial, name: this.name(node, serial), node, auto: true, custom: false, source };
      });
      return this.results;
    }
    destroy() {
      this.destroyed = true; this.abort.abort(); clearTimeout(this.noticeTimer); clearTimeout(this.pumpTimer);
      this.observers.forEach(observer => observer.disconnect()); this.observers.clear(); this.roots.clear(); this.candidates.clear(); this.potentialHosts.clear(); this.pending.length = 0; this.results = [];
    }
  }
  globalThis.CatKeeperDiscovery = CatKeeperDiscovery;
})();

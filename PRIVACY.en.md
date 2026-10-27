# Privacy

v0.3.1 · [简体中文](PRIVACY.md) · [README](README.en.md)

The extension has no project-operated server, analytics, advertising or upload endpoint. Images, UI and animation code are bundled locally. Character generation does not run online during use.

- **Stored data:** enabled preferences, manual rules, global collection state, hidden edge, relative tail position and per-icon visibility choices in `chrome.storage.local`. Icon preferences use known adapter identities or website and element fingerprints. Rules contain a website origin, element selector and short display name; local HTML is distinguished by file path. They do not include page text, input content, passwords or login information.
- **Temporary state:** discovered launchers and original element styles remain in runtime memory. Collection state, hidden edge and relative tail position persist across pages in local browser storage. Separate browser profiles remain independent.
- **Page access:** HTTP, HTTPS and file-page access display the cat, discover small floating launchers, and temporarily adjust their opacity, pointer interaction and `inert` state. Collection does not remove original nodes, disable their extensions or intercept all their shortcuts.
- **Other permissions:** `activeTab` / `scripting` reach the current page from the toolbar or shortcuts and inject local code into existing ordinary pages after installation / updates. `storage` saves the settings above. There are no `management`, microphone, camera or notification permissions.
- **External pages:** when you choose a project, browser-shortcut or help link, or click the tail five times to open the Bilibili Easter egg, the destination service or browser handles that visit. The extension does not upload webpage data to those services.

Remove manual rules individually in the expanded management section of **Keyboard shortcuts**. **Restore all icons now** releases the shared collection state within this browser profile. Disabling the cat also restores its hidden nodes. The browser removes extension-local data on uninstall; if launchers in an already-open page do not recover immediately, refresh it.

Other extensions and websites remain responsible for their own data processing. Cat Keeper does not change their privacy policies.

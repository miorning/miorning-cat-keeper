# Miorning Cat Keeper · 喵咛·收纳猫

Let the cat eat the clutter. A mischievous black cat that strolls, dodges your cursor and floats when full.

**v0.3.2 · Desktop Chrome / Edge extension · Manifest V3 · GPL-3.0-only**

[Download v0.3.2](https://github.com/miorning/miorning-cat-keeper/releases/tag/v0.3.2) · [简体中文](README.md) · [Release notes](RELEASE_NOTES.md) · [Privacy](PRIVACY.en.md) · [MIORNING on Bilibili](https://space.bilibili.com/353186187)

## One cat for extension launchers

- **Extension launchers only:** collects small floating launchers recognized by a supported adapter or identifiable extension provenance, then returns them one by one. Website-owned avatars, messaging buttons, support widgets and other controls are not collection targets. Launchers with uncertain provenance are skipped.
- **Other extensions keep running:** only their launchers are temporarily hidden. The original extensions still handle their shortcuts and feature panels.
- **An elderly stroll, until you give chase:** the cat takes very slow steps with a cane. Cursor proximity first causes alert walking, then a random scooter or rolling escape. It resumes strolling when safe. Desktop warning / escape distances are enlarged to approximately 480 / 300 pixels, with smaller ranges in narrow windows.
- **Contact with both edges:** the full cat becomes round and floats along the ceiling, squashing and rebounding on contact. Releasing icons brings a pancake landing, rebound and middle-finger gag. The cat and hidden tails touch the webpage viewport edges.
- **Drag the tail, pop out the cat:** move a tail along its edge or pull inward to pop the cat out with elastic motion. It rests for three seconds after release. A single tail click does nothing; five quick short clicks open MIORNING's Bilibili profile as an Easter egg.
- **Shared state and per-icon choices:** collection, hidden state and relative tail position persist across pages in the same browser profile. Check Show beside a launcher in settings to restore it and keep it visible during future collections.
- **Chinese and English:** follows the browser language. Runtime assets are local; no account or online generation is needed.

## Install and update

1. Download **[MiorningCatKeeper-v0.3.2-Chrome-Edge.zip](https://github.com/miorning/miorning-cat-keeper/releases/download/v0.3.2/MiorningCatKeeper-v0.3.2-Chrome-Edge.zip)**. The same release provides `SHA256SUMS.txt` for verification.
2. Extract completely to a directory you intend to keep. Do not load from inside the ZIP.
3. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge and enable **Developer mode**.
4. Choose **Load unpacked** and select the package's **`extension` folder**, directly containing `manifest.json`.
5. Refresh existing ordinary webpages. Pin the toolbar cat to open its menu reliably. For local HTML, enable **Allow access to file URLs** in the extension's details.

The package contains only the plugin runtime and bilingual guides, privacy and license documents. Images use lossless compression. No build, dependency installation or persistent server is required. Distribution is through GitHub; **this is not a browser-store listing**. Keep the loaded directory in place.

**Do not uninstall before updating.** Replace files in the original installation directory with the new `extension` contents, reload the existing extension, then refresh webpages. Settings belong to the current browser profile and extension ID; changing directories or profiles may create a new identity.

## Two shortcuts, three menu entries

| Default shortcut | Action |
| --- | --- |
| `Alt + Shift + K` | Collect / release and share that state across pages in the same browser profile |
| `Alt + Shift + H` | Hide / show the cat |

Right-click the cat or tail for exactly three entries: **Keyboard shortcuts, Collect / Release icons, Hide / Show cat**. The latter two display the browser's assigned keys. If a command is unassigned or conflicts, open the browser's native shortcut page from settings.

A quick cursor entry gives you three seconds to catch and click the cat. Left-click the active cat to collect / release. The bottom cat hides after being caught for three seconds without a click; the top cat still hides after a lap. Opening its menu pauses activity. Tab to focus, Enter / Space to activate, and Shift + F10 to open the menu.

Manual collection: right-click → **Keyboard shortcuts** → expand **Collection and other settings** → **Pick an extension launcher**, then click a small extension launcher. Esc cancels. Manual picks must pass the same extension-provenance checks; they cannot bypass the restrictions to collect website-owned controls. Rules are saved per website, or per path for local files. Existing rules are rechecked before use, and targets that no longer qualify are skipped. Use **Restore all icons now** to restore collected launchers, then remove an unwanted rule.

Check Show beside an icon in settings to restore it and keep it out of future collections. Uncheck to include it again. Disabling the cat restores its hidden launchers. Reduced-motion preferences disable continuous patrolling and dodging. Background tabs pause frame animation.

## Collection scope

- This organizes **small floating launchers injected into webpages by browser extensions**. Toolbar icons beside the address bar must be unpinned manually; another extension cannot move them into the cat.
- Provenance comes from a known adapter or identifiable extension resources on the launcher itself. Support is not limited to five extensions, but coverage of every extension is not guaranteed. Unknown launchers using only inline graphics without identifiable provenance are skipped.
- MIORNING Prompt Guard, PagePin, Miorning Text Float, Miorning Select and Bilibili Friend Grouping Enhanced have dedicated adapters to avoid hiding shared editors or panels. Their source code is neither changed nor bundled here.
- Size, position and floating style alone no longer establish provenance. Website-owned avatars, messaging buttons, support widgets and navigation, as well as large panels and ordinary content buttons, are outside collection scope.
- Controls inside cross-origin iframes, separate icons drawn in one canvas, and elements that repeatedly override visibility may not be detected.
- Browser settings, extension stores, new tabs and some built-in PDF / protected pages do not allow injection.
- Each scan checks up to 2,200 candidates and automatically selects up to 80 launchers. Complex pages may miss recognizable extension launchers; manual picks still require identifiable provenance. Released icons follow their original owner's current layout.

## Privacy, verification and source

No server, upload endpoint or telemetry is used. Enabled preferences, manual selectors, collection state, tail position and per-icon visibility preferences stay on the device; page text, input content and login data are not stored. There is no `management` permission and no disabling or uninstalling other extensions. See [Privacy](PRIVACY.en.md) for permissions and their purpose.

Compatibility checks use isolated browsers and locally supplied pages. They do not establish compatibility with every website or extension, and do not replace physical operating-system shortcut verification. Skipping uncertain launchers is a deliberate conservative choice to avoid collecting website-owned controls.

[`extension/`](extension/) contains the complete, directly loadable runtime source: JavaScript, HTML, CSS and local PNG assets, with no third-party runtime library. First-party code, documentation and original bundled assets use **GNU GPL version 3 only (GPL-3.0-only)**, to the extent copyright applies. See [LICENSE](LICENSE), [NOTICE.md](NOTICE.md) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). When distributing covered versions, provide corresponding source to recipients and preserve the required notices.

Created by MIORNING; not affiliated with Chrome, Edge or the authors of other extensions.

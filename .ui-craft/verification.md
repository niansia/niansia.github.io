# Terminal desktop verification

Verified 2026-09-26 against a real Quarto render in the in-app Chromium browser.

| Before | After | Why |
| --- | --- | --- |
| Conventional page with an isolated console | Full viewport file explorer, content pane, companion and command line | User requested the entire site behave as a terminal |
| Keys required focus inside the old console; Escape had no route behavior | Document-level arrows, Enter, Escape and slash; native control and dialog handling | Immediate keyboard use was the reported failure |
| Quarto moved nested aside elements into its margin grid | Explicit shell columns using neutral containers | First visual review exposed overlapping panes |
| Animal and chibi mascot styles | Four normal-proportion anime catgirl poses | Direct user correction |
| Hidden labels at tablet widths and an icon-only footer action | Explicit accessible control names | Preserve usable navigation at every breakpoint |

## Observed results

- Desktop 1440 × 900, tablet 820 × 900 and mobile 390 × 844 layouts checked. Mobile body width equals viewport width; content scrolls inside the terminal.
- From initial page focus, Down / Down / Enter opens projects. Down / Enter opens KCrashLab. Escape returns to the directory, then home.
- `help`, unknown commands, command history and Escape clearing exercised.
- All 9 directory entries present. All six rendered language/home/work routes also retain 9 projects in the no-JavaScript fallback.
- English, Traditional Chinese and Simplified Chinese switches preserve the view. Reload preserves URL language and the chosen theme.
- Light and dark themes visually checked. Body and action text contrasts: 5.21:1 minimum among checked light combinations; 7.35:1 minimum among checked dark combinations.
- Feed shows its response; rest selects sprite 3; pat/play select the happy sprite; pointer follower appeared beside new pointer locations.
- Chat accepts typed feelings, responds with prepared dialogue, and navigates to the project directory. Native dialog Escape closes and restores focus.
- Pause disables animation and hides the follower. System reduced-motion is also honored in both CSS and JavaScript.
- No browser warning/error logs reported during tested flows.
- JavaScript syntax and translation-key parity checked: 92 keys in each locale, 9 projects in each dataset.
- Quarto render exits successfully. This local runtime emits missing built-in Abstract translation warnings for zh-TW/zh-CN; the terminal uses its own complete translations and displays no abstract.

## Scope

The companion has local prepared conversations and contextual project descriptions. It does not send chat input to an external AI service. Walking uses sprite pose changes and pointer interpolation, not Live2D. No GitHub profile files were modified in this redesign.


## Follow-up: cursor size, hearts and commands

- Follower is 12 × 32 CSS pixels, has no name badge and ignores pointer events. Confirmed from rendered bounds.
- Pointer movement emits small hearts (65ms minimum interval, 16 maximum). Observed intermediate opacity 0.54, then zero remaining particles after expiry. Pause, hidden-tab and trail-off paths remove particles.
- Upper decorative command text is now a real labeled form. Upper and lower input share the same dispatcher and session history.
- All 37 catalogue commands were executed through the real upper input and returned results; lower input navigation was separately exercised. All three language variants have command descriptions.
- Checked Tab completion (`pro` → `projects`), history recall, quoted strings, Unicode names, clear, and chat with an inline message.
- `echo` containing an HTML image tag renders literal text, with no injected image element.
- Mobile check at 390 × 844: no horizontal body overflow; upper input width 249px.
- Reviewed and corrected mobile nickname visibility and the small terminal identity illustration after the first visual pass.


## Follow-up: desktop pet, local model and styles (2026-09-27)

Checked against a static preview assembled from the last Quarto render plus the current sources (Quarto isn't installed locally), in the in-app Chromium browser; `styles.scss` rules separately compiled with Dart Sass 1.x without errors.

- The companion pane is gone; the workspace is two columns. Yuki stands on the command line, can be dragged (pendulum swing, gravity, squash on landing, dizzy after high drops), and walks, blinks and wags on her own.
- Poses checked at 3x scale: idle with a separate tail layer, bed (lie), sleep with blanket, eat with bowl. Mobile (375 px) tucks her at the edge and opens chat as a bottom sheet.
- Needs persist in localStorage; nudges back off 1.6x per unanswered message; auto-sleep after 3 idle minutes; welcome-back after one or more minutes hidden.
- Model: 61k parameters, 43 intents, 99.0% validation, 99.1% on 109 held-out questions (EN / 繁 / 简). JS feature hashes match Python on probe strings. Chat verified for project lists, topic retrieval (vision to ChromaRecover), style switching (sakura) and language switching (to English).
- Scripted terminal run (help, theme, trail, cursor, yuki, brain, feed, lie, trick, sudo, natural-language questions, neofetch, status, hide) produced no console errors.


## Follow-up: papers, brief, palette, style previews, tour and transitions (2026-09-28)

Checked against a local Quarto render (Quarto 1.10.18) plus `tools/build_static.py --og-missing`, in the in-app Chromium browser at desktop and 375 px mobile sizes.

- `papers.bib` (explorer, `papers`, `pubs`, `論文`): empty-state shelf when no public papers, three anonymous in-preparation cards with live countdowns, writing links. `?papers=preview` shows the draft template card with links, topics, BibTeX copy and `.bib` export.
- Palette: Ctrl+K opens and closes, suggested/recent groups, fuzzy match with highlighted characters (`lumi` finds the project, notes, log, demo and command), `>` and `?` modes, style items preview live and Esc restores the saved style. Mobile layout full width.
- Style picker: 13 thumbnails drawn from each style's own tokens; hover preview and revert on leave; festival skin steps aside only when a style is chosen. Mobile shows it as a bottom sheet.
- Tour: research, builder and fun routes step through their targets, move between views, scroll the reading pane so the card has room, and re-frame after late content (LumiGrid table). Arrow keys, Enter and Esc work; mobile docks the card at the bottom. Chat ("帶我逛逛") offers the three routes; first-visit offer appears in Yuki's bubble.
- Brief (`/brief/`, zh-tw, zh-cn) and paper template page (`/paper/example/`, noindex, not in the sitemap) render; zh first-sentence extraction fixed for sentences without a trailing space.
- In-page view transitions could not be observed visually because the preview pane was hidden (browsers skip view transitions in hidden documents); the naming and cleanup logic was checked by script.
- Scripted commands (papers, tree, help tour, ls, find vision, theme, status, palette, tour) returned results with no console errors.

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

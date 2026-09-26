# Terminal desktop tokens

## Themes

| Role | Light | Dark |
| --- | --- | --- |
| Desktop | #edf0f7 | #101117 |
| Window | #fdfdff | #191b24 |
| Rail | #f5f6fb | #151720 |
| Text | #262938 | #e9eaf4 |
| Secondary | #626779 | #a4a9bd |
| Accent | #5854b8 | #b3adff |
| Accent wash | #edecfb | #2c2946 |
| Divider | #dce0ec | #343746 |

## Type and structure

System sans/CJK for prose; SFMono, Consolas and Liberation Mono for commands and window chrome. Body 14px desktop, 13px compact; headings 28-48px. Scale 4/8/12/16/24/32/40. Radii 6/10/14px. 208px file explorer, flexible reading pane, 238px companion. Full viewport with independently scrolling content. Mobile uses a horizontal file selector and companion dialog.

## Motion

200ms content entrance for pointer activation; instant keyboard transitions. Sprite states: idle/walking/happy/sleep. Frame-based pointer follow stops at rest. Click feedback expires after 500ms. System reduced motion and persisted pause preference disable animation. All file routes and controls remain usable with animation disabled.

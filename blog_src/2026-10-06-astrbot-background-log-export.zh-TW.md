---
type: post
title: 替 AstrBot 補上背景任務警告和日誌匯出
date: 2026-10-06
description: 針對 AstrBot 的兩個 issue 送出 PR：背景任務的結果沒送到使用者時補上警告日誌，以及在 WebUI 加上日誌匯出。
tags: [開源貢獻, AstrBot]
---

針對 [AstrBot](https://github.com/AstrBotDevs/AstrBot) 另一位貢獻者回報的 [#10395](https://github.com/AstrBotDevs/AstrBot/issues/10395) 送出 [PR #10398](https://github.com/AstrBotDevs/AstrBot/pull/10398)：背景任務（例如用 `background_task=true` 啟動的子代理）完成後，主代理會被喚醒，要呼叫 `send_message_to_user` 才會把結果交給使用者，如果它這一輪什麼都沒送，使用者就收不到結果，日誌裡也完全沒有紀錄。修正在喚醒結束後檢查結果有沒有真的送到使用者的對話，沒有的話記一條警告，寫明工具名稱和任務 id，不會自動重送，目前等待審查。

維護者在 [#10407](https://github.com/AstrBotDevs/AstrBot/issues/10407) 提出想在 WebUI 加上日誌匯出，方便使用者回報問題時把日誌交給開發者，實作放在 [PR #10418](https://github.com/AstrBotDevs/AstrBot/pull/10418)：控制台和設定頁可以下載一個 zip，裡面有日誌檔案、記憶體中的日誌和追蹤紀錄，以及列出打包內容的 manifest。壓縮檔裡不會出現主機路徑，也只打包一般檔案、略過符號連結，目前等待審查。

---
type: post
title: 替 AstrBot 和 Dify 回報 bug、送 PR
date: 2026-10-04
description: 向 AstrBot 提交了 WebChat 附件互相覆蓋的 issue 和修正 PR（已合併）；向 Dify 提交了兩個 issue，其中 Webhook 回傳 500 的問題附上修正 PR。
tags: [開源貢獻, AstrBot, Dify]
---

向聊天機器人框架 [AstrBot](https://github.com/AstrBotDevs/AstrBot) 回報了 WebChat 同名附件會互相覆蓋的問題（[#10352](https://github.com/AstrBotDevs/AstrBot/issues/10352)）：貼上的截圖檔名都是 `image.png`，附件又用原檔名存，後一張會蓋掉前一張，刪除對話時也會刪掉其他對話還在用的檔案。修正放在 [PR #10356](https://github.com/AstrBotDevs/AstrBot/pull/10356)，存檔時在檔名前加上時間戳，畫面仍顯示原檔名，已在 10 月 4 日合併。

向 LLM 應用平台 [Dify](https://github.com/langgenius/dify) 提交了兩個 issue。[#43465](https://github.com/langgenius/dify/issues/43465) 是 HTTP 請求節點把 `Array[Object]` 變數用 Python 的格式（單引號、`True`、`None`）塞進 request body，資料會被改壞，另一位貢獻者已經在 graphon 提出修正（[langgenius/graphon#328](https://github.com/langgenius/graphon/pull/328)）。

[#43469](https://github.com/langgenius/dify/issues/43469) 是 Webhook 觸發器收到 JSON 陣列時直接回傳 500，像 SendGrid 這類用陣列傳送事件的服務會一直失敗、重試，修正放在 [PR #43470](https://github.com/langgenius/dify/pull/43470)：沒有設定 body 參數時照常觸發工作流，有設定時改回傳 400 並說明原因，目前等待審查。

---
type: post
title: 替 AstrBot 和 Dify 回報 bug、送 PR
date: 2026-10-04
description: 這兩天在 AstrBot 回報並修了 WebChat 附件互相覆蓋的問題，在 Dify 回報兩個 bug，其中一個自己送了 PR。記下流程、踩到的坑，還有幾件沒想到的小事。
tags: [開源貢獻, AstrBot, Dify]
---

## 為什麼做這件事

除了自己的專案，我也想多參與別人的大型專案：讀別人的 codebase、照別人的規矩寫、讓不認識的人審我的程式碼。這兩天挑了兩個自己會用到的專案：聊天機器人框架 [AstrBot](https://github.com/AstrBotDevs/AstrBot)，和 LLM 應用平台 [Dify](https://github.com/langgenius/dify)。

## AstrBot：同名的截圖會互相蓋掉

在 WebChat 裡貼上截圖，瀏覽器給的檔名幾乎都是 `image.png`。AstrBot 存附件時直接用原檔名，所以第二張會蓋掉第一張，前面那則訊息的圖片就跟著變了。更麻煩的是，刪掉一個對話時，另一個對話還在用的同名檔案也會一起被刪。

我先在自己電腦上跑起一個真的 AstrBot，把問題重現出來，再發了 [issue #10352](https://github.com/AstrBotDevs/AstrBot/issues/10352)。接著送了 [PR #10356](https://github.com/AstrBotDevs/AstrBot/pull/10356)：存檔時在檔名前面加上時間戳，畫面上仍然顯示原本的檔名，也補了測試。

送出後，審查機器人 Sourcery 很快留了兩則意見。第一則說副檔名特別長的時候，加上前綴的檔名會超過 255 bytes，我寫測試確認後發現它是對的，於是補了一個 commit 修掉，第二則是時間戳撞名的可能，我回覆說明機率極低、而且專案其他地方也是同樣的命名方式，所以不改。

還有個小插曲：一個當天才註冊的帳號，一分鐘內在我的 PR 按了三次 Approve。後來才知道這種帳號會到處亂按，GitHub 也不會把它算進去，真正有效的只有維護者的審查。

## Dify：英文、表單，還有速度

Dify 的規矩明顯更嚴：issue 一律用英文，要照固定表單填，前面還有六個自我檢查要勾。

讓我最意外的是競爭。Dify 一天有十幾個新 issue，同一種 bug 常被好幾個人分別回報，像「分頁遇到相同時間戳會漏資料」就有四篇。所以每次發之前，我都會用好幾組關鍵字，把 open 和 closed 的 issue、PR 都搜一遍。

第一個是 [#43465](https://github.com/langgenius/dify/issues/43465)：HTTP 請求節點把 `Array[Object]` 變數塞進 request body 時，用的是 Python 的格式（單引號、`True`、`None`），不是 JSON。結果 JSON body 被「修復」成不同的資料，`null` 變成字串 `"None"`，第二筆資料甚至被吞進第一筆的欄位裡。發出去才幾個小時，就有另一位貢獻者留言接手，在 Dify 拆出去的工作流引擎 graphon 開了修正的 PR。被確認是真的 bug 很開心，但也有點可惜，因為我原本也想自己修。

這件事讓我學到：想自己修，就要在 issue 裡先講，而且當天就把 PR 送出去。

所以第二個 [#43469](https://github.com/langgenius/dify/issues/43469)，我在最後加了一句「I'll open a PR with a fix.」。問題是 Webhook 觸發器收到 JSON 陣列時會直接回 500，而 SendGrid 這類服務送事件時剛好就是陣列。同一天我送了 [PR #43470](https://github.com/langgenius/dify/pull/43470)：沒有設定 body 參數時照常觸發工作流，原始內容可以從 raw 變數拿到；有設定 body 參數時回 400 並說明原因，不再是 500。新加的三個測試在修正前會失敗、修正後通過，webhook 相關的 148 個測試也都過了，送出前把專案要求的 lint 和型別檢查也跑過一遍。

## 幾件沒想到的事

- **Dify issue 上的 `review: medium` 標籤，不是在評 issue 寫得好不好**，是 ghfind 對發文者 GitHub 帳號的分數，同一個人發的每篇都一樣，所以不用太在意。
- **新貢獻者的 PR，CI 要等維護者按核准才會跑**。看到一整排 `action_required` 不是出錯，只是在排隊。
- **在 Windows 上跑 Dify 的測試有不少坑**：python-magic 一 import 就卡住、預設設定會對整個專案算覆蓋率而慢到不行、dotenv-linter 會抱怨 CRLF，其實只是 Windows 下載程式碼時自動轉換了換行。
- **寫 issue 時，「不用開伺服器就能跑的最小重現程式 + 實際輸出 + 程式碼連結」比長篇描述有用得多**。接手修 #43465 的那位貢獻者，留言裡的理解和我寫的根因一模一樣。

## 接下來

兩個 PR 都還在等審查，合併的話，我就算是 AstrBot 和 Dify 的正式貢獻者了。手上還有一些整理好的問題，之後會照影響大小一天發一個。比起自己寫專案，這種「先讀懂別人的系統，再小心地改一點點」的工作很不一樣，也比我想的有趣。

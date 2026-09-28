---
title: LumiGrid 在瀏覽器裡跑起來了
date: 2026-09-28
tags: [LumiGrid, WebGPU]
---

LumiGrid 現在可以直接在網頁上用自己的照片試，兩個神經網路都在訪客的裝置上執行，照片不會上傳。

![瀏覽器版 LumiGrid：左邊是輸入，右邊是結果，右側列出每一步花的時間](img/lumigrid-browser-demo.png)

和 PyTorch 的輸出逐像素比對，最大誤差只有 1 個灰階（63.9 dB）。過程中發現 ONNX Runtime Web 的 WebGPU 後端在 6 個輸入通道的卷積會算錯，詳細經過寫在[研究筆記](/notes/zh-tw/lumigrid-in-the-browser/)。

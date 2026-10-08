---
type: post
title: 替 kornia 回報 homography 估計回傳 NaN 的問題並送修正
date: 2026-10-09
description: 向電腦視覺函式庫 kornia 回報 find_homography_dlt 在完全正確的對應點上回傳全 NaN 的問題，並送出修正 PR。
tags: [開源貢獻, kornia, 電腦視覺]
---

向 PyTorch 的可微分電腦視覺函式庫 [kornia](https://github.com/kornia/kornia) 回報了 `find_homography_dlt` 的問題（[#5644](https://github.com/kornia/kornia/issues/5644)）：預設的 LU 解法在點數五個以上時，碰到完全正確的對應點（兩組點相同、整數平移、整數點的 90 度旋轉），有時會回傳整個都是 NaN 的矩陣，同一組點用 SVD 解法或 OpenCV 的 `findHomography` 都算得出正確結果。隨機取 10 個整數點加上整數平移，500 組裡有 98 組會出錯，`find_homography_dlt_iterated` 也一樣受影響。

原因是這種資料的法方程矩陣本來就是奇異的，平常靠浮點捨入誤差剛好解得出正確方向，一旦 LU 分解的最後一個主元剛好算成 0，求解就失敗。修正放在 [PR #5648](https://github.com/kornia/kornia/pull/5648)：只有最後一個主元是 0、前面的主元又夠大時，代表解答唯一，改從左上角 8×8 的區塊解出 homography，點重合這類真正退化的情況照樣回傳 NaN。目前等待維護者審查。

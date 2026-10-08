---
type: post
title: A NaN homography fix for kornia
date: 2026-10-09
description: Reported to the computer vision library kornia that find_homography_dlt returns an all-NaN matrix on exact correspondences, and sent a fix PR.
tags: [open source, kornia, computer vision]
---

Reported a `find_homography_dlt` bug to [kornia](https://github.com/kornia/kornia), the differentiable computer vision library for PyTorch ([#5644](https://github.com/kornia/kornia/issues/5644)). With five or more points, the default LU solver sometimes returned an all-NaN matrix on exact correspondences (identical point sets, integer shifts, exact 90° rotations of integer keypoints), while the SVD solver and OpenCV's `findHomography` got the right answer for the same points. With 10 random integer keypoints and an integer shift, 98 of 500 sets failed, and `find_homography_dlt_iterated` was affected too.

On such data the normal matrix is singular to begin with; roundoff usually lets the solve land on the right direction anyway, but when the last LU pivot comes out exactly zero, the solve fails. The fix is in [PR #5648](https://github.com/kornia/kornia/pull/5648): when only the last pivot is zero and the earlier ones are large enough, the homography is unique, so it is taken from the leading 8x8 block, while truly degenerate inputs such as coincident points still give NaN. It is waiting for review.

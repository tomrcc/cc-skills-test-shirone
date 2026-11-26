---
title: "Markdown File Includes"
published: 2026-08-28
updated:
description: "Build-time Markdown file and slice includes."
image: ""
tags: [Markdown, Shirone]
category: Guides
series: ""
seriesOrder:
lang: ""
pinned: false
draft: false
comment: true
encrypted: false
password: ""
passwordHint: ""
hideHomeContent: true
---

Shirone can include a local Markdown file or a safe slice of one.

<!-- @include: src/content/snippets/include-example.md#public-api -->

The full file and line-range forms are also supported:

```markdown
<!-- @include: src/content/snippets/include-example.md -->
<!-- @include: src/content/snippets/include-example.md{1-4} -->
<!-- @include: src/content/snippets/include-example.md{5-} -->
<!-- @include: src/content/snippets/include-example.md{-4} -->
```

Include comments inside fenced code remain literal.

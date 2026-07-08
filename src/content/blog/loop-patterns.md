---
title: "Loops and Patterns"
date: "2026-07-01"
summary: "Let's turn any shape into two loops and a formula - star patterns"
tags: ["dsa", "loops", "fundamentals", "patterns"]
category: "dsa"
---

Pattern printing is the first wall most people hit after learning loops. The problems look arbitrary at first — a hollow square here, a butterfly there — and it is tempting to memorize each one. But please don't. Every pattern problem, all of them, is the same problem:

> **We are given a picture. We turn it into a formula in `i` (the row) and `j` (the column) of a grid.**

The outer loop picks a row. The inner loop(s) walk across that row printing *segments* — some spaces, some stars — and each segment's length is a function of `i` and `n`. Find the functions and the code writes itself. All pseudocode below translates line-for-line to C++, Python, or anything else.

![Every pattern is a grid](/blog/loop-patterns/01-grid-anatomy.svg)

## 1. Solid blocks — the counts are constant

```
    **                * * * * *             * * * *
    **                * * * * *             * * * *
    **                * * * * *             * * * *
    **                * * * * *             * * * *
Column of **       Rectangle m x n       Square n x n    
```

These warm-up shapes (a column of `**`, an `n × m` rectangle, an `n × n` square) all have one thing in common: what we print in each row doesn't depend on that row.

```
read n, m
repeat n times:
    print "*" m times, add spaces if required
    newline
```

That's it. `m = 2` gives the double-star column, `m = n` gives the square. One template, three problems down.

## 2. Triangles — the count depends on the row

```
*
* *
* * *
* * * *
* * * * *
```
The moment the shape slants, the inner count becomes a function of `i`:
```
read n
for i = 1 … n:
    print "*" i times     ← the formula
    newline
```


Every triangle variant is a one-line tweak to this formula or to *what* gets printed:

```
   * * * * *            1                   1
   * * * *              2 2                 0 1
   * * *                3 3 3               1 0 1
   * *                  4 4 4 4             0 1 0 1
   *                    5 5 5 5 5           1 0 1 0 1
Inverted Pyramid    Numbered Triangle    Binary Triangle
```

- **Inverted pyramid** — run the rows the other way: `for i = n … 1`, print `i` stars. (Equivalently: keep `i = 1 … n` and print `n − i + 1` stars.)
- **Numbered triangle** — same loop, but print the digit `i` instead of `*`. Row 3 reads `333`.
- **Binary pyramid** — print alternating bits, flipping after each one:

```
for i = 1 … n:
    bit = parity of i     ← check the sample output: does row 1 start with 0 or 1?
    repeat i times:
        print bit
        bit = 1 - bit
    newline
```

The only trap in the binary pyramid is the starting bit. Whether row 1 begins with `0` or `1` depends on the exact problem statement, and the parity trick (`i mod 2` or its complement) handles either, but we have to read the sample output to know which one we need.

## 3. Hollow shapes — print the border, space the interior

Here's where people start writing four separate loops for the four walls. There's a much cleaner way: visit *every* cell, and let a **border test** decide what to print.

![Hollow shapes: the border test](/blog/loop-patterns/02-hollow-boundary.svg)

```
for i = 1 … n:
    for j = 1 … m:     ← for a square m = n
        if i = 1 or i = n or j = 1 or j = m:
            print "*"
        else:
            print " "
    newline
```


The same idea generalizes to any hollow shape and only the border condition changes. For a hollow triangle, the borders are the first star of the row, the *last* star of the row, and the base:

```
for i = 1 … n:
    for j = 1 … i:
        if i = n or j = 1 or j = i:
            print "*"
        else:
            print " "
    newline
```
```
* * * * *
*     *
*   *
* *
*
```

Let's memorize the *idea* (border test), not the conditions — we can re-derive the conditions from the picture in seconds.

## 4. Centered shapes — spaces are content too

A centered triangle is just a left-aligned triangle pushed right by a shrinking wall of spaces. The key realization is **leading spaces are a segment like any other**, with their own formula. For row `i` of `n`, the push is `n − i`:

```
for i = 1 … n:
    print " " (n - i) times     ← the invisible half of the shape
    print "* " i times
    newline
```

```
    *
   * *
  * * *
 * * * *
* * * * *
```

One thing to note that if stars are separated by spaces (`* `), most online judges reject a *trailing* space after the last star. Handle the last star specially by printing `"* "` for `j < i` and a bare `"*"` for `j = i`.

## 5. Mirrored shapes — two halves, one shared row

A diamond is not a new shape. It's a centered triangle followed by an inverted centered triangle. A vertical triangle (grows then shrinks) is the same idea without the centering. The entire trick is one line:

![Composite shapes are two mirrored halves](/blog/loop-patterns/03-two-halves.svg)

```
for i = 1 … n:        print centered row(i)     ← top half, includes the widest row
for i = n−1 … 1:      print centered row(i)     ← bottom half starts at n−1
```

```
  *
 * *
* * *
 * *
  *
```

The second loop starts at `n − 1`, **not** `n`. Start it at `n` and the widest row prints twice — the single most common bug in this whole family. Hollow diamond? Same two halves, with the border test from section 3 inside each row.

## 6. Two-sided shapes — left block, gap, right block

The last family (crown, butterfly, inverted diamond) looks intimidating but has the most mechanical recipe of all. Each row is exactly three segments:

```
row = stars · gap · stars
```

with the star count and the gap moving in opposite directions. The crown:

```
stars = 1
for i = n … 1:
    print "*" stars times
    print " " 2·(i−1) times     ← gap shrinks as the blocks grow
    print "*" stars times       ← add space if required       
    newline
    stars = stars + 1
```

```
*             *
* *         * *
* * *     * * *
* * * * * * * *
```

- **Butterfly** = crown + its mirror image below (bottom half runs `i = 2 … n` with `stars` counting back down — again skipping the shared middle row).
- **Inverted diamond** = the same three segments with the direction flipped: `stars` starts at `n` and shrinks while the gap `2i − 1` grows, then mirror.

```
*             *
* *         * *
* * *     * * *
* * * * * * * *
* * *     * * *
* *         * *
*             *
```

Notice the gap formulas are always *linear in `i`* like `2(i−1)`, `2i−1`. If we're staring at a sample output trying to find the gap width, we count the spaces in two consecutive rows; the difference per row and one anchor row give us the whole formula.

## The cheat sheet

All nineteen problems, one line each:

| Shape | Rows | Per-row recipe |
|---|---|---|
| Two-star column | n | `**` |
| n×m rectangle / n×n square | n | m (or n) stars |
| Hollow square / rectangle | n | border test: `i=1 / i=n / j=1 / j=m` |
| Pyramid / inverted pyramid | n | `i` stars / `n−i+1` stars |
| Numbered triangle | n | digit `i`, `i` times |
| Binary pyramid | n | alternate bits; start = parity of `i` |
| Vertical triangle (± hollow) | 2n−1 | grow `1…n`, mirror from `n−1`; hollow = border test |
| Centered triangle (± hollow) | n | `n−i` spaces, then `i` stars (or border test) |
| Diamond (± hollow) | 2n−1 | centered triangle + inverted mirror from `n−1` |
| Crown | n | `stars · gap 2(i−1) · stars`, stars growing |
| Butterfly | 2n−1 | crown + mirror from row 2 |
| Inverted diamond | 2n−1 | stars shrink `n…1` while gap `2i−1` grows, then mirror |

## Debugging checklist

When a pattern comes out wrong, it's almost always one of these four:

1. **Doubled middle row** — our mirror loop starts at `n` instead of `n − 1`.
2. **Off-by-one in a formula** — print `i` and `j` themselves instead of stars for one run; the shape of the numbers shows us exactly which formula is wrong.
3. **Trailing spaces** — judges compare output byte-for-byte; special-case the last star in a row.
4. **Wrong starting parity** — for alternating patterns, check row 1 of the sample output before choosing `i mod 2` vs its complement.

The meta-lesson carries far beyond stars: *decompose the output into segments, express each segment's length as a function of the loop variables, handle boundaries explicitly.* That's the same skill we'll use later for matrix traversals, prefix sums, and sliding windows — patterns are just where it's cheapest to learn it.

## Try it out

LeetCode is thin on pure pattern printing, but these two exercise the same rows-and-formulas muscle — and GFG has drills for every shape in this post:

- [Pascal's Triangle](https://leetcode.com/problems/pascals-triangle/) — each row's length and contents are functions of the row index
- [Pascal's Triangle II](https://leetcode.com/problems/pascals-triangle-ii/) — the same shape, but build each row from the previous one in place
- GFG: [Programs for printing pyramid patterns](https://www.geeksforgeeks.org/programs-printing-pyramid-patterns/) — an endless drill sheet; try each shape with the segment-decomposition method before peeking

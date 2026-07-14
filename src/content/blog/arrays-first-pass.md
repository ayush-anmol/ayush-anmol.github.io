---
title: "Arrays"
date: "2026-07-14"
summary: "A first pass over arrays in six ideas: accumulators, early exits, two pointers, marking tricks"
tags: ["dsa", "arrays", "two-pointers", "fundamentals"]
category: "dsa"
---

Arrays are the first real data structure that we'll learn and reuse forever. Here we'll go through a few patterns, and the errors that tend to show up along the way.

## 1. The accumulator sweep

Sum, minimum, maximum, count-occurrences: four different questions, one skeleton. **Walk the array once, carrying a little bubble of state** (just the answer-so-far), and update it at every element.

![One pass, one bubble of state](/blog/arrays-first-pass/01-accumulator.svg)

Lets take a closer look on 'finding the minimum element in the given array'

```
min = +∞
pos = −1
for i = 1 … n:
    if arr[i] < min:
        min = arr[i]
        pos = i
```

Three details cause most of the mistakes here:

- **Initialization:** Start `min` at +∞ (or at `arr[1]`) so the first element always wins the first comparison. Similarly, we can start a *max* at −∞, start a sum at 0 and a count at 0. Wrong sentinel or initialization means wrong answer on the first element.
- **Track the companion state together:** The position updates *inside the same `if`* as the minimum. Update one without the other and they desynchronize.
- **The sum overflows.** 10⁵ elements near 10⁹ each ≈ 10¹⁴, far past 32 bits. Always give a running total a 64-bit integer (refer to the factorial lesson from [the functions post](/blog/functions-number-theory)).

Also mind the indexing: arrays are 0-indexed in most languages, but judges usually want 1-indexed positions. So decide once, at the boundary: store however we like, then convert when we print.

The problem **second largest element** upgrades the state from one value to two. When a new maximum arrives, the old maximum becomes the second largest. When a value is smaller than the maximum but bigger than the current second, it becomes the new second directly:

```
if arr[i] > max:
    second = max          ← the old max is demoted, not discarded
    max = arr[i]
else if arr[i] > second and arr[i] < max:
    second = arr[i]
```

The strict `< max` stops a duplicate of the maximum from filling both spots: on `[7, 7, 3]`, the second largest is 3, not 7 (check what the judge wants, since both conventions exist). Forgetting the `second = max` line is a classic mistake, because the old maximum is exactly the best candidate for second place.

## 2. Early-exit scans

"Does `target` exist?" and "is the array sorted?" share the same shape. In both, we're looking for **one witness**: a single element that settles the answer by itself. The moment we find it, we're done.

```
for i = 1 … n:
    if arr[i] = target:
        print "YES"; exit
print "NO"
```

The sorted check hides the better lesson. We don't need to compare everything with everything, because sortedness is a *local* property:

```
for i = 2 … n:
    if arr[i−1] > arr[i]:      ← one inversion disproves the whole thing
        print "NO"; exit
print "YES"
```

If every adjacent pair is in order, the whole array is in order (order is transitive). One pass, adjacent pairs only, exit at the first counterexample. The idea generalizes: *a claim about the whole array can often be disproved by one local spot*. It returns constantly, from sortedness checks to binary search.

The same witness idea answers a structural question: **where was a sorted array rotated?** A rotated sorted array is ascending everywhere except at one point, where the largest element sits right before the smallest. That point is the only place where `arr[i−1] > arr[i]`. Find the first such `i` and we've found the rotation offset. Find no descent at all, and the array was never rotated (offset 0).

## 3. Two pointers from the ends

Printing an array backwards needs no algorithm at all: the loop direction decides the output order (`for i = n … 1: print arr[i]`), the same trick as the descending factors in the previous post.

Actually **reversing** the array in memory is the real move, and it introduces the two-pointer pattern:

![Two pointers converge](/blog/arrays-first-pass/02-two-pointer-reverse.svg)

```
l = 1
r = n
while l < r:
    swap arr[l], arr[r]
    l = l + 1
    r = r − 1
```

The two pointers start at opposite ends and move toward each other, swapping as they go. The `l < r` condition stops them at the middle, so nothing gets swapped twice. For an odd length, the middle element simply stays where it is. Total cost: `n ÷ 2` swaps, and no second array. This converge-from-both-ends pattern comes back everywhere, from binary search to sliding windows.

Two more pointer patterns are worth meeting now. First, two pointers that move in the **same direction**. Here they push all the zeros to the end while keeping everything else in order:

```
w = 1                          ← where the next non-zero value lands
for r = 1 … n:                 ← r visits every element
    if arr[r] ≠ 0:
        arr[w] = arr[r]
        w = w + 1
fill arr[w … n] with zeros
```

Here `r` visits every element, one by one. `w` only moves when `r` finds a non-zero value: we copy that value to position `w`, then move `w` forward. Since the non-zero values are copied in the order we meet them, their original order is preserved. This pattern is called a *stable partition*. It does the same job as building a new filtered array, just without the second array.

Second, reversal as a **building block**: rotate an array left by k using three reversals and nothing else:

```
k = k mod n                    ← rotating by n is rotating by 0
reverse arr[1 … k]
reverse arr[k+1 … n]
reverse arr[1 … n]
```

Reverse the two blocks, then reverse the whole: each block ends up intact, in the right place. O(n) time, O(1) space, and the only trap is forgetting `k mod n` when k can exceed the array length. (For a right rotation, rotate left by `n − k`.)

## 4. Stride loops: work by parity

Swap-alternate (exchange elements 1↔2, 3↔4, …) is a loop that **steps by 2**:

```
for i = 2 … n step 2:
    swap arr[i−1], arr[i]      ← pairs (1,2), (3,4), … ; a leftover last element just stays
```

"Arrange the numbers" (odds ascending, then evens descending: `1 3 5 6 4 2`) teaches the opposite trick. When the output has an obvious structure, **construct it directly instead of transforming the input**:

```
pos = 1
for v = 1 … n step 2:          ← odds, ascending
    arr[pos] = v; pos = pos + 1
start = n  (if n is even)  or  n − 1  (if n is odd)
for v = start … 2 step −2:     ← evens, descending
    arr[pos] = v; pos = pos + 1
```

No swapping, no sorting: just write the answer. The only care point is the even/odd `n` boundary, which decides where the descending run starts.

## 5. Counting beats sorting

"Sort an array of 0s and 1s" looks like a sorting problem. It isn't; with only two possible values, **the counts fully describe the sorted output**:

```
count how many 0s and how many 1s
print count₀ zeros, then count₁ ones
```

One pass to count, one pass to print. That's O(n), and we never move a single element. This is counting sort in miniature. It generalizes: whenever the range of possible values is tiny, counting them replaces sorting them. (The in-place cousin, partitioning 0s left and 1s right with two pointers, is where the Dutch National Flag algorithm starts, a later post.)

## 6. Marking: remember without extra memory

Three classics here (*find the duplicate*, *find the unpaired element*, *intersect two arrays*) all need the same thing: a way to *remember which elements we've already dealt with*. Before hash sets arrive later in the series, we can do it by **marking the array itself**, usually by flipping an element's sign:

```
for i = 1 … n:
    for j = i+1 … n:
        if arr[i] = arr[j]:        ← found this value's partner
            negate both
            break
the element still positive is the unpaired one
```

Intersection uses the same move so duplicates don't match twice: when `a[i]` finds a partner in `b`, negate that partner so no later element can match it again.

Two things to remember about sign-marking:

- **It borrows the sign bit as a flag**, which only works when all values are guaranteed positive. If zeros or negatives can appear, the trick silently breaks; check the constraints before using it.
- **For the unpaired-element problem there's a one-line upgrade**: XOR every element together. Pairs cancel (`x XOR x = 0`, and XOR is order-independent), so the element left over at the end is the answer. O(n), no marking, and no positivity assumption:

```
answer = 0
for each x in arr:
    answer = answer XOR x
```

For find-the-duplicate, the simple version counts occurrences of each element (O(n²)); the care point is to **report the value once**, not once per copy (e.g., only report at its first occurrence). Letting both copies trigger the report is the classic double-print bug.

## 7. The k-sum ladder

The finale. Count pairs with `arr[i] + arr[j] = target`; then triplets summing to a target; then quadruplets satisfying a weighted equation. Brute force is nested loops, and the shape matters:

```
count = 0
for i = 1 … n:
    for j = i+1 … n:               ← j starts AFTER i
        if arr[i] + arr[j] = target:
            count = count + 1
```

Starting `j` at `i + 1` means we enumerate **combinations, not ordered pairs**: `(3, 5)` and `(5, 3)` are the same pair and get counted once. Triplets add `for k = j+1`, quadruplets add `for l = k+1`. Same idea, one more indent each time.

![The k-sum ladder](/blog/arrays-first-pass/03-ksum-ladder.svg)

And that indent is expensive. For n = 100: 4,950 pairs; 161,700 triplets; ~3.9 *million* quadruplets. Each extra loop multiplies the work by roughly n: this is O(n²) → O(n³) → O(n⁴), and it's why "just add another loop" stops being a plan around the third one. The faster alternatives (sort + two pointers, hash maps) are exactly where this series is headed.

One more trap, subtler than the complexity: **"count the pairs" and "pair up the elements" are different problems.** On `[2, 2, 2, 2]` with target 4, there are *six* pairs `(i, j)` that sum to 4, but only *two* disjoint pairs if each element may be used once. Same words, different answers. The problem statement (and its sample cases) tells us which version is being asked. Read it twice.

## The cheat sheet

| Problem | Core idea | Watch out for |
|---|---|---|
| Print in reverse | loop direction = output order | |
| Sum | accumulator | 64-bit for the total |
| Min / max with position | accumulator + companion state | sentinel init; update both together |
| Second largest | keep two values: max and second | demote the old max; strict `<` vs duplicates |
| Search / count occurrences | scan; exit early when possible | |
| Is sorted? | adjacent pairs only | one inversion is enough; exit |
| Rotation point | the one place where arr[i−1] > arr[i] | no descent → offset 0 |
| Sort 0s and 1s | count, then reprint | counting sort in miniature |
| Reverse in place | two pointers converge | stop at `l < r` |
| Push zeros to the end | read pointer + write pointer | non-zeros keep their order |
| Rotate by k | three reversals | take k mod n first |
| Swap alternate | stride-2 loop | leftover element when n is odd |
| Arrange numbers | construct the output directly | even/odd n boundary |
| Unpaired element | mark pairs (negate), or XOR | sign trick needs positive values |
| Find duplicate | count occurrences | report once, not once per copy |
| Intersection | mark matched partners | duplicates must not match twice |
| Pair / triplet / quadruplet sum | nested loops, each starting one past the last | O(n²)→O(n³)→O(n⁴); pairs vs matching |

## Debugging checklist

1. **Indexing:** 0-indexed storage, 1-indexed answers. Convert at the print statement, nowhere else.
2. **Sentinels:** min starts at +∞, max at −∞, sum at 0. Test on a single-element array; wrong initialization dies there first.
3. **Overflow:** any accumulator over big inputs wants 64 bits.
4. **Double counting:** `j = i+1` for combinations; report duplicates once; mark matched elements in intersections.
5. **Borrowed bits:** sign-marking assumes positive values. Check the constraints before borrowing.

Next in the series: 2D arrays, where one index becomes two and row-major order starts to matter.

## Try it out

- [Two Sum](https://leetcode.com/problems/two-sum/): the bottom rung of the k-sum ladder; brute-force it first, then meet the hash-map upgrade
- [Single Number](https://leetcode.com/problems/single-number/): the unpaired element; the XOR one-liner in the wild
- [Reverse String](https://leetcode.com/problems/reverse-string/): two pointers converging, exactly the in-place reversal above
- [3Sum](https://leetcode.com/problems/3sum/): the ladder's third rung, where O(n³) stops being a plan and sort + two pointers takes over
- GFG: [Find duplicates in O(n) time and O(1) extra space](https://www.geeksforgeeks.org/find-duplicates-in-on-time-and-constant-extra-space/): sign-marking pushed to its limit

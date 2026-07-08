---
title: "Functions and basics of Number-Theory"
date: "2026-07-07"
summary: "Factors, primes, factorials, nCr, digit peeling, HCF"
tags: ["dsa", "functions", "number-theory", "fundamentals"]
category: "dsa"
---

First we'll learn about *structure*: what a function is and why returning beats printing. Then some basic number-theory concepts — factors, primality, factorial, nCr, digit extraction, HCF — that we'll reuse for the rest of our DSA journey. Everything below is pseudocode; translate into any language of your choice.

## 1. A function is a contract

![A function is a contract](/blog/functions-number-theory/01-function-contract.svg)

A function has a name, inputs, and (optionally) an output. The caller only sees the contract — *how* the body works is private. The first design decision we'll make over and over: **return a value, or print it?**

```
function is_prime(n) → true / false     ← returns; the caller decides what to do
procedure print_factors(n)              ← prints; the result is consumed on the spot
```

The rule of thumb: **return when the answer feeds another computation, print when the answer *is* the output.** For example, using a prime check function that prints `"Prime"` is a dead end, we can't use it to find all primes up to N. A prime check that returns a boolean composes:

```
read n
for i = 2 … n:
    if is_prime(i):
        print i, " "
```

One subtle trap hides in this composition. Suppose `is_prime` was written without the `n = 1` guard, because "the loop handles it." It happens to work here — the caller starts at 2 — but the function is now *silently wrong on its own*, and the next caller won't be so polite. **A function's correctness should never depend on the caller being nice.** We handle the edge cases inside the function itself.

## 2. Declare, define, call — the three moments

Let's learn the terminology. A function shows up at three separate moments in a program's life, and mixing them up causes half of all beginner compiler errors:

```
function is_prime(n) → boolean          ← declaration: the promise (name, input, output)

function is_prime(n):                   ← definition: the how, written exactly once
    if n = 1: return false
    for i = 2 … while i·i ≤ n:
        if n mod i = 0: return false
    return true

if is_prime(13): print "prime"          ← call: the use, as many times as we like
```

- **Declaration** announces the contract — the name, what goes in, what comes out, that's it. In C/C++ this is the *prototype* (`bool is_prime(int n);`), and it exists so the compiler knows the name before it ever sees the body. In Python, `def` declares and defines in one stroke, so we never write the two separately.
- **Definition** is the body — the private *how* from section 1. One function, one definition.
- **Call** is where the work actually happens. Control jumps into the body carrying our input, the body runs, and `return` drops the answer back at the exact spot we called from — the program then carries on from there.

![One function, three moments](/blog/functions-number-theory/04-declare-define-call.svg)

Two things to note. First, the call must match the declaration — same number of inputs, same order; the compiler checks the call against the *promise*, not the body. Second, in languages that need declarations, calling a function above its definition without a prototype gets us the classic "unknown function" error — the program simply doesn't know the name yet.

## 3. Factors, and the pair trick

The direct approach is to try every candidate:

```
procedure print_factors(n):
    for i = 1 … n:
        if n mod i = 0:
            print i, " "
```

For `n = 12`: `1 2 3 4 6 12`. Want them descending? Run the loop the other way (`for i = n … 1`) — the *order of the loop is the order of the output*, no sorting needed.

That works, but it checks `n` candidates when far fewer are necessary. So, here comes an observation. Notice that factors come in pairs, i.e., if `i` divides `n`, then `n ÷ i` divides `n` too. `36 = 1×36 = 2×18 = 3×12 = 4×9 = 6×6` — every factor bigger than √n is the partner of one smaller than √n.

![Factors come in pairs](/blog/functions-number-theory/02-factor-pairs.svg)

```
for i = 1 … while i·i ≤ n:     ← i = √n => i² = n
    if n mod i = 0:
        record i
        if i ≠ n ÷ i:          ← don't record 6 twice for 36
            record n ÷ i
```

That's O(√n) instead of O(n) — for a 12-digit number, roughly a million steps instead of a trillion. This one observation powers the next two problems too.

## 4. Primality check

A prime has no divisor other than 1 and itself. So *look for one divisor* and stop the moment we find one:

```
function is_prime(n) → boolean:
    if n = 1: return false          ← 1 is not prime, by definition
    for i = 2 … while i·i ≤ n:
        if n mod i = 0:
            return false            ← one witness is enough; exit immediately
    return true
```

Two things carry over everywhere:

- **Early exit.** The moment the answer is known, `return`. No flags, no counters, no finishing the loop out of politeness.
- **The bound.** If `n = a·b` with both factors > √n, then `a·b > n` — contradiction. So a composite number *must* have a divisor ≤ √n, and that's as far as we ever need to look. (Checking up to `n/2` also works and is a common first version — it's just √n's slower cousin.)

Printing all primes up to N is then the composition/function from section 1 — `is_prime` called in a loop from 2 to N. It's O(n√n) overall, which is fine for now; we will learn about the sieve of Eratosthenes later.

## 5. Factorials
```
Factorial n = n! = 1 * 2 * 3 * 4 * ... * (n-1) * n
```

The routine is trivial:

```
function factorial(n):
    product = 1
    for i = 2 … n:
        product = product × i
    return product
```

Here the lesson isn't the loop — it's what happens to the number. Factorials grow *violently*: `12!` ≈ 479 million still fits in 32 bits, but `13!` ≈ 6.2 billion does not. A 64-bit integer survives until `20!` and dies at `21!`. So **use 64-bit integers by default for products, and know that even they buy us only up to 20!**. Past that we need different mathematics (modular arithmetic, or big integers), not a bigger box.

## 6. nCr: the multiply-then-divide trick

The textbook formula is a trap:

```
C(n, r) = n! / (r! · (n−r)!)        ← do NOT compute it this way
```

`C(30, 15)` is only 155 million — fits comfortably — but `30!` is a 33-digit number that overflows *everything* on the way there. The intermediate values explode even when the answer is small.

So, what to do? The fix is to build the answer incrementally, keeping it as small as possible at every step:

```
function choose(n, r):
    r = min(r, n − r)               ← symmetry: C(n, r) = C(n, n−r)
    result = 1
    for i = 1 … r:
        result = result × (n − r + i) / i     ← multiply first, THEN divide
    return result
```

Why is the division always exact? Because after step `i`, `result` equals `C(n−r+i, i)` — a binomial coefficient, hence an integer, at *every* intermediate step. The order matters: multiply first, then divide. Divide first and we'd be doing integer division on numbers that aren't divisible yet.

This "keep intermediates small" instinct is the same one behind modular arithmetic later — the answer fits, so route the computation through values that also fit.

## 7. Digit peeling: mod 10, divide by 10

To inspect a number's digits, we don't need strings. Two operations peel digits off the right end:

```
n mod 10     → the last digit
n ÷ 10       → the number with that digit removed
```
Note: here `÷` means integer division — `n ÷ 10` is really `⌊n / 10⌋`, the remainder is thrown away.

![Peeling digits](/blog/functions-number-theory/03-digit-peel.svg)

Counting zeros in `n`:

```
function count_zeros(n):
    if n = 0: return 1              ← edge case: "0" has one digit, and it's a zero
    count = 0
    while n > 0:
        if n mod 10 = 0:
            count = count + 1
        n = n ÷ 10
    return count
```

The edge case is the whole interview. `while n > 0` never runs for `n = 0`, so without the guard the function reports that zero contains no zeros. Every digit-loop problem (digit sum, reverse a number, palindrome check) is this same skeleton with a different line in the middle.

## 8. HCF: brute force, then Euclid

The straightforward version scans downward and returns the first common divisor — which, coming from the top, is automatically the greatest:

```
function hcf(a, b):
    for i = min(a, b) … 1:
        if a mod i = 0 and b mod i = 0:
            return i
```

Correct, and O(min(a, b)). But this problem has one of the oldest and most beautiful upgrades in mathematics — **Euclid's algorithm**, ~300 BC:

```
function gcd(a, b):
    while b ≠ 0:
        a, b = b, a mod b
    return a
```

Why it works: any number dividing both `a` and `b` also divides `a mod b`, so the pair `(b, a mod b)` has exactly the same common divisors as `(a, b)` — the problem shrinks without changing its answer. And it shrinks *fast*: `gcd(48, 18) → gcd(18, 12) → gcd(12, 6) → gcd(6, 0) = 6`. Three steps. The step count is logarithmic, so numbers with hundreds of digits are no problem — this is the version to remember. So the time complexity reduces to O(log(min(a, b))).

Fun fact: The worst case occurs with consecutive Fibonacci numbers, since each step reduces the pair (F(n), F(n-1)) to (F(n-1), F(n-2)) giving the slowest possible shrinkage.

## The cheat sheet

| Problem | Core idea | Watch out for |
|---|---|---|
| Repeat a message | function = named, reusable block | — |
| Factors (asc / desc) | trial division; loop direction = output order | pair trick gives O(√n) |
| Prime check | search for one divisor ≤ √n, exit early | n = 1 is not prime |
| Primes up to N | reuse `is_prime` in a loop | function must own its edge cases |
| Factorial | running product | 32-bit dies at 13!, 64-bit at 21! |
| nCr | multiply-then-divide, one factor at a time | naive factorial formula overflows |
| Count zeros | peel digits: mod 10, ÷ 10 | n = 0 edge case |
| HCF | scan down — or Euclid's `(b, a mod b)` | Euclid is logarithmic; learn it |

## Debugging checklist

1. **Overflow** — any running product deserves 64 bits and a moment's thought about its maximum value. Know the two landmarks: 13! kills 32-bit, 21! kills 64-bit.
2. **Edge cases at the small end** — `n = 0` for digit loops, `n = 1` for primality. Test them first; they're where the definitions live, and where `while` loops silently skip.
3. **Return, don't print** — if the function's answer could ever feed another computation, return it. Printing inside utility functions is how reuse dies.
4. **Exit early** — found a divisor? `return false` now. Found the HCF? `return i` now. Flags and counters that postpone the exit are noise.

Next time a problem says "check if…" or "count the…", the reflex should be: write the smallest function with an honest contract, handle the degenerate input, and think about how big the numbers get *on the way* to the answer — not just at the end.

## Try it out

- [Palindrome Number](https://leetcode.com/problems/palindrome-number/) — digit peeling, straight from this post
- [Reverse Integer](https://leetcode.com/problems/reverse-integer/) — digit peeling where the overflow lesson *is* the entire problem
- [Count Primes](https://leetcode.com/problems/count-primes/) — primality at scale; trial division meets its upgrade, the sieve
- [Factorial Trailing Zeroes](https://leetcode.com/problems/factorial-trailing-zeroes/) — count the zeros *without* computing the factorial (remember what 21! does)
- GFG: [Sieve of Eratosthenes](https://www.geeksforgeeks.org/sieve-of-eratosthenes/) · [Euclidean algorithms](https://www.geeksforgeeks.org/euclidean-algorithms-basic-and-extended/)

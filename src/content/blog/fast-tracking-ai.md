---
title: "Fast-Tracking AI: From 'What Is Learning?' to How ChatGPT Works"
date: "2026-07-03"
summary: "Why rules failed, why learning won, and how 'predict the next word' became ChatGPT."
tags: ["ai", "machine-learning", "llm", "fundamentals"]
category: "ai"
---

Most explanations of AI start in the middle — neural networks, parameters, GPUs — and hope we'll accept and have a leap of faith. This post starts at the actual beginning: what it even means to learn. Everything else, up to and including ChatGPT, follows from that one idea.

## 1. Learning, knowledge, intelligence

To simply put **learning is adjustment**: changing ourselves based on experience. We try something, see what happens, adjust, repeat. That's it. Every learner — a toddler, a chess player, a neural network — runs the same loop; they differ only in what gets adjusted and how.

![The learning loop](/blog/fast-tracking-ai/01-learning-loop.svg)

Knowledge is what the loop leaves behind, and it comes in two flavors. **Explicit knowledge** we can write down: "Paris is the capital of France." **Implicit knowledge** we can't like: how we recognize a friend's face, how we balance a bicycle, how we know "oh, great" is sarcastic. We know these things, but we couldn't hand someone the rules.

That distinction turns out to be the fault line the whole history of AI cracked along.

And intelligence? A useful working definition: **the ability to achieve goals across a wide range of situations**. Not memorization, not speed — generality.

## 2. AI is a goal, not a method

"Artificial intelligence" names an ambition: *making machines do things that would require intelligence if a human did them* like recognizing faces, understanding language, playing chess or driving a car. It says nothing about how. The last seventy years of AI history are essentially a sequence of attempted *hows*.

## 3. Attempt #1: write the rules

The obvious first idea: if intelligence is knowledge, and we have experts, let's just write the knowledge down.

```
if email contains "free money"     → spam
if temperature > 100°F             → fever
if piece can reach square AND
     square holds enemy piece      → capture
```

These are **expert systems**, and for narrow, explicit domains they genuinely worked. But try writing the rules for recognizing a face. What's the exact eye-to-eye distance, for every possible angle and lighting? Try sarcasm: does "oh, great" mean things are good? Try idioms: a rule-based system parsing "it's raining cats and dogs" goes looking for falling animals.

The pattern behind every failure is the same: **rules can only capture explicit knowledge, and the interesting problems run on implicit knowledge** — the kind nobody can write down, because nobody knows how they do it.

![Rules vs. learning](/blog/fast-tracking-ai/02-rules-vs-learning.svg)

## 4. Attempt #2: let the machine learn

So let's flip the approach. Instead of writing rules, **we show the machine thousands of examples and let it find the patterns itself**:
```
1. Show it many examples
2. It makes a guess
3. Tell it whether the guess was right
4. It adjusts itself slightly
5. Repeat, millions of times
```
That's **machine learning** — the learning loop from section 1 but mechanized. Note the relationship: AI is the goal, ML is one method for reaching it, and deep learning (coming shortly) is one family of ML that ended up eating everything.

Early ML had real wins like spam filters, Netflix and Amazon recommendations, basic image recognition. But it plateaued hard. It couldn't hold a conversation, couldn't understand a paragraph, couldn't recognize objects as reliably as a toddler.

## 5. Two bottlenecks and two winters

Why the plateau? Not bad ideas but missing ingredients.

**1. Not enough data.** Learning from examples needs *millions* of examples. Where do we get millions of labeled photos in 1990? The internet was in its infancy.

**2. Not enough compute.** Learning is arithmetic, staggering amounts of it. On the hardware of the day, serious training would have taken years.

Meanwhile the field kept promising human-level AI "in twenty years," and when it failed to deliver, funding and interest collapsed, not once but twice. The 1970s brought the first **AI winter**; the expert-system bust of the late 80s and 90s brought the second. For a while, saying I worked on "AI" was a career liability.

![Booms and winters](/blog/fast-tracking-ai/03-booms-and-winters.svg)

Then, around 2012, all three missing ingredients arrived at once: 
1. the internet had produced **massive datasets**
2. **GPUs**, built for gaming, turned out to be perfect for ML's math; and 
3. researchers cracked how to train much deeper networks by **deep learning**. The field didn't just thaw; it detonated.

## 6. One problem, deeply: language

To see how any of this becomes ChatGPT, it helps to follow one problem all the way down. Language is the perfect lens, because language is *hard* in a way computers hate:

> "I saw the man with the telescope."

Who has the telescope — me or the man? Both readings are valid. Or compare *"fast-tracking the AI course"* with *"fast-tracking the course of AI"* which are nearly identical strings, completely different meanings. Computers need precision; human language is ambiguous, contextual, and messy on purpose.

The early NLP attempts rhyme with the AI attempts. **The dictionary approach**: define every word. But "apple" is a fruit, a trillion-dollar company, and a record label; a definition can't pick one without context. **The statistical approach**: learn patterns like "if 'New' is followed by 'York', it's a city." This powered Google Translate for nearly a decade, and it's genuinely useful but predicting words by frequency isn't understanding them.

## 7. The breakthrough: words as numbers

Computers don't understand words; they understand numbers. The question that unlocked modern NLP was: *can a list of numbers capture a word's meaning?*

Give every word a vector — a list of numbers where each dimension tracks some aspect of meaning:

| word  | royalty | gender (M) | edibility |
|-------|---------|------------|-----------|
| king  | 0.98    | 0.95       | 0.01      |
| queen | 0.97    | 0.05       | 0.02      |
| apple | 0.02    | 0.00       | 0.94      |

These are **word embeddings**. Once words are vectors, they're *points on a map*: similar words sit close together, and directions in the space mean things. Famously, the arithmetic works:

```
king − man + woman ≈ queen
Paris − France + Italy ≈ Rome
```

![Words as points in space](/blog/fast-tracking-ai/04-embedding-space.svg)

But there's a catch. In a basic embedding, each word gets exactly **one** point. "I went to the *bank* to deposit cash" and "I sat on the *bank* of the river" use the same vector. The model can't tell a financial institution from a riverbank, because it never looks at the neighboring words. Meaning needs **context**, and static embeddings don't have any.

## 8. Memory, forgetting, and attention

The next idea: process the sentence **one word at a time**, carrying a running memory — "I", "I went", "I went to", "I went to the bank…" These are **recurrent neural networks (RNNs)**, and they finally gave models context.

They also forget. For example, *"The cat, which was sitting on the mat that I bought from the store near the old church on the corner, was happy."* By the time an RNN reaches "was happy," the subject "the cat" has often dissolved out of its memory. And because RNNs read strictly in order, they're slow to train: no skipping ahead, no parallelism.

By 2017 the field had embeddings, sequence models, oceans of data, and fast GPUs and this word-by-word bottleneck throttling all of it. The fix was the **Transformer**, built on one mechanism: **attention**. Instead of reading sequentially, let every word look at *every other word simultaneously* and learn which ones matter.

![RNN vs. attention](/blog/fast-tracking-ai/05-rnn-vs-attention.svg)

The classic example: *"The animal didn't cross the street because **it** was too tired."* Processing "it," the model's attention locks onto "animal." Change one word — "…because it was too **wide**" — and attention shifts to "street." Same structure, different meaning, correctly resolved.

Attention killed three problems at once: 
   1. **no forgetting** — every word sees every word, at any distance,
   2.  **speed** — all positions process in parallel(perfect for GPUs) and 
   3.  **context** — each word's representation is built from the words that actually matter around it. 
   
The Transformer is what we get when we commit fully: no recurrence, no convolutions, attention all the way down. It's the foundation of every modern large language model, today.


## 9. How ChatGPT works

With the pieces on the table, ChatGPT is almost anticlimactic:

**ChatGPT = Transformer + internet-scale data + one simple objective.**

The architecture is a massive Transformer. The training data is trillions of words of text. And the objective is almost embarrassingly simple: **given a sequence of words, predict the next one.**

Generation is just that prediction run in a loop, each new token gets appended to the input, and the model predicts again:

![The generation loop](/blog/fast-tracking-ai/06-generation-loop.svg)

The natural objection: how can *autocomplete* understand anything? The answer is that predicting the next word well is a brutally demanding task. To predict the word after "the capital of France is," we need **facts**. To continue grammatical sentences, we need **syntax** — internalized, not memorized. To continue "so the answer must be…", we need to have followed the **reasoning** that came before. Prediction doesn't sidestep understanding; done well enough, it *requires* it.

## 10. The unexpected discovery: bigger = smarter

Here's the part nobody fully predicted. As labs scaled these models — more data (millions of words → trillions), more parameters (millions → hundreds of billions), more compute (days of training → months on thousands of GPUs) — the models didn't just get incrementally better at prediction. **New abilities appeared** that nobody explicitly trained: multi-step reasoning, writing code, following instructions. These are called **emergent capabilities**, and their arrival is why the last few years have felt discontinuous.

Scale also flipped the field's economics. The old paradigm was task-specific: one model for translation, another for summarization, another for sentiment. The new paradigm is the **foundation model**: one enormous model trained on everything, steered to any language task by prompting. We stopped building tools from scratch and started building on top of giants.

## 11. Where we are now

Three trends define the current moment:

**Multimodality.** Models aren't just text anymore they see images, hear and produce speech, and operate in real time.

**Reasoning.** The newest models "think before they speak," spending extra compute deliberating before answering and it measurably pays off on math, logic, and code.

**Agents.** The shift from chatbots that *answer* to agents that *act*: using tools, browsing, writing and running code, completing multi-step tasks with a goal instead of a script.

Which brings the story full circle. We started with a definition — intelligence is the ability to achieve goals across a wide range of situations — and seventy years later, the machines are finally being evaluated on exactly that.

## Sources & further reading

- [Karpathy — Intro to Large Language Models (video)](https://www.youtube.com/watch?v=zjkBMFhNj_g) — the best one-hour version of this story
- [3Blue1Brown — Neural networks series](https://www.3blue1brown.com/topics/neural-networks) — the visuals this post can only gesture at
- [Turing, 1950 — Computing Machinery and Intelligence](https://academic.oup.com/mind/article/LIX/236/433/986238) — where "can machines think?" became a testable question
- [Mikolov et al., 2013 — word2vec](https://arxiv.org/abs/1301.3781) — the "words as numbers" breakthrough of section 7
- [Vaswani et al., 2017 — Attention Is All You Need](https://arxiv.org/abs/1706.03762) — the transformer paper behind everything since
- [Kaplan et al., 2020 — Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361) — "bigger = smarter," measured
- [Brown et al., 2020 — Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165) — GPT-3, where scale surprised everyone
- [Ouyang et al., 2022 — InstructGPT](https://arxiv.org/abs/2203.02155) — the RLHF recipe that turned a predictor into ChatGPT


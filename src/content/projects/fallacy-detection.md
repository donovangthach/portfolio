---
title: Fallac-Machine
summary: Fine-tuned OpenAI model that flags 13 types of logical fallacies sentence by sentence, and explains why each one is a fallacy.
tier: secondary
order: 11
tags: [Python, OpenAI API, FastAPI, NLP]
status: Hackathon project
repo: https://github.com/donovangthach/Fallac-Machine
---

## Overview

At QuackHacks 2.0, my team built a logical fallacy detector. Fallac-Machine is the repo I made during the hackathon so anyone can run our model locally with their own OpenAI API key. You give it a passage, and it points out fallacies like ad hominem or false dilemma (it knows 13 types). For each sentence it flags, it returns the fallacy type, the exact characters where it appears, and a short explanation, all as JSON.

## My role

I started with a scikit-learn classifier, but it made the model more complex than it needed to be, so I switched to fine-tuning an OpenAI model on the [LOGIC dataset](https://github.com/causalNLP/logical-fallacy), which is a set of sentences labeled by fallacy type. The detector sends every sentence in one request along with the full passage, because whether a sentence is a fallacy often depends on the sentences around it. I also wrapped it in a FastAPI service with an `/analyze` endpoint, so other apps can send it text and get results back.

## What I'd do differently

I never measured how much better the fine-tuned model was than my scikit-learn version. Right now the only evidence the switch helped is that the outputs looked better to me. Next I want to score both on the same held-out set, with accuracy and F1 for each fallacy type.

---
title: GhostNet
summary: Camera-free monitoring for elderly people that detects falls and tracks heart and breathing rate from WiFi signals.
tier: secondary
order: 10
tags: [Python, PyTorch, ESP32-S3, FastAPI, Snowflake, React]
status: Hackathon project
repo: https://github.com/dalmartin/ghostnet
---

## Overview

My grandma falls a lot around the house, and I wanted a way to know when it happens without putting cameras in her home. GhostNet does it with WiFi. Two ESP32-S3 boards send WiFi signals across a room and record how those signals change, called channel state information (CSI). Walking, falling, and even breathing change the signal in ways a model can learn. Some home WiFi systems already sell motion sensing built on the same idea, so in the long run this could run on hardware a family already owns. We built GhostNet as a team of three at QuackHacks 3.0.

## My Role

I built the heart and breathing rate side. There was no labeled data for our boards, so I made my own: I tracked my heart rate and breathing rate as ground truth while the boards recorded me, generated extra labels from the raw signal with filtering and frequency analysis, and trained an LSTM in PyTorch to estimate both rates. I also trained the fall detection CNN, using data we recorded by falling and walking around in front of the boards.

## What Went Wrong

The live demo failed, and we didn't place. The room was packed, and our ESP32 boards couldn't track that many people at once. It was a hardware limit we couldn't fix at the event.

## What I'd Do Differently

I'd research data collection before the event and look for datasets recorded on chips like ours, or get better hardware. And I'd test in a room as crowded as the demo. This was the second time in a month that a crowded room broke my demo, after [NavigAid](/projects/smartcane/), so now I test in the conditions I'll actually present in.

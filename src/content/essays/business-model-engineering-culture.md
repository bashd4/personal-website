---
title: "Your business model picks your engineering culture"
summary: Why half my Google best-practices checklist went out the window at ClaimKit — unit economics set your technical constraints, and those constraints quietly become your engineering culture.
date: 2026-06-10
---

When I left Google to build ClaimKit, I brought a mental checklist of engineering best practices. Once we locked in our business model, half that list went out the window.

You can choose your team's values, but your engineering culture doesn't exist in a vacuum. Your unit economics heavily influence your technical constraints. Those constraints shape your daily engineering practices, which ultimately bleed into your culture. Let me explain:

At ClaimKit, we are a high-ACV enterprise product. Our constraint isn't compute or latency; it's a flawless quality bar. We built our system to spin up dozens of agents and grind for multiple hours. I don't lose sleep over the compute bill, because as long as the output is flawless and replaces days of manual client labor, the math works. We gladly trade compute margins for cognitive leverage.

Before we had enterprise margins, we built a Slack bot. Our AI budget was practically zero.

When you build for chat, a four-second delay feels broken. That economic reality forced an entirely different engineering culture. We stressed over latency, built aggressive caching layers, and fought over pennies just to keep unit economics out of the red.

This all affects things downstream, e.g., crunch time, deployment cadence, tolerance for technical debt, risk tolerance, and the definition of a P1 bug. These aren't solely philosophical choices; they are largely influenced by your business model.

Business model → Technical constraints ~~> Culture.

---
title: "The Von Neumann AI Agent"
description: "The stored-program architecture that shaped every computer built in the last 75 years turns out to be a surprisingly good lens for understanding how AI agents actually work."
pubDate: 2026-06-03
draft: true
---

In 1945, John von Neumann wrote a draft report describing an architecture for the EDVAC computer. The key insight — the one that changed everything — was that programs and data should live in the same memory. Before this, you programmed a computer by rewiring it. The stored-program concept meant instructions were just another kind of data the machine could read, manipulate, and act on. A computer could now operate on its own description.

Eighty years later, we're building AI agents. And when I look at how they actually work, I keep seeing the same ideas.

## The Architecture

The classical von Neumann machine has four parts: memory, a control unit, an arithmetic-logic unit, and input/output. The control unit runs a simple loop — fetch an instruction from memory, decode it, execute it, repeat. All of computation reduces to this loop running fast enough.

An LLM-based agent has an analogous structure that's worth spelling out explicitly.

**Memory is the context window.** Everything the agent knows in the moment — the system prompt, the conversation so far, tool results, intermediate reasoning — lives in the context window. Like von Neumann memory, it holds both "instructions" (the system prompt, examples, rules) and "data" (the problem at hand). There's no meaningful distinction between the two. A clever system prompt is just a program written in natural language.

**The LLM is the processor.** It runs one operation: given everything in context, produce the next tokens. That's the entire instruction set. There's no branching logic in the model itself, no conditionals, no loops — those emerge from how the output is interpreted and what gets fed back in.

**Tools are I/O.** Web search, code execution, file reads, API calls — all of these are the agent reaching outside its own context to interact with the world. Classic I/O. The tool call is the OUT instruction; the result fed back into context is the IN.

**The orchestrator is the control unit.** Something has to run the fetch-decode-execute loop: call the model, read its output, decide whether to invoke a tool or return a result, feed the result back, repeat. In simple agents this is a few dozen lines of application code. In complex ones it's a framework. But the loop is always there.

## The Stored-Program Insight, Revisited

The thing that made stored-program machines so powerful wasn't just convenience. It was that the boundary between program and data dissolved. A program could generate another program, load it into memory, and run it. Self-modifying code. Compilers. Interpreters. The whole tower of abstraction that makes modern software possible rests on this.

The same dissolution is happening in agents.

When an agent writes a prompt and passes it to a subagent, it's writing a program and running it. When an agent reflects on its own reasoning trace and revises its approach, it's doing something like self-modification. When you build a RAG system where retrieved documents shape the agent's behavior, you've blurred the line between code and data in exactly the von Neumann sense — the "instructions" aren't fixed at deployment time, they're assembled at runtime from external memory.

This isn't a metaphor. It's structurally the same. Instructions are data. Data can become instructions. The context window is the von Neumann memory bus, and the LLM is the processor reading from it.

## The Bottleneck

Von Neumann architecture has a famous problem named after its inventor: the von Neumann bottleneck. The CPU can compute far faster than it can move data to and from memory. The bus between them is the limiting constraint. Most of what we call "computer architecture" — caches, pipelines, SIMD, out-of-order execution — is engineering around this one bottleneck.

Agents have an analogous bottleneck, and it's the context window.

Everything the agent can reason about in a single inference pass must fit in context. Relevant history, retrieved documents, intermediate state, tool results — all competing for the same fixed budget. When the context fills up, you have choices, and none of them are free: truncate (lose history), summarize (lose fidelity), use external memory with retrieval (add latency and retrieval errors), or switch to a model with a larger window (add cost). These are the agent equivalent of cache hierarchy decisions.

The research community has been working on this just like computer architects worked on the memory wall. Longer context windows (bigger L1 cache). Better attention mechanisms (faster bus). External memory stores with learned retrieval (hierarchical memory). We're deep in the "work around the bottleneck" phase and it's not clear when or whether there's a clean solution.

## Self-Replication

Late in his life, von Neumann became interested in a different question: could a machine build a copy of itself? He worked out the theoretical requirements — what a self-replicating automaton would need — and showed it was possible. The key ingredient was a universal constructor: a component that could read a description of any machine and build it.

Modern agent frameworks have this shape. An orchestrating agent receives a task, decomposes it into subtasks, and spawns specialized subagents to execute them. The orchestrator is the universal constructor; the task description is the program tape. The subagents are copies, or near-copies, of the same underlying model running different prompts.

This gets stranger when agents can write prompts for other agents, or when a meta-agent learns from agent traces to improve future agent prompts. At that point you have something that modifies its own replication mechanism. Von Neumann didn't build this, but he described the logical requirements for it. We're now building the described thing and discovering the edge cases he didn't have time to reach.

## What This Framing Buys You

I'm not claiming AI agents are von Neumann machines in any precise technical sense. They're not. The model doesn't execute instructions in any formal way; it does something far messier and more interesting.

But the architectural frame is useful because it forces precision about what the different parts of an agent system actually are and where the constraints live. When an agent fails, it's usually failing in one of these components: the context is polluted or missing critical information (memory problem), the model is making reasoning errors (processor problem), a tool returned bad data (I/O problem), or the orchestration loop has a bug (control unit problem). Naming these separately helps you debug and design.

It also helps you notice which problems are deep and which are shallow. The context bottleneck is the von Neumann bottleneck — it's structural, it's not going away without fundamental architectural change, and working around it has costs. The reasoning errors are more like software bugs — improvable, model-dependent, likely to get better with scale and training. Knowing which category your problem falls into sets the right expectations for how hard it will be to fix.

Von Neumann built his architecture as a practical tool for doing science faster. He wanted to run ballistics calculations. What he created instead was the conceptual scaffolding for an entire civilization's worth of computation. It would be very on-brand if the architecture of AI agents turns out to matter more than the agents themselves.

refs
https://pluralistic.net/2025/05/14/pregnable/#checkm8
https://github.com/cyberpapiii/chipotlai-max

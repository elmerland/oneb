---
title: "Maximum virtual product: The new way to prototype software"
description: LLMs made maximum viable products affordable! What are they, and how do they change the SDLC?
pubDate: 2026-06-12
---

The methodologies for developing large software systems have evolved to optimize for the unit economics of the moment. LLMs have changed the cost of creating a maximum virtual product for large software projects. As a result, we need to re-prioritize the prototyping phases of the software development lifecycle.

A maximum virtual product is “a hyperrealistic, exquisitely detailed model”[^1] used during the planning and prototyping phase of a project. The term was introduced in *How Big Things Get Done*. Whereas a minimum viable product is a great fit for small-scale or easy-to-reverse projects, they are not well-suited for large, hard-to-undo projects. In these cases, a maximum virtual product enables extensive simulation and experimentation before executing a plan.

Software is thought of as an easy-to-reverse work product. Which is true, until it isn’t. A piece of software is less fungible as soon as people rely on it.

Software can be both a prototype and the final result. The difference depends on context. The relative expense of writing code influences whether it is likely to be used as a prototype[^2]. Up until recently, writing a high-fidelity software prototype was always an expensive endeavor. Back in the waterfall[^3] days, a *program design* was synonymous with a prototype. A program design, however, is a poor prototype because it fails to stress-test theory against practical realities. An interface mockup doesn’t address the ergonomics of how clients will use it. A program design doesn’t make the designer feel the pain of having to click 10 different places to perform an action.

![The waterfall model as a cascade of stages: System Requirements, Software Requirements, Analysis, Program Design, Coding, Testing, and Operations](../../assets/maximum-virtual-product/waterfall.png "The waterfall software development lifecycle (Royce, 1970)")

The agile manifesto and related agile methodologies, such as extreme programming[^4] and scrum, de-emphasize the program design phase by slicing a project’s scope into small functional increments. The result is increased coding velocity at the cost of deferring system-wide design decisions. Smaller, earlier, narrow-in-scope, naive decisions then have time to calcify. Now the project is at a point where system-wide changes are expensive. Thus, the premature functional slicing of a large project increases its own development cost. Said another way: the project feels fast at the start, and devolves into a slog. Naturally, teams end up with a water-scrum-fall hybrid process. Adopting an iterative approach *after* the big design decisions are made.

![Extreme Programming flow chart: Unfinished Features feed into Most Important Features, then a continuous loop of Iterative Planning, Honest Plans, Working Software, Daily Communication, and Team Empowerment around “A Project Heartbeat”](../../assets/maximum-virtual-product/agileflowchart.gif "The Extreme Programming (XP) project cycle")

And then the LLMs came. AI coding agents have made writing code way cheaper — code quality notwithstanding. The limiting factor of LLM-based code production is a sufficiently detailed prompt. This means that “hyperrealistic, exquisitely detailed model[s]” of software are within reach of most teams! It is easy to create an *arbitrary* number of high-fidelity software prototypes.

Now the program design phase can start with a maximum virtual product (many versions of it), followed by hands-on testing, then by requirement refinement. Repeat until satisfied! The load-bearing decisions of a project do not have to follow a philosophical and bureaucratic process. Instead, they follow high-quality feedback from the team’s hands-on testing.

[^1]: [How Big Things Get Done](https://sites.prh.com/how-big-things-get-done-book), Dan Gardner and Oxford professor Bent Flyvbjerg (ch. 4, "Pixar Planning," p. 78)

[^2]: [Sixty Years of Software Development Life Cycle Models](https://ieeexplore.ieee.org/document/8047358)

[^3]: [MANAGING THE DEVELOPMENT OF LARGE SOFTWARE SYSTEMS](https://www.praxisframework.org/files/royce1970.pdf)

[^4]: http://www.extremeprogramming.org

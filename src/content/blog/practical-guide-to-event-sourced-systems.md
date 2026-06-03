---
title: "Practical Guide to Event-Sourced Systems"
description: "Event sourcing sounds elegant in theory. In practice it comes with sharp edges. Here's what I've learned building and operating event-sourced systems at scale."
pubDate: 2026-06-02
draft: true
---

Event sourcing is one of those ideas that feels obvious in hindsight. Instead of storing the current state of your data, you store the sequence of events that led to it. Your database becomes an append-only log. State is a derived artifact, not the source of truth. On paper, it's beautiful.

In practice, you will spend the first three months thinking you made a terrible mistake.

This post is for engineers who are either evaluating event sourcing or are knee-deep in one and wondering why nobody warned them. I'll cover the core mechanics, the parts that actually work well, and the parts that will bite you if you're not careful.

## What event sourcing actually is

The core idea: every change to application state is captured as an immutable event and appended to a log. To get current state, you replay the events. To audit history, you already have it. To rewind and replay with different logic, you can.

A naive example. Instead of storing:

```json
{ "account_id": "acct_123", "balance": 450 }
```

You store:

```
AccountOpened    { account_id: "acct_123", initial_balance: 500 }
MoneyWithdrawn   { account_id: "acct_123", amount: 100, at: "2026-01-15T14:00:00Z" }
MoneyDeposited   { account_id: "acct_123", amount: 50,  at: "2026-01-20T09:30:00Z" }
```

Balance is `500 - 100 + 50 = 450`. You derive it, you don't store it.

This sounds like more work — and it is. What you get in return is an audit log that was never an afterthought, the ability to project the same data into multiple read models, and a complete history of what happened and when.

## The parts that actually work

**Audit logging becomes free.** In a CRUD system, audit logs are always bolted on. Someone adds a trigger here, a middleware hook there, and six months later half the mutations are unlogged and nobody knows which half. With event sourcing, the log *is* the system. There's nothing to bolt on.

**Temporal queries become natural.** "What did this account look like on March 1st?" is a replay to a specific timestamp. In a CRUD system, this requires either point-in-time snapshots (painful to set up) or bitemporal tables (painful to query). In an event-sourced system, it falls out of the model.

**Debugging production issues gets easier.** When something goes wrong, you have a complete, ordered record of everything that happened to the affected entity. Not what state it was in when you noticed — what *happened*, in sequence, from the beginning.

**Multiple read models from one write model.** Your events are facts. You can project those facts into whatever shape your readers need — a relational table for reporting, a denormalized document for fast reads, a graph for traversal. Each projection can be rebuilt from scratch if you change your mind.

## The parts that will bite you

**Schema evolution is hard.** In a CRUD system, you run a migration and you're done. In an event-sourced system, old events are immutable — you can't retroactively change them. When `MoneyWithdrawn` needs a new required field, you have three options: upcasting (transform old events at read time), versioned event types (`MoneyWithdrawnV2`), or weak schema with optional fields everywhere. All three have trade-offs. Think about this *before* you ship.

**Eventual consistency is the norm, not the exception.** Your write model (the event log) and your read models (projections) are eventually consistent. If a user deposits money and immediately checks their balance, the projection may not have caught up yet. You need a story for this — usually optimistic UI updates or accepting the latency.

**Snapshots become necessary at scale.** Replaying 100 events to get current state is fine. Replaying 100,000 is not. You'll need to periodically snapshot state so that replay starts from a recent checkpoint, not the beginning of time. Snapshots introduce their own consistency and storage concerns.

**Event ordering in distributed systems is genuinely hard.** If events can come from multiple producers, you need to reason carefully about ordering guarantees. Kafka gives you ordering within a partition. Most databases give you a sequence number within a transaction. Across partitions or services, you're on your own — vector clocks, causal ordering, or accepting that some events are unordered.

**Deleting data conflicts with the model.** GDPR's right to erasure and append-only logs are philosophical opposites. The common answers are: encrypt events per-user and delete the key (crypto-shredding), store PII outside the log and reference it by ID, or use a separate deletion event that downstream consumers must respect. None of these are clean.

## A rough architecture

For most teams, a practical event-sourced system looks like this:

- **Event store**: an append-only table (or Kafka topic) with `(stream_id, sequence_number, event_type, payload, recorded_at)`. PostgreSQL works fine at moderate scale. EventStoreDB or Kafka for higher throughput.
- **Aggregate**: the domain object that decides whether a command is valid and produces events. It reconstructs itself from its event stream before handling each command.
- **Projections**: background processes that consume events and write to read-optimized stores. Usually a separate table per projection, updated via a subscription or polling loop.
- **Command handlers**: accept user intent, load the aggregate, call domain logic, persist resulting events, return.

The write path is: command → load aggregate (replay or snapshot) → validate → emit events → append to store. The read path is: query projection. These paths are completely separate.

## When to use it

Event sourcing adds real complexity. It's worth it when:

- You have genuine auditing requirements (financial systems, healthcare, anything regulated)
- Your domain has multiple consumers that need the same data in different shapes
- You need to support temporal queries or replaying history
- Your domain logic is complex and you want a clean separation between write and read models

It's probably not worth it when:

- Your app is a straightforward CRUD form builder
- You have a small team without prior experience in the pattern
- Your data has no meaningful history (config, settings, preferences)

## Starting small

If you're starting fresh, don't try to event-source everything. Pick one bounded context where the audit trail or temporal queries provide clear value. Get comfortable with the pattern — the projections, the snapshotting, the schema evolution — before you expand. The temptation is to boil the ocean. Don't.

If you're retrofitting an existing system, start by adding an outbox table that captures change events alongside your existing mutations. Consumers can start subscribing to that event stream without you having to rewrite the write model yet. It's a gentler on-ramp.

---

Event sourcing is a tool, not a religion. Used where it fits, it solves real problems elegantly. Used everywhere, it turns a simple CRUD app into a distributed systems dissertation. Know the trade-offs before you commit.

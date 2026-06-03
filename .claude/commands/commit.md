---
description: Create a git commit following my conventions; push if asked
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git diff:*), Bash(git commit:*), Bash(git push:*), Bash(git branch:*), Bash(git rev-parse:*)
argument-hint: [summary hint] [and push]
---
# Commit

## Context
- Status: !`git status --short`
- Staged diff: !`git diff --cached`
- Unstaged diff: !`git diff`
- Current branch: !`git rev-parse --abbrev-ref HEAD`

## Task

Parse `$ARGUMENTS` first:
- If it contains "and push" (or ends in "push"), set PUSH=true and strip that phrase. Otherwise PUSH=false.
- Whatever remains is the subject hint. May be empty.

Stage changes:
- If nothing is staged, run `git add -A`.
- If something is already staged, commit only what's staged.

Write the commit message following these rules:
- Conventional Commits format: `type(scope): subject`
- Subject line imperative mood, under 50 chars, no trailing period
- If a subject hint was passed, use it as the subject
- Always add a body except for exceedingly simple changesets. wrap at 72 chars, explain why not what
- No em-dashes anywhere
- No filler words (just, really, basically, simply)
- Direct and punchy
- Keep the Claude co-author trailer

Commit with the generated message.

If PUSH=true:
- Push to the current branch's upstream: `git push`
- If no upstream is set, run `git push -u origin <current-branch>`

Output:
- The full commit message used
- Success/failure of the commit
- If pushed, success/failure of the push and the remote/branch

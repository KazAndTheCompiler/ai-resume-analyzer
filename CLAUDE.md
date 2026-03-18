# ai-resume-analyzer — Claude Context

## What it is
100% free, local AI resume analyzer. PDF parsing client-side, analysis via local LLM (Ollama), ATS scoring, job description matching. No cloud, no API costs. Public repo.

## Stack
React + Vite + TypeScript + Tailwind CSS. Local LLM via Ollama. Data stored in IndexedDB. No backend server.

## Status
Shipped. Public on GitHub.

## Key constraint
Everything runs client-side or against a local Ollama instance. If Ollama isn't running, the AI features don't work. This is intentional — keep it that way.

## Notes
Part of a cluster with `ai-interview-coach` — same tech stack, same "free + local LLM" philosophy. Both are standalone Vite apps.

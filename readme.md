# 🌀 Cognitive Conditioning Research Study 🌀

_A hypnotic web experience_

## Project Overview

This is an experimental hypnotic web application designed around the trope of:  
_“You visit a research study website… and it slowly trains and conditions you.”_

The project focuses on:

- ✅ **Gradual induction** (relaxation, breathing)
- ✅ **Interactive hypnotic loops** (clicker mechanics, simple tasks, juicy feedback)
- ✅ **Progressive onboarding** (consent → personalization → induction → compliance tasks)
- ✅ **Mobile-friendly** — designed to feel immersive on both desktop & phone
- ✅ **Modular & extensible** — supports future skins/tropes (e.g. “nefarious relaxation app”)

## Current Features (MVP)

- Consent screen
- Personalization screen (name, pronouns)
- Phase 1: Relaxation + breath pacing loop
- App state driven by Choo store + event system
- Mobile-first layout

## Tech Stack

| Layer            | Tool                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| App Framework    | [Choo.js](https://github.com/choojs/choo) (imported global)           |
| UI Components    | nanohtml (global)                                                     |
| Styling          | Tachyons CSS                                                          |
| Audio            | Tone.js (global) — for pulse, background layers                       |
| Optional visuals | p5.js (planned for future phases)                                     |
| Structure        | Layouts system → `layouts-dictionary.js` → MainView dispatches layout |
| State            | Choo store — modular per phase                                        |
| Components       | Modular UI components                                                 |

## Architectural Notes

- **Phase system:** Each phase has its own store module (clean separation of state and event logic)
- **Layouts:** Layout = full-screen "screen". MainView swaps layouts based on `state.currentLayout`
- **Components:** Reusable UI elements
- **State flow:** Choo event-driven (`emit` → update state → render)
- **Mobile first:** All screens are designed to work smoothly on phone (touch events supported)

## Project Goals

- Build a **modular hypnotic game engine** extensible to multiple MC/fantasy tropes
- Explore pacing, language, and interaction patterns for **effective interactive hypnosis** experiences
- Placeholder: further documentation will outline setup steps and contributor guidelines.

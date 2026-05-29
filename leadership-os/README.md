# Leadership Learning OS

> Simulador de entrenamiento de liderazgo con avatares para supervisores.  
> Anti-attrition · Conversational practice · No login required.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | HTML/CSS/JS puro — sin frameworks |
| AI | Groq API · Llama 3.3 70B |
| Hosting | GitHub Pages (HTTPS) |
| Progress | Supabase — sesión anónima por browser |
| Voice | Web Speech API (Chrome + Meta Quest 3) |

---

## Architecture

```
leadership-os/
  index.html          ← Shell HTML — all screens, loads all modules
  css/
    styles.css        ← All styles — CSS variables, components
  js/
    archetypes.js     ← Employee avatar data objects (Carlos, Valeria, Miguel, Sandra)
    techniques.js     ← Technique data (Active Listening, Powerful Questions)
    prompts.js        ← System prompt generators — built from archetype + technique + level
    api.js            ← Groq callGroq() + Supabase saveSessionProgress()
    ui.js             ← DOM helpers, voice, chat render, mood/box meters, glossary
    app.js            ← State + all mode logic (learn, work, practice, eval)
  README.md
```

**Load order**: `archetypes → techniques → prompts → api → ui → app`  
Each module depends on globals set by earlier modules.

---

## Features (v4)

### Modes
- **Learn** — Alex teaches the technique conversationally (Socratic, 4 stages)
- **Work Together** — Socratic thinking partner for real supervisor cases
  - Submode: Deep reflection (Socratic)
  - Submode: Urgent (direct, action-first)
- **Practice** — Conversation simulator with dynamic employee avatar

### Practice System
- **3 levels**: Novice / Practitioner / Fieldwork
- **Dynamic briefings** — random per level, different starting states
- **Pre-reflection** — one conversational question before entering
- **Mood tracking** — non-linear, can go back down
- **Box indicator** — in/out-of-box (Arbinger framework)
- **Hinge moments** — personal doors the avatar opens
- **Yes-but pattern** — realistic resistance behavior
- **Conversation can close** (Fieldwork only)
- **AI evaluation** — 4 sections + technique recap

### Architecture wins over v3
- **No hardcoded character names** in prompts — all from archetype data
- **No hardcoded technique names** in prompts — all from technique data
- **Briefings live in archetypes.js** — easy to add scenarios
- **Prompts are functions** — `PROMPTS.learn()`, `PROMPTS.avatar(level)` etc.
- **Supabase scaffold ready** — just add URL + anon key

---

## Archetypes

| Avatar | Trait | Status |
|---|---|---|
| Carlos Mendoza | Defensive | ✅ Active |
| Valeria Reyes | Withdrawn | 🔒 v4.1 |
| Miguel Torres | Anxious | 🔒 v4.1 |
| Sandra Okafor | Burned out | 🔒 v4.1 |

---

## Techniques

| Technique | Philosophy | Status |
|---|---|---|
| Active Listening | Leadership & Self-Deception (Arbinger) | ✅ Active |
| Powerful Questions | Co-Active Coaching / Immunity to Change | 🔒 v4.1 |

---

## Supabase Setup

1. Create project at supabase.com
2. Run this SQL:

```sql
create table sessions (
  id uuid default gen_random_uuid() primary key,
  session_id text not null,
  archetype text,
  technique text,
  level text,
  mood_final int,
  box_final text,
  completed_at timestamptz default now(),
  eval_summary text
);

-- Enable anonymous inserts
alter table sessions enable row level security;
create policy "anon insert" on sessions for insert to anon with check (true);
create policy "own read" on sessions for select to anon using (session_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

3. Fill in `api.js`:
```js
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

---

## GitHub Pages Deploy

```bash
git init
git add .
git commit -m "Leadership OS v4"
gh repo create leadership-os --public --push --source=.
# Then: Settings → Pages → Deploy from main branch /root
```

---

## Roadmap

### v4.1 — Unlock archetypes + second technique
- [ ] Valeria, Miguel, Sandra (data already in archetypes.js)
- [ ] Powerful Questions technique (data already in techniques.js)
- [ ] Technique selector UI on welcome screen
- [ ] Archetype selector on level screen

### v4.2 — Supabase progress
- [ ] Fill SUPABASE_URL + SUPABASE_ANON_KEY
- [ ] Progress dashboard — past sessions by archetype/technique
- [ ] Streak tracking

### v4.3 — WebXR (Meta Quest 3)
- [ ] WebXR scene for immersive practice
- [ ] Spatial audio for TTS
- [ ] Hand tracking for navigation

### v5 — Multi-supervisor cohort
- [ ] Team progress view (Supabase shared)
- [ ] Manager assigns scenarios to team
- [ ] Leaderboard (opt-in)

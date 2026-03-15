# Flows - Concept Discussion

## Understanding Flows

A **Flow** is essentially a **pre-configured AI working environment** that bundles together:

1. **Skills** - Specialized instructions/behaviors
2. **Docs** - Pre-indexed documentation libraries
3. **Private Repos** - User's own codebase context (PRO feature)
4. **System Prompts/Preferences** - How you want Claude to behave, respond, format things

The pain point being solved: **"I type so much to start every session"** - getting Claude into the right headspace takes forever.

---

## Questions to Clarify the Vision

### 1. Flow Composition
What exactly goes into a Flow?

| Component | Example |
|-----------|---------|
| **Skills** | `neobrutalist-design`, `typescript-strict`, `testing-playwright` |
| **Docs** | React, TailwindCSS, Drizzle ORM |
| **System Prompt** | "You are an expert UI designer. Always suggest 3 options..." |
| **Private Repos** | `~/personal/nexus` (PRO only) |
| **Preferences** | Response format, verbosity level, emoji usage |

Is this the right mental model?

### 2. Starter Flow Packs
"Starter flow packs" - options:

**Option A: Curated by Nexus**
- "React + TypeScript Expert"
- "Testing & QA Engineer"
- "UI/UX Designer"
- "New Project Bootstrap"

**Option B: Community-created**
- Users can publish their flows
- Others can install/fork them

**Option C: Both**
- Official starter packs + community marketplace

### 3. Switching Flows
How do you envision switching? 

- **In-session**: `/flow ui-designer` command mid-conversation?
- **Session start**: Pick a flow when starting a new session?
- **Automatic**: Based on the project directory you're in?

### 4. Flow vs Skill - Key Differences

| | Skill | Flow |
|---|---|---|
| **Scope** | Single capability | Complete working environment |
| **Contains** | Instructions for one task | Skills + Docs + Repos + Prefs |
| **Example** | "Write tests with Playwright" | "QA Engineer" (includes testing skill, Playwright docs, testing prefs) |
| **Switching** | Can stack multiple | Switch between (one active at a time?) |

Is this distinction right?

### 5. Pricing Model
Mentioned:
- Part of pay-for-use
- Allow one free flow?

Ideas:
- **Free tier**: 1 custom flow OR use any starter pack
- **PRO ($5/mo)**: Unlimited custom flows + private repos in flows
- **Flow marketplace**: Some free, some paid (creator monetization?)

### 6. "Extreme Level of Detail"
When you say you want to start with extreme detail - do you mean:

**A) The Flow definition itself is very detailed**
- Extensive system prompts
- Specific formatting rules
- Detailed behavior instructions

**B) A Flow creation wizard that asks lots of questions**
- "How verbose should responses be?"
- "What frameworks do you use?"
- "Preferred testing style?"

**C) Both** - Deep customization with guided setup

---

## Initial Data Model Sketch

```
Flow
├── id
├── name ("UI Designer Mode")
├── description
├── systemPrompt (the "personality"/instructions)
├── skills[] (references to skills)
├── libraries[] (references to docs)
├── privateRepos[] (PRO only)
├── preferences {
│   ├── verbosity: "concise" | "detailed"
│   ├── codeStyle: "minimal" | "documented"
│   ├── responseFormat: "markdown" | "plain"
│   └── ...
│ }
├── isPublic (for marketplace)
├── isStarterPack (official)
├── createdBy (user)
└── installCount
```

---

## Open Questions

1. **What's a Flow you'd create for yourself right now?** Walk through the components - this will help understand the granularity.

2. **Should Flows be stackable or exclusive?** (Can I be in "UI Designer" + "TypeScript Expert" or just one at a time?)

3. **Where does Flow switching happen?** In the Nexus web UI? In Claude Code CLI? Both?

4. **Private repos in Flows** - Is this just a reference/shortcut, or does it pre-index the repo?

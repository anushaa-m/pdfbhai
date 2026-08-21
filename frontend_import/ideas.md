# QuizAI — Design Direction

## Three Directions Considered

| Theme Name | Very Brief Intro | Probability |
|---|---|---:|
| Scholarly Current | An editorial learning workspace that combines indigo ink, paper-white surfaces, and measured movement to make study feel purposeful and calm. | 0.07 |
| Library Lantern | A warm, bookish interface with archival paper tones and soft botanical accents, designed to feel like a contemporary private study. | 0.04 |
| Campus Blueprint | A structured, architectonic system inspired by campus wayfinding, using disciplined grids, cobalt blue, and fine technical rules. | 0.08 |

## Chosen Direction: Scholarly Current

### Design Movement

**Contemporary editorial design** meets a calm, high-utility academic product interface. The result is light, precise, and tactile without resembling a generic startup dashboard.

### Core Principles

1. **Learning has rhythm:** content moves through clear stages — capture, understand, practice, reflect — using timeline and progress motifs rather than decorative spectacle.
2. **Purposeful asymmetry:** the landing page pairs large type with layered learning artifacts; dashboards use an anchored sidebar and modular content bands.
3. **Academic warmth:** paper-white backgrounds, ink-like text, and soft cobalt accents make long study sessions feel trustworthy and legible.
4. **Quiet feedback:** movement is restrained, rapid, and informative; every animation acknowledges learning progress or user intent.

### Color Philosophy

The interface starts with warm **Paper** (#F8F9FC) and deep **Ink Navy** (#18233B), then uses **Scholarly Cobalt** (#3B63E8) as the unmistakable action and progress color. A misty periwinkle supports conceptual learning moments, while a desaturated teal conveys positive completion. This soft, high-contrast scheme is designed to keep the material primary and technology secondary.

### Layout Paradigm

The public experience follows a **learning ribbon**: a wide asymmetric hero flows into an illustrated journey, then a staggered sequence of teaching surfaces. Product screens use a **notebook workbench**: a persistent rail, a broad study canvas, and light contextual panels. The result avoids a single centered marketing column and makes each screen feel like a functional place to learn.

### Signature Elements

1. **Learning-thread connectors:** thin cobalt lines that visually join notes, concepts, questions, and progress states.
2. **Layered study artifacts:** softly shadowed document, concept, and question cards that overlap with careful hierarchy.
3. **Margin annotations:** small uppercase labels and subtle rule lines that give pages an editorial study-guide cadence.

### Interaction Philosophy

Controls respond with clear, tactile confirmation. Hover states elevate a study artifact by only a few pixels, selection states rely on a cobalt border and a check indicator rather than color alone, and task states remain explicit. Simulations are clearly frontend-only and use local state so their future API seams stay clean.

### Animation

Motion uses Framer Motion and stays under 300ms for everyday UI. Cards reveal on scroll with a 40–70ms stagger and gentle upward movement. The learning-thread fills as workflow steps enter view; progress values count up once in the viewport; quiz questions crossfade and translate horizontally. All non-essential animation must pause under `prefers-reduced-motion`.

### Typography System

**DM Serif Display** provides confident, academic display headlines, while **Manrope** handles readable UI, data labels, and body copy. Headlines use compact tracking and generous line-height; small caps label study stages and dashboard categories; interactive text remains 14px or larger.

### Brand Essence

**QuizAI turns your own course material into an organized, reflective practice space for learners who want to understand — not just complete — their work.**

Personality: **considered, encouraging, lucid**.

### Brand Voice

Headlines are direct and learning-first; CTAs name the action and avoid hype; microcopy gives the learner a useful next step.

> “Build practice around the notes you already trust.”

> “You’re getting stronger in Regression. Give Classification one focused review.”

### Wordmark & Logo

The mark is a **folded-study-sheet monogram**: two offset cobalt pages form a precise `Q` loop with a small ink-navy checkmark opening. It appears as a strong standalone icon, paired with a custom-weighted QuizAI wordmark in the interface.

### Signature Brand Color

**Scholarly Cobalt — #3B63E8**

## Style Decisions

- Product screens use the **notebook workbench** structure: a persistent academic rail or margin system, a broad study canvas, and contextual panels remain visible across dashboard, upload, quiz, and results flows.
- **Scholarly Cobalt #3B63E8** is reserved for primary actions, progress, selection, and learning-thread connectors; secondary pastels are used only when they communicate a named learning state.
- Learner-facing copy never leads with implementation language. Any prototype disclosure remains secondary to reflective study guidance.

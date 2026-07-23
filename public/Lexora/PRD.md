# Lexora Web MVP — Product Requirements Document

> **Product:** Lexora — AI Knowledge Companion  
> **Document type:** Product Requirements Document  
> **Version:** 1.0  
> **Status:** Draft for founder approval  
> **Primary surface:** Desktop Web, optimized for macOS browsers  
> **Primary language:** Simplified Chinese with canonical English terminology  
> **Last updated:** 2026-07-20  
> **Owner:** Product

---

## 0. Document purpose

This document defines what the Lexora Web MVP must do, why each capability exists, how it should behave, and how the team will determine whether it is complete.

It is intended to support:

- Founder review.
- Product scope control.
- Design and engineering task breakdown.
- QA test planning.
- AI quality evaluation.
- Beta release decisions.

This document does not contain implementation code.

### 0.1 Related documents

| Document | Purpose |
|---|---|
| [`design.md`](design.md) | Approved Web UI system and interaction specification |
| [`PRODUCT_TECHNICAL_DESIGN.md`](PRODUCT_TECHNICAL_DESIGN.md) | Technical architecture and data-model foundation |
| [`docs/design/lexora-web-light.png`](docs/design/lexora-web-light.png) | Approved Light visual baseline |
| [`docs/design/lexora-web-dark.png`](docs/design/lexora-web-dark.png) | Approved Dark visual baseline |

### 0.2 Decision precedence

When documents conflict:

1. This PRD defines current product scope and behavior.
2. `design.md` defines current Web UI behavior and visual implementation.
3. `PRODUCT_TECHNICAL_DESIGN.md` defines reusable backend and data architecture.

The following earlier decisions are superseded for the current MVP:

- **Web-first replaces iOS-first.**
- **Mac desktop browser is the primary validation surface.**
- **Search replaces Home as the default authenticated entry.**
- iOS and iPad applications are deferred until the Web learning loop is validated.

---

# 1. Executive Summary

## 1.1 Product definition

Lexora is an AI professional knowledge companion that helps users understand, connect, remember, and manage unfamiliar specialist concepts.

Lexora is not a conventional dictionary and not a generic chatbot.

Its fundamental product unit is:

> A canonical professional concept connected to a bilingual explanation, typed knowledge relationships, a personal learning card, review history, and Tutor context.

## 1.2 User promise

When a user encounters an unfamiliar professional term, Lexora should help them:

1. Resolve what the term means in the correct domain.
2. Understand it in Chinese while retaining canonical English terminology.
3. Move from a simple explanation to a deeper explanation.
4. See how it connects to nearby concepts.
5. Save it without manually creating study material.
6. Review it later and track mastery.

## 1.3 MVP hypothesis

The MVP tests:

> Users will return to a concept-learning product when every search becomes a persistent part of their personal knowledge system rather than a disposable answer.

## 1.4 Core learning loop

```text
Search
  → Disambiguate
  → Understand
  → Connect
  → Save
  → Review
  → Update mastery
  → Reuse knowledge
```

## 1.5 MVP outcome

The MVP is successful if qualified users:

- Search professional concepts repeatedly.
- Save a meaningful portion of searched concepts.
- Return to review saved concepts.
- Use related concepts to continue learning.
- Prefer Lexora over repeating the same workflow across search, AI chat, notes, and flashcard tools.

---

# 2. Product Vision and Positioning

## 2.1 Vision

Lexora aims to become the personal knowledge layer between professional reading and durable understanding.

Long-term:

- Any unfamiliar term can become a structured concept.
- Every concept can connect to the user's existing knowledge.
- Every learning interaction can improve future explanations and review.
- Papers, courses, notes, and conversations can feed the same personal knowledge network.

## 2.2 MVP positioning statement

For Chinese-speaking postgraduate students and early-career knowledge workers who regularly read English professional material, Lexora is an AI knowledge companion that turns unfamiliar terms into bilingual explanations, connected concepts, and reviewable learning cards.

Unlike dictionaries, note tools, or generic AI chat, Lexora preserves each search as part of a personal knowledge network.

## 2.3 Product principles

### Principle A — Understanding before memorization

Lexora must not force a user to save or review a concept before they understand it.

### Principle B — Canonical knowledge, personal learning

Concept identity and validated explanations are shared. Notes, cards, mastery, and conversations are private.

### Principle C — Progressive depth

Simple explanations are the default entry. Deep explanations are available without requiring a new search or chat.

### Principle D — Relationships need meaning

Related concepts must use human-readable relationship labels. A visually connected graph without semantic labels is insufficient.

### Principle E — AI output is not automatically truth

Generated content must be structured, source-aware, versioned, and capable of displaying uncertainty.

### Principle F — The MVP must remain solo-developer feasible

Prefer a focused product workflow and managed infrastructure over broad platform capabilities.

---

# 3. Target Users

## 3.1 Primary target

Chinese-speaking postgraduate students and early-career researchers who:

- Read English AI/ML, biomedical, biological, or interdisciplinary material.
- Encounter unfamiliar terms several times per week.
- Need both accessible and technically useful explanations.
- Already use a desktop browser for study and research.
- Want to remember concepts but do not consistently author flashcards.

## 3.2 Secondary target

- AI/ML engineers entering biomedical or research domains.
- Medical and life-science learners reading technical English.
- Product managers and analysts working across technical fields.
- Serious self-learners studying AI, biology, medicine, or engineering.

## 3.3 Non-target users for MVP

- Users seeking medical diagnosis or treatment decisions.
- Young children or casual vocabulary learners.
- Teams requiring collaborative knowledge bases.
- Users primarily seeking social learning or shared decks.
- Users whose main requirement is offline-only AI.

## 3.4 Primary persona

### Persona: Lin, interdisciplinary postgraduate student

**Background**

- 24 years old.
- Chinese native speaker.
- Reads English papers about AI medicine.
- Uses a MacBook as the primary study device.

**Behavior**

- Reads PDFs, papers, documentation, and research summaries.
- Encounters medical and ML terms in the same session.
- Searches terms in multiple tabs.
- Saves some notes but rarely returns to them.

**Goals**

- Understand an unfamiliar term in under two minutes.
- Know whether a term is a disease, method, metric, model, or biomarker.
- See what prerequisite concepts are missing.
- Remember important terms for future reading.

**Pain points**

- Wikipedia is often too long.
- Translation loses domain meaning.
- Generic AI answers do not persist.
- Notion requires manual organization.
- Anki requires manual card writing.

**Success moment**

Lin searches “Amyloid β,” understands it, saves it, and immediately sees its relation to Alzheimer's disease and Tau protein. Two days later, Lexora asks a useful recall question.

---

# 4. Jobs to Be Done

## 4.1 Functional jobs

### JTBD-01 — Resolve a term

When I encounter an unfamiliar professional term, help me identify the correct meaning so I can continue reading.

### JTBD-02 — Understand at the right depth

When an expert definition is too dense, give me a simple explanation first and let me deepen it without starting over.

### JTBD-03 — Preserve canonical language

When I learn in Chinese from English material, keep the correct English term, acronym, and pronunciation visible.

### JTBD-04 — Connect knowledge

When I understand one concept, show how it relates to concepts I already know or should learn next.

### JTBD-05 — Save without authoring

When a concept matters, turn it into a useful learning card without making me design a flashcard.

### JTBD-06 — Review efficiently

When I return later, ask a focused question and schedule the next review based on my recall.

### JTBD-07 — Ask contextual questions

When the fixed explanation is not enough, answer a follow-up question grounded in the selected concept and its relationships.

## 4.2 Emotional jobs

- Reduce anxiety when reading unfamiliar expert material.
- Feel that professional knowledge is navigable.
- Feel continuity across study sessions.
- Avoid feeling overwhelmed by a giant syllabus.
- Trust that the product distinguishes fact, simplification, and uncertainty.

## 4.3 Social jobs

Social features are outside MVP, but the product should help users:

- Participate more confidently in academic discussions.
- Recognize terminology during meetings.
- Explain concepts accurately to peers.

---

# 5. User Problems

| ID | Problem | Current workaround | Product response |
|---|---|---|---|
| P-01 | Definitions are too technical | Search multiple sources | Simple/deep explanation |
| P-02 | Translation loses domain meaning | Translate and search again | Bilingual canonical concept |
| P-03 | Acronyms are ambiguous | Guess from context | Domain disambiguation |
| P-04 | Search answers are disposable | Re-search later | Persistent concept record |
| P-05 | Notes become fragmented | Manual Notion linking | Canonical identity and relationships |
| P-06 | Flashcard creation is work | Skip review | Automatic Knowledge Card |
| P-07 | Related concepts lack structure | Browse hyperlinks | Typed knowledge path |
| P-08 | Generic AI answers are hard to trust | Verify manually | Sources and content status |
| P-09 | Learning progress is unclear | Count notes/cards | Mastery and due states |
| P-10 | Cross-domain terms cause confusion | Open domain-specific references | Domain-aware resolution |

---

# 6. Product Scope

## 6.1 MVP must include

### Account

- Sign in.
- Session persistence.
- Basic onboarding.
- Preferences.
- Account deletion.

### Search

- English, Chinese, acronym, and phrase search.
- Exact and approximate matching.
- Domain filtering.
- Ambiguity resolution.
- AI generation for unresolved concepts.

### Concept

- Canonical English and Chinese names.
- English and Chinese definitions.
- IPA and English pronunciation.
- Simple explanation.
- Deep explanation.
- Key points.
- Misconception.
- Sources.
- Content status.

### Knowledge

- Related concepts.
- Typed relationship labels.
- Focused knowledge path.
- Saved concept library.
- Learning state.

### Learning

- Automatic Knowledge Card.
- Review question.
- Reveal answer.
- Self-rating.
- Deterministic scheduling.
- Mastery update.

### Tutor

- Contextual Q&A for the selected concept.
- Simple explanation request.
- Comparison request.
- Example request.
- Typed-answer feedback.

### Product experience

- Desktop Web.
- Light, Dark, and System themes.
- Responsive fallback.
- Keyboard navigation.
- Accessibility.
- Error, empty, loading, and offline-aware states.

## 6.2 MVP should include if schedule allows

- Typed-answer AI assessment.
- Knowledge Library relations view.
- Data export.
- Review reminders.
- Report inaccurate content.

## 6.3 Explicitly excluded

- Marketing landing page.
- Pricing and subscriptions.
- Social features.
- Community content.
- Shared decks.
- Collaborative spaces.
- Android application.
- Native macOS application.
- Native iOS application.
- Browser extension.
- Camera/OCR lookup.
- Full PDF upload and parsing.
- Paper annotation.
- Citation manager.
- User-created card templates.
- Complex deck management.
- Global unlimited graph.
- Autonomous agent orchestration.
- Fine-tuned custom model.
- Offline AI generation.

---

# 7. Success Metrics

## 7.1 North-star metric

### Weekly Learned Concepts

Number of unique concepts per active user that receive at least one meaningful learning action during a week:

- Saved.
- Reviewed.
- Marked learning/mastered through review.
- Used in Tutor conversation.
- Revisited after the first day.

Simple page views do not count.

## 7.2 Activation

A user is activated when, within seven days of signup, they:

1. Search at least three concepts.
2. Save at least one concept.
3. Complete at least one review.

## 7.3 Core funnel

```text
Signup
  → First search
  → Successful concept resolution
  → Concept save
  → First review
  → Week-two return
```

## 7.4 MVP product metrics

| Metric | Definition | Initial target |
|---|---|---:|
| Search success rate | Search ends in selected or generated concept | ≥90% |
| Search-to-detail rate | Search result opens detail | ≥70% |
| Search-to-save rate | Unique search sessions resulting in save | ≥25% |
| Save-to-review rate | Saved concept reviewed within 7 days | ≥30% |
| Week-2 learner retention | Activated user returns in week 2 | ≥25% |
| Duplicate concept rate | New generations later merged as duplicate | <5% |
| Tutor use rate | Saved concept sessions using Tutor | Informational |
| Review completion rate | Started review sessions completed | ≥70% |

These are beta hypotheses and must be recalibrated after the first 30–50 qualified users.

## 7.5 Quality metrics

| Metric | Target |
|---|---:|
| Structured AI response validity | ≥99% |
| Existing concept cache hit after warm-up | Track by domain |
| Human-reviewed concept accuracy | ≥90% acceptable |
| Human-reviewed relation accuracy | ≥90% acceptable |
| AI safety evaluation pass rate | 100% on critical cases |
| Crash-free sessions | ≥99.5% |
| Search UI response to local input | <100 ms perceived |
| Cached concept content load | <1 s target |
| New explanation first useful state | <5 s target |
| New explanation completion | <12 s target |

## 7.6 Guardrail metrics

- Medical diagnosis-like response rate.
- Unsupported causal relation rate.
- Low-confidence content save rate.
- AI generation error rate.
- User content-report rate.
- Daily AI cost per active learner.
- Tutor requests per user per day.
- Account deletion completion failures.

---

# 8. Product Navigation

## 8.1 Primary routes

| Route | Product label | Purpose |
|---|---|---|
| `/search` | 搜索 | Search and read concepts |
| `/concept/:slug` | Concept Detail | Canonical concept experience |
| `/knowledge` | 知识库 | Saved concepts and relations |
| `/learning` | 学习 | Due reviews and mastery |
| `/settings` | Settings | Account and preferences |

## 8.2 Default entry

After successful authentication:

- Open the last valid product route if available.
- Otherwise open `/search`.

There is no MVP Home dashboard.

## 8.3 Navigation requirements

### NAV-001

The persistent header must contain only:

- Lexora brand.
- Search.
- Knowledge.
- Learning.
- Theme.
- Language.
- Account.

**Priority:** P0

### NAV-002

Browser Back and Forward must restore:

- Route.
- Selected concept.
- Search query where safe.
- Previous scroll position when feasible.

**Priority:** P0

### NAV-003

`⌘ K` must focus or open global concept search.

**Priority:** P0

### NAV-004

No authenticated page may display TemporalSync, portfolio, About, Work, Blog, social, or unrelated product information.

**Priority:** P0

---

# 9. Authentication and Onboarding

## 9.1 Goal

Allow users to preserve their personal knowledge base while keeping signup friction low.

## 9.2 Authentication methods

### MVP public method

- Sign in with Apple.

### Optional beta method

- Email magic link for invited testers and administration.

Password-based signup is not required for MVP.

## 9.3 Authentication requirements

### AUTH-001 — Sign in with Apple

The user can authenticate through Apple and return to the requested Lexora route.

**Acceptance criteria**

- Successful sign-in creates or restores one Lexora profile.
- Returning sign-in does not create duplicate profiles.
- Authentication failure produces a human-readable retry state.
- Canceling Apple sign-in returns safely to the sign-in page.

**Priority:** P0

### AUTH-002 — Session persistence

The product retains valid sessions across browser restarts.

**Acceptance criteria**

- User is not repeatedly asked to sign in while the session is valid.
- Expired session redirects to sign-in and preserves intended route.
- Signing out removes local authenticated state.

**Priority:** P0

### AUTH-003 — First-login profile bootstrap

On first successful login, create the application profile required for preferences and personal data.

**Acceptance criteria**

- Profile is created exactly once.
- Failure can be retried safely.
- User does not reach the app with a partially initialized profile.

**Priority:** P0

### AUTH-004 — Account deletion

Authenticated users can initiate account deletion from Settings.

**Acceptance criteria**

- Product clearly explains what will be deleted.
- User must confirm the destructive action.
- Recent re-authentication may be required.
- Personal cards, records, conversations, and files are deleted.
- User receives a clear completion or pending status.
- User is signed out after completion.

**Priority:** P0

## 9.4 Onboarding

Maximum three steps:

1. Interface language.
2. Learning domains.
3. Daily review goal.

### ONB-001 — Language

- Default from browser preference.
- User can choose Simplified Chinese or English.
- Required before completion.

### ONB-002 — Domain interests

Options:

- Medicine.
- AI / Machine Learning.
- Biology.
- Engineering.

Multiple selection allowed.

The choice personalizes examples and ranking but does not restrict search.

### ONB-003 — Daily goal

Options:

- 3 concepts.
- 5 concepts.
- 10 concepts.
- No goal.

Daily goals do not create punishment, loss states, or streak pressure.

### ONB-004 — Skip

The user may skip domain and daily-goal steps.

**Priority:** P1

---

# 10. Concept Search

## 10.1 Goal

Resolve professional terminology quickly and reliably across English and Chinese.

## 10.2 Supported inputs

- English term.
- Chinese term.
- Acronym.
- Multi-word phrase.
- Common spelling variation.
- Minor misspelling.

V1 does not accept image, voice, PDF, or browser-selected text.

## 10.3 Search stages

Search proceeds through:

1. Recent/local concepts.
2. Exact canonical name.
3. Alias and acronym.
4. Prefix and typo-tolerant match.
5. Keyword/full-text match.
6. Semantic match.
7. AI explanation request when unresolved.

These stages are product behavior, not separately exposed to the user.

## 10.4 Search requirements

### SEARCH-001 — Input

The user can enter a term from the Search rail or global search.

**Acceptance criteria**

- Input supports Chinese and English.
- Input remains responsive during remote requests.
- Clear action is available when text exists.
- `⌘ K` focuses it.
- `Esc` closes suggestions or clears focus.

**Priority:** P0

### SEARCH-002 — Suggestions

Suggestions appear after a meaningful query.

**Acceptance criteria**

- Do not issue expensive AI generation on every keystroke.
- Suggestions are grouped into likely match, other meanings, and related concepts.
- Each result shows English name, Chinese name, and domain.
- Keyboard arrows and Enter can select a result.
- Screen readers receive result count and selection.

**Priority:** P0

### SEARCH-003 — Exact result

An existing approved concept opens without AI regeneration.

**Acceptance criteria**

- Concept detail appears from stored content.
- Existing user save/mastery state is restored.
- Search is recorded in recent activity.

**Priority:** P0

### SEARCH-004 — Misspelling suggestion

When a probable misspelling is detected, show the likely canonical concept.

Example:

```text
Alzheimers desease
→ Alzheimer's Disease
```

**Acceptance criteria**

- Product does not silently change a meaning-critical term.
- User can inspect or accept the correction.

**Priority:** P1

### SEARCH-005 — Acronym resolution

The product resolves acronyms by domain.

Example:

```text
MCI
→ Mild Cognitive Impairment
```

When an acronym has multiple common meanings, require disambiguation.

**Priority:** P0

### SEARCH-006 — Domain filter

The user can filter search ranking by:

- All.
- Medicine.
- AI / ML.
- Biology.
- Engineering.

The filter influences ranking, not absolute availability.

**Priority:** P1

### SEARCH-007 — No existing concept

When no useful concept is found, show:

```text
使用 AI 解释“{query}”
```

Do not start generation without a deliberate action unless the user submitted the query explicitly with Enter.

**Priority:** P0

## 10.5 Search history

### SEARCH-008 — Recent concepts

The Search rail shows the six most recently opened concepts.

**Acceptance criteria**

- One concept appears once.
- Most recent activity determines order.
- English name, Chinese name, and relative recency are shown.
- Selecting a row restores concept detail.

**Priority:** P0

### SEARCH-009 — Privacy

Search history is private to the user.

Clearing all history:

- Lives in a secondary menu.
- Requires confirmation.
- Does not delete saved concepts.

**Priority:** P1

---

# 11. Concept Disambiguation

## 11.1 Goal

Prevent one visible term from being treated as one universal meaning.

## 11.2 Trigger conditions

Disambiguation appears when:

- Multiple canonical concepts share a term.
- Acronym confidence is below threshold.
- User context does not provide a reliable domain.
- Search results contain materially different meanings.

## 11.3 Requirements

### DISAMB-001 — Sense selection

Display two to four likely meanings.

Example:

```text
Embedding 可能指：

1. Machine Learning — 将对象映射为向量表示
2. Mathematics — 将一个空间映射到另一个空间
3. Linguistics — 句法结构中的嵌入
```

**Acceptance criteria**

- Each choice includes domain and one-line description.
- User can refine the query.
- No meaning is preselected when confidence is insufficient.
- Choice becomes part of recent context.

**Priority:** P0

### DISAMB-002 — Preserve original query

The original query remains visible through disambiguation and concept selection.

**Priority:** P0

### DISAMB-003 — Re-disambiguate

Concept Detail provides an overflow action:

```text
这不是我想找的含义
```

This returns to the sense-selection state.

**Priority:** P1

---

# 12. AI Concept Explanation

## 12.1 Goal

Generate a structured, reusable concept only when an approved concept cannot satisfy the request.

## 12.2 Explanation output

Every accepted concept must contain:

- Canonical English name.
- Canonical Chinese name when available.
- Domain.
- Subdomain when useful.
- Acronym expansion.
- Aliases.
- English definition.
- Chinese definition.
- Simple Chinese explanation.
- Deep Chinese explanation.
- Two to four key points.
- Common misconception.
- Pronunciation metadata when reliable.
- Related-concept proposals.
- Reference metadata.
- Content status.
- Generation/version provenance.

## 12.3 Generation requirements

### GEN-001 — Deliberate generation

Generate only when:

- Search has no acceptable existing match.
- User explicitly submits the term.
- The request passes rate and safety checks.

**Priority:** P0

### GEN-002 — Progress

Show understandable generation stages:

1. Resolving term.
2. Building explanation.
3. Finding related concepts.

**Acceptance criteria**

- Existing page structure remains stable.
- User can cancel.
- Query remains visible.
- Product does not show malformed partial structured content.

**Priority:** P0

### GEN-003 — Idempotency

Repeated generation requests for the same normalized term, sense, locale, and content version must not produce duplicate active concepts.

**Priority:** P0

### GEN-004 — Structured validation

Invalid AI output is never written directly into the visible canonical concept.

**Acceptance criteria**

- Required fields are validated.
- Relation types use the approved vocabulary.
- Unsupported or malformed references are rejected.
- Validation failure triggers a bounded retry or safe error.

**Priority:** P0

### GEN-005 — Failure

If generation fails:

- Preserve query.
- Explain that generation failed.
- Offer retry.
- Offer nearby search results if available.
- Do not fabricate a fallback explanation.

**Priority:** P0

### GEN-006 — Low confidence

When confidence or source support is insufficient:

- Display `需要核验`.
- Explain the limitation.
- Promote sources.
- Do not display unsupported causal claims.

**Priority:** P0

## 12.4 Generation cache

Approved generated content is reusable across users.

Personal query context, notes, or private paper text must not be inserted into shared canonical content.

---

# 13. Concept Detail

## 13.1 Goal

Provide one coherent place to understand, connect, save, and ask about a concept.

## 13.2 Required content hierarchy

1. Domain and subdomain.
2. English canonical term.
3. Chinese name.
4. IPA and pronunciation.
5. Concise definition.
6. Simple/deep control.
7. Structured explanation.
8. Related concepts.
9. References and status.
10. Personal learning actions.

## 13.3 Requirements

### CONCEPT-001 — Canonical identity

The title area displays:

- English name.
- Chinese name.
- Acronym where relevant.
- Domain.

**Priority:** P0

### CONCEPT-002 — Pronunciation

The user can hear the canonical English term.

**Acceptance criteria**

- Speaker button has accessible label.
- Playing state is visible.
- Repeated click stops or restarts predictably.
- Failure does not block concept reading.

**Priority:** P0

### CONCEPT-003 — Simple explanation

Simple mode answers:

- What is it?
- Why should I care?
- One concrete example when useful.

Simple mode avoids unexplained specialist terms where possible.

**Priority:** P0

### CONCEPT-004 — Deep explanation

Deep mode includes:

- Definition and overview.
- Mechanism or working principle.
- Importance or application.
- Common misconception.

For medicine:

- Avoid diagnosis.
- Avoid treatment instructions.
- Distinguish association and causation.

**Priority:** P0

### CONCEPT-005 — Mode persistence

Simple/deep preference is preserved while navigating within the same session.

**Priority:** P1

### CONCEPT-006 — Accordions

Explanation sections support independent expansion and collapse.

**Acceptance criteria**

- Entire header is interactive.
- Keyboard operation works.
- Expansion does not lose reading position.
- At least one meaningful section is open by default.

**Priority:** P0

### CONCEPT-007 — References

Deep explanations display two to five relevant source entries when available.

Each source includes:

- Title or source label.
- Organization/publication.
- Date/year when available.
- Link.

**Priority:** P0

### CONCEPT-008 — Content status

Display one of:

- Approved.
- AI generated.
- Needs review.
- Deprecated.

Users must not infer that all visible text has been manually verified.

**Priority:** P0

### CONCEPT-009 — Report content

Users can report:

- Incorrect explanation.
- Incorrect translation.
- Incorrect relationship.
- Broken reference.
- Safety concern.

The report flow must not require a long form.

**Priority:** P1

---

# 14. Knowledge Relationships

## 14.1 Goal

Help users build a mental model around the current concept.

## 14.2 Approved relationship vocabulary

| Type | Meaning | Directional |
|---|---|---|
| `is_a` | Concept is a type of another concept | Yes |
| `part_of` | Concept is a component of another | Yes |
| `prerequisite_of` | Useful knowledge before another concept | Yes |
| `associated_with` | Meaningful non-causal association | Usually symmetric |
| `causes` | Supported causal relationship | Yes |
| `measured_by` | Measured or evaluated through another concept | Yes |
| `used_for` | Used for an application | Yes |
| `contrasts_with` | Useful conceptual contrast | Usually symmetric |
| `related_to` | Fallback meaningful relationship | Usually symmetric |

## 14.3 Requirements

### REL-001 — Knowledge path

Concept Detail displays a focused path of four to six concepts.

**Acceptance criteria**

- Current concept is visually identifiable.
- Every connection has a human-readable label.
- English and Chinese names are visible.
- Saved/mastery state is distinguishable.
- The path is available to screen readers as an ordered list.

**Priority:** P0

### REL-002 — Related concept preview

Selecting a related concept first shows enough preview to avoid accidental context loss.

The user can then open it in Concept Detail.

**Priority:** P1

### REL-003 — No unsupported causality

AI-proposed `causes` edges require stricter evidence than `associated_with`.

Low-confidence causal edges are not shown as causal.

**Priority:** P0

### REL-004 — No duplicate/self edges

The visible graph/path must not contain:

- Self edges.
- Duplicate active edges.
- Same edge repeated with equivalent relation.

**Priority:** P0

### REL-005 — Bounded graph

MVP does not render the full global knowledge graph.

Initial relations view:

- One selected concept.
- Maximum 12 nodes.
- One-hop neighborhood by default.

**Priority:** P0

### REL-006 — Relationship explanation

When a relation label alone is insufficient, provide one short sentence explaining it.

**Priority:** P1

---

# 15. Save and Knowledge Card

## 15.1 Goal

Turn understanding into a reviewable learning object with one action.

## 15.2 Save behavior

Saving a concept creates:

- User-concept association.
- Initial learning state.
- One default Knowledge Card.
- Initial review schedule.

## 15.3 Requirements

### CARD-001 — One-click save

The user can save from Concept Detail.

**Acceptance criteria**

- Optimistic visual feedback appears immediately.
- Duplicate clicks do not create duplicate cards.
- Saved state persists across reload and devices.
- Save failure reverts and explains the problem.

**Priority:** P0

### CARD-002 — Default card

The default card contains:

- Front question.
- Concise answer.
- Two to four key points.
- One recall question.
- Concept link.

**Priority:** P0

### CARD-003 — Card uniqueness

V1 allows one active default card per user per concept.

Saving an already-saved concept:

- Does not create another card.
- Shows existing state.
- Offers `查看卡片`.

**Priority:** P0

### CARD-004 — Personal note

User can add a private text note to the saved concept.

Rules:

- Note does not modify canonical content.
- Note is private.
- Autosave with clear status.

**Priority:** P1

### CARD-005 — Unsave

User may remove a concept from active learning.

Behavior:

- Preserve review history unless user explicitly deletes it.
- Deactivate the card.
- Explain consequences.

**Priority:** P1

### CARD-006 — Save confirmation

After successful save:

- Button becomes `已保存到知识库`.
- Show a subtle confirmation.
- Offer optional `查看卡片`.

No modal is required.

**Priority:** P0

---

# 16. Personal Knowledge Base

## 16.1 Goal

Give users a durable, searchable collection of concepts and learning states.

## 16.2 Concept states

| State | Meaning | Entered when |
|---|---|---|
| New | Viewed, not saved | Concept first viewed |
| Learning | Saved or actively reviewing | Saved or reviewed |
| Needs Review | Due or recent recall declined | Schedule due/lapse |
| Mastered | Stable recall threshold reached | Review algorithm threshold |

Mastered is reversible.

## 16.3 Knowledge Library requirements

### KB-001 — Saved list

The user can view all saved concepts.

Each row displays:

- English name.
- Chinese name.
- Domain.
- Mastery state.
- Last activity.
- Next review when applicable.

**Priority:** P0

### KB-002 — Search own knowledge

The user can search within saved concepts by:

- English name.
- Chinese name.
- Alias/acronym.

**Priority:** P0

### KB-003 — Filter

Filters:

- Domain.
- Mastery state.
- Due status.

**Priority:** P1

### KB-004 — Sort

Sort options:

- Recent activity.
- Next review.
- Alphabetical.
- Mastery.

Default:

```text
Recent activity descending
```

**Priority:** P1

### KB-005 — List and Relations views

List is default.

Relations view shows a focused graph around a selected saved concept.

**Priority:** P1

### KB-006 — Empty state

When no concepts are saved:

```text
你的知识网络从第一个概念开始。
```

Primary action:

```text
搜索一个概念
```

**Priority:** P0

### KB-007 — Personal data isolation

Users cannot access another user's:

- Saved concepts.
- Notes.
- Mastery.
- Cards.
- Review history.
- Conversations.

**Priority:** P0

---

# 17. Learning and Review

## 17.1 Goal

Help users retain saved concepts through short, interpretable review sessions.

## 17.2 Review model

V1 uses:

- One default card per concept.
- Deterministic spaced repetition.
- User self-rating as scheduling truth.
- Optional AI feedback on typed answers.

AI does not independently decide the next review schedule.

## 17.3 Learning overview requirements

### LEARN-001 — Due count

Learning page displays:

- Due today.
- Learning.
- Mastered.

**Priority:** P0

### LEARN-002 — Start review

Primary action begins a session with:

- Up to five due cards by default.
- All due cards if fewer than five.

User may continue after completion.

**Priority:** P0

## 17.4 Review flow

```text
Question
  → Think or type
  → Reveal
  → Compare / AI feedback
  → Rate recall
  → Schedule next review
  → Next card
```

### LEARN-003 — Question

Show:

- One recall question.
- Concept domain.
- Optional answer input.

Do not show the answer simultaneously.

**Priority:** P0

### LEARN-004 — Reveal answer

User can reveal with:

- Visible button.
- `Space` keyboard shortcut.

After reveal:

- Show concise answer.
- Show key points.
- Show AI assessment if typed answer exists and feature is enabled.

**Priority:** P0

### LEARN-005 — Self-rating

Ratings:

- Again.
- Hard.
- Good.
- Easy.

Keyboard:

- `1`.
- `2`.
- `3`.
- `4`.

**Priority:** P0

### LEARN-006 — Scheduling

After rating:

- Record event.
- Update interval.
- Update due date.
- Update mastery.
- Move to next card.

Scheduling must be deterministic and testable.

**Priority:** P0

### LEARN-007 — Idempotent review

Submitting the same review event more than once must not double-update:

- Review count.
- Schedule.
- Mastery.

**Priority:** P0

### LEARN-008 — Typed-answer assessment

If enabled, AI labels the answer:

- Incorrect.
- Partial.
- Correct.

Rules:

- Feedback is short and specific.
- User can override by self-rating.
- AI assessment does not directly determine schedule.

**Priority:** P1

### LEARN-009 — Session completion

Show:

- Cards reviewed.
- Next due summary.
- Optional continue action.

Do not use:

- Confetti.
- Competitive leaderboard.
- Punitive streak loss.

**Priority:** P0

## 17.5 Mastery

### LEARN-010 — Mastery calculation

Mastery is derived from:

- Review outcomes.
- Interval.
- Recency.
- Lapse count.

The user-facing state is simpler than the internal score.

### LEARN-011 — Mastered is reversible

If a mastered concept is forgotten:

- State can return to Needs Review or Learning.
- Historical mastery is retained in event history.

**Priority:** P0

---

# 18. Tutor

## 18.1 Goal

Answer follow-up questions without turning Lexora into an ungrounded general chatbot.

## 18.2 Tutor context

Tutor receives only:

- Selected concept.
- Approved explanation.
- Approved nearby relationships.
- Relevant mastery summary.
- Bounded recent conversation.
- User question.

Tutor does not receive unrelated private knowledge by default.

## 18.3 Supported intents

- Explain more simply.
- Explain more deeply.
- Give an example.
- Compare two concepts.
- Explain a relationship.
- Clarify a misconception.
- Generate a recall question.
- Assess a typed review answer.

## 18.4 Tutor requirements

### TUTOR-001 — Ask from Concept Detail

The user can ask a question from the right rail.

**Acceptance criteria**

- Selected concept is always visible in context.
- Input remains after transient failure.
- Submit supports keyboard.
- Answer streams or loads without shifting the entire layout.

**Priority:** P0

### TUTOR-002 — Grounded answer

Tutor clearly distinguishes:

- Answer based on canonical concept.
- Answer based on a reference.
- General explanation.
- Uncertainty.

**Priority:** P0

### TUTOR-003 — Suggested prompts

When conversation is empty, show no more than three:

- 用更简单的方式解释.
- 它和 MCI 有什么区别？
- 给我一个具体例子.

Suggestions update by concept but must remain useful.

**Priority:** P1

### TUTOR-004 — Conversation persistence

Concept conversation is available when the user returns.

V1 may show only the most recent conversation per concept.

**Priority:** P1

### TUTOR-005 — Bounded context

Old conversation is summarized or truncated safely.

The product must not send unlimited full conversation history to the model.

**Priority:** P0

### TUTOR-006 — Tutor cannot edit canonical knowledge

Tutor answers never directly alter:

- Concept definition.
- Canonical translation.
- Relationships.
- References.

**Priority:** P0

### TUTOR-007 — Failure

On failure:

- Preserve question.
- Show retry.
- Do not generate a fake answer.
- Do not duplicate user messages.

**Priority:** P0

---

# 19. Settings and Preferences

## 19.1 Profile

Fields:

- Display name.
- Interface language.
- Learning language.
- Domain interests.
- Daily review goal.

## 19.2 Theme

Values:

- Light.
- Dark.
- System.

Requirements:

- Preference persists before and after login.
- Initial page avoids theme flash.
- Theme change applies without reload.

**Priority:** P0

## 19.3 Language

Interface options:

- Simplified Chinese.
- English.

Changing interface language does not remove bilingual concept content.

**Priority:** P1

## 19.4 Notifications

MVP Web may support browser notifications only after:

- User has saved a concept.
- User understands the review benefit.
- User explicitly opts in.

Notification content:

- Due review count.
- No sensitive concept details on lock screen by default.

**Priority:** P2

## 19.5 Data export

Export should eventually include:

- Saved concepts.
- Personal notes.
- Mastery state.
- Review history.

Format may be JSON/CSV package.

**Priority:** P1

## 19.6 Account deletion

See AUTH-004.

Settings must make deletion discoverable.

---

# 20. Light and Dark Modes

## 20.1 Goal

Provide equivalent professional reading experiences in both themes.

## 20.2 Requirements

### THEME-001

Every primary page must support Light and Dark.

**Priority:** P0

### THEME-002

Theme changes must preserve:

- Route.
- Search query.
- Selected concept.
- Scroll position.
- Unsaved Tutor draft.

**Priority:** P0

### THEME-003

Dark mode must use the approved deep-violet Lexora canvas, not generic pure black.

**Priority:** P0

### THEME-004

Long-form body text must meet readability and contrast requirements independently in both themes.

**Priority:** P0

### THEME-005

Saved, learning, mastered, warning, and error states must not rely on color alone.

**Priority:** P0

---

# 21. Loading, Empty, Error, and Offline States

## 21.1 Initial application load

- Show product shell promptly.
- Restore session.
- Load route content.
- Avoid blank full-screen waits.

## 21.2 Search loading

- Keep input usable.
- Show small progress near results.
- Do not lock the entire app.

## 21.3 Concept loading

- Preserve column layout.
- Use title/body skeleton.
- Do not skeleton the already-known search rail.

## 21.4 Empty states

### Search

```text
搜索一个专业概念，开始构建你的知识网络。
```

### Knowledge

```text
你的知识网络从第一个概念开始。
```

### Learning

```text
当前没有待复习的概念。
```

Each empty state has one next action.

## 21.5 Error requirements

### STATE-001 — Actionable message

Every error states:

- What failed.
- What was preserved.
- What the user can do.

**Priority:** P0

### STATE-002 — Retry

Retry is safe and does not duplicate:

- Concept.
- Card.
- Message.
- Review.

**Priority:** P0

### STATE-003 — Offline

When offline:

- Previously cached concepts remain readable where available.
- Search explains network limitation.
- New AI generation is unavailable.
- Review events may queue for sync if supported.

**Priority:** P1

### STATE-004 — Service degradation

If AI provider is unavailable but canonical data works:

- Existing concepts remain usable.
- Save and review remain usable.
- Tutor and generation show scoped unavailable state.

**Priority:** P0

---

# 22. Professional Knowledge Quality

## 22.1 Quality levels

| Status | Meaning | User treatment |
|---|---|---|
| Approved | Passed required quality gate | Normal display |
| AI Generated | Structured and validated, not manually reviewed | Label near sources |
| Needs Review | Quality/source concern | Warning |
| Deprecated | Replaced or outdated | Warn and link replacement |

## 22.2 Content requirements

### QUALITY-001 — Definition clarity

Definitions must identify the concept category.

Examples:

- Disease.
- Biomarker.
- Model.
- Algorithm.
- Imaging method.
- Metric.
- Data system.

**Priority:** P0

### QUALITY-002 — Simple/deep consistency

Simple and deep explanations must not contradict each other.

**Priority:** P0

### QUALITY-003 — Translation

Chinese names must preserve professional meaning.

When no stable Chinese term exists:

- Retain English.
- Provide a descriptive Chinese explanation.
- Avoid inventing an authoritative translation.

**Priority:** P0

### QUALITY-004 — Acronym

First visible acronym occurrence includes its expansion.

**Priority:** P0

### QUALITY-005 — Misconception

Common misconception content must correct a plausible misunderstanding, not create a generic warning.

**Priority:** P1

### QUALITY-006 — References

References should prioritize:

- Authoritative organizations.
- Peer-reviewed reviews.
- Standard textbooks/reference documentation.
- Official technical documentation.

Avoid using low-quality SEO pages as primary evidence.

**Priority:** P0

### QUALITY-007 — Freshness

Concepts with time-sensitive scientific or technical content store:

- Generation/update date.
- Content version.
- Source date where available.

**Priority:** P0

---

# 23. Medical Safety

## 23.1 Product boundary

Lexora provides educational information, not:

- Diagnosis.
- Treatment decisions.
- Medication instructions.
- Emergency advice replacement.
- Individual risk prediction.

## 23.2 Requirements

### SAFE-001 — Educational notice

Medical concepts show:

```text
内容仅用于知识学习，不构成诊断或治疗建议。
```

The notice is visible but not presented as a repeated alarm.

**Priority:** P0

### SAFE-002 — Symptom queries

When a user describes personal symptoms:

- Do not infer a diagnosis.
- Explain the relevant concept generally.
- Encourage appropriate professional evaluation when warranted.

**Priority:** P0

### SAFE-003 — Treatment questions

Tutor does not provide individualized treatment plans.

**Priority:** P0

### SAFE-004 — Emergency content

The product must have an appropriate safe response for potential emergencies.

The exact escalation language must be localized and reviewed before launch.

**Priority:** P0

### SAFE-005 — Causation

Medical association must not be rewritten as causation.

**Priority:** P0

### SAFE-006 — Citation

High-risk medical claims require stronger reference support or must be omitted.

**Priority:** P0

---

# 24. Privacy and Security Requirements

## 24.1 Data minimization

Collect only data required for:

- Authentication.
- Preferences.
- Saved concepts.
- Learning records.
- Tutor conversations.
- Product reliability and analytics.

## 24.2 Requirements

### PRIV-001 — Private learning data

Personal notes, cards, mastery, and conversations are private by default.

**Priority:** P0

### PRIV-002 — Model context

Send only the minimum relevant context to the model.

Do not send unrelated profile or knowledge history.

**Priority:** P0

### PRIV-003 — Secrets

Model provider keys and privileged backend credentials never appear in the browser client.

**Priority:** P0

### PRIV-004 — Authorization

Authenticated identity alone is insufficient; every private record requires ownership authorization.

**Priority:** P0

### PRIV-005 — User-editable metadata

User-editable profile fields must not determine authorization.

**Priority:** P0

### PRIV-006 — Conversation retention

Define and disclose retention for Tutor content.

User can delete conversation history.

**Priority:** P1

### PRIV-007 — Analytics

Do not send:

- Raw auth tokens.
- Provider keys.
- Full private notes.
- Full Tutor messages by default.
- Direct personal identifiers unnecessarily.

**Priority:** P0

### PRIV-008 — Delete account

See AUTH-004.

Deletion must include private stored files when later introduced.

**Priority:** P0

---

# 25. Accessibility Requirements

## 25.1 Target

Meet WCAG 2.2 AA for the core MVP flow.

## 25.2 Requirements

### A11Y-001 — Keyboard

The complete core loop is keyboard accessible:

- Search.
- Result selection.
- Concept reading.
- Accordion.
- Save.
- Tutor.
- Review.
- Rating.

**Priority:** P0

### A11Y-002 — Focus

Visible focus indication exists in Light and Dark modes.

**Priority:** P0

### A11Y-003 — Semantics

- Concept title is H1.
- Major regions use landmarks.
- Knowledge path is an ordered list.
- Accordion states are announced.
- Form fields have labels.

**Priority:** P0

### A11Y-004 — Contrast

- Normal text: 4.5:1.
- Large text: 3:1.
- Essential component boundaries: appropriate non-text contrast.

**Priority:** P0

### A11Y-005 — Zoom

Core flow remains usable at 200% browser zoom.

**Priority:** P0

### A11Y-006 — Reduced motion

Respect reduced-motion preference.

Disable non-essential:

- Theme sliding animation.
- Decorative orbit movement.
- Large drawer transitions.

**Priority:** P0

### A11Y-007 — Audio alternative

Pronunciation audio does not contain information unavailable in text.

**Priority:** P0

---

# 26. Performance and Reliability Requirements

## 26.1 Performance targets

### PERF-001

Initial authenticated shell should become usable quickly on normal broadband.

Target:

- Useful shell within 2 seconds after session resolution.

### PERF-002

Cached concept:

- Target visible content under 1 second.

### PERF-003

Search typing:

- No visible typing lag.

### PERF-004

New AI explanation:

- First meaningful progress within 1 second.
- First useful content target under 5 seconds.
- Completion target under 12 seconds.

### PERF-005

Knowledge path:

- One-hop relation display target under 1 second when cached.

## 26.2 Reliability

### RELIAB-001 — Idempotency

Required for:

- Generate concept.
- Save concept.
- Send Tutor message.
- Submit review.
- Delete account initiation.

**Priority:** P0

### RELIAB-002 — Retry policy

- Bounded retries for transient failures.
- No unbounded retry loops.
- User-visible retry for meaningful failures.

**Priority:** P0

### RELIAB-003 — Graceful AI failure

AI failure must not block:

- Existing concept reading.
- Saved library.
- Deterministic review.
- Settings.

**Priority:** P0

### RELIAB-004 — Data integrity

The product must prevent:

- Duplicate active cards.
- Duplicate canonical concepts for same sense/version.
- Double-applied reviews.
- Tutor message duplication.

**Priority:** P0

---

# 27. Analytics and Event Tracking

## 27.1 Analytics principles

- Track product behavior, not private knowledge content.
- Use stable event names.
- Record success and failure.
- Do not treat page views as learning.
- Do not log raw search text if privacy policy does not support it.

## 27.2 Core event taxonomy

### Authentication

| Event | Key properties |
|---|---|
| `signup_started` | method |
| `signup_completed` | method |
| `login_completed` | method |
| `logout_completed` | — |
| `account_deletion_started` | — |
| `account_deletion_completed` | duration/status |

### Search

| Event | Key properties |
|---|---|
| `search_submitted` | query language, length, domain filter |
| `search_results_shown` | count, result types, latency |
| `search_result_selected` | rank, match type |
| `disambiguation_shown` | candidate count |
| `disambiguation_selected` | selected rank/domain |
| `concept_generation_started` | domain hint |
| `concept_generation_completed` | latency, cache/new, status |
| `concept_generation_failed` | error category |

### Concept

| Event | Key properties |
|---|---|
| `concept_viewed` | concept ID, domain, source |
| `explanation_depth_changed` | simple/deep |
| `pronunciation_played` | success/failure |
| `reference_opened` | source type |
| `related_concept_selected` | relation type |
| `content_reported` | category |

### Save and knowledge

| Event | Key properties |
|---|---|
| `concept_saved` | concept ID, domain |
| `concept_unsaved` | concept ID |
| `knowledge_view_changed` | list/relations |
| `personal_note_saved` | character-count bucket only |

### Learning

| Event | Key properties |
|---|---|
| `review_session_started` | due count, session size |
| `review_answer_revealed` | response mode |
| `review_rated` | rating, interval bucket |
| `review_session_completed` | reviewed count, duration |
| `mastery_state_changed` | previous/new state |

### Tutor

| Event | Key properties |
|---|---|
| `tutor_question_submitted` | intent category, not raw text |
| `tutor_answer_completed` | latency, references, model route |
| `tutor_answer_failed` | error category |
| `suggested_prompt_selected` | prompt category |

### Preferences

| Event | Key properties |
|---|---|
| `theme_changed` | from/to |
| `language_changed` | from/to |
| `domain_preferences_changed` | count |

## 27.3 Required dashboards

For beta operations:

- Activation funnel.
- Search success.
- Search-to-save.
- Save-to-review.
- Week-2 retention.
- AI generation latency/error.
- Cache hit.
- Review completion.
- Safety flags.
- AI cost per active user.

---

# 28. AI Evaluation Plan

## 28.1 Purpose

AI quality cannot be validated only through manual spot checks during development.

## 28.2 Evaluation dataset

Create 100–200 representative concept cases across:

- Medicine.
- AI / ML.
- Biology.
- Engineering.
- Cross-domain ambiguity.
- Acronyms.
- Misspellings.
- Chinese-to-English queries.
- Low-confidence/niche concepts.

## 28.3 Evaluation dimensions

### Concept explanation

- Correct concept identity.
- Correct domain.
- Translation quality.
- Simple explanation clarity.
- Deep explanation accuracy.
- Internal consistency.
- Misconception usefulness.
- Reference relevance.
- Safety.

### Relations

- Correct endpoints.
- Correct direction.
- Correct relation type.
- No unsupported causality.
- Learning usefulness.

### Tutor

- Answers the question.
- Uses selected concept.
- Does not overreach.
- Explains uncertainty.
- Does not diagnose.
- Preserves language preference.

### Review assessment

- Correct/partial/incorrect classification.
- Feedback specificity.
- No schedule manipulation.

## 28.4 Release thresholds

Critical safety:

```text
100% pass on critical test set
```

Overall explanation and relation quality:

```text
At least 90% acceptable in reviewed launch sample
```

Structured validity:

```text
At least 99%
```

---

# 29. Content Operations

## 29.1 Seed content

Before beta:

- Curate 50–100 high-quality concepts.
- Focus on AI/ML and biomedical intersection.
- Include known ambiguous terms.
- Include relationships.
- Include sources.

Suggested seed clusters:

### Neurodegeneration

- Alzheimer's Disease.
- Mild Cognitive Impairment.
- Amyloid β.
- Tau Protein.
- Cognitive Aging.
- MRI.
- PET.
- Biomarker.

### AI / ML

- Embedding.
- Transformer.
- Attention.
- Cosine Similarity.
- Vector Database.
- Fine-tuning.
- Retrieval-Augmented Generation.

### Clinical data

- EHR.
- Clinical Decision Support.
- ICD.
- Cohort.
- Confounding.
- Sensitivity.
- Specificity.

## 29.2 Content correction

Correction flow:

1. User reports content.
2. Record concept/version/category.
3. Review issue.
4. Update as a new content version.
5. Deprecate prior version if needed.
6. Preserve learning references to canonical concept identity.

## 29.3 Content merge

Duplicate concepts require a merge workflow:

- Select surviving canonical concept.
- Move aliases.
- Repoint relations.
- Repoint user associations.
- Preserve event history.
- Deprecate duplicate.

This may be admin-only and not part of public MVP UI.

---

# 30. User Flows

## 30.1 First-time user

```text
Open Lexora
  → Sign in with Apple
  → Choose language
  → Optional domains and goal
  → Search opens
  → User searches a concept
  → Concept resolves
  → User reads simple explanation
  → User saves concept
  → Knowledge Card created
  → User sees review expectation
```

### Completion condition

User has one saved concept and understands where review happens.

## 30.2 Existing concept search

```text
⌘ K
  → Type “Amyloid beta”
  → Existing result appears
  → Select result
  → Cached Concept Detail opens
  → Personal state restored
```

## 30.3 Ambiguous search

```text
Search “Embedding”
  → Multiple meanings shown
  → Select AI / ML
  → Concept Detail opens
```

## 30.4 New generation

```text
Search uncommon term
  → No approved match
  → Choose AI explain
  → Progress stages
  → Validated concept appears
  → Content status visible
```

## 30.5 Save and review

```text
Concept Detail
  → Save as Knowledge Card
  → Confirmation
  → Card becomes due
  → Learning
  → Reveal answer
  → Rate Good
  → Next due date updates
```

## 30.6 Knowledge path exploration

```text
Concept Detail
  → Select related concept
  → Preview relationship
  → Open related concept
  → Back returns to previous concept and position
```

## 30.7 Tutor

```text
Concept Detail
  → Ask “它和 MCI 有什么区别？”
  → Grounded answer streams
  → References shown
  → Conversation retained
```

## 30.8 Account deletion

```text
Settings
  → Delete account
  → Explain deletion
  → Confirm / re-authenticate
  → Deletion completes
  → Sign out
```

---

# 31. Edge Cases

## 31.1 Search

- Empty query.
- Single-character query.
- Very long pasted text.
- URL pasted instead of a term.
- Mixed Chinese/English.
- Unsupported characters.
- Acronym with many meanings.
- Concept with no stable Chinese translation.
- Search during network loss.
- Rate limit reached.

## 31.2 Concept

- Very long English name.
- Very long Chinese name.
- Missing IPA.
- Acronym identical to another concept.
- Deprecated explanation.
- Broken reference.
- No approved relationships.
- Low-confidence translation.
- Content generated while another request is in progress.

## 31.3 Save

- Double click.
- Multiple tabs saving same concept.
- Session expires during save.
- Card already exists.
- Save succeeds but UI loses connection.

## 31.4 Review

- Same event submitted twice.
- Due date crosses timezone.
- User changes timezone.
- Review opened in two tabs.
- Typed-answer AI times out.
- Card deactivated during session.

## 31.5 Tutor

- Empty question.
- Extremely long question.
- Prompt injection attempt.
- Personal medical symptom question.
- Request for diagnosis.
- Question unrelated to selected concept.
- Provider timeout.
- Conversation exceeds context budget.

## 31.6 Theme/accessibility

- System theme changes while app is open.
- Browser zoom at 200%.
- Reduced motion.
- High contrast.
- Keyboard-only navigation.
- Screen reader with expanded Tutor response.

---

# 32. Non-Goals

The MVP does not attempt to:

- Replace medical professionals.
- Provide a complete academic ontology.
- Cover every professional domain equally at launch.
- Compete with Anki's advanced scheduling customization.
- Compete with Notion's general note flexibility.
- Become a full research-paper reader.
- Create a social learning network.
- Provide a public content publishing platform.
- Build a general autonomous AI agent.
- Guarantee offline generation.

---

# 33. Dependencies

## 33.1 Product dependencies

- Final Lexora brand mark.
- Approved Chinese terminology.
- Seed concept set.
- Content quality rubric.
- Medical safety copy.
- Privacy policy.
- Beta-user recruitment.

## 33.2 Technical dependencies

- Web application shell.
- Supabase project/environments.
- Authentication configuration.
- Database schema and RLS.
- AI provider integration.
- Structured output validation.
- Embedding/search pipeline.
- Analytics.
- Error monitoring.

## 33.3 Operational dependencies

- Domain and deployment.
- Support email or feedback channel.
- Content-report handling.
- Account deletion monitoring.
- AI usage/cost monitoring.

---

# 34. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| AI produces plausible errors | Loss of trust/safety | Sources, status, evals, correction workflow |
| Duplicate concepts fragment graph | Poor knowledge continuity | Normalization, sense keys, semantic duplicate check |
| Web app becomes a generic dashboard | Weak differentiation | Search-first editorial UI |
| Graph becomes decorative | User confusion | Typed labels, bounded path, accessible list |
| Review feels like Anki clone | Weak product value | Search-to-card automation remains core |
| AI costs rise | Beta instability | Cache, quotas, model routing, telemetry |
| Medical users over-rely | Safety risk | Educational boundary, no diagnosis, stronger claims policy |
| Solo developer over-scopes | Delay | P0/P1/P2 priority, explicit exclusions |
| Dark mode harms reading | Retention/accessibility | Dedicated body token and contrast QA |
| Search quality weak before corpus grows | Poor activation | Curated seed set + hybrid search + generation |
| Account/privacy flow incomplete | Launch blocker | P0 release gate |

---

# 35. Priority Framework

## 35.1 P0 — Launch blocking

Must be complete:

- Authentication.
- Search.
- Disambiguation.
- Existing concept detail.
- AI concept generation.
- Simple/deep explanation.
- Pronunciation.
- References/status.
- Knowledge path.
- Save/default card.
- Knowledge Library list.
- Deterministic review.
- Tutor basic Q&A.
- Light/Dark.
- RLS/private data.
- Account deletion.
- Critical analytics.
- Critical AI safety.
- Accessibility core flow.

## 35.2 P1 — MVP completeness

Include when P0 is stable:

- Typed-answer AI assessment.
- Personal notes.
- Relations graph view.
- Search domain filter.
- Content report.
- Tutor conversation persistence.
- Data export.
- Offline cached reading.

## 35.3 P2 — Post-MVP

- Browser notifications.
- Advanced filters.
- Custom review sessions.
- Paper metadata ingestion.
- Native apps.

---

# 36. Release Plan

## 36.1 Internal alpha

Audience:

- Founder.
- Development/test accounts.

Goals:

- Validate end-to-end data flow.
- Validate search and generation.
- Validate save/review.
- Catch security and data issues.

Exit criteria:

- P0 happy paths function.
- No known cross-user data access.
- AI schemas stable.
- Critical safety suite passes.

## 36.2 Private beta

Audience:

- 30–50 qualified postgraduate/research users.

Goals:

- Validate search frequency.
- Validate explanation usefulness.
- Validate save behavior.
- Validate review return.
- Discover concept-quality failures.

Duration:

- Minimum two learning weeks.

Exit criteria:

- Activation and retention measurable.
- Critical bugs controlled.
- Cost per learner understood.
- Content issue process works.

## 36.3 Public MVP

Requires:

- P0 complete.
- Privacy policy.
- Terms/AI notice.
- Account deletion.
- Monitoring and support.
- Performance within acceptable range.
- No unresolved critical safety issues.

---

# 37. MVP Acceptance Test Matrix

## 37.1 Account

- [ ] New user signs in with Apple.
- [ ] Existing user restores same profile.
- [ ] Session persists after browser restart.
- [ ] Expired session returns to intended route after login.
- [ ] User can sign out.
- [ ] User can delete account and private data.

## 37.2 Search

- [ ] English term resolves.
- [ ] Chinese term resolves.
- [ ] Acronym resolves.
- [ ] Ambiguous term presents senses.
- [ ] Misspelling suggests likely term.
- [ ] No match offers AI generation.
- [ ] Keyboard selection works.
- [ ] Recent concepts update without duplicates.

## 37.3 Concept

- [ ] English and Chinese names display.
- [ ] Domain displays.
- [ ] Pronunciation works or fails gracefully.
- [ ] Simple explanation displays.
- [ ] Deep explanation displays.
- [ ] Accordions work with keyboard.
- [ ] Sources display.
- [ ] Content status displays.

## 37.4 Relationship

- [ ] Knowledge path displays four to six relevant concepts.
- [ ] Every edge has a readable relation.
- [ ] Related concept opens correctly.
- [ ] No self or duplicate edge.
- [ ] Screen reader receives ordered relation list.

## 37.5 Save and library

- [ ] Save creates one active card.
- [ ] Double save does not duplicate.
- [ ] Saved state restores after reload.
- [ ] Saved concept appears in Knowledge Library.
- [ ] Another user cannot see it.

## 37.6 Learning

- [ ] Due card starts review.
- [ ] Answer is hidden before reveal.
- [ ] Reveal works with Space.
- [ ] Ratings work with buttons and keys.
- [ ] Rating updates due date.
- [ ] Duplicate review submission is ignored.
- [ ] Mastery state updates.

## 37.7 Tutor

- [ ] Concept-grounded question submits.
- [ ] Answer references current concept.
- [ ] Failure preserves question.
- [ ] Medical diagnosis request triggers safe behavior.
- [ ] Tutor cannot change canonical content.

## 37.8 Themes

- [ ] Light works on every P0 route.
- [ ] Dark works on every P0 route.
- [ ] Theme persists.
- [ ] No initial theme flash.
- [ ] Essential states remain distinguishable.

## 37.9 Accessibility

- [ ] Core loop works with keyboard.
- [ ] Focus is visible.
- [ ] Concept uses semantic H1.
- [ ] Accordions announce state.
- [ ] 200% zoom remains usable.
- [ ] Reduced motion is respected.

---

# 38. Launch Blockers

The MVP must not launch publicly with:

- Cross-user data access.
- Client-exposed model or service credentials.
- Missing account deletion.
- Unsupported medical diagnosis behavior in critical tests.
- Duplicate review scheduling.
- Unvalidated AI output shown as canonical.
- Inaccessible search or review by keyboard.
- Broken Light or Dark core flow.
- No way to identify AI-generated content.
- No monitoring for AI errors and cost.

---

# 39. Open Product Decisions

These decisions should be confirmed before implementation reaches feature completion:

1. Is Sign in with Apple the only public authentication method?
2. Can validated but unreviewed AI concepts be saved immediately?
3. Is typed-answer AI assessment included in public MVP or private beta only?
4. Is personal note editing included in P1?
5. Are browser notifications deferred completely?
6. What exact criteria transition a concept to Mastered?
7. Which source categories are acceptable for each launch domain?
8. What daily AI usage limit applies during beta?
9. What analytics provider and privacy configuration will be used?
10. Which 50–100 concepts form the seed launch corpus?

---

# 40. Recommended Founder Decisions

## 40.1 Authentication

Recommendation:

```text
Sign in with Apple public; email magic link only for invited beta/admin.
```

## 40.2 AI concept visibility

Recommendation:

Validated generated concepts may be shown immediately with:

- `AI 生成`.
- Sources.
- Quality status.
- Report action.

High-risk or low-confidence content requires stronger gating.

## 40.3 Typed review

Recommendation:

Include typed-answer assessment in private beta, but keep it P1 for public MVP if quality or latency is unstable.

## 40.4 Notifications

Recommendation:

Defer browser notifications until review behavior is validated.

## 40.5 Seed focus

Recommendation:

Launch corpus emphasizes:

- AI / ML.
- Biomedical concepts.
- AI medicine intersection.

Engineering remains searchable but is not equally curated at launch.

---

# 41. Definition of MVP Done

Lexora Web MVP is done when a qualified user can:

1. Sign in.
2. Search an English, Chinese, or acronym term.
3. Resolve an ambiguous meaning.
4. Receive or generate a valid bilingual concept.
5. Hear pronunciation.
6. Switch between simple and deep explanations.
7. Inspect sources and content status.
8. Understand a typed knowledge path.
9. Save one Knowledge Card without duplication.
10. Find the concept in their private Knowledge Library.
11. Complete a scheduled review.
12. See mastery and due state update.
13. Ask a grounded Tutor question.
14. Use the complete loop in Light or Dark mode.
15. Complete the core loop with keyboard navigation.
16. Delete their account and private data.

The MVP is not done merely because the screens render or AI returns text. It is done when the full learning loop is safe, persistent, measurable, and testable.

---

# 42. Final Product Decision

Lexora will first launch as a standalone desktop Web product optimized for Mac users.

The product will:

- Open directly into Search.
- Use a three-column concept-learning workspace.
- Keep canonical professional knowledge separate from private learning data.
- Generate explanations only when existing concepts cannot satisfy the query.
- Convert saved concepts into one default review card.
- Use typed, bounded knowledge relationships.
- Use deterministic scheduling for review.
- Use Tutor as a grounded concept companion, not a general autonomous agent.
- Support equal Light and Dark experiences.
- Prioritize trust, accessibility, and data isolation over feature breadth.

This PRD is the product scope baseline for MVP planning and implementation.

# Documentation Templates
Got it 👍 — what you’re describing is essentially a **developer log + decision record system**. The goal is:

* ✅ Keep it lightweight, easy to update.
* ✅ Track history of issues, decisions, and context.
* ✅ Make it clear where the team left off and what to do next.
* ✅ Minimal files to maintain.

Here’s my recommendation:

---

## 📂 File Structure for Documentation & Notes

```
/docs
  /notes
    2025-08-20.md         # Daily or session notes (journal style)
  DECISIONS.md            # Permanent record of architectural/product decisions
  ISSUES.md               # Known issues + resolutions
  NEXT-STEPS.md           # Running list of what to do next
```

---

### File Details

1. **`/docs/notes/YYYY-MM-DD.md`**

   * Daily (or per work session) log.
   * Format:

     ```
     ## Session Notes (2025-08-20)
     - What we worked on
     - Problems encountered
     - Temporary hacks or experiments
     - Links to relevant code/commits
     - Hand-off notes if another dev picks up
     ```

   This creates a chronological **engineering journal**.

---

2. **`/docs/DECISIONS.md`** (single file, append-only)

   * Record major decisions using the **ADR (Architectural Decision Record) lite format**:

     ```
     ## Decision: Auth Mode Toggle
     - Date: 2025-08-18
     - Context: Need simple dev auth, production-ready auth later
     - Decision: Use AUTH_MODE=dev|clerk env toggle
     - Alternatives: Hardcode clerk (rejected, less flexible)
     - Status: Accepted
     ```
   * Easy to scan to understand *why things are the way they are*.

---

3. **`/docs/ISSUES.md`**

   * Running log of technical/product issues + how they were resolved.
   * Example:

     ```
     ## Issue #1: Prisma migrations failing
     - Date: 2025-08-19
     - Context: Conflict between dev and prod schema
     - Fix: Recreated migration from clean DB
     - Status: Resolved
     ```
   * Keeps troubleshooting knowledge in one place.

---

4. **`/docs/NEXT-STEPS.md`**

   * Always up-to-date list of what’s next.
   * Serves as a lightweight task tracker, even if you don’t use Jira/Trello.
   * Format:

     ```
     ## Next Steps (as of 2025-08-20)
     - [ ] Finish Finance Hat transaction forms
     - [ ] Add UI for recurring items (Automation Engine)
     - [ ] Test Company Docs upload flow
     ```

---

✅ With this structure:

* Daily notes don’t clutter the main docs (they go in `/notes`).
* Decisions, issues, and next steps are **centralized and easy to scan**.
* You only maintain 3 main files (`DECISIONS.md`, `ISSUES.md`, `NEXT-STEPS.md`) plus the rolling notes journal.

---

Would you like me to **generate template starter files** (`DECISIONS.md`, `ISSUES.md`, `NEXT-STEPS.md`, and today’s `2025-08-20.md`) so you can drop them into `/docs` right away?
---
********************************************************************************************************
---

This folder contains starter templates for maintaining project notes, decisions, issues, and next steps.

---

## /docs/DECISIONS.md

```markdown
# Architectural & Product Decisions

## Decision: Auth Mode Toggle
- Date: 2025-08-18
- Context: Need simple dev auth, production-ready auth later.
- Decision: Use AUTH_MODE=dev|clerk env toggle.
- Alternatives: Hardcode Clerk (rejected, less flexible).
- Status: Accepted

---

## Decision: Reminder Defaults
- Date: 2025-08-20
- Context: Recurring items need reminders.
- Decision: Global defaults (30d, 10d) with per-item overrides.
- Alternatives: Per-item only (too repetitive for users).
- Status: Accepted
```

---

## /docs/ISSUES.md

```markdown
# Known Issues & Resolutions

## Issue #1: Prisma migrations failing
- Date: 2025-08-19
- Context: Conflict between dev and prod schema.
- Fix: Recreated migration from clean DB.
- Status: Resolved

## Issue #2: Company switcher UI in dev mode
- Date: 2025-08-20
- Context: Clerk not enabled in dev.
- Fix: Added fake companies dropdown with AUTH_MODE=dev toggle.
- Status: Resolved
```

---

## /docs/NEXT-STEPS.md

```markdown
# Next Steps (as of 2025-08-20)

- [ ] Finish Finance Hat transaction forms.
- [ ] Add UI for recurring items (Automation Engine).
- [ ] Test Company Docs upload flow.
- [ ] Verify Focus banner renders globally.
- [ ] Create initial payroll form for manual pay runs.
```

---

## /docs/notes/2025-08-20.md

```markdown
# Session Notes (2025-08-20)

## What We Worked On
- Drafted detailed PRD for MVP.
- Updated Windsurf Rules to enforce structure.
- Created Nextacular_Adaptation guide.
- Added Vision and Architecture docs.

## Problems Encountered
- Concern: ensuring users with multiple companies only see one at a time.
- Resolution: Scoped queries by companyId, company switcher in dev mode.

## Where We Left Off
- MVP scaffold ready.
- Need to build Finance Hat first.

## Next Session Priorities
- Scaffold Finance Hat transactions.
- Build recurring items UI.
- Verify migrations.
```

# SaaStastic + TimeTrakr Integration Planning

## Snapshot of what we know
- **SaaStastic foundation** SaaStastic already ships with multi-tenant guards, role-based access, Clerk sign-in, Stripe billing, and strict TypeScript patterns, making it a stable launch pad for a combined product.@[C:/Users/danny/CascadeProjects/HatsOffMVP/saastastic/CASCADE_LLM_ONBOARDING.md:L5-L188]
- **TimeTrakr Dashboard** The existing dashboard covers importing TimeTrakr Lite exports, full payroll, job costing, invoicing, and now applies company-scoped API calls through a CompanyContext layer.@[C:/Users/danny/CascadeProjects/windsurf-project/TimeTrakrDashboard/docs/LLM_ONBOARDING_GUIDE.md:L17-L205]
- **TimeTrakr Lite app** The PWA stores data in the browser (Dexie/IndexedDB), offers time entry and list tools, and exports TSV files without a live backend today.@[C:/Users/danny/CascadeProjects/windsurf-project/FastTimeCSV/timetrakrlite/docs/code_explanation.json:L1-L173]

## Questions we need you to answer
- **Company setup expectations** How many separate companies (tenants) do we need to support at launch, and do they need separate branding or billing?
We need to be able to support multiple companies at launch, none already in the system.  It will be a clean slate, or possibly one real test company if that would be better.  All other companies will be created through the SaaStastic UI and stripe checkout/clerk authentication processes.
- **User onboarding flow** How should workers log in on mobile once the shared platform exists (email link, text invite, existing credentials)?
Good question. Probably email invite via link as primary method, with text invite as secondary.  If reasonably doiable for the MVP, we can also do SMS invite maybe?
- **Offline guarantees** What is the acceptable delay between someone clocking time offline and the data showing up in the dashboard once they reconnect? 
There no limit, as long as the data is on the device, if they have no service for a week then when they reconnect it should sync up and show up in the dashboard.  The timetrakr mobile app still needs to remain 100% reliable even if off line.
- **Data migration scope** Do we need to move historical data from current exports into the new system, or can we start fresh going forward? 
We can start fresh going forward, but still need to be able to import historical data from the timetrakr app or via tsv or csv from the client's own system.
- **Payroll approvals** Who signs off on payroll runs today, and should SaaStastic enforce approval steps or reminders before pay is processed?
We aren't providing payroll processing or service.  We are offering a tool to make manual payroll processing easier, and cheaper for the customers.
- **Customer communication** Do clients need access to invoices inside the combined app, or will invoices continue to be sent outside the platform?
Invoicing will be an integral part of the app based on their data from the timetrakr app.  We will be using the stripe checkout process to handle the payment and billing for their subscription to our app.  
Offering a way to provide our customers with the ability to use stripe to bill and receive money from their customers is definitely something worth considering for future iterations of the app.
## Integration options and what they mean
### Option 1 – Rebuild inside SaaStastic (recommended)
Use SaaStastic as the single codebase, rebuild dashboard features as new modules, and connect TimeTrakr Lite’s data flow through SaaStastic APIs. This keeps everything under one authentication, billing, and permission system. Development means re-creating the existing dashboard screens inside SaaStastic’s feature folders but gives us long-term consistency.

### Option 2 – Wrap the existing dashboard
Keep TimeTrakr Dashboard running as-is, connect it to SaaStastic through shared sign-in and data services, and slowly replace parts over time. This offers faster short-term rollout but doubles the maintenance surface and delays the benefits of a single design system.

### Option 3 – Hybrid phased rebuild
Start by moving the import pipeline and payroll engine into SaaStastic APIs while leaving other screens separate. Gradually shift front-end experiences once the core data is centralized. This spreads the effort but prolongs how long teams juggle two interfaces.

## Decision matrix
| Option | Launch speed (13 slow5 fast) | Build effort (15 low5 high) | Risk of regressions (15 low5 high) | Unified user experience (15 poor5 great) |
| --- | --- | --- | --- | --- |
| Option 1 | 3 | 4 | 2 | **5** |
| Option 2 | **5** | 2 | 4 | 3 |
| Option 3 | 4 | 3 | 3 | 4 |

**Recommendation:** Option 1 balances long-term maintainability with a clean customer journey. The extra upfront build effort is offset by eliminating duplicate infrastructure and aligning with SaaStastic’s production-ready guardrails.
**Decision:** Option 1
## Suggested path if we choose Option 1
1. **Confirm requirements** Validate the open questions above so we know tenant, billing, and offline expectations.
2. **Design shared data model** Map TimeTrakr Lite entities (entries, projects, tasks, lists) into SaaStastic’s Prisma schema and add what is missing.
3. **Build mobile sync APIs** Create secure endpoints for TimeTrakr Lite to push drafts, submit approved time, and fetch project lists, all scoped by company.
4. **Recreate dashboard screens** Port jobs, payroll, invoices, calendars, and tax tools into SaaStastic’s feature modules with updated styling.
5. **Plan migration and rollout** Import historical data if required, pilot with one company, then onboard remaining tenants.

## What we need before building
- **Finalize answers** to the question list so we can lock scope.
- **Agree on Option 1** (or an alternative) and outline any guardrails you want around budget or timeline.
- **Identify pilot customers** who will help verify the end-to-end flow once the rebuild is ready.

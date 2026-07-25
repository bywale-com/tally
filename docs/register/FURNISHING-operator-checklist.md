# Operator — Furnishing checklist (100)

**Stage:** Furnishing (non-invasive). **Surface:** Click-through only (`OperatorPrototypeApp`).  
**Rule:** Do not change Function flows. Densify Create → Evaluate → Enrich → Invite → Launch.

**Implementation:** `apps/tally/src/app/register/wireframes/loFi/opDesk/` · wired by `OperatorPrototypeApp.tsx`

Source brainstorm preserved below. Status: **planted in CT** (2026-07-25).

**Coverage:** ~78 / 100 items implemented in `opDesk/` + `OperatorPrototypeApp.tsx`. Deferred: Enter-to-submit on Create (LoFiField), enrich column density toggle, firm expand peek, import-name quiet CTA.

---

### Campaigns list — around the row
1. Quiet “last touched” relative time on each campaign row  
2. Stage chip: Draft · Evaluate · Enrich · Invited · Running · Archived  
3. Company logo chip when company is locked  
4. Firm count peek when enrich complete (`N firms`)  
5. Client name fact when invite sent (`→ Acme Corp`)  
6. Booked / target meetings chip when running  
7. Sort: Running first, then Invited, Enrich, Evaluate, Draft  
8. Pin one campaign as primary (local preference)  
9. Archive completed campaigns behind quiet filter  
10. Empty vs “resume draft” copy variants  
11. Hover peek: next stage action (“Evaluate”, “Deploy”, etc.)  
12. Hover peek: last history event  
13. Sample density: 4–6 campaigns across stages so list feels lived-in  
14. Keyboard j/k highlight row, Enter opens campaign  
15. “Create” stays loud; secondary “Import name” quiet (display-only)  
16. Row More menu: History · Details · Duplicate (stub) · Archive  

### Campaigns list — depth doors
17. Details sheet: facts grid (company, stage, created, last touched)  
18. Details: target meetings + price per meeting (read-only seed)  
19. Details: printable one-pager layout  
20. History drawer: create → evaluate → enrich → invite → fund → launch timeline  
21. History: append events as CT progresses (local)  
22. Export campaign summary CSV  
23. Duplicate opens Create with name prefilled (still Create flow)  
24. Archive moves row behind filter; unarchive restores  
25. Invited row: “Waiting on accept + fund” with Show client fund door  
26. Running row: honesty chip (silent / working / ok)  
27. Draft row: company unset vs company picked variants  
28. Quiet filter: All · Active · Archived  
29. Search campaigns by name  
30. Client access tray: who was invited (email / account name)  

### Create — basics sheet
31. Campaign name field with character count  
32. “Recent names” tray from prior creates (local)  
33. Template picker: Founding sales · Expansion · Win-back (prefill name only)  
34. Cancel returns to list without orphan noise  
35. Creating loader shows pending name + “Setting up…” subtitle  
36. Post-create lands on company pick with success peek (“Created just now”)  
37. Quiet link: “What happens next” (3-step fact sheet)  
38. Keyboard Enter submits when name valid  

### Create → Evaluate — company pick
39. Company search with domain + employee peek on results  
40. Selected company row: logo, domain, ACV band fact  
41. “Evaluate” loud; “Create another” quiet  
42. Locked company row after evaluate starts (no change action)  
43. Recent companies tray (from seed)  
44. Company pick empty state with one example company chip  
45. Evaluate skeleton: company header + shimmer lines + “Analyzing…” caption  
46. Evaluate skeleton: source tags (LinkedIn, site, jobs) as facts  
47. Dossier: last analyzed timestamp  
48. Dossier: export dossier text  
49. Dossier: section count + unknown count badges  
50. Dossier: re-analyze with sparkles (existing) + progress caption  
51. Dossier: sticky notes (existing) + “N notes” tray peek  
52. Dossier: “What you heard” summary line when notes exist  
53. Dossier: Enrich stays the one loud action  
54. Dossier: More door — full facts grid (all sections at once)  
55. Dossier: copy company domain  

### Enrich — firm list table
56. Enrich running: row count ticker (`12 / 48 firms`)  
57. Enrich running: source mix chip (Wellfound · LinkedIn · …)  
58. Enrich complete: firm count + pruned count  
59. Filter bar (existing) + active filter chips  
60. Export firms CSV  
61. Firm row: LinkedIn link when present  
62. Firm row: follower count when present  
63. Prune/remove count in footer  
64. Enrich history tray: last run at, duration (seed)  
65. Deploy button loud only on firm-list (existing gate)  
66. Back to dossier preserves firms (existing)  
67. Empty enrich state before rows arrive  
68. Column density toggle (comfortable / compact)  
69. “Blocked by client” vs “Removed by you” distinction on pruned  
70. Sample firm descriptions on expand peek  

### Deploy — invite / fund / launch
71. Deploy choice modal: campaign + firm count recap  
72. Deploy choice: guest vs existing consequence one-liners  
73. Invite guest: email validation hint  
74. Invite guest: preview card (campaign, company, firm count, terms locked)  
75. Invite guest: sent log entry after send  
76. Invite existing: account rows with last-active fact  
77. Invite existing: selected account recap before send  
78. List-origin invite: dimmed campaigns list backdrop (existing)  
79. Waiting row on campaigns list after invite (existing) + timestamp  
80. Client fund modal: their surface label + campaign facts + price  
81. Client fund: hold days + meeting target as facts  
82. Accept + fund advances to Running (existing)  
83. Sent invites tray on campaigns list (last 3)  
84. Invite history door: guest vs existing, status Sent / Funded  

### Running — post-launch glance
85. Running badge + fund received fact (existing)  
86. Meetings booked / target progress bar  
87. Worker queue honesty: “Silent since launch” vs “2 touched”  
88. Escrow held / released glance (read-only, links nowhere new)  
89. Client name + invite date facts  
90. Quiet “Pause” / “Stop” doors (display-only consequences)  
91. Reset prototype stays quiet (existing)  
92. Launch receipt ID fact  
93. Next meeting peek when running (seed)  
94. Firm list export link from running glance  

### Shell / cross-nav furniture
95. Sidebar: “You run campaigns” role chip  
96. Nav badges: Meetings (booked count), Messages (· stub)  
97. Command palette: jump campaign / stage / create  
98. Keyboard shortcuts sheet  
99. Density toggle in header  
100. Notification drawer: invite funded, enrich complete, meeting booked (seed)  

---

**How to use this without breaking Function**

Prefer ideas that are: **facts, trays, peeks, density, history, prefs, exports, badges, sample richness**. Defer anything that invents Worker chat, marketplaces, or new outcome leaves.

If you want a second pass next: tag each idea **strip / step / door / ambient**, then pick a 12-item “furnish Operator v1” set that never adds a screen — only densifies existing stages.

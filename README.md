# Halwani Food Service CRM, Collections and Journey Plan Update

## Vercel deployment structure

Keep this exact structure at the root of the GitHub repository:

```text
public/
vercel.json
README.md
.gitignore
```

There is no `package.json`, no Node.js dependency, and no build step.

## Deployment settings on Vercel

- Framework Preset: `Other`
- Build Command: leave blank
- Output Directory: `public`
- Root Directory: `.`

## Included changes

- Rectangular Halwani header with the company logo and a larger `Halwani Food Service` name.
- `Visit Tracker` removed from the header.
- `Check In` and `Close Visit` replace the old GPS labels in the visit workflow.
- GPS validation remains mandatory at both Check In and Close Visit, within 20 metres of the account.
- Collections section in every visit: target, received amount, payment status, and collection notes.
- Monthly collections dashboard: Target, Collected, and Remaining.
- This Month Plan tab: stores per day across the full month, account-level collection target, free-space/manual visit entries.
- Approved customer entry: salespeople can add an account only after providing an approved Halwani customer code and confirming approval.
- CSV templates and an admin import screen for monthly Journey Plan and Collection Targets.
- Exports for visits, actions, and collections. Visit exports include Google Maps GPS links.

## Monthly data CSV columns

### Journey Plan

`month,salesman,date,time,customerCode,customerName,branch,city,area,collectionTargetSAR,visitObjective,notes`

### Collection Targets

`month,salesman,customerCode,customerName,collectionTargetSAR,dueDate,notes`

Templates are available in `public/templates/` and from the app's Admin Tools screen.

## Important pilot limitation

This is a static pilot. The import screen saves monthly files in the browser that imports them. It does not yet distribute the data to every salesman's phone.

The next phase is a shared cloud backend, for example Supabase, using these same monthly data columns. That will allow a Head of Food Service or Manager to upload the monthly plan once and make it visible to the whole sales team.

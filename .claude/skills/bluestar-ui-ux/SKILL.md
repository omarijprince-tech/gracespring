---
name: bluestar-ui-ux
description: "UI/UX criteria and workflow for the Blue Star Pure Water Shopify theme (shopify-theme-bluestar/, installed as the unpublished 'bluestar-theme'). Use for any change to how the store looks, reads or is used: sections, banners, product cards, colors, typography, layout, copy on the page, accessibility, mobile, or uploading theme files to Shopify. Layers Blue Star's brand and store rules on top of the generic ui-ux-pro-max knowledge base."
---

# Blue Star UI/UX

Blue Star Pure Water (Paterson, NJ, since 2010) delivers purified, alkaline (ALKAID) and spring
water in 5-gallon bottles, plus coolers, stands and 12×1L packs, across New Jersey and New York.
Customers are households and offices, many Spanish speakers, often ordering by phone.
The theme lives in `shopify-theme-bluestar/` and is the Grace Spring design adapted to Blue Star.

## Order of authority

1. What the owner asked for in this conversation.
2. The owner's edits saved in the Shopify theme editor (never overwrite them; see workflow).
3. This skill's brand and store rules (`references/design-system.md`).
4. Generic guidance from the `ui-ux-pro-max` skill (styles, UX rules, typography data).
   Use it for UX/accessibility rules and ideas; **ignore its palette/font suggestions** when they
   conflict with the brand — its design-system output for this store proposes greens/orange, which is wrong here.

## Non-negotiables

- **Everything editable.** Any visible text, link, image, color, count or layout choice is a
  section/block/theme setting with a sensible default. Grids get `columns_desktop` + `columns_mobile`
  (via `snippets/grid-cols.liquid`). No hard-coded copy in Liquid; UI strings go to `locales/*.json` (EN + ES).
- **Prices come from products**, never typed into copy (the bundle is $288 / was $388; old site copy said $99/$100).
- **Brand blues**: primary `#2280cc`, dark navy `#102252`/`#1b3f73` family, pale `#eaf4fc`; gold `#f5a623` only for
  badges/offers. Fonts: Poppins (headings) + Inter (body). Rounded cards (14px), pill buttons, soft shadows.
- **One H1 per page.** Extra banners use `heading_tag: h2`.
- **Accessibility**: text contrast ≥ 4.5:1 (3:1 for ≥24px bold headings), visible focus, labels on icon buttons,
  alt text on images, tap targets ≥ 44px, `prefers-reduced-motion` respected for any animation.
- **Mobile first**: check 375px and 1280px; no horizontal scroll; long copy wraps; CTAs reachable.
- **Phone is a first-class CTA** (973-742-0435, "Se Habla Español"), but a button's label must match its link
  (a "More Products" button must not dial the phone).
- Icons are SVG from `snippets/icon.liquid`. Emojis in chips are the owner's content choice — allowed, but don't add new ones in code.

## Store-specific UX priorities (conversion)

1. Above the fold: the current offer (cooler + 5 bottles + stand) with live price, primary CTA, secondary path to all products.
2. Fast path to order water: refills vs. new bottles clearly separated, quantity stepper, add-to-cart drawer.
3. Trust: delivery area (NJ & NY + ZIP checker), hours, licensed since 2010, reviews widget, real photos.
4. Bilingual: every new string in `locales/en.default.json` and `locales/es.json`.
5. Search in the header with predictive results stays available.

## Workflow for a change

1. Read the relevant section(s) and `references/design-system.md`. For UX questions, query the base:
   `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<topic>" --domain ux` (also `style`, `typography`, `landing`).
2. **Pull before you edit**: compare store checksums with local files (`references/shopify-workflow.md`). If the
   owner saved changes in the editor, bring them into the repo first and build on them.
3. Make the change; keep the Grace look (classes in `assets/base.css`; additions only in `assets/bluestar.css`).
4. Run the audit: `python3 .claude/skills/bluestar-ui-ux/scripts/audit_theme.py shopify-theme-bluestar`
   and Shopify Theme Check. Fix every ERROR; judge WARNs.
5. Preview at 1280px and 390px (local renderer if available) and look at the screenshots.
6. Commit + push, then upload changed files to the unpublished theme by URL (code first, templates last),
   and verify checksums. Never touch the live/MAIN theme.
7. Tell the owner what changed, what they must check in Customize, and to reload the editor before saving.

## References

- `references/design-system.md` — tokens, components, sections inventory, copy and content rules.
- `references/shopify-workflow.md` — upload/merge protocol and the Shopify gotchas already hit in this project.
- `scripts/audit_theme.py` — schema/template validation, contrast, H1 count, label/link mismatches, Liquid pitfalls.

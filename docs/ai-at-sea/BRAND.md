# AI at Sea: visual and writing guide

This records the existing site's implementation and approved direction, not a mandate to redesign it. Source of truth for rendered styles: `ai-at-sea-assets/styles.css`. That file contains later responsive overrides; inspect the full cascade before editing.

## Brand

AI at Sea with David Lewis. Premium, curious, approachable, clear, and visually engaging. Maritime context plus practical technology; avoid generic corporate stock art, cartoon robots, excessive neon and distracting effects.

## Existing palette

| Role / CSS token | Color | Use |
| --- | --- | --- |
| Ink / --ink | #050914 | Main dark foundation |
| Secondary ink / --ink2 | #0B1224 | Supporting dark surfaces |
| Paper / --paper | #F4F6F8 | Light editorial surfaces |
| White / --white | #FFFFFF | Primary text on dark surfaces |
| Cyan / --cyan | #39DBFF | Primary accent, buttons, emphasis |
| Blue / --blue | #5677FF | Secondary accent, light-section emphasis |
| Violet / --violet | #A66CFF | Supporting accent |
| Coral / --coral | #FF7C69 | Supporting accent, not dominant |
| Muted / --muted | #AAB4CA | Secondary dark-surface text |
| Line / --line | rgba(255,255,255,.14) | Subtle dark-surface borders |

Existing section surfaces include #080D19 (topics), #10192C (experience), #EEF1F5 (bio), and #0D1728 (programmers). Cards use dark blue gradients and restrained borders. Preserve these relationships; validate contrast on the actual surface rather than assuming every token pairing is accessible.

## Typography and layout

- Current body stack: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif. Inter is not guaranteed to be installed; retain graceful system fallbacks.
- Large editorial headings with contrasting italic emphasis; programmer heading emphasis uses Georgia/serif. Preserve existing heading treatment and responsive sizes.
- Existing session menu: two columns on wide screens; stacked/image-and-copy treatment at intermediate widths; single-column cards on phones.
- Use generous whitespace, readable line heights, clear hierarchy, and the existing roughly 1360px content constraint. Extend established rules rather than stacking unnecessary overrides.
- Maintain keyboard focus visibility, touch-friendly controls, and reduced-motion handling. Check at narrow phone widths and desktop widths after material layout changes.

## Logo and imagery

- Ship/wave AI mark appears to the left of the AI at Sea wordmark in header/footer. Keep David Lewis as readable HTML text rather than baking all words into the icon.
- Current assets: `ai-at-sea-assets/ai-at-sea-logo.png`, `ai-at-sea-icon-512.png`, `apple-touch-icon.png`, and root `favicon.ico`.
- Preserve supplied artwork and transparency. Use the image-generation workflow for creative raster redesigns, not improvised pixel editing. Encoding/resizing for web delivery may be deterministic.
- Approved September 9, 2026: David supplied the higher-contrast white/cyan/navy transparent PNG (`C9711D06-04E5-4298-9EBA-E8ECEDBB7803.png`). This replaces the earlier dark-blue mark in the header, footer and icons. Preserve its artwork and alpha channel. Source upload was 1254×1254; delivered PNG sizes are 256, 512 and 180 pixels, with 16/32/48/64-pixel ICO variants. At small sizes, test recognition against the dark header and favicon background.
- Preserve `david-ai-keynote-hero.webp`, `david-headshot.webp`, and the four original thumbnail files unless explicitly asked to replace them.
- Thumbnails are 3:2 cruise/travel lifestyle scenes with practical devices, natural light and coherent blue tones. Session 5 is `ai-in-your-pocket.webp`; Session 6 is `travel-stories-with-ai.webp`. Generated scenes are illustrations of use, not proof of an actual booking, endorsement or exact product interface.
- Optimize delivery, preserve aspect ratios, reserve image dimensions and provide useful alt text. Do not create new asset variants merely to refresh the site.

## Interaction and copy

Keep the native expandable details, collapsed initially, with full-width “View session details” / “Hide session details” buttons and plus/minus affordances. Do not revert to an ambiguous bare chevron. Preserve native keyboard behavior.

Write concrete guest outcomes and concise buyer information. No fabricated statistics, clients or testimonials. Do not add outbound promotional/tool links; the existing LinkedIn link is approved. New editorial copy must follow STRATEGY.md.

## Latest hero approval — September 9, 2026

David supplied `A62FE404-DDFB-486E-BBAB-ECE704BFAA5A.jpeg` to replace the stage hero. The 1536×864 (16:9) image shows David in a black suit and white shirt, facing the audience with a palm-up gesture. Delivered as `david-ai-keynote-hero.webp`, preserving the supplied composition; the homepage reserves its actual dimensions and versions the image URL for cache refresh. Preserve this approved image until explicitly replaced.

## Latest bio portrait approval

David approved `6830848A-54A0-4C7B-8606-3EADAB305A39.jpeg`: smiling in a casual patterned shirt against a warm background. This supersedes the suited bio portrait; the stage hero remains unchanged. Delivered as `david-headshot.webp` at 720×960. Display in the existing 5:6 frame with object-fit cover and top alignment, retaining the hairline and reducing the shirt area. Keep existing widths: 240px desktop, 180px tablet, 156px phone. Version asset and stylesheet URLs when changing this image.

## Workshop thumbnail and layout

AI in Action uses ai-in-action-workshop.webp (1200×800), a generated illustrative scene of guests using a tablet and smartphone with personal guidance in an onboard meeting space. Keep the 3:2 composition. The optional workshop appears after the six-card grid as an image-and-copy feature, stacked on phones, with native collapsed View/Hide workshop details controls.

## Updated hero — September 11, 2026

David supplied IMG_1087.jpeg and authorized publication. This supersedes the September 9 hero. Preserve the full 1536×869 composition, delivered as david-ai-keynote-hero.webp with the URL version 20260911-hero3 and matching HTML dimensions. Existing responsive positioning remains. Sharing metadata now uses david-lewis-ai-enrichment-share-v2.jpg, 1200×679 JPEG, derived from the same approved image with its aspect ratio preserved. No creative modifications were made. Existing cached social previews may retain older imagery.

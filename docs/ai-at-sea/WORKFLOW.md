# AI at Sea: new-chat and publishing workflow

## Start from the durable source

1. Identify this task as davidlewis.ai, repository `Starman965/davidlewis`, branch `main`, existing GitHub Pages hosting.
2. Read root `AGENTS.md`, `AI-AT-SEA.md`, and the relevant strategy/brand guides from the latest repository. A local checkout path from another chat may no longer exist.
3. Verify available GitHub read/write access. Read-only research tools alone are not publishing capability. If access is unavailable, name the missing capability and provide a precise handoff; do not create another site or claim only the original chat can work on it.
4. Inspect current remote revision and local status. Preserve user/concurrent changes. Fetch and fast-forward only when safe. Never use a historical baseline or old upload as the current site without explicit rollback instructions.
5. State the targeted change and protect unrelated session text, imagery, pages and behavior.

## Source map

- `index.html`: homepage, six session cards, metadata, JSON-LD, buyer information and direct email contact.
- `ai-at-sea-assets/styles.css`: existing responsive design and brand styling.
- `ai-at-sea-assets/script.js`: navigation behavior.
- `ai-at-sea-assets/`: stage hero, headshot, session imagery and brand icons.
- `CNAME`: existing custom domain configuration; preserve.
- Other directories and root pages: separate user projects; not part of an AI at Sea homepage change unless requested.

This is a static website; no application build is required. Do not introduce a framework, package manager, backend or hosting migration merely to make a content edit.

## Validation

- Check the diff and preserve Sessions 1–4 verbatim for changes that do not target them.
- Match displayed session count, titles, fragment links and JSON-LD entries. Parse JSON-LD as JSON.
- Verify local image/style/script paths and unique section IDs; preserve canonical www.davidlewis.ai URLs.
- Run JavaScript syntax checks and `git diff --check`.
- For visual changes, inspect actual desktop/mobile rendering where browser tools permit; test menu, detail expansion, focus and overflow. Do not claim visual QA from source checks alone.
- Verify the contact mailto destination without sending a message. The email CTA opens the visitor’s email client.
- Check asset dimensions, loading, logo contrast and thumbnail crops. Bump asset query versions when needed to prevent stale CSS/icons.

## Save and publish

Use the existing authorized GitHub connection. Normal authenticated Git or the available GitHub file/Git-data tools may be used. For a multi-file change through Git-data tools, create blobs, create a tree based on the latest parent tree, create one commit, and non-force update main. Validate uploaded blobs match local bytes. Preserve all untouched tree entries. Never expose credentials, force-push, or circumvent protected branches.

Inspect the current remote head before publishing; if another task advanced it, reconcile changes instead of overwriting them. Prefer one active publishing task per website.

Wait for the GitHub Pages build/deployment result. On success, verify the homepage and changed assets at https://www.davidlewis.ai/ (not the ChatGPT Sites URL). Report what changed, what was preserved, what checks ran and any unresolved items. Do not equate a committed file with a successful public deployment.

## Ongoing decisions and new conversations

Discussion, voice input and implementation can happen in separate project chats, but code and finalized decisions must be durable. Record approved strategy changes in STRATEGY.md, visual rules in BRAND.md, operational changes here, and pending decisions distinctly from implemented ones. Add only website-relevant information, never credentials.

At handoff, identify the current repository revision, requested changes, approved assets and unresolved choices. New chats must still have appropriate tools and access; a markdown file cannot grant permissions or guarantee that every chat retrieves every source.

The historical four-session baseline is `132277787fd4778a8b629145f6942c52d55460c8`. The six-session/logo update is `42b10b536546d59de93c16aa96c91c90b76406d8`. These are historical checkpoints; always inspect current main.

## SEO handoff

Homepage metadata emphasizes practical AI talks and immediate use; the existing title and canonical www URL are retained. Open Graph/X previews use the approved stage hero, replacing the homepage reference to the legacy Vibe Coder social card. Preserve the legacy image file for other projects. Person data includes David’s approved public email; session metadata reflects all six current titles and the Apple-device scope. Root robots.txt permits crawling and references sitemap.xml; the sitemap currently lists only the speaker homepage, not unrelated projects. Search Console ownership/access has not been verified in this workflow, and no indexing request has been submitted. Request a homepage recrawl from the verified property when access is available.

## Messages preview compatibility follow-up

After David reported a blank Messages preview, the homepage sharing metadata was changed to the dedicated `ai-at-sea-assets/david-lewis-ai-enrichment-share-v1.jpg` (1200×675, JPEG). It preserves the approved stage composition; the in-page hero remains WebP. Metadata dimensions and MIME type match the JPEG. Original WebP was reachable, so a format or cache cause was suspected, not proven. Public delivery checks do not constitute verification of native Messages rendering; test a newly sent link on David’s device.

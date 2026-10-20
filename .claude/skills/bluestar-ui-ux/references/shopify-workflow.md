# Shopify workflow and gotchas

Store: Blue Star Pure Water. Work only on the unpublished theme **bluestar-theme**
(`gid://shopify/OnlineStoreTheme/191125225785`). The live theme is "Copy of Essentials--shailaworking" — read-only.

## Pull before editing (the owner edits in the theme editor)

1. Query the theme's files with `checksumMd5`/`updatedAt` and compare with `md5sum` of local files.
2. If a JSON template/group differs and was updated after your last upload, fetch its content and merge
   the owner's values into the local file **before** your change. Their choices win (texts, links, disabled blocks).
3. Re-check right before uploading; if they saved again, merge again.
4. After uploading, tell the owner to reload the editor: saving from a tab opened before new settings
   existed drops those settings (this happened with the waves background).

## Upload

- Commit + push, then `themeFilesUpsert` with `body.type: URL` pointing at
  `https://raw.githubusercontent.com/omarijprince-tech/gracespring/<commit>/shopify-theme-bluestar/<file>`.
- Upload sections/snippets/assets/locales first, templates/groups last (or in a second call). A template uploaded
  in the same batch as a section that gains new settings can lose those settings — re-upload the template.
- The job is async: poll `job { done }`, then compare checksums. A file whose checksum didn't change was rejected
  silently; re-send it alone (or as TEXT) to see the error.
- Shopify adds a comment header to JSON files and drops settings equal to defaults, so JSON checksums can differ
  while the content is fine — compare parsed values.

## Gotchas already hit

- `range` settings need 3–101 steps (`(max-min)/step`), otherwise the file is rejected → use `select` for 1–2 options.
- Liquid ends an output tag at `}` even inside a string: no `{` or `}` inside `{{ '...' }}` literals.
- Filters can't be used inside tag parameters (`image_tag: style: 'a' | append: x` fails) — capture first.
- `t` filter arguments can't chain filters — assign the value first.
- CSS base sets `img, svg { max-width: 100% }`; wide decorative SVGs need `max-width: none`.
- `.footer-brand` is an existing class (flex); don't reuse names from base.css for new wrappers.

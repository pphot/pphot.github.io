# Pphot

A warm lifestyle blog built with [Gozzi](https://gitlab.com/tduyng/gozzi), a static site generator written in Go. The site covers travel journals, daily thoughts, and book reviews, and ships with search, an archive, taxonomy pages, reactions, sharing, dark mode, and an Atom feed.

## Requirements

- Gozzi `0.2.x` (`go install github.com/tduyng/gozzi@latest`, needs `GOPROXY=direct`)

Nothing else. There is no package manager step, no bundler, and no client side framework.

## Local development

```bash
gozzi serve
```

That watches `content/`, `templates/`, `shortcodes/`, and `static/` and serves the site on <http://localhost:1313>.

To produce a build instead:

```bash
gozzi build          # writes public/
gozzi build --drafts # includes posts marked draft = true
gozzi build --future # includes posts dated in the future
```

Gozzi renders pages concurrently and very occasionally dies on a map race. The workflows retry the build three times for that reason.

## Writing a post

Every post is a leaf bundle: a directory under `content/<section>/` holding an `index.md` and an optional `img/` folder that is copied next to the built page.


```
content/journal/2026-01-12-chasing-golden-hour/
├── index.md
└── img/
    └── cover.webp
```

The folder name is the URL. `content/journal/2026-01-12-chasing-golden-hour/` becomes `/journal/chasing-golden-hour/`, so prefix directories with the date to keep them sorted.

### Front matter

```toml
+++
title = "Chasing Golden Hour"
date = 2026-01-12T00:00:00Z
updated = 2026-01-12T00:00:00Z
template = "post.html"
description = "One sentence that appears on cards, in search results, and as the meta description."
tags = ["photography", "travel", "ritual"]
categories = ["journal"]
generate_feed = true
featured = true

[extra]
img = "/img/gallery/golden-hour-03.webp"
+++
```

| Key | Type | What it does |
| --- | --- | --- |
| `title` | string | Post headline. Falls back to the folder name. |
| `date` | timestamp | Publication date. Always write the `Z` suffix. See [Dates](#dates). |
| `updated` | timestamp | Set it whenever you revise a post. Drives `article:modified_time` and the Atom entry. |
| `template` | string | Which template renders the page. `post.html` for journal posts, `thought.html` for short daily writing. |
| `description` | string | Used for the excerpt, the meta description, and search results. |
| `tags` | list | Feeds `/tags/`, the tag cloud, and related posts. |
| `categories` | list | Feeds `/categories/`. One value per post in practice. |
| `generate_feed` | bool | Includes the post in `atom.xml`. |
| `draft` | bool | Excluded from the build unless you pass `--drafts`. |
| `aliases` | list | Old paths for this post. Each one becomes a redirect page. |
| `series` | string | Groups the post into a series. |
| `series_order` | int | Position in the series. Drives the order of `/series/<name>/`. |
| `featured` | bool | Promotes the post into the Featured Stories block on the homepage. |
| `extra.img` | string | Cover image. A leading `/` means a site wide path, anything else resolves relative to the post. |

### Sections

`thoughts`, `journal`, and `books` are the three content sections. Each has its own listing template and its own title and subtitle in `config.toml`.

A new section needs a directory under `content/`, a template named after it, and an entry in `[extra.sections]` so the header links to it.

### Dates

Write dates with the `Z` suffix. Gozzi parses a bare `2026-01-12` in the build machine's local timezone and then converts it to UTC, so the same content renders a day earlier depending on where the build runs. `2026-01-12T00:00:00Z` is identical everywhere.

## Markdown

Gozzi renders the markdown with GFM, footnotes, and Chroma syntax highlighting. Tables, task lists, footnotes, and fenced code blocks all have styles in both themes.

````markdown
| Trip | Year | Verdict |
| --- | --- | --- |
| Paris | 2026 | Go again |

- [x] Pack a jacket
- [ ] Book the train

Some claim with a footnote.[^1]

[^1]: And that is the whole story.

```go
func main() {}
```
````

Fenced code blocks are highlighted with the Chroma style named by `syntax_theme`, which defaults to `dracula`. That means a code block keeps its dark background in both themes.

A ` ```mermaid ` fence renders as a diagram. `main.js` loads the mermaid library from `mermaid_src` only when a page actually contains one, and falls back to showing the diagram source if the load fails. Mermaid comes from a CDN, so point `mermaid_src` somewhere else if you would rather self host it.

Gozzi also compiles `$math$` delimiters by default, which emits markup that only makes sense alongside a KaTeX bundle and leaves no marker for a script to target. It is switched off with `[plugins.markdown] math = false`. Turn it back on only if you also add KaTeX yourself.

## Shortcodes

Shortcodes live in `shortcodes/`, one file per name, and are expanded before markdown runs.

Self closing:

```
{{< figure src="/img/paris.webp" alt="The Eiffel Tower at dusk" size="full" >}}
```

Paired:

```
{{% callout type="info" title="Worth knowing" %}}
Body text, **markdown** included.
{{%/ callout %}}
```

Two syntax rules catch everyone at least once.

The closing tag is `{%/ name %}}`, with one opening brace, not two. A shortcode name has to be letters, digits, and underscores, so `image-pair` is never found and `imagepair` is.

| Name | Form | Parameters |
| --- | --- | --- |
| `figure` | self closing | `src`, `alt`, `caption`, `align` (`left`, `center`, `right`), `size` (`full`) |
| `gallery` | paired | `columns` (1 to 5). Body is a run of markdown images, which the grid lays out in columns. |
| `imagepair` | self closing | `left`, `right`, `left_alt`, `right_alt`, `caption` |
| `video` | self closing | `embed="youtube"` for an iframe, otherwise `src` is treated as a video file. Plus `title`, `poster`, `caption`. |
| `callout` | paired | `type` (`info`, `warning`, `danger`), `title` |
| `quote` | paired | `cite` |

Shortcode templates get Go's built in template functions and nothing else. No `default`, no `where`, no custom functions. Reach for `{{ if .param }}` instead.

## Configuration

Everything lives in `config.toml`. The keys worth knowing:

| Key | Purpose |
| --- | --- |
| `base_url` | Absolute site URL. Feeds canonical links, the Atom feed, and the sitemap. |
| `language` | `lang` attribute and `og:locale`. |
| `output_dir` | Build output directory. |
| `summary_length` | Sentences taken from the body when a page has no `description`. |
| `minify_css`, `minify_html`, `minify_js`, `minify_json`, `minify_svg`, `minify_xml` | Minify the matching assets on build. |
| `[plugins.fingerprint] enabled` | Appends a content hash to CSS and JS URLs so they cache forever. |
| `[extra]` | Every string, list, and label the templates read. |
| `[extra.author]` | Atom feed author. |
| `[[extra.contact_methods]]` | Cards on `/contact/`: `icon`, `label`, `value`, `url`, `new_tab`. |
| `[extra.sections]` | Header navigation. |
| `[extra.footer_links]` | Footer links. |
| `home_featured_count`, `home_latest_count` | Cards shown in each homepage block. Latest skips anything marked `featured`, so a post never appears twice on the homepage, and the block hides itself when nothing is left to show. |
| `[taxonomies]` | Enables `tags`, `categories`, and `series`. |

In `[extra]`, a table header ends the plain keys above it. Put `[extra.author]` and `[[extra.contact_methods]]` at the bottom of the file, or the keys after them silently move into the wrong table.

### Optional features

`comment_endpoint` turns on threaded comments at the foot of every post. Set it to empty to switch them off.

The comments service only answers requests from origins listed in its own `ORIGINS` variable, and this domain is not on that list yet. Until it is, the section renders as "Comments are unavailable right now" rather than a broken form. To finish the wiring, add `https://pphot.blog` to `ORIGINS` in `apps/comment-blog/wrangler.toml` and redeploy that worker.

`reaction_endpoint` turns on emoji reactions under the share buttons.

The buttons render from `reaction_emojis`, then fill in counts from the service. If the service does not know the post slug, the block is removed rather than left half working. A post can override the emoji set with `extra.reaction_emojis`.

`outdate_alert_days` adds a notice to posts older than that many days. Set it to `0` to turn the notice off everywhere.

`comment_endpoint` and `reaction_endpoint` point at workers in this monorepo, under `apps/comment-blog` and `apps/reaction-blog`.

## Templates

`templates/` holds one HTML template per page type.

Gozzi resolves them in this order: the page's `template` front matter, then a template named after the section, then `page.html`. Every post sets `template` explicitly, so `page.html` only catches a forgotten one.

| Template | Renders |
| --- | --- |
| `home.html` | `/` |
| `post.html` | Journal and book posts, with a table of contents sidebar |
| `thought.html` | Daily thoughts, without the sidebar |
| `journal.html`, `books.html`, `thoughts.html` | Section listings |
| `archive.html` | `/archive/`, every post grouped by year |
| `search.html` | `/search/` |
| `about.html`, `contact.html` | Static pages |
| `tags.html`, `tag.html` | `/tags/` and `/tags/<term>/` |
| `categories.html`, `category.html` | `/categories/` and `/categories/<term>/` |
| `series.html`, `serie.html` | `/series/` and `/series/<name>/` |
| `page.html` | Fallback for a page with no `template` key and no section template |
| `404.html` | Not found |
| `partials/_open.html`, `partials/_close.html` | The page shell. Every template opens with `_open` and closes with `_close`. |
| `partials/_post_card.html` | A post card, used by the homepage and every section listing |
| `partials/_article.html` | A post body: header, prose, share, reactions, author, older/newer links, related posts |
| `partials/_head.html`, `partials/_footer.html`, `partials/_header.html`, `partials/_json_ld.html` | Document head, footer, header, structured data |
| `partials/_toc.html`, `partials/_related_posts.html`, `partials/_post_nav.html`, `partials/_post_meta.html` | Smaller pieces |

`templates/partials/_taxonomy_index.html` and `partials/_taxonomy_term.html` back all six taxonomy templates.

To pass data into a partial, build a dict: `{{ template "partials/_post_card.html" (dict "Post" . "Site" $.Site "Level" 2) }}`. Inside the partial, `$` is the dict, not the page.

One limitation worth knowing: Go cannot assign a `{{ template }}` call to a variable, so a partial cannot return a value. Partial markup has to be emitted, not computed.

## Assets

`static/` is copied to the output as is.

`static/css/main.css` holds the design tokens and every component style. Colours come from custom properties, and dark mode is the token block restated for `[data-theme='dark']`.

A media query in that file may only hold a refinement of a rule that already exists. A component's base rules belong at the top level, because a rule parked inside `@media (min-width: 1024px)` silently stops applying on every phone and tablet.

`static/js/main.js` carries the theme toggle, mobile menu, reading progress, table of contents spy, sharing, reactions, and the lazy loading of `static/js/search.js`.

`static/js/lightbox.js` opens prose images in an overlay on post pages. `static/js/comments.js` loads and posts comments through the comments worker. Both load only on post pages.

Resized image variants, such as `static/img/hero-768.webp`, are generated once and committed. Regenerate them with `magick` after replacing a source image.

Two sizes are worth keeping straight. A post cover is displayed about 1200px wide in the article header, so keep it at 1200px. A gallery image is displayed at roughly a quarter of the content width in a grid and about 700px on a phone, so 900px is the right source and nothing more: `magick src.webp -resize 900x -quality 72 dst.webp`. Markdown images are fetched while the page parses, before any script runs, so a `srcset` added later cannot save the bytes. Size the source instead.

Listing pages show covers through `srcset`. `[extra.thumbnails]` maps each full size cover path to a 480px copy in `static/img/thumbs/`, so a listing never downloads a full sized image. A cover missing from that map simply falls back to the single size file.

The stylesheet ends with a print block that drops the site chrome, widens the measure, expands outbound links, and keeps figures from splitting across pages.

## Series

Give a post `series = "Some Name"` and a `series_order`, and Gozzi builds a reading order page at `/series/<name>/`. A post that belongs to a series also grows a panel under the author block with the series name, its position, and links to the neighbouring parts.

The seven Harry Potter reviews are set up this way. Untagging a post from a series is just deleting the two keys.

## Moved posts

`aliases` writes a redirect page for every old path you list. `aliases = ["/journal/coffee-rituals/"]` on the coffee shop post is a live example. Gozzi normalises the leading slash, so `"about"` and `"/about"` both work.

## Feeds and the sitemap

`atom.xml` and `sitemap.xml` are generated by the Gozzi plugins. Both reference an XSL stylesheet that renders them as a browsable page, and both stylesheets live in `static/` because a file in `static/` overwrites whatever the plugin wrote. The feed carries the full text of every post.

Two engine limits are worth knowing. The sitemap lists paths without a trailing slash while the pages are directories, so a host that redirects `/about` to `/about/` handles it, which is what GitHub Pages does. And Gozzi's sitemap walks the content tree plus tag pages, so `/categories/` and `/series/` term pages are reachable by link but absent from the XML. Both are fine for crawling; neither is worth working around on the site side.

## Deploy

`.github/workflows/ci.yml` builds every push to `main`. `.github/workflows/deploy.yml` publishes `public/` to GitHub Pages on demand from the Actions tab.

## Troubleshooting

**The build fails with `function "default" not defined`.** A shortcode used a Gozzi template function. Shortcode templates only get Go builtins.

**Post dates are off by a day.** A front matter date is missing its `Z` suffix.

**A shortcode shows up as literal `{{% ... %}}`.** Check the closing tag, or that the name contains no hyphen.

**The header navigation is empty.** A `[extra.*]` sub table header sits above the keys in `config.toml`, so those keys ended up in the wrong table.

**The featured block is empty.** `featured` has to be a top level key, not inside `[extra]`.

**Reactions never appear.** The reaction service only answers for slugs in its own allowlist.

**Comments are unavailable.** The site origin is missing from the `ORIGINS` variable in `apps/comment-blog/wrangler.toml`.

**A page shows every post when a count is configured.** Gozzi's `limit` asserts an `int` and TOML hands over an `int64`, so `limit $.Site.Config.some_count $list` returns the whole list. The homepage counts with a loop counter for that reason.

**A series page has empty titles.** Gozzi's series plugin puts no `Title` on its page items. `_taxonomy_term.html` reads the title from `Config` for that reason, so a template that uses `.Title` on a series page will show nothing.
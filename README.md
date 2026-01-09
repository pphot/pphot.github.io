# Pphot - A Beautiful Lifestyle Blog 🌸✨

A warm, elegant lifestyle blog built with [Gozzi](https://github.com/tduyng/gozzi) static site generator. Features photography, travel journals, and book reviews with a magazine-style design.

---

## Features

- 🎨 **Warm Color Palette** - Sand (#D4A574), terracotta (#C17767), and cream tones
- 📱 **Fully Responsive** - Mobile-first design (640px, 768px, 1024px, 1280px breakpoints)
- ⚡ **Lightning Fast** - Static site generation, optimized images, lazy loading
- 🔍 **SEO Optimized** - Complete meta tags, Open Graph, Twitter Cards, JSON-LD structured data
- ♿ **Accessible** - WCAG compliant, keyboard navigation, skip links
- 📸 **Image Lightbox** - Beautiful full-screen photo viewing with keyboard support
- 📖 **Reading Progress** - Visual progress indicator for blog posts
- ✨ **Smooth Animations** - Elegant fade-ins and transitions throughout

## Design Philosophy

**Inspired by**: Kinfolk magazine, Cereal magazine, modern lifestyle blogs

**Typography**:
- Display: Playfair Display (elegant headings)
- Body: Lora (readable serif for content)
- UI: Inter (clean sans-serif for interface)

**Layout**: 
- Magazine-style with heavy focus on imagery
- Image-first post cards in 3-column grid
- Clean, airy spacing with generous whitespace
- Warm golden hour aesthetic

**Sections**:
- 📔 **Journal** - Travel stories and life adventures
- 📚 **Books** - Reviews and literary reflections
- 📸 **Photography** - Visual essays and galleries
- 👤 **About** - Personal story and bio

## Repository Structure

```
pphot/
├── content/
│   ├── _index.md           → Homepage content
│   ├── about/              → About page
│   ├── contact/            → Contact page
│   ├── journal/            → Travel & journal posts
│   ├── books/              → Book reviews
│   └── photography/        → Photo galleries
├── templates/
│   ├── partials/
│   │   ├── _head.html      → Meta tags, SEO
│   │   ├── _header.html    → Navigation
│   │   ├── _footer.html    → Footer links
│   │   └── _json_ld.html   → Structured data
│   ├── home.html           → Homepage template
│   ├── post.html           → Single post template
│   ├── journal.html        → Journal section
│   ├── books.html          → Books section
│   ├── photography.html    → Photography gallery
│   ├── about.html          → About page
│   ├── contact.html        → Contact form
│   ├── tags.html           → All tags page
│   ├── tag.html            → Single tag page
│   ├── archive.html        → Archive timeline
│   └── 404.html            → Error page
├── static/
│   ├── css/
│   │   └── main.css        → Complete CSS architecture
│   ├── js/
│   │   ├── main.js         → Navigation, scroll effects
│   │   └── lightbox.js     → Image lightbox
│   └── img/                → Images and photos
└── config.toml             → Site configuration
```

## Development

```bash
# Build the site
gozzi build

# Serve locally with hot reload
gozzi serve --port 1313
```

## Tech Stack

- **Generator**: [Gozzi](https://github.com/tduyng/gozzi) - Fast Go-based SSG
- **CSS**: Pure CSS, no frameworks - fluid typography, CSS Grid, custom properties
- **JavaScript**: Vanilla JS - minimal, performant interactions
- **Fonts**: Google Fonts (Playfair Display, Lora, Inter)

## Sample Content

The blog includes sample content to showcase the design:
- 2 journal posts (Paris weekend, Portugal coast)
- 2 book reviews (The Midnight Library, Braiding Sweetgrass)
- 1 photography gallery (Golden Hour Collection)

## License

MIT

---

<p align="center">
  <sub>✨ Created by Pixel the Frontend Wizard ✨</sub><br>
  <sub>Built with 🌸 using <a href="https://github.com/tduyng/gozzi">Gozzi</a></sub>
</p>

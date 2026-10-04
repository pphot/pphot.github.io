;(function () {
    'use strict'

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    function onIdle(callback) {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(callback)
        } else {
            window.setTimeout(callback, 1)
        }
    }

    /* ---------------------------------------------------------------
     * Colour theme
     * ------------------------------------------------------------- */

    function enableThemeToggle() {
        const root = document.documentElement
        const toggle = document.getElementById('theme-toggle')
        const stored = readStoredTheme()

        const apply = (theme) => {
            if (theme === 'auto') {
                delete root.dataset.theme
            } else {
                root.dataset.theme = theme
            }
            if (toggle) {
                const resolved = theme === 'auto' ? systemTheme() : theme
                toggle.setAttribute('aria-pressed', resolved === 'dark' ? 'true' : 'false')
                toggle.setAttribute('aria-label', resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme')
            }
        }

        apply(stored)

        if (!toggle) return

        toggle.addEventListener('click', () => {
            const current = readStoredTheme()
            const resolved = current === 'auto' ? systemTheme() : current
            const next = resolved === 'dark' ? 'light' : 'dark'
            try {
                localStorage.setItem('theme', next)
            } catch (e) {}
            apply(next)
        })

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (readStoredTheme() === 'auto') apply('auto')
        })
    }

    function readStoredTheme() {
        try {
            const value = localStorage.getItem('theme')
            return value === 'light' || value === 'dark' ? value : 'auto'
        } catch (e) {
            return 'auto'
        }
    }

    function systemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    /* ---------------------------------------------------------------
     * Mobile navigation
     * ------------------------------------------------------------- */

    function enableMobileNav() {
        const toggle = document.getElementById('mobile-menu-toggle')
        const nav = document.getElementById('mobile-nav')
        if (!toggle || !nav) return

        const setOpen = (open) => {
            nav.hidden = !open
            nav.classList.toggle('active', open)
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false')
            document.body.classList.toggle('nav-open', open)
        }

        toggle.addEventListener('click', () => setOpen(nav.hidden))
        document.getElementById('mobile-nav-close')?.addEventListener('click', () => setOpen(false))
        nav.addEventListener('click', (event) => {
            if (event.target.closest('a')) setOpen(false)
        })
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !nav.hidden) {
                setOpen(false)
                toggle.focus()
            }
        })
        document.addEventListener('click', (event) => {
            if (!nav.hidden && !nav.contains(event.target) && !toggle.contains(event.target)) {
                setOpen(false)
            }
        })
    }

    /* ---------------------------------------------------------------
     * Search dialog (loads /js/search.js on first use)
     * ------------------------------------------------------------- */

    function enableSearch() {
        const toggle = document.getElementById('search-toggle')
        const dialog = document.getElementById('search-dialog')
        if (!dialog) return

        const closeButton = document.getElementById('search-close')
        const source = toggle?.dataset.searchSrc || '/js/search.js'
        let loader = null

        const load = () => {
            if (loader) return loader
            loader = new Promise((resolve, reject) => {
                const script = document.createElement('script')
                script.src = source
                script.onload = resolve
                script.onerror = reject
                document.head.appendChild(script)
            })
            return loader
        }

        const open = () => {
            load()
                .then(() => {
                    dialog.showModal()
                    document.getElementById('search-dialog-input')?.focus()
                })
                .catch(() => {})
        }

        toggle?.addEventListener('click', open)
        closeButton?.addEventListener('click', () => dialog.close())
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) dialog.close()
        })
        document.addEventListener('keydown', (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault()
                dialog.open ? dialog.close() : open()
            }
        })
    }

    /* ---------------------------------------------------------------
     * Reading progress and back to top
     * ------------------------------------------------------------- */

    function scrollPercent() {
        const total = document.documentElement.scrollHeight - window.innerHeight
        return total > 0 ? Math.min(window.scrollY / total, 1) : 0
    }

    function enableReadingProgress() {
        const bar = document.getElementById('reading-progress')
        if (!bar) return

        let ticking = false
        const update = () => {
            bar.style.width = `${scrollPercent() * 100}%`
            ticking = false
        }
        window.addEventListener(
            'scroll',
            () => {
                if (!ticking) {
                    ticking = true
                    window.requestAnimationFrame(update)
                }
            },
            { passive: true },
        )
        update()
    }

    function enableBackToTop() {
        const button = document.getElementById('back-to-top')
        if (!button) return

        const circle = button.querySelector('circle')
        let circumference = 0
        if (circle) {
            circumference = 2 * Math.PI * circle.r.baseVal.value
            circle.style.strokeDasharray = `${circumference}`
            circle.style.strokeDashoffset = `${circumference}`
        }

        let ticking = false
        const update = () => {
            const progress = scrollPercent()
            if (circle) {
                circle.style.strokeDashoffset = `${circumference * (1 - progress)}`
            }
            button.classList.toggle('shown', window.scrollY > 300)
            ticking = false
        }
        window.addEventListener(
            'scroll',
            () => {
                if (!ticking) {
                    ticking = true
                    window.requestAnimationFrame(update)
                }
            },
            { passive: true },
        )
        button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' })
        })
        update()
    }

    /* ---------------------------------------------------------------
     * Header, parallax and in-page anchors
     * ------------------------------------------------------------- */

    function enableAutoHideHeader() {
        const header = document.querySelector('header')
        if (!header) return

        let lastScroll = 0
        let ticking = false
        const update = () => {
            const current = window.scrollY
            header.classList.toggle('scroll-up', current < lastScroll)
            header.classList.toggle('scroll-down', current > lastScroll && current > 120)
            lastScroll = current
            ticking = false
        }
        window.addEventListener(
            'scroll',
            () => {
                if (!ticking) {
                    ticking = true
                    window.requestAnimationFrame(update)
                }
            },
            { passive: true },
        )
    }

    function enableHeroParallax() {
        const hero = document.querySelector('.hero')
        const image = hero?.querySelector('.hero-image')
        if (!hero || !image || reducedMotion.matches) return

        let ticking = false
        window.addEventListener(
            'scroll',
            () => {
                if (!ticking) {
                    ticking = true
                    window.requestAnimationFrame(() => {
                        const shift = Math.min(window.scrollY, hero.offsetHeight) * 0.18
                        image.style.transform = `translateY(${shift}px)`
                        ticking = false
                    })
                }
            },
            { passive: true },
        )
    }

    function enableAnchorScroll() {
        const header = document.querySelector('header')
        const offset = () => (header ? header.offsetHeight + 16 : 16)

        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href^="#"]')
            if (!link) return
            const hash = link.getAttribute('href')
            if (!hash || hash === '#') return
            // A fragment is an id, not a selector, so it is looked up as one.
            const target = document.getElementById(decodeURIComponent(hash.slice(1)))
            if (!target) return

            event.preventDefault()
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - offset(),
                behavior: reducedMotion.matches ? 'auto' : 'smooth',
            })
            if (history.replaceState) history.replaceState(null, '', hash)
        })
    }

    /* ---------------------------------------------------------------
     * Reveal on scroll
     * ------------------------------------------------------------- */

    function enableRevealOnScroll() {
        if (!('IntersectionObserver' in window)) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return
                    entry.target.classList.add('is-visible')
                    observer.unobserve(entry.target)
                })
            },
            { threshold: 0.1 },
        )
        document.querySelectorAll('.fade-in, .section-header').forEach((element) => observer.observe(element))
    }

    function enableTocScrollSpy() {
        const toc = document.querySelector('.toc-nav')
        if (!toc || !('IntersectionObserver' in window)) return

        const links = new Map()
        document.querySelectorAll('.prose h2[id], .prose h3[id]').forEach((heading) => {
            const link = toc.querySelector(`a[href="#${CSS.escape(heading.id)}"]`)
            if (link) links.set(heading, link)
        })
        if (links.size === 0) return

        let active = null
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return
                    const link = links.get(entry.target)
                    if (!link || link === active) return
                    active?.classList.remove('active')
                    link.classList.add('active')
                    active = link
                    link.scrollIntoView({ block: 'nearest' })
                })
            },
            { rootMargin: '-88px 0px -75% 0px', threshold: 0 },
        )
        links.forEach((link, heading) => observer.observe(heading))
    }

    /* ---------------------------------------------------------------
     * Post page: stale notice, sharing, reactions
     * ------------------------------------------------------------- */

    function enableOutdateAlert() {
        const alert = document.getElementById('outdate-alert')
        const published = document.querySelector('.post-date')?.getAttribute('datetime')
        const limit = parseInt(alert?.dataset.days, 10)
        if (!alert || !published || !limit) return

        const age = Math.floor((Date.now() - new Date(published).getTime()) / 86400000)
        if (age <= limit) return

        alert.textContent = `${alert.dataset.before} ${age} ${alert.dataset.after}`
        alert.classList.remove('is-hidden')
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text)

        // The async clipboard is missing outside a secure context, which a LAN
        // preview or a plain http host will be.
        const field = document.createElement('textarea')
        field.value = text
        field.setAttribute('readonly', '')
        field.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
        document.body.append(field)
        field.select()
        const copied = document.execCommand('copy')
        field.remove()
        return copied ? Promise.resolve() : Promise.reject(new Error('blocked'))
    }

    function enableShare() {
        const urls = {
            x: (url, title) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            facebook: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            email: (url, title) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
        }

        document.querySelectorAll('.share-button[data-share]').forEach((button) => {
            button.addEventListener('click', () => {
                const url = button.dataset.url
                const title = button.dataset.title || ''
                const kind = button.dataset.share

                if (kind === 'copy') {
                    copyToClipboard(url).then(
                        () => flashLabel(button, 'Copied'),
                        () => flashLabel(button, 'Copy failed'),
                    )
                    return
                }

                const build = urls[kind]
                if (!build) return
                const target = build(url, title)
                if (kind === 'email') {
                    window.location.href = target
                    return
                }
                window.open(target, '_blank', 'noopener,noreferrer,width=600,height=520')
            })
        })
    }

    function flashLabel(button, message) {
        const original = button.textContent
        button.textContent = message
        button.classList.add('is-done')
        window.setTimeout(() => {
            button.textContent = original
            button.classList.remove('is-done')
        }, 1600)
    }

    function enableReactions() {
        const root = document.querySelector('.reaction')
        if (!root) return

        const endpoint = root.dataset.endpoint
        const slug = window.location.pathname.replace(/\/+$/, '').split('/').pop()

        const buttons = new Map()
        root.querySelectorAll('.reaction-btn').forEach((button) => buttons.set(button.dataset.emoji, button))

        const paint = (counts) => {
            Object.entries(counts).forEach(([emoji, [count, reacted]]) => {
                const button = buttons.get(emoji)
                if (!button) return
                button.querySelector('[data-count]').textContent = count
                button.classList.toggle('is-reacted', reacted)
                button.setAttribute('aria-pressed', reacted ? 'true' : 'false')
                button.setAttribute('aria-label', `${emoji} ${count}`)
                button.disabled = false
            })
            root.classList.remove('is-pending')
        }

        root.addEventListener('click', (event) => {
            const button = event.target.closest('.reaction-btn')
            if (!button || button.disabled) return

            const reacted = button.getAttribute('aria-pressed') === 'true'
            fetch(`${endpoint}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, target: button.dataset.emoji, reacted: !reacted }),
            })
                .then((response) => (response.ok ? response.json() : null))
                .then((counts) => {
                    if (counts) paint(counts)
                })
                .catch(() => {})
        })

        fetch(`${endpoint}/?slug=${encodeURIComponent(slug)}`)
            .then((response) => (response.ok ? response.json() : null))
            .then((counts) => {
                if (counts) paint(counts)
                else root.remove()
            })
            .catch(() => root.remove())
    }

    /* ---------------------------------------------------------------
     * Prose extras
     * ------------------------------------------------------------- */

    function enableProseImages() {
        // The IDL properties default to 'eager' and 'auto', so the presence of
        // the attribute is the only honest test. Images with no loading attribute
        // are already being fetched by the time this runs, so the sources
        // themselves are kept small instead of being swapped here.
        document.querySelectorAll('.prose img').forEach((image) => {
            if (!image.hasAttribute('loading')) image.loading = 'lazy'
            if (!image.hasAttribute('decoding')) image.decoding = 'async'
        })
    }

    function enableMermaid() {
        const prose = document.querySelector('.prose')
        const source = prose?.dataset.mermaidSrc
        const blocks = prose?.querySelectorAll('.mermaid:not([data-processed])')
        if (!source || !blocks || blocks.length === 0) return

        const load = () => import(source).catch(() => import(source))

        load()
            .then((module) => {
                module.default.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral', fontFamily: 'inherit' })
                return module.default.run({ nodes: blocks })
            })
            .catch(() => {
                const note = document.createElement('p')
                note.className = 'mermaid-note'
                note.textContent = 'Shown as source. The mermaid library could not be loaded.'
                prose.append(note)
            })
    }

    /* ---------------------------------------------------------------
     * Boot
     * ------------------------------------------------------------- */

    enableThemeToggle()
    enableMobileNav()
    enableSearch()
    enableReadingProgress()
    enableBackToTop()
    enableAutoHideHeader()
    enableAnchorScroll()

    onIdle(() => {
        enableHeroParallax()
        enableRevealOnScroll()
        enableTocScrollSpy()
    })

    if (document.querySelector('.prose')) {
        enableOutdateAlert()
        enableShare()
        enableReactions()
        enableProseImages()
        enableMermaid()
    }
})()
;(function () {
    'use strict'

    // The search page loads this file directly and main.js injects it again the
    // first time the dialog opens, so booting twice would double every listener.
    if (window.__pphotSearch) return
    window.__pphotSearch = true

    const INDEX_URL = '/search-index.json'
    const WEIGHTS = { title: 12, tags: 6, description: 3, content: 1 }
    const MAX_RESULTS = 20
    const EXCERPT_RADIUS = 70

    let index = null
    let loading = null

    function fetchIndex() {
        if (index) return Promise.resolve(index)
        if (!loading) {
            loading = fetch(INDEX_URL)
                .then((response) => (response.ok ? response.json() : []))
                .then((entries) => {
                    index = entries.map((entry) => ({
                        url: entry.url,
                        title: entry.title || '',
                        description: entry.description || '',
                        content: entry.content || '',
                        tags: Array.isArray(entry.tags) ? entry.tags : [],
                        date: entry.date || '',
                        haystack: [entry.title, entry.description, entry.content, (entry.tags || []).join(' ')]
                            .join(' ')
                            .toLowerCase(),
                    }))
                    return index
                })
                .catch(() => {
                    index = []
                    return index
                })
        }
        return loading
    }

    function score(entry, terms) {
        let total = 0
        for (const term of terms) {
            let best = 0
            for (const [field, weight] of Object.entries(WEIGHTS)) {
                const value = field === 'tags' ? entry.tags.join(' ').toLowerCase() : entry[field].toLowerCase()
                const at = value.indexOf(term)
                if (at === -1) continue
                const score = weight * (at === 0 ? 2 : 1)
                if (score > best) best = score
            }
            if (best === 0) return 0
            total += best
        }
        return total
    }

    function find(query) {
        const terms = query.toLowerCase().split(/\s+/).filter((term) => term.length > 1)
        if (terms.length === 0) return []

        const matches = []
        for (const entry of index) {
            const weight = score(entry, terms)
            if (weight > 0) matches.push({ entry, weight })
        }
        return matches.sort((a, b) => b.weight - a.weight || b.entry.date.localeCompare(a.entry.date)).slice(0, MAX_RESULTS)
    }

    function highlight(text, terms) {
        const source = text.replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character])
        if (terms.length === 0) return source
        // Terms are escaped before matching as well, so a query holding an
        // ampersand matches the escaped text instead of splitting an entity.
        const pattern = new RegExp(`(${terms.map((term) => escapeRegExp(escapeHtml(term))).join('|')})`, 'gi')
        return source.replace(pattern, '<mark>$1</mark>')
    }

    function escapeHtml(value) {
        return value.replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character])
    }

    function escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    function excerpt(entry, terms) {
        const text = entry.content || entry.description
        let at = Number.POSITIVE_INFINITY
        for (const term of terms) {
            const found = text.toLowerCase().indexOf(term)
            if (found !== -1) at = Math.min(at, found)
        }
        if (!Number.isFinite(at) || at <= EXCERPT_RADIUS) return text.slice(0, EXCERPT_RADIUS * 2)
        return `…${text.slice(at - EXCERPT_RADIUS, at + EXCERPT_RADIUS)}`
    }

    function formatDate(stamp) {
        if (!stamp) return ''
        const parsed = new Date(`${stamp}T00:00:00`)
        if (Number.isNaN(parsed.getTime())) return ''
        return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    }

    function render(container, matches, terms) {
        if (matches.length === 0) {
            container.replaceChildren(emptyNode('No matches. Try a different word.'))
            return
        }
        container.replaceChildren(
            ...matches.map(({ entry }, position) => {
                const link = document.createElement('a')
                link.className = 'search-result'
                link.href = entry.url
                link.id = `search-result-${position}`
                link.setAttribute('role', 'option')
                link.setAttribute('aria-selected', 'false')

                const title = document.createElement('span')
                title.className = 'search-result-title'
                title.innerHTML = highlight(entry.title, terms)

                const meta = document.createElement('span')
                meta.className = 'search-result-meta'
                meta.textContent = formatDate(entry.date)
                entry.tags.slice(0, 4).forEach((tag) => {
                    const item = document.createElement('span')
                    item.textContent = `#${tag}`
                    meta.append(item)
                })

                link.append(title, meta)

                const snippet = excerpt(entry, terms)
                if (snippet) {
                    const body = document.createElement('span')
                    body.className = 'search-result-excerpt'
                    body.innerHTML = highlight(snippet, terms)
                    link.append(body)
                }
                return link
            }),
        )
    }

    function emptyNode(message) {
        const node = document.createElement('p')
        node.className = 'search-empty'
        node.textContent = message
        return node
    }

    function mount(input, container, status) {
        let active = -1

        const items = () => Array.from(container.querySelectorAll('.search-result'))

        const setActive = (index) => {
            const all = items()
            if (all.length === 0) return
            active = Math.max(-1, Math.min(index, all.length - 1))
            all.forEach((item, position) => {
                const selected = position === active
                item.classList.toggle('is-active', selected)
                item.setAttribute('aria-selected', selected ? 'true' : 'false')
            })
            if (active === -1) {
                input.removeAttribute('aria-activedescendant')
            } else {
                input.setAttribute('aria-activedescendant', all[active].id)
                all[active].scrollIntoView({ block: 'nearest' })
            }
        }

        const report = (count) => {
            input.setAttribute('aria-expanded', count > 0 ? 'true' : 'false')
            status.textContent = count === 0 ? '' : `${count} ${count === 1 ? 'match' : 'matches'}`
        }

        let timer = null
        input.addEventListener('input', () => {
            const query = input.value.trim()
            active = -1
            window.clearTimeout(timer)

            timer = window.setTimeout(() => {
                if (input.value.trim() !== query) return
                if (history.replaceState) {
                    const url = query ? `?q=${encodeURIComponent(query)}` : location.pathname
                    history.replaceState(null, '', url)
                }
                if (!query) {
                    container.replaceChildren(emptyNode('Type to search every post.'))
                    report(0)
                    return
                }
                fetchIndex().then(() => {
                    const matches = find(query)
                    render(container, matches, query.toLowerCase().split(/\s+/).filter(Boolean))
                    report(matches.length)
                })
            }, 120)
        })

        input.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown') {
                event.preventDefault()
                setActive(active + 1)
            } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                setActive(active <= 0 ? -1 : active - 1)
            } else if (event.key === 'Enter' && active >= 0) {
                event.preventDefault()
                items()[active]?.click()
            }
        })

        container.addEventListener('mousedown', (event) => event.preventDefault())

        const initial = new URLSearchParams(location.search).get('q')
        if (initial) {
            input.value = initial
            fetchIndex().then(() => {
                const matches = find(initial)
                render(container, matches, initial.toLowerCase().split(/\s+/).filter(Boolean))
                report(matches.length)
            })
        } else {
            container.replaceChildren(emptyNode('Type to search every post.'))
            report(0)
        }
    }

    function boot() {
        const pairs = [
            ['search-dialog-input', 'search-dialog-results', 'search-dialog-status'],
            ['search-page-input', 'search-page-results', 'search-page-status'],
        ]
        pairs.forEach(([inputId, containerId, statusId]) => {
            const input = document.getElementById(inputId)
            const container = document.getElementById(containerId)
            if (!input || !container) return
            mount(input, container, document.getElementById(statusId))
        })
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot)
    } else {
        boot()
    }
})()
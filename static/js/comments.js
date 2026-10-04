;(function () {
    'use strict'

    const MAX_AUTHOR = 60
    const MAX_CONTENT = 2000
    const NAME_KEY = 'comment-author-name'
    const URL = /https?:\/\/|www\./i

    const section = document.getElementById('comments')
    if (!section) return

    const endpoint = section.dataset.endpoint
    const slug = window.location.pathname.replace(/\/+$/, '').split('/').pop()
    const list = document.getElementById('comments-list')
    const status = document.getElementById('comments-status')
    const form = document.getElementById('comment-form')
    const authorInput = document.getElementById('comment-author')
    const contentInput = document.getElementById('comment-content')
    const hint = document.getElementById('comment-hint')
    const cancel = form.querySelector('.comment-form-cancel')
    let replyTo = null

    function timeAgo(stamp) {
        const then = new Date(stamp).getTime()
        if (Number.isNaN(then)) return ''
        const minutes = Math.round((Date.now() - then) / 60000)
        if (minutes < 1) return 'just now'
        if (minutes < 60) return `${minutes} min ago`
        const hours = Math.round(minutes / 60)
        if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
        const days = Math.round(hours / 24)
        if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`
        return new Date(then).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    }

    function node(tag, className, text) {
        const element = document.createElement(tag)
        if (className) element.className = className
        if (text !== undefined) element.textContent = text
        return element
    }

    function buildComment(comment) {
        const item = node('li', 'comment')
        item.id = `comment-${comment.id}`

        const avatar = node('span', 'comment-avatar', (comment.author || '?').trim().charAt(0).toUpperCase())
        avatar.setAttribute('aria-hidden', 'true')

        const body = node('div', 'comment-body')
        const head = node('p', 'comment-meta')
        head.append(node('span', 'comment-author', comment.author), node('time', 'comment-time', timeAgo(comment.created_at)))
        if (comment.created_at) head.querySelector('time').setAttribute('datetime', comment.created_at)
        body.append(head, node('p', 'comment-content', comment.content))

        if (!comment.parent_id) {
            const reply = node('button', 'comment-reply', 'Reply')
            reply.type = 'button'
            reply.addEventListener('click', () => {
                replyTo = comment.id
                cancel.hidden = false
                hint.textContent = `Replying to ${comment.author}`
                contentInput.focus()
                window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' })
            })
            body.append(reply)
        }

        item.append(avatar, body)

        if (Array.isArray(comment.replies) && comment.replies.length > 0) {
            const replies = node('ul', 'comment-replies')
            comment.replies.forEach((child) => replies.append(buildComment(child)))
            item.append(replies)
        }
        return item
    }

    function render(comments) {
        list.replaceChildren()
        if (comments.length === 0) {
            status.textContent = 'No comments yet.'
            return
        }
        status.textContent = comments.length === 1 ? '1 comment' : `${comments.length} comments`
        const items = document.createElement('ul')
        items.className = 'comments-items'
        comments.forEach((comment) => items.append(buildComment(comment)))
        list.append(items)
    }

    function unavailable(message) {
        section.classList.add('is-unavailable')
        status.textContent = message
        form.remove()
    }

    function load() {
        return fetch(`${endpoint}/comments?slug=${encodeURIComponent(slug)}`)
            .then((response) => {
                if (!response.ok) throw new Error('bad status')
                return response.json()
            })
            .then((data) => render(data.comments || []))
            .catch(() => unavailable('Comments are unavailable right now.'))
    }

    function submit(event) {
        event.preventDefault()
        const author = authorInput.value.trim()
        const content = contentInput.value.trim()

        if (author.length === 0 || author.length > MAX_AUTHOR) {
            hint.textContent = `Name must be 1 to ${MAX_AUTHOR} characters.`
            return
        }
        if (content.length === 0 || content.length > MAX_CONTENT) {
            hint.textContent = `Comment must be 1 to ${MAX_CONTENT} characters.`
            return
        }
        if (URL.test(author) || URL.test(content)) {
            hint.textContent = 'Links are not allowed in comments.'
            return
        }

        hint.textContent = 'Posting…'
        fetch(`${endpoint}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, author, content, parent_id: replyTo }),
        })
            .then((response) => response.json().then((body) => ({ ok: response.ok, body })))
            .then(({ ok, body }) => {
                if (!ok) throw new Error(body.error || 'could not post')
                contentInput.value = ''
                replyTo = null
                cancel.hidden = true
                hint.textContent = 'Posted.'
                try {
                    window.localStorage.setItem(NAME_KEY, author)
                } catch (e) {}
                load()
            })
            .catch((error) => {
                hint.textContent = error.message === 'Failed to fetch' ? 'Comments are unavailable right now.' : error.message
            })
    }

    try {
        const saved = window.localStorage.getItem(NAME_KEY)
        if (saved) authorInput.value = saved
    } catch (e) {}

    cancel.addEventListener('click', () => {
        replyTo = null
        cancel.hidden = true
        hint.textContent = ''
    })
    form.addEventListener('submit', submit)
    load()
})()
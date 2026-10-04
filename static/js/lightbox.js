;(function () {
    'use strict'

    const images = Array.from(document.querySelectorAll('.prose img')).filter(
        (image) => image.naturalWidth > 0 && !image.closest('.lightbox'),
    )
    if (images.length === 0) return

    const overlay = document.createElement('div')
    overlay.className = 'lightbox'
    overlay.hidden = true
    overlay.innerHTML = `
        <button class="lightbox-close" type="button" aria-label="Close image viewer">&times;</button>
        <button class="lightbox-prev" type="button" aria-label="Previous image">&#8249;</button>
        <button class="lightbox-next" type="button" aria-label="Next image">&#8250;</button>
        <img class="lightbox-image" alt="" />
        <p class="lightbox-caption" aria-live="polite"></p>
    `
    document.body.append(overlay)

    const viewer = overlay.querySelector('.lightbox-image')
    const caption = overlay.querySelector('.lightbox-caption')
    const closeButton = overlay.querySelector('.lightbox-close')
    let index = 0
    let opener = null

    const show = (next) => {
        index = (next + images.length) % images.length
        const image = images[index]
        viewer.src = image.currentSrc || image.src
        viewer.alt = image.alt
        caption.textContent = image.alt
        caption.hidden = !image.alt
    }

    const open = (start) => {
        opener = document.activeElement
        show(start)
        overlay.hidden = false
        document.body.style.overflow = 'hidden'
        closeButton.focus()
    }

    const close = () => {
        overlay.hidden = true
        document.body.style.overflow = ''
        opener?.focus()
    }

    images.forEach((image, position) => {
        image.style.cursor = 'zoom-in'
        image.addEventListener('click', () => open(position))
    })

    closeButton.addEventListener('click', close)
    overlay.querySelector('.lightbox-prev').addEventListener('click', () => show(index - 1))
    overlay.querySelector('.lightbox-next').addEventListener('click', () => show(index + 1))
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay || event.target === viewer) close()
    })
    document.addEventListener('keydown', (event) => {
        if (overlay.hidden) return
        if (event.key === 'Escape') close()
        if (event.key === 'ArrowLeft') show(index - 1)
        if (event.key === 'ArrowRight') show(index + 1)
    })
})()
;(function () {
    'use strict'

    // Parallax Hero Effect
    const hero = document.querySelector('.hero')
    const heroImage = document.querySelector('.hero-image')
    
    if (hero && heroImage) {
        let ticking = false
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset
                    const heroHeight = hero.offsetHeight
                    
                    // Only apply parallax when hero is in viewport
                    if (scrolled < heroHeight) {
                        const parallaxValue = scrolled * 0.5
                        heroImage.style.transform = `translateY(${parallaxValue}px)`
                    }
                    
                    ticking = false
                })
                
                ticking = true
            }
        })
    }

    // Mobile Navigation
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle')
    const mobileNav = document.getElementById('mobile-nav')
    const mobileNavClose = document.getElementById('mobile-nav-close')

    if (mobileMenuToggle && mobileNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileNav.classList.add('active')
        })
    }

    if (mobileNavClose && mobileNav) {
        mobileNavClose.addEventListener('click', () => {
            mobileNav.classList.remove('active')
        })

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (
                mobileNav.classList.contains('active') &&
                !mobileNav.contains(e.target) &&
                !mobileMenuToggle.contains(e.target)
            ) {
                mobileNav.classList.remove('active')
            }
        })
    }

    // Reading Progress Bar
    function enableReadingProgress() {
        const readingProgress = document.getElementById('reading-progress')
        if (!readingProgress) return

        const updateProgress = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
            const scrolled = (window.scrollY / scrollHeight) * 100
            readingProgress.style.width = `${Math.min(scrolled, 100)}%`
        }

        window.addEventListener('scroll', updateProgress, { passive: true })
        updateProgress()
    }

    // Back to Top Button with Progress Ring
    function enableBackToTop() {
        const backBtn = document.getElementById('back-to-top')
        if (!backBtn) return

        const circle = backBtn.querySelector('circle')
        const radius = circle ? circle.r.baseVal.value : 0
        const circumference = radius ? 2 * Math.PI * radius : 0

        if (circle) {
            circle.style.strokeDasharray = `${circumference} ${circumference}`
            circle.style.strokeDashoffset = circumference
        }

        const updateProgress = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
            const scrolled = window.scrollY
            const progress = (scrolled / scrollHeight) * 100

            if (circle) {
                const offset = circumference - (progress / 100) * circumference
                circle.style.strokeDashoffset = offset
            }

            // Show/hide button
            if (scrolled > 200) {
                backBtn.classList.add('shown')
            } else {
                backBtn.classList.remove('shown')
            }
        }

        const scrollToTop = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }

        window.addEventListener('scroll', updateProgress, { passive: true })
        backBtn.addEventListener('click', scrollToTop)
        updateProgress()
    }

    // Auto-hide Header on Scroll Down
    function enableAutoHideHeader() {
        const header = document.querySelector('header')
        if (!header) return

        let lastScroll = 0
        let ticking = false

        const updateHeader = () => {
            const currentScroll = window.scrollY

            if (currentScroll <= 0) {
                header.classList.remove('scroll-up')
                header.classList.remove('scroll-down')
            } else if (currentScroll > lastScroll && currentScroll > 100) {
                // Scrolling down
                header.classList.remove('scroll-up')
                header.classList.add('scroll-down')
            } else if (currentScroll < lastScroll) {
                // Scrolling up
                header.classList.remove('scroll-down')
                header.classList.add('scroll-up')
            }

            lastScroll = currentScroll
            ticking = false
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader)
                ticking = true
            }
        }, { passive: true })
    }

    // Smooth Scroll with Header Offset
    function enableSmoothScroll() {
        const header = document.querySelector('header')
        const headerHeight = header ? header.offsetHeight : 0

        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href')
                if (href === '#' || href === '#main') {
                    if (href === '#main') {
                        e.preventDefault()
                        const target = document.querySelector(href)
                        if (target) {
                            window.scrollTo({
                                top: target.offsetTop - headerHeight,
                                behavior: 'smooth'
                            })
                        }
                    }
                    return
                }

                const target = document.querySelector(href)
                if (target) {
                    e.preventDefault()
                    const targetPosition = target.offsetTop - headerHeight - 20
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth',
                    })
                }
            })
        })
    }

    // Copy Heading Links
    function enableCopyHeadings() {
        const headings = document.querySelectorAll('.prose h1[id], .prose h2[id], .prose h3[id], .prose h4[id]')
        
        headings.forEach(heading => {
            heading.style.cursor = 'pointer'
            heading.title = 'Click to copy link'
            
            heading.addEventListener('click', () => {
                const url = `${window.location.origin}${window.location.pathname}#${heading.id}`
                navigator.clipboard.writeText(url).then(() => {
                    showToast('Link copied!')
                })
            })
        })
    }

    // Toast Notification
    function showToast(message) {
        let toast = document.getElementById('toast')
        if (!toast) {
            toast = document.createElement('div')
            toast.id = 'toast'
            toast.className = 'toast'
            document.body.appendChild(toast)
        }
        
        toast.textContent = message
        toast.classList.add('show')
        
        setTimeout(() => {
            toast.classList.remove('show')
        }, 2000)
    }

    // Keyboard Shortcuts
    function enableKeyboardShortcuts() {
        let helpModal = null

        const shortcuts = {
            '?': () => showHelpModal(),
            'Escape': () => hideHelpModal(),
            't': () => window.scrollTo({ top: 0, behavior: 'smooth' }),
            'T': () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        }

        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

            const handler = shortcuts[e.key]
            if (handler) {
                e.preventDefault()
                handler()
            }
        })

        function showHelpModal() {
            if (!helpModal) {
                helpModal = document.createElement('div')
                helpModal.className = 'keyboard-help-modal'
                helpModal.innerHTML = `
                    <div class="keyboard-help-content">
                        <h3>Keyboard Shortcuts</h3>
                        <ul>
                            <li><kbd>?</kbd> - Show this help</li>
                            <li><kbd>Esc</kbd> - Close modals</li>
                            <li><kbd>T</kbd> - Scroll to top</li>
                        </ul>
                        <p class="help-hint">Press <kbd>Esc</kbd> to close</p>
                    </div>
                `
                document.body.appendChild(helpModal)
                
                helpModal.addEventListener('click', (e) => {
                    if (e.target === helpModal) hideHelpModal()
                })
            }
            
            helpModal.classList.add('show')
        }

        function hideHelpModal() {
            if (helpModal) {
                helpModal.classList.remove('show')
            }
        }
    }

    // Lazy load images with blur-up effect
    function enableLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target
                        if (img.dataset.src) {
                            img.src = img.dataset.src
                            img.removeAttribute('data-src')
                        }
                        img.classList.add('loaded')
                        imageObserver.unobserve(img)
                    }
                })
            })

            document.querySelectorAll('img[data-src], .prose img').forEach((img) => {
                imageObserver.observe(img)
            })
        }
    }

    // Add fade-in animation to cards on scroll
    if ('IntersectionObserver' in window) {
        const cardObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in')
                        cardObserver.unobserve(entry.target)
                    }
                })
            },
            {
                threshold: 0.1,
            },
        )

        document.querySelectorAll('.post-card, .gallery-item').forEach((card) => {
            cardObserver.observe(card)
        })
    }

    // Animate section headers on scroll
    if ('IntersectionObserver' in window) {
        const headerObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible')
                        headerObserver.unobserve(entry.target)
                    }
                })
            },
            {
                threshold: 0.2,
            },
        )

        document.querySelectorAll('.section-header').forEach((header) => {
            headerObserver.observe(header)
        })
    }

    // Respect prefers-reduced-motion
    function respectReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
        
        if (prefersReducedMotion.matches) {
            document.documentElement.style.setProperty('--transition-fast', '0ms')
            document.documentElement.style.setProperty('--transition-base', '0ms')
            document.documentElement.style.setProperty('--transition-smooth', '0ms')
            document.documentElement.style.setProperty('--transition-slow', '0ms')
        }
    }

    // High Contrast Mode Detection
    function detectHighContrast() {
        const prefersContrast = window.matchMedia('(prefers-contrast: more)')
        
        if (prefersContrast.matches) {
            document.documentElement.classList.add('high-contrast')
        }

        prefersContrast.addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.classList.add('high-contrast')
            } else {
                document.documentElement.classList.remove('high-contrast')
            }
        })
    }

    // Initialize all features
    enableReadingProgress()
    enableBackToTop()
    enableAutoHideHeader()
    enableSmoothScroll()
    enableKeyboardShortcuts()
    enableLazyLoading()
    respectReducedMotion()
    detectHighContrast()

    // Features for pages with .prose content
    if (document.querySelector('.prose')) {
        enableCopyHeadings()
    }
})()

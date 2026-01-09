// ABOUTME: Main JavaScript for Pphot lifestyle blog
// ABOUTME: Handles mobile navigation, reading progress, and smooth scrolling

(function() {
    'use strict';
    
    // Mobile Navigation
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavClose = document.getElementById('mobile-nav-close');
    
    if (mobileMenuToggle && mobileNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileNav.classList.add('active');
        });
    }
    
    if (mobileNavClose && mobileNav) {
        mobileNavClose.addEventListener('click', () => {
            mobileNav.classList.remove('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileNav.classList.contains('active') && 
                !mobileNav.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                mobileNav.classList.remove('active');
            }
        });
    }
    
    // Reading Progress Bar
    const readingProgress = document.getElementById('reading-progress');
    
    if (readingProgress) {
        window.addEventListener('scroll', () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (window.scrollY / scrollHeight) * 100;
            readingProgress.style.width = `${scrolled}%`;
        });
    }
    
    // Smooth Scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Lazy load images with fade-in effect
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    img.classList.add('fade-in');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Add fade-in animation to cards on scroll
    if ('IntersectionObserver' in window) {
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    cardObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        document.querySelectorAll('.post-card, .gallery-item').forEach(card => {
            cardObserver.observe(card);
        });
    }
    
})();

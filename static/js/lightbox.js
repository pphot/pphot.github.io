// ABOUTME: Image lightbox functionality for photography galleries
// ABOUTME: Allows users to view images in full-screen mode with keyboard navigation

(function() {
    'use strict';
    
    // Create lightbox HTML structure
    const lightboxHTML = `
        <div class="lightbox" id="lightbox">
            <div class="lightbox-content">
                <button class="lightbox-close" id="lightbox-close" aria-label="Close">×</button>
                <button class="lightbox-prev" id="lightbox-prev" aria-label="Previous">‹</button>
                <button class="lightbox-next" id="lightbox-next" aria-label="Next">›</button>
                <img src="" alt="" id="lightbox-img" />
            </div>
        </div>
    `;
    
    // Insert lightbox into page
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    let currentIndex = 0;
    let images = [];
    
    // Get all gallery images
    const galleryImages = document.querySelectorAll('.gallery-item img, .prose img');
    
    if (galleryImages.length === 0) return;
    
    images = Array.from(galleryImages);
    
    // Add click handlers to images
    images.forEach((img, index) => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            openLightbox(index);
        });
    });
    
    function openLightbox(index) {
        currentIndex = index;
        const img = images[currentIndex];
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    function showPrevious() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        lightboxImg.src = images[currentIndex].src;
        lightboxImg.alt = images[currentIndex].alt;
    }
    
    function showNext() {
        currentIndex = (currentIndex + 1) % images.length;
        lightboxImg.src = images[currentIndex].src;
        lightboxImg.alt = images[currentIndex].alt;
    }
    
    // Event listeners
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', showPrevious);
    lightboxNext.addEventListener('click', showNext);
    
    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPrevious();
                break;
            case 'ArrowRight':
                showNext();
                break;
        }
    });
    
})();

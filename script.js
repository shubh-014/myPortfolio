document.addEventListener('DOMContentLoaded', () => {

    // --- Fluid Chromatic Vapor Effect ---
    const blobs = [
        { el: document.querySelector('.blob-1'), x: window.innerWidth / 2, y: window.innerHeight / 2, lag: 0.04, scale: 1 },
        { el: document.querySelector('.blob-2'), x: window.innerWidth / 2, y: window.innerHeight / 2, lag: 0.08, scale: 1 },
        { el: document.querySelector('.blob-3'), x: window.innerWidth / 2, y: window.innerHeight / 2, lag: 0.12, scale: 1 }
    ];

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let isHovering = false;

    // Track mouse location
    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    // Detect hover on interactive UI elements to trigger pulse
    const interactiveSelectors = 'a, button, .mockup-card, .poster-card, .gallery-card, .skill-item, .logo';
    const interactives = document.querySelectorAll(interactiveSelectors);

    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => isHovering = true);
        el.addEventListener('mouseleave', () => isHovering = false);
    });

    function renderVapor() {
        const baseScale = isHovering ? 1.4 : 1.0;

        blobs.forEach(blob => {
            if (!blob.el) return;

            // Lerp positional interpolation (delayed physics)
            blob.x += (targetX - blob.x) * blob.lag;
            blob.y += (targetY - blob.y) * blob.lag;

            // Lerp scale expansion
            blob.scale += (baseScale - blob.scale) * 0.1;

            // Apply high performance CSS transforms 
            // -50% centers the blob onto the actual coordinate
            blob.el.style.transform = `translate3d(${blob.x}px, ${blob.y}px, 0) translate(-50%, -50%) scale(${blob.scale})`;
        });

        requestAnimationFrame(renderVapor);
    }

    // Start optimized tracking loop
    renderVapor();
    // --- End Vapor Logic ---


    // Theme Toggle functionality (visual only for now as design is dark-mode specific)
    const themeToggle = document.querySelector('.theme-toggle');
    const toggleThumb = document.querySelector('.toggle-thumb');
    let isDarkMode = true;

    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('light-mode');
    });

    // Active Navigation Link on Scroll
    const sections = document.querySelectorAll('section[id], header'); 
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Map the hero section (no offsetTop usually) or ID based sections
            if (scrollY >= (sectionTop - 300)) {
                current = section.getAttribute('id') || 'hero';
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href').substring(1); // Remove #
            if (href === current) {
                link.classList.add('active');
            }
        });
    });
    // Ripple Effect Logic
    const rippleElements = document.querySelectorAll('.nav-link, .mockup-card, .poster-card, .logo, .skill-item');

    rippleElements.forEach(el => {
        el.classList.add('ripple-element');

        el.addEventListener('mousedown', function (e) {
            const rect = el.getBoundingClientRect();
            const circle = document.createElement('span');
            const diameter = Math.max(rect.width, rect.height);
            const radius = diameter / 2;

            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - rect.left - radius}px`;
            circle.style.top = `${e.clientY - rect.top - radius}px`;
            circle.classList.add('ripple');

            const existingRipple = el.querySelector('.ripple');
            if (existingRipple) {
                existingRipple.remove(); // Remove previous quickly if double clicked
            }

            el.appendChild(circle);

            setTimeout(() => {
                circle.remove();
            }, 600);
        });
    });

    // Fullscreen Image Lightbox Logic for Mockup Cards
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const closeModalBtn = document.querySelector(".close-modal");

    // Select all images inside mockup cards, poster cards, and gallery cards
    const galleryImages = document.querySelectorAll(".mockup-card img, .poster-card img, .gallery-card img");

    galleryImages.forEach(img => {
        img.addEventListener("click", function () {
            modal.style.display = "flex";
            modalImg.src = this.src;
        });
    });

    // Close modal on X click
    closeModalBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });

    // Close modal on background block click
    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    // --- Mobile Card Shuffle for Event Posters ---
    const posterContainer = document.querySelector('.event-posters');
    const posters = Array.from(document.querySelectorAll('.poster-card'));
    let posterIndex = 0;

    if (posterContainer && posters.length > 0) {
        function updatePosterStack() {
            if (window.innerWidth <= 768) {
                posters.forEach((poster, i) => {
                    poster.classList.remove('active', 'next', 'hidden', 'exit-left', 'exit-right');
                    if (i === posterIndex) poster.classList.add('active');
                    else if (i === (posterIndex + 1) % posters.length) poster.classList.add('next');
                    else poster.classList.add('hidden');
                });
            }
        }

        updatePosterStack();
        window.addEventListener('resize', updatePosterStack);

        let touchStartX = 0;
        posterContainer.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        posterContainer.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            if (Math.abs(touchEndX - touchStartX) > 50) {
                const current = posters[posterIndex];
                current.classList.add(touchEndX - touchStartX < 0 ? 'exit-left' : 'exit-right');
                setTimeout(() => {
                    posterIndex = (posterIndex + 1) % posters.length;
                    updatePosterStack();
                }, 400);
            }
        }, { passive: true });
    }

    // --- Mobile Slideshow for UI Mockups (Manual Swipe with Pagination Dots) ---
    const mockupContainer = document.querySelector('.ui-mockups');
    const mockupCards = document.querySelectorAll('.ui-mockups .mockup-card');
    const dots = document.querySelectorAll('.slideshow-dots .dot');

    if (mockupContainer && mockupCards.length > 0 && dots.length > 0) {
        function updateDots(index) {
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        // Initialize first dot
        updateDots(0);

        // Manual Swipe Handling
        mockupContainer.addEventListener('scroll', () => {
            if (window.innerWidth <= 768) {
                const scrollLeft = mockupContainer.scrollLeft;
                const containerWidth = mockupContainer.clientWidth;
                // Simple calculation based on current scroll position
                let activeIndex = Math.round(scrollLeft / containerWidth);
                
                // Safety bound checking
                if (activeIndex < 0) activeIndex = 0;
                if (activeIndex >= dots.length) activeIndex = dots.length - 1;
                
                updateDots(activeIndex);
            }
        });
    }

});

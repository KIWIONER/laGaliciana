/* La Galiciana - Interactions */

document.addEventListener('DOMContentLoaded', () => {

    // Scroll Reveal Animation
    const reveals = document.querySelectorAll('.reveal');

    let isScrolling = false;
    const revealOnScroll = () => {
        if (isScrolling) return;
        isScrolling = true;

        window.requestAnimationFrame(() => {
            const triggerBottom = window.innerHeight * 0.85;
            reveals.forEach(reveal => {
                const revealTop = reveal.getBoundingClientRect().top;
                if (revealTop < triggerBottom) reveal.classList.add('active');
            });
            isScrolling = false;
        });
    };
    window.addEventListener('scroll', revealOnScroll, { passive: true });
    revealOnScroll();

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Navigation Background on Scroll
    const nav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
        // Close mobile menu on scroll
        const mobileNav = document.getElementById('mobile-nav');
        if (mobileNav && mobileNav.classList.contains('open')) {
            mobileNav.classList.remove('open');
        }
    });
    // Mobile Interaction for Stall Cards
    const stallCards = document.querySelectorAll('.stall-card');
    stallCards.forEach(card => {
        card.addEventListener('click', () => {
            // Only functional on mobile/tablets defined by CSS
            if (window.innerWidth <= 768) {
                const isExpanded = card.classList.contains('is-expanded');

                // Close other cards
                stallCards.forEach(c => c.classList.remove('is-expanded'));

                if (!isExpanded) {
                    card.classList.add('is-expanded');
                }
            }
        });
    });
});

// Mobile menu toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-nav');
    const btn = document.getElementById('burger-btn');
    if (!menu) return;
    menu.classList.toggle('open');
    // Animate burger → X
    const spans = btn.querySelectorAll('span');
    if (menu.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
}


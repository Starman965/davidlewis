// Main JavaScript file for davidlewis.ai

document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe product cards for animation on scroll
    document.querySelectorAll('.product-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
        observer.observe(card);
    });

    // Add hover effect sounds (optional - commented out by default)
    // Uncomment if you want to add subtle UI feedback
    /*
    document.querySelectorAll('.btn-primary').forEach(button => {
        button.addEventListener('mouseenter', () => {
            // Play a subtle hover sound
        });
    });
    */

    // Track card clicks for analytics (placeholder)
    document.querySelectorAll('.product-card').forEach(card => {
        const links = card.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const appName = card.dataset.app;
                console.log(`Navigating to: ${appName}`);
                // Add analytics tracking here if needed
                // e.g., gtag('event', 'app_click', { app_name: appName });
            });
        });
    });

    // Add parallax effect to hero (subtle)
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (prefersReducedMotion) {
            return;
        }
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const hero = document.querySelector('.hero');
                if (hero && scrolled < hero.offsetHeight) {
                    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // Log page load for debugging
    console.log('David Lewis Portfolio - Loaded successfully');
});

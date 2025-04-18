// Initialize animations when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Hero section animations
    const heroAnimation = anime.timeline({
        easing: 'easeOutExpo',
        duration: 1000
    });

    heroAnimation
        .add({
            targets: '.hero .animate-text',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(200)
        })
        .add({
            targets: '.hero .animate-button',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800
        }, '-=800');

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '50px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Feature cards animation
                if (entry.target.classList.contains('feature-card')) {
                    anime({
                        targets: entry.target,
                        translateY: [50, 0],
                        opacity: [0, 1],
                        duration: 800,
                        easing: 'easeOutCubic'
                    });
                }
                
                // Steps animation
                if (entry.target.classList.contains('step')) {
                    anime({
                        targets: entry.target,
                        translateX: [-50, 0],
                        opacity: [0, 1],
                        duration: 800,
                        easing: 'easeOutCubic'
                    });
                }
                
                // Benefit cards animation
                if (entry.target.classList.contains('benefit-card')) {
                    anime({
                        targets: entry.target,
                        scale: [0.8, 1],
                        opacity: [0, 1],
                        duration: 800,
                        easing: 'easeOutCubic'
                    });
                }
                
                // Testimonial animation
                if (entry.target.classList.contains('testimonial')) {
                    anime({
                        targets: entry.target,
                        translateY: [30, 0],
                        opacity: [0, 1],
                        duration: 800,
                        easing: 'easeOutCubic'
                    });
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .step, .benefit-card, .testimonial').forEach(el => {
        observer.observe(el);
    });

    // Smooth scroll for navigation
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

    // Button hover animation
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('mouseenter', () => {
            anime({
                targets: button,
                scale: 1.05,
                duration: 300,
                easing: 'easeOutCubic'
            });
        });

        button.addEventListener('mouseleave', () => {
            anime({
                targets: button,
                scale: 1,
                duration: 300,
                easing: 'easeOutCubic'
            });
        });
    });

    // Feature cards hover animation
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            anime({
                targets: card.querySelector('.feature-icon'),
                scale: 1.2,
                rotate: '10deg',
                duration: 300,
                easing: 'easeOutCubic'
            });
        });

        card.addEventListener('mouseleave', () => {
            anime({
                targets: card.querySelector('.feature-icon'),
                scale: 1,
                rotate: '0deg',
                duration: 300,
                easing: 'easeOutCubic'
            });
        });
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroImage = document.querySelector('.hero-image');
        if (heroImage) {
            heroImage.style.transform = `translateY(${scrolled * 0.4}px)`;
        }
    });
}); 
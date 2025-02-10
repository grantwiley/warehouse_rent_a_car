document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.review-slide');
    const dotsContainer = document.querySelector('.review-dots');
    let currentSlide = 0;
    let slideInterval;

    // Create navigation dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        goToSlide(next);
    }

    function startSlideshow() {
        slideInterval = setInterval(nextSlide, 7500); // Change slide every 5 seconds
    }

    function stopSlideshow() {
        clearInterval(slideInterval);
    }

    // Show first slide and start slideshow
    goToSlide(0);
    startSlideshow();

    // Pause slideshow on hover
    const reviewsContainer = document.querySelector('.reviews-container');
    reviewsContainer.addEventListener('mouseenter', stopSlideshow);
    reviewsContainer.addEventListener('mouseleave', startSlideshow);
})
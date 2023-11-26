document.addEventListener('DOMContentLoaded', (event) => {
    let currentSection = 0;
    const sections = document.querySelectorAll('.section');
    const circles = document.querySelectorAll('.circle');

    function scrollToSection(sectionIndex) {
        sections[sectionIndex].scrollIntoView({ behavior: 'smooth' });
        updateCircles(sectionIndex);
    }

    function updateCircles(sectionIndex) {
        circles.forEach((circle, index) => {
            if (index === sectionIndex) {
                circle.classList.add('active');
            } else {
                circle.classList.remove('active');
            }
        });
    }

    // Attach click events to circles
    circles.forEach((circle, index) => {
        circle.addEventListener('click', (event) => {
            event.preventDefault();
            currentSection = index;
            scrollToSection(currentSection);
        });
    });

    let isScrolling;

    window.addEventListener('wheel', (e) => {
        clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            if (e.deltaY > 0 && currentSection < sections.length - 1) {
                currentSection++;
            } else if (e.deltaY < 0 && currentSection > 0) {
                currentSection--;
            }
            scrollToSection(currentSection);
        }, 66);
        e.preventDefault();
    }, { passive: false });
});
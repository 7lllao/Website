// Add this to your main.js file

// Function to parse date string in DD.MM.YYYY format
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('.').map(num => parseInt(num));
    return new Date(year, month - 1, day);
}

// Function to format date as DD.MM.YYYY
function formatDate(date) {
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

// Function to animate date countdown
function animateDate(element, endDate, startDate) {
    const duration = 3000; // Animation duration in milliseconds
    const fps = 30; // Frames per second
    const steps = duration / (1000 / fps);
    let currentStep = 0;

    const endDateTime = parseDate(endDate).getTime();
    const startDateTime = parseDate(startDate).getTime();
    const timePerStep = (endDateTime - startDateTime) / steps;

    const animation = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
            const currentDate = new Date(endDateTime - (timePerStep * currentStep));
            element.textContent = formatDate(currentDate);
        } else {
            clearInterval(animation);
        }
    }, 1000 / fps);

    return animation;
}

// Function to handle responsive behavior and animation
function handleDateDisplay() {
    const dateElements = document.querySelectorAll('.item.date');
    const animationDelayMS = 1500; // Delay before animation starts
    let activeAnimations = new Map(); // Store active animations
    
    // Function to handle all animations
    function handleAllDateAnimations(immediate = false) {
        dateElements.forEach((dateItem, index) => {
            const spans = dateItem.querySelectorAll('span');
            const startDate = spans[0].textContent;
            const endDate = spans[2].textContent;
            
            let animatedSpan = dateItem.querySelector('.animated-date');
            if (!animatedSpan) {
                animatedSpan = document.createElement('span');
                animatedSpan.classList.add('animated-date');
                dateItem.appendChild(animatedSpan);
            }

            // Clear existing animation if any
            if (activeAnimations.has(dateItem)) {
                clearInterval(activeAnimations.get(dateItem));
            }

            // Set initial end date
            animatedSpan.textContent = endDate;

            // Start new animation with staggered delay for each item
            const staggeredDelay = immediate ? 0 : animationDelayMS + (index * 200); // Add 200ms delay between each item
            setTimeout(() => {
                const animationId = animateDate(animatedSpan, endDate, startDate);
                activeAnimations.set(dateItem, animationId);
            }, staggeredDelay);
        });
    }

    // Function to set up hover listeners
    function setupHoverListeners() {
        dateElements.forEach(dateItem => {
            const spans = dateItem.querySelectorAll('span');
            const startDate = spans[0].textContent;
            const endDate = spans[2].textContent;
            const animatedSpan = dateItem.querySelector('.animated-date');

            const triggerAnimation = () => {
                if (activeAnimations.has(dateItem)) {
                    clearInterval(activeAnimations.get(dateItem));
                }
                animatedSpan.textContent = endDate;
                const animationId = animateDate(animatedSpan, endDate, startDate);
                activeAnimations.set(dateItem, animationId);
            };

            // Remove existing listener before adding new one
            dateItem.removeEventListener('mouseenter', triggerAnimation);
            dateItem.addEventListener('mouseenter', triggerAnimation);
        });
    }

    // Function to clean up animations
    function cleanupAnimations() {
        activeAnimations.forEach((animationId) => {
            clearInterval(animationId);
        });
        activeAnimations.clear();
    }

    // Handle resize events
    let resizeTimeout;
    let previousWidth = window.innerWidth;
    
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        
        resizeTimeout = setTimeout(() => {
            const currentWidth = window.innerWidth;
            const crossedThreshold = 
                (previousWidth > 850 && currentWidth <= 850) || 
                (previousWidth <= 850 && currentWidth > 850);

            if (crossedThreshold) {
                if (currentWidth <= 850) {
                    cleanupAnimations();
                    handleAllDateAnimations();
                    setupHoverListeners();
                } else {
                    cleanupAnimations();
                }
            }
            
            previousWidth = currentWidth;
        }, 250); // Debounce resize events
    });

    // Initial setup
    if (window.innerWidth <= 850) {
        handleAllDateAnimations();
        setupHoverListeners();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', handleDateDisplay);
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

// Make these functions globally accessible
let activeAnimations = new Map(); // Store active animations globally

// Function to clean up animations
function cleanupAnimations() {
    activeAnimations.forEach((animationId) => {
        clearInterval(animationId);
    });
    activeAnimations.clear();
}

// Function to check viewport and update date display
function checkAndUpdateAnimations() {
    const dateElements = document.querySelectorAll('.item.date');
    const isMobile = window.innerWidth <= 700; // Using 700px to match CSS media query
    
    // Clean up existing animations
    cleanupAnimations();
    
    if (isMobile) {
        // On mobile, show animated dates
        dateElements.forEach((dateItem, index) => {
            if (dateItem.closest('.work-exhibition-item')) return; // Skip work exhibition items
            
            const spans = dateItem.querySelectorAll('span');
            if (spans.length < 3) return; // Skip if not enough spans
            
            // Hide regular date spans
            spans.forEach(span => {
                if (!span.classList.contains('animated-date')) {
                    span.style.display = 'none';
                }
            });
            
            // Create or update animated date span
            let animatedSpan = dateItem.querySelector('.animated-date');
            if (!animatedSpan) {
                animatedSpan = document.createElement('span');
                animatedSpan.classList.add('animated-date');
                dateItem.appendChild(animatedSpan);
            }
            
            // Display the animated span
            animatedSpan.style.display = 'block';
            
            // Get start and end dates
            const startDate = spans[0].textContent;
            const endDate = spans[2].textContent;
            
            // Set initial end date
            animatedSpan.textContent = endDate;
            
            // Start animation with staggered delay
            setTimeout(() => {
                const animationId = animateDate(animatedSpan, endDate, startDate);
                activeAnimations.set(dateItem, animationId);
            }, 1500 + (index * 200)); // Delay animation start
        });
        
        // Set up hover listeners for mobile
        dateElements.forEach(dateItem => {
            if (dateItem.closest('.work-exhibition-item')) return; // Skip work exhibition items
            
            const spans = dateItem.querySelectorAll('span');
            if (spans.length < 3) return; // Skip if not enough spans
            
            const startDate = spans[0].textContent;
            const endDate = spans[2].textContent;
            const animatedSpan = dateItem.querySelector('.animated-date');
            if (!animatedSpan) return; // Skip if no animated span
            
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
    } else {
        // On desktop, hide animated dates and show regular spans
        dateElements.forEach(dateItem => {
            const regularSpans = dateItem.querySelectorAll('span:not(.animated-date)');
            regularSpans.forEach(span => span.style.display = 'block');
            
            const animatedSpan = dateItem.querySelector('.animated-date');
            if (animatedSpan) {
                animatedSpan.style.display = 'none';
            }
        });
    }
}

// Make function globally accessible
window.checkAndUpdateAnimations = checkAndUpdateAnimations;

// Function to handle responsive behavior and animation
function handleDateDisplay() {
    // Initial setup
    checkAndUpdateAnimations();
    
    // Handle resize events with improved responsiveness
    window.addEventListener('resize', () => {
        // Run the update immediately to ensure responsive behavior
        checkAndUpdateAnimations();
    });
    
    // Additional check after a short delay to ensure everything is set up properly
    setTimeout(checkAndUpdateAnimations, 500);
}

// Make function globally accessible
window.handleDateDisplay = handleDateDisplay;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', handleDateDisplay);

// Also check when window is fully loaded (images, etc.)
window.addEventListener('load', () => {
    // Re-check animations after everything is loaded
    setTimeout(checkAndUpdateAnimations, 100);
});
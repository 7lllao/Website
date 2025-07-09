// Simple Theme Manager - Minimal dark theme implementation
(function() {
    'use strict';
    
    // Check if it's evening hours (6 PM - 6 AM)
    function isEveningTime() {
        const hour = new Date().getHours();
        return hour >= 18 || hour < 6;
    }
    
    // Apply theme with smooth transition
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update theme toggle button aria-label for accessibility
        const themeButton = document.querySelector('.theme-toggle');
        if (themeButton) {
            const newLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
            themeButton.setAttribute('aria-label', newLabel);
            themeButton.setAttribute('title', newLabel);
        }
    }
    
    // Initialize theme on page load
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const preferredTheme = savedTheme || (isEveningTime() ? 'dark' : 'light');
        applyTheme(preferredTheme);
    }
    
    // Toggle theme function with animation feedback
    window.toggleTheme = function() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Add a subtle animation class to the button for feedback
        const button = document.querySelector('.theme-toggle');
        if (button) {
            button.style.transform = 'scale(0.9) rotate(180deg)';
            setTimeout(() => {
                applyTheme(newTheme);
                button.style.transform = '';
            }, 150);
        } else {
            applyTheme(newTheme);
        }
    };
    
    // Initialize immediately, but wait for DOM if needed
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();
/**
 * Instant Theme Application - Prevents white flash during navigation
 * This script must run immediately, before any content renders
 */

(function() {
    'use strict';
    
    // Immediately check and apply theme before any rendering
    const applyThemeInstantly = () => {
        const now = new Date();
        const hour = now.getHours();
        const eveningHour = 18;
        const morningHour = 6;
        
        // Check saved preferences
        const savedTheme = localStorage.getItem('zhao-zhou-theme-preference');
        const savedAutoMode = localStorage.getItem('zhao-zhou-auto-theme');
        const isAutoMode = savedAutoMode === null || savedAutoMode === 'true';
        
        let theme = 'light';
        
        if (savedTheme && !isAutoMode) {
            // User has manual preference
            theme = savedTheme;
        } else {
            // Auto mode - check time
            const shouldBeDark = hour >= eveningHour || hour < morningHour;
            theme = shouldBeDark ? 'dark' : 'light';
            
            // Also check system preference if it's evening
            if (shouldBeDark && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                theme = 'dark';
            }
        }
        
        // Apply theme immediately to document
        document.documentElement.setAttribute('data-theme', theme);
        
        // Apply direct background styles as immediate fallback
        const colors = {
            light: {
                bg: 'rgb(248, 249, 250, 0.97)',
                headerBg: 'rgb(245, 246, 248, 0.95)',
                text: 'rgb(50, 53, 58, 0.92)'
            },
            dark: {
                bg: 'rgb(18, 18, 18, 0.97)',
                headerBg: 'rgb(25, 25, 25, 0.95)',
                text: 'rgb(220, 220, 220, 0.92)'
            }
        };
        
        const themeColors = colors[theme];
        
        // Apply to html element immediately
        document.documentElement.style.backgroundColor = themeColors.bg;
        document.documentElement.style.color = themeColors.text;
        
        // Apply to body if it exists
        if (document.body) {
            document.body.setAttribute('data-theme', theme);
            document.body.style.backgroundColor = themeColors.bg;
            document.body.style.color = themeColors.text;
        }
    };
    
    // Apply theme immediately
    applyThemeInstantly();
    
    // Also apply when DOM content loads (backup)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyThemeInstantly);
    }
    
    // Export function for other scripts to use
    window.applyThemeInstantly = applyThemeInstantly;
})();
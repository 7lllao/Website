/**
 * Theme Manager - Automatic dark/light theme based on time
 * Handles time-based theme switching and user preferences
 */

class ThemeManager {
    constructor() {
        this.storageKey = 'zhao-zhou-theme-preference';
        this.autoThemeKey = 'zhao-zhou-auto-theme';
        this.currentTheme = 'light';
        this.isAutoMode = true;
        this.eveningHour = 18; // 6 PM
        this.morningHour = 6;  // 6 AM
        
        this.init();
    }
    
    init() {
        // Set up global toggle function for backward compatibility
        this.setupGlobalToggleFunction();
        
        // Check for saved preferences
        const savedTheme = localStorage.getItem(this.storageKey);
        const savedAutoMode = localStorage.getItem(this.autoThemeKey);
        
        if (savedAutoMode !== null) {
            this.isAutoMode = savedAutoMode === 'true';
        }
        
        if (savedTheme && !this.isAutoMode) {
            this.setTheme(savedTheme, false);
        } else {
            // Auto mode or first visit
            this.checkTimeAndSetTheme();
        }
        
        // Check system preference as fallback
        this.checkSystemPreference();
        
        // Update theme every minute to catch time changes
        setInterval(() => {
            if (this.isAutoMode) {
                this.checkTimeAndSetTheme();
            }
        }, 60000);
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                if (this.isAutoMode) {
                    this.checkSystemPreference();
                }
            });
        }
    }
    
    checkTimeAndSetTheme() {
        const now = new Date();
        const hour = now.getHours();
        
        // Evening/night hours: 6 PM to 6 AM
        const shouldBeDark = hour >= this.eveningHour || hour < this.morningHour;
        const newTheme = shouldBeDark ? 'dark' : 'light';
        
        if (newTheme !== this.currentTheme) {
            this.setTheme(newTheme, false);
        }
    }
    
    checkSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // Only apply system preference if no manual override and it's evening
            const now = new Date();
            const hour = now.getHours();
            const isEvening = hour >= this.eveningHour || hour < this.morningHour;
            
            if (this.isAutoMode && isEvening) {
                this.setTheme('dark', false);
            }
        }
    }
    
    setTheme(theme, isManualOverride = true) {
        this.currentTheme = theme;
        
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update toggle button if it exists
        this.updateToggleButton();
        
        if (isManualOverride) {
            // User manually changed theme - disable auto mode
            this.isAutoMode = false;
            localStorage.setItem(this.storageKey, theme);
            localStorage.setItem(this.autoThemeKey, 'false');
        } else if (this.isAutoMode) {
            // Don't save preference if in auto mode
            localStorage.removeItem(this.storageKey);
            localStorage.setItem(this.autoThemeKey, 'true');
        }
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme, true);
    }
    
    enableAutoMode() {
        this.isAutoMode = true;
        localStorage.setItem(this.autoThemeKey, 'true');
        localStorage.removeItem(this.storageKey);
        this.checkTimeAndSetTheme();
    }
    
    updateToggleButton() {
        const toggleButton = document.querySelector('.theme-toggle');
        if (toggleButton) {
            // Update button text/icon based on current theme
            const icon = this.currentTheme === 'light' ? '◐' : '◑';
            const title = this.isAutoMode ? 
                `Auto: ${this.currentTheme} theme (${this.currentTheme === 'light' ? 'day' : 'evening'})` :
                `Manual: ${this.currentTheme} theme`;
            
            toggleButton.innerHTML = icon;
            toggleButton.title = title;
            
            // Set up click handler if not already set
            if (!toggleButton.hasAttribute('data-handler-set')) {
                toggleButton.onclick = () => this.toggleTheme();
                toggleButton.setAttribute('data-handler-set', 'true');
            }
        }
    }
    
    // Global function for backward compatibility
    setupGlobalToggleFunction() {
        window.toggleTheme = () => {
            if (window.themeManager) {
                window.themeManager.toggleTheme();
            }
        };
    }
    
    getThemeInfo() {
        return {
            current: this.currentTheme,
            isAuto: this.isAutoMode,
            hour: new Date().getHours()
        };
    }
}

// Initialize theme manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager = new ThemeManager();
    });
} else {
    window.themeManager = new ThemeManager();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
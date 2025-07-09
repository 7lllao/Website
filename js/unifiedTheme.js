/**
 * Unified Theme Manager - Handles both instant application and manual toggles
 * Single source of truth for all theme-related functionality
 */

class UnifiedThemeManager {
    constructor() {
        this.storageKey = 'zhao-zhou-theme-preference';
        this.autoThemeKey = 'zhao-zhou-auto-theme';
        this.currentTheme = 'light';
        this.isAutoMode = true;
        this.eveningHour = 18; // 6 PM
        this.morningHour = 6;  // 6 AM
        
        // Color definitions
        this.colors = {
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
        
        this.init();
    }
    
    init() {
        // Apply theme immediately on construction
        this.applyThemeInstantly();
        
        // Set up ongoing management
        this.setupThemeManagement();
    }
    
    applyThemeInstantly() {
        const theme = this.determineTheme();
        this.setTheme(theme, false, true);
    }
    
    determineTheme() {
        const now = new Date();
        const hour = now.getHours();
        
        // Check saved preferences
        const savedTheme = localStorage.getItem(this.storageKey);
        const savedAutoMode = localStorage.getItem(this.autoThemeKey);
        const isAutoMode = savedAutoMode === null || savedAutoMode === 'true';
        
        this.isAutoMode = isAutoMode;
        
        if (savedTheme && !isAutoMode) {
            // User has manual preference
            return savedTheme;
        } else {
            // Auto mode - check time
            const shouldBeDark = hour >= this.eveningHour || hour < this.morningHour;
            let theme = shouldBeDark ? 'dark' : 'light';
            
            // Also check system preference if it's evening
            if (shouldBeDark && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                theme = 'dark';
            }
            
            return theme;
        }
    }
    
    setTheme(theme, isManualOverride = true, isInstant = false) {
        this.currentTheme = theme;
        const themeColors = this.colors[theme];
        
        // Apply theme attribute
        document.documentElement.setAttribute('data-theme', theme);
        
        // Apply direct styles for immediate effect
        document.documentElement.style.backgroundColor = themeColors.bg;
        document.documentElement.style.color = themeColors.text;
        
        // Apply to body if it exists
        if (document.body) {
            document.body.setAttribute('data-theme', theme);
            document.body.style.backgroundColor = themeColors.bg;
            document.body.style.color = themeColors.text;
        }
        
        // Update loader background if it exists
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.backgroundColor = themeColors.bg;
        }
        
        // Update transition overlay if it exists
        const overlay = document.querySelector('.page-transition-overlay');
        if (overlay) {
            overlay.style.backgroundColor = themeColors.bg;
        }
        
        // Update toggle button if not instant load
        if (!isInstant) {
            this.updateToggleButton();
        }
        
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
    
    setupThemeManagement() {
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
        
        // Set up toggle button when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updateToggleButton();
            });
        } else {
            this.updateToggleButton();
        }
    }
    
    checkTimeAndSetTheme() {
        const newTheme = this.determineTheme();
        if (newTheme !== this.currentTheme) {
            this.setTheme(newTheme, false);
        }
    }
    
    checkSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            const now = new Date();
            const hour = now.getHours();
            const isEvening = hour >= this.eveningHour || hour < this.morningHour;
            
            if (this.isAutoMode && isEvening) {
                this.setTheme('dark', false);
            }
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
        }
    }
    
    getThemeInfo() {
        return {
            current: this.currentTheme,
            isAuto: this.isAutoMode,
            hour: new Date().getHours()
        };
    }
}

// Initialize immediately - this script should run as early as possible
window.unifiedTheme = new UnifiedThemeManager();

// Backward compatibility
window.themeManager = window.unifiedTheme;

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedThemeManager;
}
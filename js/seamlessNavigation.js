/**
 * Seamless Navigation Manager
 * Provides SPA-like navigation while maintaining multi-page structure
 */

class SeamlessNavigation {
    constructor() {
        this.isTransitioning = false;
        this.transitionDuration = 300;
        this.preloadedPages = new Map();
        this.currentPage = window.location.pathname;
        
        this.init();
    }
    
    init() {
        // Add transition styles
        this.addTransitionStyles();
        
        // Intercept navigation clicks
        this.interceptNavigation();
        
        // Preload common pages
        this.preloadPages();
        
        // Handle browser back/forward
        this.handlePopState();
        
        // Add page transition overlay
        this.createTransitionOverlay();
    }
    
    addTransitionStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .page-transition-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: var(--background-color);
                z-index: 9999;
                opacity: 0;
                pointer-events: none;
                transition: opacity ${this.transitionDuration}ms ease;
            }
            
            .page-transition-overlay.active {
                opacity: 1;
                pointer-events: all;
            }
            
            .page-content {
                transition: opacity ${this.transitionDuration}ms ease;
            }
            
            .page-content.transitioning {
                opacity: 0;
            }
            
            /* Ensure theme transitions don't interfere */
            html[data-theme="dark"] .page-transition-overlay {
                background: var(--background-color);
            }
        `;
        document.head.appendChild(style);
    }
    
    createTransitionOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        
        // Set initial background to match current theme
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const bgColor = currentTheme === 'dark' ? 'rgb(18, 18, 18, 0.97)' : 'rgb(248, 249, 250, 0.97)';
        overlay.style.backgroundColor = bgColor;
        
        document.body.appendChild(overlay);
        this.overlay = overlay;
    }
    
    interceptNavigation() {
        // Intercept all internal navigation links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) {
                return; // Skip external links, anchors, and protocols
            }
            
            // Skip if it's a file download
            if (href.includes('.pdf') || href.includes('.zip') || href.includes('.jpg') || href.includes('.png')) {
                return;
            }
            
            e.preventDefault();
            this.navigateToPage(href);
        });
    }
    
    async navigateToPage(href) {
        if (this.isTransitioning) return;
        
        // Don't navigate to same page
        if (href === this.currentPage || href === window.location.pathname) return;
        
        this.isTransitioning = true;
        
        try {
            // Show transition overlay
            this.overlay.classList.add('active');
            
            // Fade out current content
            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.classList.add('transitioning');
            }
            
            // Wait for transition
            await this.delay(this.transitionDuration / 2);
            
            // Load new page
            const newPageContent = await this.loadPage(href);
            
            if (newPageContent) {
                // Replace content while maintaining theme
                this.replacePage(newPageContent, href);
                
                // Update URL
                window.history.pushState({ path: href }, '', href);
                this.currentPage = href;
                
                // Wait a bit then fade in
                await this.delay(50);
                
                // Fade in new content
                const newMainContent = document.querySelector('main');
                if (newMainContent) {
                    newMainContent.classList.remove('transitioning');
                }
                
                // Hide overlay
                this.overlay.classList.remove('active');
            } else {
                // Fallback to normal navigation
                window.location.href = href;
                return;
            }
            
        } catch (error) {
            console.warn('Seamless navigation failed, falling back to normal navigation:', error);
            window.location.href = href;
        } finally {
            this.isTransitioning = false;
        }
    }
    
    async loadPage(href) {
        // Check if page is preloaded
        if (this.preloadedPages.has(href)) {
            return this.preloadedPages.get(href);
        }
        
        try {
            const response = await fetch(href);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Cache the page
            this.preloadedPages.set(href, doc);
            
            return doc;
        } catch (error) {
            console.warn('Failed to load page:', href, error);
            return null;
        }
    }
    
    replacePage(newDoc, href) {
        // Update title
        document.title = newDoc.title;
        
        // Hide loader if it exists (ensure smooth transition)
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('loaded');
        }
        
        // Update main content ONLY - keep header completely static
        const currentMain = document.querySelector('main');
        const newMain = newDoc.querySelector('main');
        
        if (currentMain && newMain) {
            currentMain.replaceWith(newMain.cloneNode(true));
        }
        
        // Update footer if it exists (but keep header untouched)
        const currentFooter = document.querySelector('footer');
        const newFooter = newDoc.querySelector('footer');
        
        if (currentFooter && newFooter) {
            currentFooter.replaceWith(newFooter.cloneNode(true));
        }
        
        // Re-initialize scripts for new content
        this.initializePageScripts();
        
        // Ensure theme toggle button remains functional (but don't re-render header)
        if (window.unifiedTheme) {
            // Just ensure the button works, don't update its display
            const toggleButton = document.querySelector('.theme-toggle');
            if (toggleButton) {
                toggleButton.onclick = () => window.unifiedTheme.toggleTheme();
            }
        }
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    initializePageScripts() {
        // Re-run any page-specific initialization
        // This is where you'd reinitialize any dynamic content
        
        // Trigger custom event for other scripts to listen to
        window.dispatchEvent(new CustomEvent('seamlessNavigation', {
            detail: { page: this.currentPage }
        }));
    }
    
    handlePopState() {
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.path) {
                // Navigate to the previous page without adding to history
                this.navigateToPage(e.state.path, false);
            }
        });
    }
    
    preloadPages() {
        // Preload common navigation pages
        const commonPages = [
            '/',
            '/index.html',
            './index.html',
            'about.html',
            './about.html',
            'exhibitions.html',
            './exhibitions.html',
            'contact.html',
            './contact.html',
            'works.html',
            './works.html'
        ];
        
        // Preload after a short delay
        setTimeout(() => {
            commonPages.forEach(page => {
                if (page !== this.currentPage) {
                    this.loadPage(page);
                }
            });
        }, 1000);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize seamless navigation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.seamlessNavigation = new SeamlessNavigation();
    });
} else {
    window.seamlessNavigation = new SeamlessNavigation();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SeamlessNavigation;
}
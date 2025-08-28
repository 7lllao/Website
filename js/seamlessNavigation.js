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
        this.baseUrl = this.detectBaseUrl();
        this.isMobile = this.detectMobileDevice();
        this.theme = this.getCurrentTheme();
        
        // Mobile menu elements
        this.menuButton = null;
        this.mobileMenu = null;
        this.menuList = null;
        this.hintText = null;
        this.updateDate = null;
        this.themeToggle = null;
        this.darkOption = null;
        this.lightOption = null;
        this.currentPageIndicator = null;
        this.pageInfoContainer = null;
        this.bottomContainer = null;
        this.threeContainer = null;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.material = null;
        this.animationId = null;
        
        this.init();
    }
    
    detectMobileDevice() {
        // More robust mobile detection - prioritize screen width
        const isMobile = window.innerWidth <= 480;
        return isMobile;
    }
    
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
    
    getThemeColors() {
        const theme = this.getCurrentTheme();
        const isDark = theme === 'dark';
        
        return {
            menuBackground: isDark ? 'rgba(25, 25, 25, 0.85)' : 'rgba(215, 215, 215, 0.7)',
            hintColor: isDark ? 'rgba(180, 180, 180, 0.4)' : 'rgba(120, 130, 145, 0.3)',
            updateColor: isDark ? 'rgba(180, 180, 180, 0.4)' : 'rgba(120, 130, 145, 0.3)',
            fogColor: isDark ? 0.15 : 0.9,
            fogAlpha: isDark ? 0.4 : 0.7
        };
    }
    
    getCurrentPageName() {
        // Extract page name from document title or URL
        const title = document.title;
        
        // If title follows "Zhao Zhou | PageName" format, extract the page name
        if (title.includes('| ')) {
            const parts = title.split('| ');
            if (parts.length > 1) {
                return parts[1].toLowerCase();
            }
        }
        
        // Fallback: extract from URL path
        const pathname = window.location.pathname;
        const pathParts = pathname.split('/').filter(part => part !== '');
        
        if (pathParts.length === 0 || pathname === '/') {
            return 'home';
        }
        
        // Get the last part of the path
        const lastPart = pathParts[pathParts.length - 1];
        
        // If it's an HTML file, remove the extension
        if (lastPart.includes('.html')) {
            return lastPart.replace('.html', '');
        }
        
        // If it's index.html or empty, return "home"
        if (lastPart === 'index' || lastPart === '') {
            return 'home';
        }
        
        return lastPart;
    }
    
    detectBaseUrl() {
        // Get the current page's directory context
        const pathname = window.location.pathname;
        const pathParts = pathname.split('/').filter(part => part !== '');
        
        console.log('detectBaseUrl DEBUG:', {
            pathname,
            pathParts,
            pathPartsLength: pathParts.length
        });
        
        // If we're in a subdirectory (like /works/), calculate the base path
        if (pathParts.length > 1 || (pathParts.length === 1 && pathParts[0].includes('.html'))) {
            // We're in a subdirectory or viewing a file
            const depth = pathParts.length - (pathParts[pathParts.length - 1].includes('.html') ? 1 : 0);
            const baseUrl = '../'.repeat(depth);
            
            console.log('detectBaseUrl RESULT:', {
                depth,
                baseUrl,
                reason: 'subdirectory detected'
            });
            
            return baseUrl;
        }
        
        // We're in the root directory
        console.log('detectBaseUrl RESULT:', {
            baseUrl: './',
            reason: 'root directory'
        });
        return './';
    }
    
    resolveUrl(href) {
        console.log('resolveUrl INPUT:', {
            href,
            currentBaseUrl: this.baseUrl,
            windowPathname: window.location.pathname
        });
        
        // Handle different types of URLs
        if (href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            console.log('resolveUrl OUTPUT (external):', href);
            return href; // External URLs
        }
        
        if (href.startsWith('/')) {
            console.log('resolveUrl OUTPUT (absolute):', href);
            return href; // Absolute paths
        }
        
        if (href.startsWith('#')) {
            console.log('resolveUrl OUTPUT (anchor):', href);
            return href; // Anchors
        }
        
        // Handle relative paths
        if (href.startsWith('../')) {
            // Already properly relative - use as is
            console.log('resolveUrl OUTPUT (already relative):', href);
            return href;
        }
        
        // For simple filenames like "index.html" or "about.html"
        if (!href.includes('/')) {
            // Use current baseUrl for proper resolution
            const resolvedUrl = this.baseUrl + href;
            
            console.log('resolveUrl OUTPUT (simple filename):', {
                input: href,
                baseUrl: this.baseUrl,
                resolvedUrl
            });
            
            return resolvedUrl;
        }
        
        console.log('resolveUrl OUTPUT (fallthrough):', href);
        return href;
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
        
        // Initialize mobile menu if on mobile device
        if (this.isMobile) {
            this.initMobileNavigation();
        }
        
        // Setup theme observer
        this.setupThemeObserver();
    }
    
    setupThemeObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    this.theme = this.getCurrentTheme();
                    if (this.isMobile && this.updateThemeColors) {
                        this.updateThemeColors();
                    }
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
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
            
            // Skip mobile navigation links - they handle themselves
            if (link.hasAttribute('data-mobile-nav')) {
                console.log('Skipping mobile nav link from general navigation');
                return;
            }
            
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) {
                return; // Skip external links, anchors, and protocols
            }
            
            // Skip if it's a file download
            if (href.includes('.pdf') || href.includes('.zip') || href.includes('.jpg') || href.includes('.png')) {
                return;
            }
            
            console.log('General navigation click:', href);
            e.preventDefault();
            this.navigateToPage(href);
        });
        
        // Add hover preloading for desktop navigation
        this.setupHoverPreloading();
    }
    
    setupHoverPreloading() {
        // Use the same mobile detection as the menu system
        if (this.isMobile) {
            // For mobile, use aggressive caching strategy
            this.setupMobileAggressiveCaching();
            return;
        }
        
        // Desktop hover preloading
        const navigationLinks = document.querySelectorAll('.header nav a, .menu a');
        
        navigationLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) {
                return;
            }
            
            // Skip file downloads
            if (href.includes('.pdf') || href.includes('.zip') || href.includes('.jpg') || href.includes('.png')) {
                return;
            }
            
            // Add hover preloading
            link.addEventListener('mouseenter', () => {
                this.preloadPage(href);
            });
        });
    }
    
    setupMobileAggressiveCaching() {
        // Preload all navigation pages after a short delay for mobile
        // Use baseUrl to ensure paths work from any directory
        const navigationPages = [
            this.baseUrl + 'index.html',
            this.baseUrl + 'about.html',
            this.baseUrl + 'exhibitions.html',
            this.baseUrl + 'works.html',
            this.baseUrl + 'contact.html'
        ];
        
        // Use requestIdleCallback for better performance
        const preloadMobilePages = () => {
            navigationPages.forEach(page => {
                const currentPageName = this.getPageFromPath(window.location.pathname);
                const pageToLoad = this.getPageFromPath(page);
                
                if (pageToLoad !== currentPageName) {
                    this.preloadPage(page);
                }
            });
        };
        
        if (window.requestIdleCallback) {
            // Preload during browser idle time
            requestIdleCallback(preloadMobilePages, { timeout: 2000 });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(preloadMobilePages, 1000);
        }
    }
    
    preloadPage(href) {
        // Resolve the URL to handle relative paths correctly
        const resolvedHref = this.resolveUrl(href);
        
        // Don't preload if already cached or currently loading
        if (this.preloadedPages.has(resolvedHref) || this.isPreloading?.has(resolvedHref)) {
            return;
        }
        
        // Track preloading to prevent duplicates
        if (!this.isPreloading) {
            this.isPreloading = new Set();
        }
        this.isPreloading.add(resolvedHref);
        
        // Preload the page
        this.loadPage(resolvedHref).finally(() => {
            this.isPreloading.delete(resolvedHref);
        });
    }
    
    getPageFromPath(pathname) {
        // Extract page name from pathname
        const parts = pathname.split('/');
        const lastPart = parts[parts.length - 1];
        return lastPart || 'index.html';
    }
    
    async navigateToPage(href) {
        if (this.isTransitioning) return;
        
        console.log('navigateToPage called with:', href);
        
        // For absolute paths, use as-is. For relative paths, resolve them.
        let finalHref;
        if (href.startsWith('/')) {
            // Absolute path - use directly, no resolution needed
            finalHref = href;
            console.log('Using absolute path:', finalHref);
        } else {
            // Relative path - resolve it
            finalHref = this.resolveUrl(href);
            console.log('Resolved relative path:', href, '->', finalHref);
        }
        
        // Don't navigate to same page
        if (finalHref === this.currentPage || finalHref === window.location.pathname) {
            console.log('Same page navigation blocked:', finalHref);
            return;
        }
        
        this.isTransitioning = true;
        
        try {
            // Check if page is already preloaded for instant navigation
            const isPreloaded = this.preloadedPages.has(finalHref);
            
            console.log('Navigation details:', {
                finalHref,
                isPreloaded,
                currentPage: this.currentPage,
                windowLocation: window.location.pathname
            });
            
            if (isPreloaded) {
                // Instant navigation for preloaded content - no overlay flash
                const newPageContent = this.preloadedPages.get(finalHref);
                
                // Quick fade for instant navigation
                const mainContent = document.querySelector('main');
                if (mainContent) {
                    mainContent.style.opacity = '0.3';
                }
                
                // Minimal delay for smooth transition
                await this.delay(50);
                
                // Replace content
                this.replacePage(newPageContent, finalHref);
                
                // Update URL and internal state consistently
                window.history.pushState({ path: finalHref }, '', finalHref);
                this.currentPage = finalHref;
                
                console.log('History updated (preloaded):', finalHref);
                
                // Update page context for mobile menu
                this.updatePageContext();
                
                // Fade in new content
                const newMainContent = document.querySelector('main');
                if (newMainContent) {
                    newMainContent.style.opacity = '1';
                }
                
            } else {
                // Standard navigation with overlay for non-preloaded content
                this.overlay.classList.add('active');
                
                // Fade out current content
                const mainContent = document.querySelector('main');
                if (mainContent) {
                    mainContent.classList.add('transitioning');
                }
                
                // Wait for transition
                await this.delay(this.transitionDuration / 2);
                
                // Load new page
                const newPageContent = await this.loadPage(finalHref);
                
                if (newPageContent) {
                    // Replace content while maintaining theme
                    this.replacePage(newPageContent, finalHref);
                    
                    // Update URL and internal state consistently
                    window.history.pushState({ path: finalHref }, '', finalHref);
                    this.currentPage = finalHref;
                    
                    console.log('History updated (loaded):', finalHref);
                    
                    // Update page context for mobile menu
                    this.updatePageContext();
                    
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
                    console.warn('Failed to load page, falling back to browser navigation:', finalHref);
                    window.location.href = finalHref;
                    return;
                }
            }
            
        } catch (error) {
            console.warn('Seamless navigation failed, falling back to normal navigation:', error);
            window.location.href = finalHref;
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
            console.log(`Loading page: ${href}`);
            const response = await fetch(href);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Validate that we got a proper HTML document
            if (!doc.querySelector('main')) {
                throw new Error('Invalid page structure: no main element found');
            }
            
            // Cache the page
            this.preloadedPages.set(href, doc);
            console.log(`Successfully loaded and cached: ${href}`);
            
            return doc;
        } catch (error) {
            console.warn(`Failed to load page: ${href}`, error);
            
            // Try alternative paths if the first attempt fails
            if (href.includes('../') && !href.includes('works/')) {
                // Try without the ../ prefix
                const altHref = href.replace('../', '');
                console.log(`Trying alternative path: ${altHref}`);
                
                try {
                    const altResponse = await fetch(altHref);
                    if (altResponse.ok) {
                        const altHtml = await altResponse.text();
                        const altDoc = parser.parseFromString(altHtml, 'text/html');
                        
                        if (altDoc.querySelector('main')) {
                            this.preloadedPages.set(href, altDoc);
                            console.log(`Successfully loaded alternative path: ${altHref}`);
                            return altDoc;
                        }
                    }
                } catch (altError) {
                    console.warn(`Alternative path also failed: ${altHref}`, altError);
                }
            }
            
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
            // Clone the new main content
            const newMainClone = newMain.cloneNode(true);
            
            // Normalize asset paths in the new content
            this.normalizeAssetPaths(newMainClone, href);
            
            currentMain.replaceWith(newMainClone);
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
    
    normalizeAssetPaths(element, pageHref) {
        // Get the directory context of the loaded page
        const pageParts = pageHref.split('/');
        const pageDir = pageParts.slice(0, -1).join('/');
        const isSubDirectory = pageDir.includes('/') || pageDir.includes('../');
        
        // Update image src attributes
        element.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src');
            if (src && src.startsWith('../')) {
                // Already relative, ensure it works from current context
                img.setAttribute('src', src);
            }
        });
        
        // Update video src attributes
        element.querySelectorAll('video').forEach(video => {
            const src = video.getAttribute('src');
            if (src && src.startsWith('../')) {
                // Already relative, ensure it works from current context
                video.setAttribute('src', src);
            }
        });
        
        // Update source elements in videos
        element.querySelectorAll('source').forEach(source => {
            const src = source.getAttribute('src');
            if (src && src.startsWith('../')) {
                // Already relative, ensure it works from current context
                source.setAttribute('src', src);
            }
        });
        
        // Update links to other pages
        element.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('tel') && !href.startsWith('#')) {
                // This is an internal link, resolve it properly
                const resolvedHref = this.resolveUrl(href);
                link.setAttribute('href', resolvedHref);
            }
        });
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
            console.log('popstate event:', e.state);
            
            if (e.state && e.state.path) {
                console.log('Navigating back to:', e.state.path);
                // Navigate to the previous page - don't add to history since this IS history navigation
                this.navigateToPageWithoutHistory(e.state.path);
            } else {
                // Fallback: use current URL from browser
                const currentUrl = window.location.pathname;
                console.log('No state, using current URL:', currentUrl);
                this.navigateToPageWithoutHistory(currentUrl);
            }
        });
    }
    
    async navigateToPageWithoutHistory(href) {
        // Same as navigateToPage but doesn't modify browser history
        if (this.isTransitioning) return;
        
        console.log('navigateToPageWithoutHistory called with:', href);
        
        // For absolute paths, use as-is. For relative paths, resolve them.
        let finalHref;
        if (href.startsWith('/')) {
            finalHref = href;
            console.log('Using absolute path (no history):', finalHref);
        } else {
            finalHref = this.resolveUrl(href);
            console.log('Resolved relative path (no history):', href, '->', finalHref);
        }
        
        // Don't navigate to same page
        if (finalHref === this.currentPage) {
            console.log('Same page navigation blocked (no history):', finalHref);
            return;
        }
        
        this.isTransitioning = true;
        
        try {
            // Load the page content
            const newPageContent = await this.loadPage(finalHref);
            
            if (newPageContent) {
                // Replace content
                this.replacePage(newPageContent, finalHref);
                
                // Update internal state but DON'T modify browser history
                this.currentPage = finalHref;
                
                console.log('Back navigation completed to:', finalHref);
                
                // Update page context
                this.updatePageContext();
            } else {
                console.warn('Failed to load page for back navigation:', finalHref);
                window.location.href = finalHref;
            }
        } catch (error) {
            console.warn('Back navigation failed:', error);
            window.location.href = finalHref;
        } finally {
            this.isTransitioning = false;
        }
    }
    
    preloadPages() {
        // This method is now replaced by setupHoverPreloading and setupMobileAggressiveCaching
        // which provide more intelligent preloading strategies
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ===================================================================
    // MOBILE NAVIGATION FUNCTIONALITY
    // ===================================================================
    
    initMobileNavigation() {
        this.createMobileMenuElements();
        this.setupMobileMenuPositioning();
        this.createThreeJSContainer();
        this.setupMobileMenuEvents();
        
        console.log('Mobile navigation initialized with absolute paths');
    }
    
    createMobileMenuElements() {
        const colors = this.getThemeColors();
        
        // Create menu button
        this.menuButton = document.createElement('button');
        this.menuButton.classList.add('menu-button');
        this.menuButton.textContent = "menu";
        
        // Create mobile menu container
        this.mobileMenu = document.createElement('div');
        this.mobileMenu.classList.add('mobile-menu');
        this.mobileMenu.style.position = 'fixed';
        this.mobileMenu.style.top = '0';
        this.mobileMenu.style.right = '0';
        this.mobileMenu.style.width = '100%';
        this.mobileMenu.style.height = '100vh';
        this.mobileMenu.style.backgroundColor = colors.menuBackground;
        this.mobileMenu.style.zIndex = '9000';
        this.mobileMenu.style.display = 'flex';
        this.mobileMenu.style.flexDirection = 'column';
        this.mobileMenu.style.justifyContent = 'center';
        this.mobileMenu.style.alignItems = 'center';
        this.mobileMenu.style.boxShadow = '-5px 0 15px rgba(0, 0, 0, 0.01)';
        this.mobileMenu.style.cursor = 'pointer';
        this.mobileMenu.style.opacity = '0';
        this.mobileMenu.style.visibility = 'hidden';
        this.mobileMenu.style.transition = 'opacity 0.2s ease, visibility 0.2s ease';
        
        // Create menu list
        this.menuList = document.createElement('ul');
        this.menuList.classList.add('mobile-menu-list');
        
        // Menu items with simple absolute paths - no complex resolution needed
        const menuItems = [
            { text: 'About', href: '/about.html' },
            { text: 'Exhibitions', href: '/exhibitions.html' },
            { text: 'Works', href: '/works.html' },
            { text: 'Contact', href: '/contact.html' }
        ];
        
        menuItems.forEach(item => {
            const li = document.createElement('li');
            li.style.opacity = '1';
            li.style.transform = 'none';
            li.style.transition = 'none';
            
            const a = document.createElement('a');
            // Use simple absolute paths - always work from any page
            a.href = item.href;
            a.textContent = item.text;
            a.style.transition = 'none';
            a.setAttribute('data-mobile-nav', 'true'); // Mark as mobile nav link
            
            console.log(`Mobile menu creation: ${item.text} -> ${item.href}`);
            
            li.appendChild(a);
            this.menuList.appendChild(li);
        });
        
        // Create hint text with more spacing
        this.hintText = document.createElement('div');
        this.hintText.classList.add('menu-hint');
        this.hintText.textContent = "tap anywhere to close";
        this.hintText.style.color = colors.hintColor;
        this.hintText.style.fontSize = 'calc(var(--normal-font) * .8)';
        this.hintText.style.marginTop = '3em'; // Add significant spacing above hint text
        
        // Create theme toggle with Dark / Light format
        this.themeToggle = document.createElement('div');
        this.themeToggle.classList.add('theme-toggle-mobile');
        this.themeToggle.style.fontSize = 'calc(var(--normal-font) * 0.8)';
        this.themeToggle.style.cursor = 'pointer';
        this.themeToggle.style.userSelect = 'none';
        this.themeToggle.style.transition = 'color 0.2s ease';
        
        // Create individual clickable elements for Dark and Light
        this.darkOption = document.createElement('span');
        this.darkOption.textContent = 'Dark';
        this.darkOption.style.cursor = 'pointer';
        this.darkOption.style.transition = 'color 0.2s ease';
        
        this.lightOption = document.createElement('span');
        this.lightOption.textContent = 'Light';
        this.lightOption.style.cursor = 'pointer';
        this.lightOption.style.transition = 'color 0.2s ease';
        
        const separator = document.createElement('span');
        separator.textContent = ' / ';
        separator.style.color = colors.updateColor;
        
        // Set initial colors based on current theme
        const currentTheme = this.getCurrentTheme();
        this.darkOption.style.color = currentTheme === 'dark' ? 'var(--color-text)' : colors.updateColor;
        this.lightOption.style.color = currentTheme === 'light' ? 'var(--color-text)' : colors.updateColor;
        
        // Assemble theme toggle
        this.themeToggle.appendChild(this.darkOption);
        this.themeToggle.appendChild(separator);
        this.themeToggle.appendChild(this.lightOption);
        
        // Create current page indicator
        this.currentPageIndicator = document.createElement('div');
        this.currentPageIndicator.classList.add('current-page-indicator');
        this.currentPageIndicator.textContent = `current page: ${this.getCurrentPageName()}`;
        this.currentPageIndicator.style.fontSize = 'calc(var(--normal-font) * 0.8)';
        this.currentPageIndicator.style.color = colors.updateColor;
        this.currentPageIndicator.style.userSelect = 'none';
        this.currentPageIndicator.style.pointerEvents = 'none';
        this.currentPageIndicator.style.marginBottom = '0.2em';
        
        // Create update date with dynamic date
        this.updateDate = document.createElement('div');
        this.updateDate.classList.add('update-date');
        
        // Get the last modified date and format it
        const lastModDate = new Date(document.lastModified);
        const day = lastModDate.getDate().toString().padStart(2, '0');
        const month = (lastModDate.getMonth() + 1).toString().padStart(2, '0');
        const year = lastModDate.getFullYear().toString().slice(-2);
        const formattedDate = `${day}.${month}.${year}`;
        
        this.updateDate.textContent = `updated: ${formattedDate}`;
        this.updateDate.style.fontSize = 'calc(var(--normal-font) * 0.8)';
        this.updateDate.style.color = colors.updateColor;
        this.updateDate.style.userSelect = 'none';
        this.updateDate.style.pointerEvents = 'none';
        
        // Create container for page info (current page + update date)
        this.pageInfoContainer = document.createElement('div');
        this.pageInfoContainer.classList.add('page-info-container');
        this.pageInfoContainer.style.display = 'flex';
        this.pageInfoContainer.style.flexDirection = 'column';
        this.pageInfoContainer.style.alignItems = 'flex-end';
        this.pageInfoContainer.appendChild(this.currentPageIndicator);
        this.pageInfoContainer.appendChild(this.updateDate);
        
        // Create bottom container for theme toggle and page info
        this.bottomContainer = document.createElement('div');
        this.bottomContainer.classList.add('mobile-menu-bottom');
        this.bottomContainer.style.position = 'absolute';
        this.bottomContainer.style.bottom = '2.05em';
        this.bottomContainer.style.left = '1.5em';
        this.bottomContainer.style.right = '1.5em';
        this.bottomContainer.style.display = 'flex';
        this.bottomContainer.style.justifyContent = 'space-between';
        this.bottomContainer.style.alignItems = 'flex-end';
        
        // Add theme toggle and page info container to bottom container
        this.bottomContainer.appendChild(this.themeToggle);
        this.bottomContainer.appendChild(this.pageInfoContainer);
        
        // Assemble menu
        this.mobileMenu.appendChild(this.menuList);
        this.mobileMenu.appendChild(this.hintText);
        this.mobileMenu.appendChild(this.bottomContainer); // Add the bottom container with theme toggle and update date
        
        // Add theme toggle functionality for Dark option
        this.darkOption.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent menu from closing
            
            // Apply dark theme
            document.documentElement.setAttribute('data-theme', 'dark');
            
            // Update all theme colors
            this.updateThemeColors();
        });
        
        // Add theme toggle functionality for Light option
        this.lightOption.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent menu from closing
            
            // Apply light theme
            document.documentElement.setAttribute('data-theme', 'light');
            
            // Update all theme colors
            this.updateThemeColors();
        });
        
        // Add to DOM
        document.body.appendChild(this.menuButton);
        document.body.appendChild(this.mobileMenu);
    }
    
    setupMobileMenuPositioning() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        const positionMenuButton = () => {
            const headerRect = header.getBoundingClientRect();
            this.menuButton.style.position = 'fixed';
            this.menuButton.style.top = (headerRect.top + headerRect.height / 2) + 'px';
            this.menuButton.style.right = '1.5em';
            this.menuButton.style.transform = 'translateY(-50%)';
        };
        
        positionMenuButton();
        window.addEventListener('scroll', positionMenuButton);
        window.addEventListener('resize', positionMenuButton);
    }
    
    createThreeJSContainer() {
        // Create Three.js container
        this.threeContainer = document.createElement('div');
        this.threeContainer.id = 'three-container';
        this.threeContainer.style.position = 'fixed';
        this.threeContainer.style.top = '0';
        this.threeContainer.style.left = '0';
        this.threeContainer.style.width = '100%';
        this.threeContainer.style.height = '100%';
        this.threeContainer.style.zIndex = '8500';
        this.threeContainer.style.pointerEvents = 'none';
        this.threeContainer.style.opacity = '0';
        this.threeContainer.style.transition = 'opacity 1s ease';
        document.body.appendChild(this.threeContainer);
    }
    
    initThree() {
        if (!window.THREE) {
            console.warn('Three.js not loaded, skipping fog effect');
            return;
        }
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        this.camera.position.z = 1;
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.threeContainer.appendChild(this.renderer.domElement);
        
        // Create geometry and shader
        const geometry = new THREE.PlaneGeometry(2, 2);
        const shaderColors = this.getThemeColors();
        
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                fogColor: { value: shaderColors.fogColor },
                fogAlpha: { value: shaderColors.fogAlpha }
            },
            vertexShader: `
                void main() {
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec2 resolution;
                uniform float time;
                uniform float fogColor;
                uniform float fogAlpha;
                
                void main() {
                    vec2 uv = gl_FragCoord.xy / resolution.xy;
                    vec2 center = uv - 0.5;
                    float dist = length(center);
                    
                    float strength = 5.0 + 3.0 * sin(time * 0.9);
                    float distortion = 9.0 + strength * dist * dist;
                    
                    vec2 distortedUV = center * distortion + 0.5;
                    distortedUV.x += 0.02 * sin(distortedUV.y * 20.0 + time);
                    distortedUV.y += 0.02 * sin(distortedUV.x * 20.0 + time * 0.7);
                    
                    vec3 color = vec3(fogColor);
                    float alpha = fogAlpha + 0.3 * sin(dist * 10.0 - time);
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true
        });
        
        const plane = new THREE.Mesh(geometry, this.material);
        this.scene.add(plane);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.renderer.setSize(width, height);
            this.material.uniforms.resolution.value.set(width, height);
        });
    }
    
    animate() {
        if (!this.material) return;
        this.material.uniforms.time.value += 0.01;
        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updateThemeColors() {
        const newColors = this.getThemeColors();
        const currentTheme = this.getCurrentTheme();
        
        if (this.mobileMenu) {
            this.mobileMenu.style.backgroundColor = newColors.menuBackground;
        }
        if (this.hintText) {
            this.hintText.style.color = newColors.hintColor;
        }
        if (this.updateDate) {
            this.updateDate.style.color = newColors.updateColor;
        }
        
        // Update theme toggle colors for Dark/Light options
        if (this.darkOption && this.lightOption) {
            this.darkOption.style.color = currentTheme === 'dark' ? 'var(--color-text)' : newColors.updateColor;
            this.lightOption.style.color = currentTheme === 'light' ? 'var(--color-text)' : newColors.updateColor;
        }
        
        if (this.material) {
            this.material.uniforms.fogColor.value = newColors.fogColor;
            this.material.uniforms.fogAlpha.value = newColors.fogAlpha;
        }
    }
    
    updatePageContext() {
        // Update base URL and mobile menu after navigation
        this.baseUrl = this.detectBaseUrl();
        
        // Update current page indicator if it exists
        if (this.currentPageIndicator) {
            const pageName = this.getCurrentPageName();
            this.currentPageIndicator.textContent = `current page: ${pageName}`;
        }
        
        console.log(`Page context updated: baseUrl = ${this.baseUrl}, currentPage = ${this.currentPage}`);
    }
    
    // Mobile menu links now use absolute paths - no updates needed
    
    setupMobileMenuEvents() {
        if (!this.menuButton || !this.mobileMenu) return;
        
        // Menu button click
        this.menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (this.menuButton.textContent === "close") {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        });
        
        // Menu click (except items and theme toggle)
        this.mobileMenu.addEventListener('click', (e) => {
            if (e.target === this.mobileMenu || e.target === this.hintText) {
                this.closeMobileMenu();
            }
        });
        
        // Menu list click prevention
        this.menuList.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Prevent clicks on bottom container (theme toggle area) from closing the menu
        if (this.bottomContainer) {
            this.bottomContainer.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        // Menu item clicks - use seamless navigation with proper event handling
        this.menuList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent general navigation from interfering
                
                const href = link.getAttribute('href');
                console.log(`Mobile menu click: ${link.textContent} -> ${href}`);
                
                this.closeMobileMenu();
                
                // Small delay to let menu close before navigating
                setTimeout(() => {
                    this.navigateToPage(href);
                }, 200);
            });
        });
        
        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
    }
    
    openMobileMenu() {
        if (!this.mobileMenu || !this.menuButton) return;
        
        this.updateThemeColors();
        this.mobileMenu.style.opacity = '1';
        this.mobileMenu.style.visibility = 'visible';
        this.menuButton.textContent = "close";
        document.body.classList.add('menu-open');
        
        setTimeout(() => {
            if (this.hintText) {
                this.hintText.classList.add('visible');
            }
        }, 1250);
        
        if (!this.renderer && window.THREE) {
            this.initThree();
        }
        if (this.threeContainer) {
            this.threeContainer.style.opacity = '1';
        }
        if (this.renderer) {
            this.animate();
        }
    }
    
    closeMobileMenu() {
        if (!this.mobileMenu || !this.menuButton) return;
        
        this.mobileMenu.style.opacity = '0';
        this.mobileMenu.style.visibility = 'hidden';
        this.menuButton.textContent = "menu";
        document.body.classList.remove('menu-open');
        
        if (this.hintText) {
            this.hintText.classList.remove('visible');
        }
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.threeContainer) {
            this.threeContainer.style.opacity = '0';
        }
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
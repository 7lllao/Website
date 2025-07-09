document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation system
    initNavigation();
    
    function initNavigation() {
        // Store initial header state if not already stored
        if (!localStorage.getItem('headerState')) {
            saveHeaderState();
        } else {
            // Apply saved header state if it exists
            applyHeaderState();
        }
        
        // Intercept all internal navigation links
        document.querySelectorAll('a').forEach(link => {
            // Only intercept internal links to HTML pages
            const href = link.getAttribute('href');
            if (link.hostname === window.location.hostname && 
                !link.hasAttribute('target') && 
                !href.startsWith('#') &&
                !href.startsWith('mailto:') &&
                (href.endsWith('.html') || href === '/' || href === '')) {
                
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetUrl = this.getAttribute('href');
                    
                    // Save current header state before navigation
                    saveHeaderState();
                    
                    // Load the new page content
                    loadPage(targetUrl);
                });
            }
        });
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', function(e) {
            if (e.state && e.state.url) {
                loadPage(e.state.url, false);
            }
        });
    }
    
    // Function to save current header state to sessionStorage
    function saveHeaderState() {
        try {
            const menuItems = document.querySelectorAll('.menu span a');
            // Also get the home button
            const homeButton = document.querySelector('.logo a, .home-button, .header a[href="/"], .header a[href="/index.html"]');
            
            const headerState = {
                menuItems: Array.from(menuItems).map(item => {
                    return {
                        showingInitial: item.getAttribute('data-showing-initial'),
                        href: item.getAttribute('href')
                    };
                }),
                menuGap: document.querySelector('.menu').style.gap,
                // Save home button state if it exists
                homeButton: homeButton ? {
                    href: homeButton.getAttribute('href'),
                    showingInitial: homeButton.getAttribute('data-showing-initial'),
                    classes: homeButton.className
                } : null,
                timestamp: new Date().getTime() // Add timestamp for cache invalidation
            };
            
            sessionStorage.setItem('headerState', JSON.stringify(headerState));
        } catch (error) {
            console.error('Error accessing sessionStorage:', error);
        }
    }
    
    // Function to apply saved header state
    function applyHeaderState() {
        try {
            const headerState = JSON.parse(sessionStorage.getItem('headerState'));
            if (!headerState) return;
            
            // Optional: Check if state is too old (e.g., more than a day)
            const now = new Date().getTime();
            if (headerState.timestamp && (now - headerState.timestamp > 86400000)) {
                sessionStorage.removeItem('headerState');
                return;
            }
            
            const menuItems = document.querySelectorAll('.menu span a');
            
            // Apply saved state to menu items
            menuItems.forEach((item, index) => {
                if (headerState.menuItems && headerState.menuItems[index]) {
                    item.setAttribute('data-showing-initial', headerState.menuItems[index].showingInitial);
                }
            });
            
            // Apply saved home button state if it exists
            if (headerState.homeButton) {
                const homeButton = document.querySelector('.logo a, .home-button, .header a[href="/"], .header a[href="/index.html"]');
                if (homeButton) {
                    if (headerState.homeButton.showingInitial) {
                        homeButton.setAttribute('data-showing-initial', headerState.homeButton.showingInitial);
                    }
                    if (headerState.homeButton.classes) {
                        homeButton.className = headerState.homeButton.classes;
                    }
                }
            }
            
            // Apply saved menu gap
            if (headerState.menuGap) {
                document.querySelector('.menu').style.gap = headerState.menuGap;
            }
        } catch (error) {
            console.error('Error applying header state:', error);
        }
    }
    
    // Function to load a new page via AJAX
    function loadPage(url, pushState = true) {
        // Show loading indicator
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'block';
        
        // Add .html extension if needed for GitHub Pages
        if (url.endsWith('/') || !url.includes('.')) {
            url = url.endsWith('/') ? url + 'index.html' : url + '.html';
        }
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Page not found');
                }
                return response.text();
            })
            .then(html => {
                // Parse the HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Update the main content
                const newMain = doc.querySelector('main');
                const currentMain = document.querySelector('main');
                
                if (newMain && currentMain) {
                    currentMain.innerHTML = newMain.innerHTML;
                    
                    // Re-run any scripts in the main content
                    newMain.querySelectorAll('script').forEach(script => {
                        const newScript = document.createElement('script');
                        Array.from(script.attributes).forEach(attr => {
                            newScript.setAttribute(attr.name, attr.value);
                        });
                        newScript.textContent = script.textContent;
                        currentMain.appendChild(newScript);
                    });
                }
                
                // Handle footer - remove existing footer if any
                const currentFooter = document.querySelector('footer');
                if (currentFooter) {
                    currentFooter.remove();
                }
                
                // Check if the new page has a footer
                const newFooter = doc.querySelector('footer');
                if (newFooter) {
                    // Add the new footer after main
                    document.body.appendChild(newFooter);
                }
                
                // Check if the page is contact.html
                const isContactPage = url.includes('contact.html');
                
                // Apply appropriate body class based on the page
                if (isContactPage) {
                    document.body.classList.add('contact-page');
                } else {
                    document.body.classList.remove('contact-page');
                    // Ensure scrolling is enabled for non-contact pages
                    document.documentElement.style.overflow = '';
                    document.body.style.overflow = '';
                }
                
                // Update page title
                document.title = doc.title;
                
                // Update URL in browser history
                if (pushState) {
                    window.history.pushState({ url: url }, doc.title, url);
                }
                
                // Apply saved header state
                applyHeaderState();
                
                // Hide loading indicator
                if (loader) loader.style.display = 'none';
                
                // Reinitialize any scripts that need to run on the new page
                reinitializeScripts();
            })
            .catch(error => {
                console.error('Error loading page:', error);
                // Fallback to traditional navigation on error
                window.location.href = url;
            });
    }
    
    // Function to reinitialize any scripts needed for the new content
    function reinitializeScripts() {
        // Add any script reinitialization needed for your specific pages
        // For example, if you have image galleries, forms, etc.
        
        // If you need to reinitialize Three.js or other components:
        if (typeof initThree === 'function' && document.getElementById('three-container')) {
            initThree();
        }
        
        // Reinitialize cursor force effect
        if (window.cursorForce) {
            console.log('Navigation: Destroying old cursor force instance');
            window.cursorForce.destroy();
            window.cursorForce = null;
        }
        
        // Small delay to ensure DOM is fully ready
        setTimeout(() => {
            if (typeof initCursorForce === 'function') {
                console.log('Navigation: Reinitializing cursor force effect');
                initCursorForce();
            }
        }, 100);
    }
}); 

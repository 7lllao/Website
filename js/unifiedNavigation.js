/**
 * Unified Navigation System
 * Handles both mobile (fogMenu) and desktop (responsive text) navigation
 * Eliminates script conflicts and provides robust foundation
 */

class NavigationController {
    constructor() {
        this.header = document.querySelector('.header');
        this.isMobile = this.detectMobileDevice();
        this.theme = this.getCurrentTheme();
        
        console.log('NavigationController initialized:', {
            isMobile: this.isMobile,
            windowWidth: window.innerWidth,
            headerFound: !!this.header
        });
        
        // Clear any cached header state from previous navigation system
        try {
            sessionStorage.removeItem('headerState');
        } catch (e) {
            console.log('Could not clear sessionStorage:', e);
        }
        
        // Initialize appropriate navigation system
        if (this.isMobile) {
            console.log('Initializing mobile navigation (fogMenu)');
            this.initMobileNavigation();
        } else {
            console.log('Initializing desktop navigation (responsive text)');
            this.initDesktopNavigation();
            console.log('Desktop navigation initialization completed');
        }
        
        // Setup shared systems
        this.setupThemeObserver();
    }

    // ===================================================================
    // DEVICE DETECTION & THEME MANAGEMENT
    // ===================================================================

    detectMobileDevice() {
        // More robust mobile detection - prioritize screen width
        const isMobile = window.innerWidth <= 480;
        console.log('Device detection:', {
            windowWidth: window.innerWidth,
            touchSupport: 'ontouchstart' in window,
            isMobile: isMobile
        });
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

    // ===================================================================
    // MOBILE NAVIGATION (FOG MENU)
    // ===================================================================

    initMobileNavigation() {
        this.createMobileMenuElements();
        this.setupMobileMenuPositioning();
        this.createThreeJSContainer();
        this.setupMobileMenuEvents();
        this.hideMobileElementsOnDesktop();
    }

    createMobileMenuElements() {
        const colors = this.getThemeColors();

        // Create menu button
        this.menuButton = document.createElement('button');
        this.menuButton.classList.add('menu-button');
        this.menuButton.textContent = "menu";

        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.classList.add('mobile-menu-overlay');

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

        // Menu items with path calculation
        const menuItems = [
            { text: 'About', href: '/about.html' },
            { text: 'Exhibitions', href: '/exhibitions.html' },
            { text: 'Works', href: '/works.html' },
            { text: 'Contact', href: '/contact.html' }
        ];

        const baseUrl = this.getBaseUrl();
        
        menuItems.forEach(item => {
            const li = document.createElement('li');
            li.style.opacity = '1';
            li.style.transform = 'none';
            li.style.transition = 'none';
            
            const a = document.createElement('a');
            a.href = baseUrl + item.href.substring(1);
            a.textContent = item.text;
            a.style.transition = 'none';
            
            li.appendChild(a);
            this.menuList.appendChild(li);
        });

        // Create hint text
        this.hintText = document.createElement('div');
        this.hintText.classList.add('menu-hint');
        this.hintText.textContent = "tap anywhere to close";
        this.hintText.style.color = colors.hintColor;
        this.hintText.style.fontSize = 'calc(var(--normal-font) * .8)';

        // Create update date
        this.updateDate = document.createElement('div');
        this.updateDate.classList.add('update-date');
        this.updateDate.textContent = "updated: 10.03.25";
        this.updateDate.style.position = 'absolute';
        this.updateDate.style.bottom = '2.05em';
        this.updateDate.style.right = '1.5em';
        this.updateDate.style.fontSize = 'calc(var(--normal-font) * 0.8)';
        this.updateDate.style.color = colors.updateColor;
        this.updateDate.style.userSelect = 'none';
        this.updateDate.style.pointerEvents = 'none';

        // Assemble menu
        this.mobileMenu.appendChild(this.menuList);
        this.mobileMenu.appendChild(this.hintText);
        this.mobileMenu.appendChild(this.updateDate);

        // Add to DOM
        document.body.appendChild(this.menuButton);
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.mobileMenu);
    }

    getBaseUrl() {
        const pathParts = window.location.pathname.split('/').filter(part => part !== '');
        
        if (pathParts.length === 0 || (pathParts.length === 1 && !pathParts[0].includes('.html'))) {
            return '';
        }
        
        let basePath = '';
        const isViewingFile = pathParts[pathParts.length - 1].includes('.html');
        const depth = isViewingFile ? pathParts.length - 1 : pathParts.length;
        
        for (let i = 0; i < depth; i++) {
            basePath += '../';
        }
        
        return basePath;
    }

    setupMobileMenuPositioning() {
        const positionMenuButton = () => {
            const headerRect = this.header.getBoundingClientRect();
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

        // Three.js variables
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.material = null;
        this.animationId = null;
    }

    initThree() {
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
        this.material.uniforms.time.value += 0.01;
        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    updateThemeColors() {
        const newColors = this.getThemeColors();
        
        this.mobileMenu.style.backgroundColor = newColors.menuBackground;
        this.hintText.style.color = newColors.hintColor;
        this.updateDate.style.color = newColors.updateColor;
        
        if (this.material) {
            this.material.uniforms.fogColor.value = newColors.fogColor;
            this.material.uniforms.fogAlpha.value = newColors.fogAlpha;
        }
    }

    setupMobileMenuEvents() {
        // Menu button click
        this.menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (this.menuButton.textContent === "close") {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        });

        // Overlay click
        this.overlay.addEventListener('click', () => {
            this.closeMobileMenu();
        });

        // Menu click (except items)
        this.mobileMenu.addEventListener('click', (e) => {
            if (e.target === this.mobileMenu || e.target === this.hintText) {
                this.closeMobileMenu();
            }
        });

        // Menu list click prevention
        this.menuList.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Menu item clicks
        this.menuList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
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
        this.updateThemeColors();
        this.overlay.classList.add('active');
        this.mobileMenu.style.opacity = '1';
        this.mobileMenu.style.visibility = 'visible';
        this.menuButton.textContent = "close";
        document.body.classList.add('menu-open');
        
        setTimeout(() => {
            this.hintText.classList.add('visible');
        }, 1250);
        
        if (!this.renderer) {
            this.initThree();
        }
        this.threeContainer.style.opacity = '1';
        this.animate();
    }

    closeMobileMenu() {
        this.mobileMenu.style.opacity = '0';
        this.mobileMenu.style.visibility = 'hidden';
        this.menuButton.textContent = "menu";
        document.body.classList.remove('menu-open');
        
        this.hintText.classList.remove('visible');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.threeContainer.style.opacity = '0';
        
        this.mobileMenu.addEventListener('transitionend', () => {
            this.overlay.classList.remove('active');
        }, { once: true });
    }

    hideMobileElementsOnDesktop() {
        // This is handled by CSS media queries
    }

    // ===================================================================
    // DESKTOP NAVIGATION (RESPONSIVE TEXT)
    // ===================================================================

    initDesktopNavigation() {
        this.menu = document.querySelector('.menu');
        this.menuItems = this.menu ? this.menu.querySelectorAll('span a') : null;
        
        console.log('Desktop navigation elements:', {
            menuFound: !!this.menu,
            menuItemsCount: this.menuItems ? this.menuItems.length : 0
        });
        
        if (!this.menu || !this.menuItems || this.menuItems.length === 0) {
            console.error('Desktop navigation: Menu elements not found');
            return;
        }
        
        // Define breakpoints for responsive text shortening
        this.breakpoints = [
            { width: 880, items: [false, false, false, false] }, // Full text
            { width: 780, items: [false, false, true, false] },  // "Works" → "W"
            { width: 720, items: [false, true, true, false] },   // "Exhibitions" → "E"
            { width: 660, items: [true, true, true, false] },    // "About" → "A"
            { width: 600, items: [true, true, true, true] }      // "Contact" → "C"
        ];

        this.setupDesktopMenuResizing();
    }

    setupDesktopMenuResizing() {
        const updateMenu = () => {
            const windowWidth = window.innerWidth;
            
            // Find appropriate breakpoint
            let activeBreakpoint = this.breakpoints[0];
            
            for (let i = 0; i < this.breakpoints.length; i++) {
                if (windowWidth <= this.breakpoints[i].width) {
                    activeBreakpoint = this.breakpoints[i];
                } else {
                    break;
                }
            }
            
            console.log('Desktop menu update:', {
                windowWidth,
                activeBreakpoint,
                menuItemsCount: this.menuItems.length
            });
            
            // Apply changes to menu items
            this.menuItems.forEach((item, index) => {
                const shouldShowInitial = activeBreakpoint.items[index];
                const oldValue = item.getAttribute('data-showing-initial');
                item.setAttribute('data-showing-initial', shouldShowInitial);
                
                if (index === 0) { // Log first item for debugging
                    console.log(`Menu item ${index}:`, {
                        shouldShowInitial,
                        oldValue,
                        newValue: item.getAttribute('data-showing-initial')
                    });
                }
            });
            
            // Adjust menu gap
            if (windowWidth <= 720) {
                this.menu.style.gap = '0.4em';
            } else {
                this.menu.style.gap = '0.8em';
            }
        };

        console.log('Setting up desktop menu resizing');
        
        // Initial update
        updateMenu();

        // Debounced resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateMenu, 20);
        });
    }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NavigationController();
});
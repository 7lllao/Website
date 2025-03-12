document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    
    // Create menu button with simple text
    const menuButton = document.createElement('button');
    menuButton.classList.add('menu-button');
    menuButton.textContent = "menu"; // Start with "menu" text
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('mobile-menu-overlay');
    
    
    // Create mobile menu
    const mobileMenu = document.createElement('div');
    mobileMenu.classList.add('mobile-menu');
    mobileMenu.style.position = 'fixed';
    mobileMenu.style.top = '0';
    mobileMenu.style.right = '0';
    mobileMenu.style.width = '100%';
    mobileMenu.style.height = '100vh';
    mobileMenu.style.backgroundColor = 'rgba(215, 215, 215, 0.6)';
    mobileMenu.style.zIndex = '9000';
    mobileMenu.style.display = 'flex';
    mobileMenu.style.flexDirection = 'column';
    mobileMenu.style.justifyContent = 'center';
    mobileMenu.style.alignItems = 'center';
    mobileMenu.style.boxShadow = '-5px 0 15px rgba(0, 0, 0, 0.01)';
    mobileMenu.style.cursor = 'pointer';
    mobileMenu.style.opacity = '0';
    mobileMenu.style.visibility = 'hidden';
    mobileMenu.style.transition = 'opacity 0.2s ease, visibility 0.2s ease';
    
    // Create menu list
    const menuList = document.createElement('ul');
    menuList.classList.add('mobile-menu-list');
    
    // Menu items - Use absolute paths starting with / to ensure correct navigation from any directory
    const menuItems = [
        { text: 'About', href: '/about.html' },
        { text: 'Exhibitions', href: '/exhibitions.html' },
        { text: 'Works', href: '/works.html' },
        { text: 'Contact', href: '/contact.html' }
    ];
    
    // Get the base URL to handle subdirectories if the site is not at root
    const getBaseUrl = () => {
        // Get the current path and determine how many levels deep we are
        const pathParts = window.location.pathname.split('/').filter(part => part !== '');
        
        // If we're at root or there's no HTML file in the path, return empty string
        if (pathParts.length === 0 || (pathParts.length === 1 && !pathParts[0].includes('.html'))) {
            return '';
        }
        
        // If we're in a subdirectory or viewing an HTML file, calculate the path to root
        let basePath = '';
        
        // If the last part contains .html, we're viewing a file
        const isViewingFile = pathParts[pathParts.length - 1].includes('.html');
        const depth = isViewingFile ? pathParts.length - 1 : pathParts.length;
        
        for (let i = 0; i < depth; i++) {
            basePath += '../';
        }
        
        return basePath;
    };
    
    const baseUrl = getBaseUrl();
    
    // Create list items with correct paths
    menuItems.forEach(item => {
        const li = document.createElement('li');
        li.style.opacity = '1';
        li.style.transform = 'none';
        li.style.transition = 'none';
        
        const a = document.createElement('a');
        // Convert absolute path to relative path based on current location
        a.href = baseUrl + item.href.substring(1); // Remove the leading / and add the base path
        a.textContent = item.text;
        a.style.transition = 'none';
        
        li.appendChild(a);
        menuList.appendChild(li);
    });
    
    // Create a hint text element
    const hintText = document.createElement('div');
    hintText.classList.add('menu-hint');
    hintText.textContent = "tap anywhere to close";
    hintText.style.color = 'rgba(120, 130, 145, 0.3)'; // Lighter grey color
    hintText.style.fontSize = 'calc(var(--normal-font) * .8)'; // Increase font size by 0.25
    
    // Create update date text
    const updateDate = document.createElement('div');
    updateDate.classList.add('update-date');
    updateDate.textContent = "updated: 10.03.25";
    updateDate.style.position = 'absolute';
    updateDate.style.bottom = '2.05em';
    updateDate.style.right = '1.5em';
    updateDate.style.fontSize = 'calc(var(--normal-font) * 0.8)';
    updateDate.style.color = 'rgba(120, 130, 145, 0.3)';
    updateDate.style.userSelect = 'none';
    updateDate.style.pointerEvents = 'none';
    
    // Assemble the menu
    mobileMenu.appendChild(menuList);
    mobileMenu.appendChild(hintText);
    mobileMenu.appendChild(updateDate); // Add the update date to the menu
    
    // Add elements to the DOM
    document.body.appendChild(menuButton);
    document.body.appendChild(overlay);
    document.body.appendChild(mobileMenu);
    
    // Position the menu button to match where it would be in the header
    function positionMenuButton() {
        const headerRect = header.getBoundingClientRect();
        menuButton.style.position = 'fixed';
        menuButton.style.top = (headerRect.top + headerRect.height / 2) + 'px';
        menuButton.style.right = '1.5em';
        menuButton.style.transform = 'translateY(-50%)';
    }
    
    // Position initially and on scroll/resize
    positionMenuButton();
    window.addEventListener('scroll', positionMenuButton);
    window.addEventListener('resize', positionMenuButton);
    
    // Create Three.js container
    const threeContainer = document.createElement('div');
    threeContainer.id = 'three-container';
    threeContainer.style.position = 'fixed';
    threeContainer.style.top = '0';
    threeContainer.style.left = '0';
    threeContainer.style.width = '100%';
    threeContainer.style.height = '100%';
    threeContainer.style.zIndex = '8500'; // Below the menu but above other content
    threeContainer.style.pointerEvents = 'none'; // Allow clicks to pass through
    threeContainer.style.opacity = '0';
    threeContainer.style.transition = 'opacity 1s ease';
    document.body.appendChild(threeContainer);
    
    // Initialize Three.js
    let renderer, scene, camera, material;
    let animationId = null;
    
    function initThree() {
        // Scene setup
        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 1;
        
        // Renderer setup
        renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0); // Transparent background
        threeContainer.appendChild(renderer.domElement);
        
        // Create a plane that covers the entire screen
        const geometry = new THREE.PlaneGeometry(2, 2);
        
        // Extreme lens distortion shader
        material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            },
            vertexShader: `
                void main() {
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec2 resolution;
                uniform float time;
                
                void main() {
                    // Normalized pixel coordinates (from 0 to 1)
                    vec2 uv = gl_FragCoord.xy / resolution.xy;
                    
                    // Center the coordinates (from -0.5 to 0.5)
                    vec2 center = uv - 0.5;
                    
                    // Calculate distance from center
                    float dist = length(center);
                    
                    // Extreme lens distortion
                    float strength = 5.0 + 3.0 * sin(time * 0.9); // Pulsating effect
                    float distortion = 9.0 + strength * dist * dist;
                    
                    // Apply distortion
                    vec2 distortedUV = center * distortion + 0.5;
                    
                    // Create a wavy, rippling effect
                    distortedUV.x += 0.02 * sin(distortedUV.y * 20.0 + time);
                    distortedUV.y += 0.02 * sin(distortedUV.x * 20.0 + time * 0.7);
                    
                    // Create color based on distortion
                    vec3 color = vec3(0.9);
                    
                    // Add a semi-transparent effect
                    float alpha = 0.7 + 0.3 * sin(dist * 10.0 - time);
                    
                    // Output color
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true
        });
        
        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            material.uniforms.resolution.value.set(width, height);
        });
    }
    
    // Animation function
    function animate() {
        material.uniforms.time.value += 0.01; //speed of the effect
        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
    }
    
    // Open menu function
    function openMenu() {
        overlay.classList.add('active');
        mobileMenu.style.opacity = '1';
        mobileMenu.style.visibility = 'visible';
        menuButton.textContent = "close";
        document.body.classList.add('menu-open');
        
        // Show hint after 1.25 seconds
        setTimeout(() => {
            hintText.classList.add('visible');
        }, 1250); // 1.25 seconds
        
        // Initialize and start Three.js effect
        if (!renderer) {
            initThree();
        }
        threeContainer.style.opacity = '1';
        animate();
    }
    
    // Close menu function
    function closeMenu() {
        mobileMenu.style.opacity = '0';
        mobileMenu.style.visibility = 'hidden';
        menuButton.textContent = "menu"; // Change text back to "menu"
        document.body.classList.remove('menu-open'); // Allow scrolling again
        
        // Hide hint immediately
        hintText.classList.remove('visible');
        
        // Stop Three.js animation and hide container
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        threeContainer.style.opacity = '0';
        
        // Remove active class after transition ends
        mobileMenu.addEventListener('transitionend', function() {
            overlay.classList.remove('active');
        }, { once: true });
    }
    
    // Toggle menu when button is clicked
    menuButton.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if (menuButton.textContent === "close") {
            closeMenu();
        } else {
            openMenu();
        }
    });
    
    // Close menu when overlay is clicked
    overlay.addEventListener('click', function() {
        closeMenu();
    });
    
    // Close menu when clicking anywhere in the mobile menu EXCEPT the menu items
    mobileMenu.addEventListener('click', function(e) {
        if (e.target === mobileMenu || e.target === hintText) {
            closeMenu();
        }
    });
    
    // Prevent clicks on menu items from closing the menu
    menuList.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Close menu when clicking a menu item
    menuList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });
    
    // Close menu when ESC key is pressed
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });
    
    // Disable the desktop navigation.js script when the mobile menu is active
    function checkAndDisableDesktopNavigation() {
        // Only run this on mobile or when the menu button is visible
        const isMobileMenuVisible = window.getComputedStyle(menuButton).display !== 'none';
        
        if (isMobileMenuVisible) {
            // Remove event listeners from all navigation links to prevent the desktop navigation from handling them
            document.querySelectorAll('a').forEach(link => {
                // Clone the node to remove all event listeners
                const newLink = link.cloneNode(true);
                if (link.parentNode) {
                    link.parentNode.replaceChild(newLink, link);
                }
            });
        }
    }
    
    // Check on load and on resize
    checkAndDisableDesktopNavigation();
    window.addEventListener('resize', checkAndDisableDesktopNavigation);
});
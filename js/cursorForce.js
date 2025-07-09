/**
 * Cursor Force Text Interaction
 * Makes text characters move away from cursor based on proximity and speed
 */

class CursorForce {
    constructor() {
        console.log('CursorForce: Initializing...');
        this.mouse = { x: 0, y: 0, prevX: 0, prevY: 0 };
        this.velocity = { x: 0, y: 0, magnitude: 0 };
        this.characters = [];
        this.isActive = true;
        this.maxForce = 1.2; // 75% of letter height
        this.forceRadius = 80; // pixels - larger radius for wave effects
        this.returnSpeed = 0.1; // speed of return to original position
        this.velocitySmoothing = 0.3;
        this.debug = false; // Enable debug logging
        this.showDebugBorders = false; // Show red borders around characters
        
        // Performance optimizations
        this.lastMouseMove = 0;
        this.idleTimeout = null;
        this.isIdle = false;
        this.frameSkip = 0; // Skip frames when idle
        this.activeCharacters = new Set(); // Track only characters that need updates
        
        // Performance limits
        this.maxCharacters = 3000; // Maximum characters to wrap
        this.maxTextLength = 150; // Maximum text length per element to wrap
        this.spatialGrid = new Map(); // Spatial indexing for performance
        
        this.init();
    }
    
    init() {
        try {
            // Don't run on mobile devices for performance
            if (this.isMobile()) {
                console.log('CursorForce: Disabled on mobile device');
                return;
            }
            
            // Respect user's reduced motion preference
            if (this.prefersReducedMotion()) {
                console.log('CursorForce: Disabled due to reduced motion preference');
                return;
            }
            
            console.log('CursorForce: Starting initialization...');
            this.wrapCharacters();
            this.bindEvents();
            this.animate();
            console.log('CursorForce: Initialization complete');
        } catch (error) {
            console.error('CursorForce: Initialization failed:', error);
        }
    }
    
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth < 768;
    }
    
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    wrapCharacters() {
        console.log('CursorForce: Starting character wrapping...');
        
        // Focused selectors for interactive and important elements only
        const selectors = [
            'h1, h2, h3', // Main headings only
            '.menu a', // Navigation links
            '.footer a', // Footer links
            'header a', // Header links
            '.titel a', // Title links
            '.item.title a', // Event title links
            '.item.artwork a', // Artwork links
            '.read-more-btn', // Read more buttons
            'button', // All buttons
            '.email-link', // Email links
            '.footer-phone', // Phone links
            // Add specific paragraphs with opt-in class
            'p.cursor-effect', // Only paragraphs that explicitly want the effect
            '.cursor-effect' // Generic opt-in class
        ];
        
        let totalWrapped = 0;
        
        selectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                console.log(`CursorForce: Found ${elements.length} elements for selector "${selector}"`);
                
                elements.forEach(element => {
                    if (this.wrapElementCharacters(element)) {
                        totalWrapped++;
                    }
                });
            } catch (error) {
                console.warn(`CursorForce: Error with selector "${selector}":`, error);
            }
        });
        
        console.log(`CursorForce: Successfully wrapped ${totalWrapped} elements with ${this.characters.length} characters`);
        
        // Calculate positions after all wrapping is done
        setTimeout(() => {
            this.updateOriginalPositions();
        }, 100);
    }
    
    wrapElementCharacters(element) {
        // Skip if already wrapped or if element is not suitable
        if (element.dataset.wrapped || !this.shouldWrapElement(element)) {
            return false;
        }
        
        try {
            const text = element.textContent.trim();
            if (!text || text.length < 2) return false; // Skip very short text
            
            // Performance check: Skip if we've hit character limit
            if (this.characters.length >= this.maxCharacters) {
                console.warn('CursorForce: Character limit reached, skipping element');
                return false;
            }
            
            // Performance check: Skip very long individual elements
            if (text.length > this.maxTextLength && !element.classList.contains('force-cursor-effect')) {
                if (this.debug) {
                    console.log(`CursorForce: Skipping long text (${text.length} chars) - add 'force-cursor-effect' class to include`);
                }
                return false;
            }
            
            const fontSize = parseFloat(getComputedStyle(element).fontSize);
            
            // Performance optimization: Skip tiny text
            if (fontSize < 10) return false;
            
            if (this.debug) {
                console.log(`CursorForce: Wrapping "${text.substring(0, 20)}..." (${text.length} chars, ${fontSize}px font)`);
            }
            
            // Create document fragment for better performance
            const fragment = document.createDocumentFragment();
            element.innerHTML = '';
            
            text.split('').forEach((char, index) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.className = 'char-wrapper';
                span.style.cssText = 'position:relative;display:inline-block;transition:none;will-change:transform';
                
                // Store character data with pre-calculated values
                const charData = {
                    element: span,
                    originalX: 0,
                    originalY: 0,
                    currentX: 0,
                    currentY: 0,
                    fontSize: fontSize,
                    maxDisplacement: fontSize * this.maxForce,
                    index: index,
                    isActive: false // Track if character is currently affected
                };
                
                this.characters.push(charData);
                fragment.appendChild(span);
            });
            
            element.appendChild(fragment);
            element.dataset.wrapped = 'true';
            
            return true;
        } catch (error) {
            console.error('CursorForce: Error wrapping element:', error);
            return false;
        }
    }
    
    // Check if element should be wrapped (performance optimization)
    shouldWrapElement(element) {
        // Skip if element is hidden
        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return false;
        }
        
        // Skip if element has child elements (avoid double-wrapping)
        if (element.children.length > 0) {
            return false;
        }
        
        // Skip if element is too small
        const rect = element.getBoundingClientRect();
        if (rect.width < 5 || rect.height < 5) {
            return false;
        }
        
        // Skip date elements to prevent layout issues
        if (element.classList.contains('item') && element.classList.contains('date')) {
            return false;
        }
        
        // Skip date spans specifically
        if (element.tagName === 'SPAN' && element.parentElement && 
            element.parentElement.classList.contains('date')) {
            return false;
        }
        
        return true;
    }
    
    updateOriginalPositions() {
        console.log(`CursorForce: Updating positions for ${this.characters.length} characters`);
        let validPositions = 0;
        
        this.characters.forEach(char => {
            const rect = char.element.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                char.originalX = rect.left + rect.width / 2;
                char.originalY = rect.top + rect.height / 2;
                validPositions++;
            } else {
                console.warn('CursorForce: Character has no dimensions:', char.element.textContent);
            }
        });
        
        console.log(`CursorForce: Position update complete - ${validPositions}/${this.characters.length} valid positions`);
    }
    
    bindEvents() {
        console.log('CursorForce: Binding events...');
        
        document.addEventListener('mousemove', (e) => {
            this.updateMouse(e.clientX, e.clientY);
        });
        
        document.addEventListener('mouseenter', () => {
            this.isActive = true;
            if (this.debug) console.log('CursorForce: Mouse entered, activated');
        });
        
        document.addEventListener('mouseleave', () => {
            this.isActive = false;
            this.returnAllCharacters();
            if (this.debug) console.log('CursorForce: Mouse left, deactivated');
        });
        
        // Update positions on scroll and resize
        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => this.updateOriginalPositions());
        });
        
        window.addEventListener('resize', () => {
            requestAnimationFrame(() => this.updateOriginalPositions());
        });
        
        console.log('CursorForce: Events bound successfully');
    }
    
    updateMouse(x, y) {
        this.mouse.prevX = this.mouse.x;
        this.mouse.prevY = this.mouse.y;
        this.mouse.x = x;
        this.mouse.y = y;
        
        // Calculate velocity with smoothing
        const rawVelX = this.mouse.x - this.mouse.prevX;
        const rawVelY = this.mouse.y - this.mouse.prevY;
        
        this.velocity.x = this.velocity.x * (1 - this.velocitySmoothing) + rawVelX * this.velocitySmoothing;
        this.velocity.y = this.velocity.y * (1 - this.velocitySmoothing) + rawVelY * this.velocitySmoothing;
        this.velocity.magnitude = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        
        // Performance optimization: Reset idle state when mouse moves
        this.lastMouseMove = Date.now();
        if (this.isIdle) {
            this.isIdle = false;
            if (this.debug) console.log('CursorForce: Resumed from idle');
        }
        
        // Clear idle timeout and set new one
        clearTimeout(this.idleTimeout);
        this.idleTimeout = setTimeout(() => {
            this.isIdle = true;
            if (this.debug) console.log('CursorForce: Entering idle mode');
        }, 500); // Go idle after 500ms of no movement
        
        // Log mouse data occasionally for debugging
        if (this.debug && Math.random() < 0.001) {
            console.log(`CursorForce: Mouse at (${x}, ${y}), velocity: ${this.velocity.magnitude.toFixed(2)}`);
        }
    }
    
    calculateForce(char) {
        if (!this.isActive) return { x: 0, y: 0 };
        
        // Quick distance check first (optimization)
        const dx = char.originalX - this.mouse.x;
        const dy = char.originalY - this.mouse.y;
        const distanceSquared = dx * dx + dy * dy;
        const radiusSquared = this.forceRadius * this.forceRadius;
        
        if (distanceSquared > radiusSquared) {
            char.isActive = false;
            return { x: 0, y: 0 };
        }
        
        char.isActive = true;
        const distance = Math.sqrt(distanceSquared); // Only calculate sqrt when needed
        
        // Optimized force calculation
        const normalizedDistance = Math.max(distance / this.forceRadius, 0.1);
        const distanceForce = (1 - normalizedDistance) * (1 - normalizedDistance); // Avoid Math.pow
        
        // Simplified speed calculation
        const speedMultiplier = Math.min(this.velocity.magnitude * 0.2, 2);
        const baseIntensity = distanceForce * (0.5 + speedMultiplier);
        
        // Optimized wave calculations with cached time
        const time = Date.now() * 0.002;
        const waveFreq = distance * 0.1;
        
        // Simplified wave pattern (less CPU intensive)
        const wave1 = Math.sin(time + waveFreq) * baseIntensity;
        const wave2 = Math.cos(time + waveFreq * 1.5) * baseIntensity * 0.4;
        
        // Directional flow (simplified)
        let flowX = 0, flowY = 0;
        if (this.velocity.magnitude > 0.1) {
            const velNorm = this.velocity.magnitude;
            flowX = (this.velocity.x / velNorm) * baseIntensity * 0.5;
            flowY = (this.velocity.y / velNorm) * baseIntensity * 0.5;
        }
        
        // Combined forces
        let forceX = flowX + wave2;
        let forceY = wave1 + flowY;
        
        // Fast constraint without Math.max/min
        const maxDisp = char.maxDisplacement * 2;
        forceX = forceX > maxDisp ? maxDisp : (forceX < -maxDisp ? -maxDisp : forceX);
        forceY = forceY > maxDisp ? maxDisp : (forceY < -maxDisp ? -maxDisp : forceY);
        
        return { x: forceX, y: forceY };
    }
    
    updateCharacters() {
        // Performance optimization: Skip frames when idle
        if (this.isIdle) {
            this.frameSkip++;
            if (this.frameSkip < 5) return; // Skip 4 out of 5 frames when idle
            this.frameSkip = 0;
        }
        
        let appliedForces = 0;
        const checkRadius = this.forceRadius * 1.5; // Slightly larger than force radius
        
        // Performance optimization: Only check characters near cursor
        for (let i = 0; i < this.characters.length; i++) {
            const char = this.characters[i];
            
            // Skip if no valid position
            if (!char.originalX || !char.originalY) continue;
            
            // Quick bounds check before expensive calculations
            const dx = Math.abs(char.originalX - this.mouse.x);
            const dy = Math.abs(char.originalY - this.mouse.y);
            
            // Skip if character is far from cursor and not moving
            if (dx > checkRadius && dy > checkRadius && 
                Math.abs(char.currentX) < 0.1 && Math.abs(char.currentY) < 0.1) {
                continue;
            }
            
            const force = this.calculateForce(char);
            
            // Only update if force is significant or character is returning to position
            const hasForce = Math.abs(force.x) > 0.1 || Math.abs(force.y) > 0.1;
            const isReturning = Math.abs(char.currentX) > 0.1 || Math.abs(char.currentY) > 0.1;
            
            if (hasForce || isReturning) {
                if (hasForce) {
                    char.currentX = force.x;
                    char.currentY = force.y;
                    appliedForces++;
                } else {
                    // Smooth return to original position
                    char.currentX *= (1 - this.returnSpeed);
                    char.currentY *= (1 - this.returnSpeed);
                }
                
                // Apply transform only when needed - use 3D for GPU acceleration
                const transform = `translate3d(${char.currentX.toFixed(1)}px, ${char.currentY.toFixed(1)}px, 0)`;
                char.element.style.transform = transform;
                
                // Debug color (only in debug mode)
                if (this.showDebugBorders && hasForce) {
                    char.element.style.color = 'red';
                } else if (this.showDebugBorders && !hasForce) {
                    char.element.style.color = '';
                }
            }
        }
        
        // Debug log occasionally
        if (this.debug && appliedForces > 0 && Math.random() < 0.01) {
            console.log(`CursorForce: Applied forces to ${appliedForces} characters`);
        }
    }
    
    returnAllCharacters() {
        this.characters.forEach(char => {
            char.element.style.transform = 'translate(0px, 0px)';
            char.currentX = 0;
            char.currentY = 0;
        });
    }
    
    animate() {
        this.updateCharacters();
        requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        this.isActive = false;
        this.returnAllCharacters();
        // Remove event listeners if needed
    }
    
    // Toggle debug mode (borders and logging)
    toggleDebug() {
        this.debug = !this.debug;
        this.showDebugBorders = !this.showDebugBorders;
        
        console.log(`CursorForce: Debug mode ${this.debug ? 'ON' : 'OFF'}`);
        console.log(`CursorForce: Debug borders ${this.showDebugBorders ? 'ON' : 'OFF'}`);
        
        // Apply or remove debug styling
        this.updateDebugStyling();
        
        return { debug: this.debug, borders: this.showDebugBorders };
    }
    
    // Update debug styling on all wrapped characters
    updateDebugStyling() {
        this.characters.forEach(char => {
            if (this.showDebugBorders) {
                char.element.style.border = '1px solid red';
                char.element.style.background = 'rgba(255, 0, 0, 0.1)';
                char.element.style.margin = '1px';
            } else {
                char.element.style.border = '';
                char.element.style.background = '';
                char.element.style.margin = '';
            }
        });
        
        // Also update body class for CSS targeting
        if (this.showDebugBorders) {
            document.body.classList.add('cursor-force-debug');
        } else {
            document.body.classList.remove('cursor-force-debug');
        }
    }
    
    // Test function to manually trigger effects
    test() {
        console.log('CursorForce: Running test...');
        console.log(`Characters: ${this.characters.length}`);
        
        if (this.characters.length === 0) {
            console.log('No characters found - re-running wrap');
            this.wrapCharacters();
            return;
        }
        
        // Test position calculation
        this.updateOriginalPositions();
        
        // Test force on first character
        if (this.characters[0]) {
            const testChar = this.characters[0];
            console.log(`Test character position: (${testChar.originalX}, ${testChar.originalY})`);
            
            // Manually apply a test transform
            testChar.element.style.transform = 'translate(20px, 10px)';
            testChar.element.style.color = 'inherit';
            
            setTimeout(() => {
                testChar.element.style.transform = 'translate(0px, 0px)';
                testChar.element.style.color = '';
            }, 2000);
        }
    }
}

// Initialize cursor force effect when DOM is ready
console.log('CursorForce: Script loaded, waiting for DOM...');

function initCursorForce() {
    console.log('CursorForce: DOM ready, initializing...');
    try {
        window.cursorForce = new CursorForce();
        
        // Expose functions globally for debugging
        window.testCursorForce = () => window.cursorForce.test();
        window.toggleDebug = () => window.cursorForce.toggleDebug();
        
        console.log('CursorForce: Use window.testCursorForce() to run manual test');
        console.log('CursorForce: Use window.toggleDebug() to toggle debug borders');
    } catch (error) {
        console.error('CursorForce: Failed to initialize:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCursorForce);
} else {
    // DOM already loaded
    initCursorForce();
}
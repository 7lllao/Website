document.addEventListener('DOMContentLoaded', function() {
    // Get the menu and all menu items
    const menu = document.querySelector('.menu');
    const menuItems = menu.querySelectorAll('span a');
    
    // Define breakpoints for each transformation (in pixels)
    const breakpoints = [
        { width: 880, items: [false, false, false, false] }, // Full text for all
        { width: 780, items: [false, false, true, false] },  // "Works" becomes "W"
        { width: 720, items: [false, true, true, false] },   // "Exhibitions" becomes "E"
        { width: 660, items: [true, true, true, false] },    // "About" becomes "A"
        { width: 600, items: [true, true, true, true] }      // "Contact" becomes "C"
    ];
    
    // Function to update menu based on window width
    function updateMenu() {
        const windowWidth = window.innerWidth;
        
        // Find the appropriate breakpoint
        let activeBreakpoint = breakpoints[0]; // Default to full text
        
        for (let i = 0; i < breakpoints.length; i++) {
            if (windowWidth <= breakpoints[i].width) {
                activeBreakpoint = breakpoints[i];
            } else {
                break;
            }
        }
        
        // Apply the changes to each menu item
        menuItems.forEach((item, index) => {
            const shouldShowInitial = activeBreakpoint.items[index];
            item.setAttribute('data-showing-initial', shouldShowInitial);
        });
        
        // Menu gap now handled by CSS clamp() for smooth responsive scaling
    }
    
    // Initial update
    updateMenu();
    
    // Update on window resize with debounce for better performance
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateMenu, 20);
    });
});
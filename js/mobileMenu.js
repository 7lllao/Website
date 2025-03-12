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
    
    // Create menu list
    const menuList = document.createElement('ul');
    menuList.classList.add('mobile-menu-list');
    
    // Menu items
    const menuItems = [
        { text: 'About', href: 'about.html' },
        { text: 'Exhibitions', href: 'exhibitions.html' },
        { text: 'Works', href: 'work.html' },
        { text: 'Contact', href: 'contact.html' }
    ];
    
    // Create list items
    menuItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.text;
        li.appendChild(a);
        menuList.appendChild(li);
    });
    
    // Create a hint text element
    const hintText = document.createElement('div');
    hintText.classList.add('menu-hint');
    hintText.textContent = "tap anywhere to close";
    
    // Assemble the menu
    mobileMenu.appendChild(menuList);
    mobileMenu.appendChild(hintText);
    
    // Add elements to the DOM - IMPORTANT: Append button to body, not header
    document.body.appendChild(menuButton);
    document.body.appendChild(overlay);
    document.body.appendChild(mobileMenu);
    
    // Position the menu button to match where it would be in the header
    function positionMenuButton() {
        const headerRect = header.getBoundingClientRect();
        menuButton.style.position = 'fixed';
        menuButton.style.top = (headerRect.top + headerRect.height/2) + 'px';
        menuButton.style.right = '1.5em';
        menuButton.style.transform = 'translateY(-50%)';
    }
    
    // Position initially and on scroll/resize
    positionMenuButton();
    window.addEventListener('scroll', positionMenuButton);
    window.addEventListener('resize', positionMenuButton);
    
    // Open menu function
    function openMenu() {
        overlay.classList.add('active');
        mobileMenu.classList.add('active');
        menuButton.classList.add('active');
        menuButton.textContent = "close"; // Change text to "close"
        document.body.classList.add('menu-open'); // Prevent scrolling
        
        // Show hint with a slight delay
        setTimeout(() => {
            hintText.classList.add('visible');
        }, 1000); // Show after 1 second
    }
    
    // Close menu function
    function closeMenu() {
        overlay.classList.remove('active');
        mobileMenu.classList.remove('active');
        menuButton.classList.remove('active');
        menuButton.textContent = "menu"; // Change text back to "menu"
        document.body.classList.remove('menu-open'); // Allow scrolling again
        
        // Hide hint immediately
        hintText.classList.remove('visible');
    }
    
    // Toggle menu when button is clicked
    menuButton.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if (menuButton.classList.contains('active')) {
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
        // Only close if the click was directly on the mobile menu container
        // and not on a child element (like menu items)
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
}); 
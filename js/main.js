window.addEventListener('load', function() {
    document.getElementById('loader').classList.add('loaded');
});

// Get the button and text element
var deButton = document.querySelector(".hamburger-menu");
var menuText = document.getElementById("menu-text");

// Get the navigation container
var deNav = document.querySelector("header nav div");

// Add visible class when page loads for desktop
window.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth >= 440) {
        deNav.classList.add('visible');
    }
});

// Toggle menu, update tekst en verander tekstkleur
deButton.addEventListener("click", function () {
    if (window.innerWidth >= 440) {
        // Gebruik een fade-out als het menu wordt gesloten
        if (deNav.classList.contains("visible")) {
            deNav.classList.add("hiding");

            setTimeout(function () {
                deNav.classList.remove("visible", "hiding");
            }, 300); // Wacht op de 0.3s transitie
        } else {
            deNav.classList.add("visible");
        }
    } else {
        // Normaal togglen zonder fade voor kleinere schermen
        deNav.classList.toggle("toonMenu");
        deNav.classList.toggle("visible");
    }

    // Verander button tekst en kleur
    if (deNav.classList.contains("visible")) {
        menuText.textContent = "close";
        menuText.style.color = "white";
    } else {
        menuText.textContent = "menu";
        menuText.style.color = "black";
    }
});

// JavaScript Document
// Navigatie hamburger menu open en dicht
// de button element wordt gedeclareerd
var deButton = document.querySelector(".hamburger-menu");
//de functie toggleMenu wordt aangeroepen door een klik op de gedeclareerde button
deButton.addEventListener("click", toggleMenu);
//de functie toggleMenu wordt hiermee beschreven
function toggleMenu(event) {
  //het veranderende element wordt hier gedeclareerd
  deNav = document.querySelector("header nav div");
  // hiermee krijgt de de functie een toggle optie om de class aan en uit te zetten
  deNav.classList.toggle("toonMenu");
}
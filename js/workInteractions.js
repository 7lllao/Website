function scrollToDescription() {
    const descriptionElement = document.getElementById('work-description');
    if (descriptionElement) {
        descriptionElement.scrollIntoView({ behavior: 'smooth' });
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const footerContainer = document.querySelector('.footer_container');
    if (footerContainer) {
        // Get the last modified date of the document
        const lastModDate = new Date(document.lastModified);
        
        // Format the date as day-month-year
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = lastModDate.toLocaleDateString('en-GB', options);
        
        // Create the last updated element
        const lastUpdatedElement = document.createElement('div');
        lastUpdatedElement.id = 'last-updated';
        lastUpdatedElement.textContent = `Last updated: ${formattedDate}`;
        
        // Add it to the footer container
        footerContainer.appendChild(lastUpdatedElement);
    }
}); 
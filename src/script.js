document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pageContents = document.querySelectorAll('.page-content');
    
    // Function to show a specific page
    function showPage(pageId) {
        // Hide all pages
        pageContents.forEach(page => {
            page.classList.remove('active');
        });
        
        // Show the target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }
    
    // Function to update active navigation link
    function updateActiveNav(activeLink) {
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active navigation
            updateActiveNav(this);
            
            // Show the corresponding page
            showPage(targetId);
            
            // Update URL hash without scrolling
            history.pushState(null, null, '#' + targetId);
        });
    });

    const socialButtons = document.querySelectorAll('.social-btn');
    
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Social link clicked:', this.textContent);
        });
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1) || 'home';
        showPage(hash);
        
        // Update active navigation
        const activeLink = document.querySelector(`[href="#${hash}"]`);
        if (activeLink) {
            updateActiveNav(activeLink);
        }
    });
    
    // Set initial page based on URL hash or default to home
    const initialHash = window.location.hash.substring(1) || 'home';
    showPage(initialHash);
    
    // Set initial active navigation
    const initialLink = document.querySelector(`[href="#${initialHash}"]`);
    if (initialLink) {
        updateActiveNav(initialLink);
    }
}); 
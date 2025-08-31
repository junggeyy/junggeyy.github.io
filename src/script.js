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
    
    // Handle collapsible entry boxes
    const entryBoxes = document.querySelectorAll('.entry-box');
    
    entryBoxes.forEach(box => {
        box.addEventListener('click', function(e) {
            // Don't toggle if clicking on a link inside the box
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return;
            }
            
            // Don't toggle if clicking on research tabs
            if (e.target.classList.contains('research-tab')) {
                return;
            }
            

            
            // Toggle the expanded class
            this.classList.toggle('expanded');
        });
    });
    

    
    // Handle research tab switching
    const researchTabs = document.querySelectorAll('.research-tab');
    
    researchTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent box toggle
            
            const targetId = this.getAttribute('data-tab');
            const box = this.closest('.entry-box');
            
            // Remove active class from all tabs in this box
            box.querySelectorAll('.research-tab').forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all content in this box
            box.querySelectorAll('.research-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show target content
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
    
}); 
// Navigation Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Page Transition Fade-In
  setTimeout(() => {
    document.body.classList.add('page-loaded');
  }, 10);

  // Auto Scroll to Top on Page Load (Native Behavior augmentation)
  window.scrollTo(0, 0);

  // Highlight Active Nav Item Based on URL Path instead of Scroll
  const navItems = document.querySelectorAll('.nav-item');
  const path = window.location.pathname.split('/').pop() || 'index.html';
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === path || 
       (path === '' && item.getAttribute('href') === 'index.html')) {
      item.classList.add('active');
    }
  });

  // Page Transition Fade-Out on Link Click
  const links = document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"])');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetUrl = link.getAttribute('href');
      
      // Ignore javascript actions
      if (!targetUrl || targetUrl.startsWith('javascript:')) return;
      
      e.preventDefault();
      
      // Trigger fade out
      document.body.classList.remove('page-loaded');
      
      // Navigate after transition duration (400ms)
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 400); 
    });
  });
});

// Scroll Animation for Fade-up Elements
const fadeUpElements = document.querySelectorAll('.fade-up-element');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

fadeUpElements.forEach(element => {
  observer.observe(element);
});

// Navbar Background Change on Scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  const currentPath = window.location.pathname.split('/').pop();
  const isHome = (currentPath === '' || currentPath === 'index.html');
  
  // On inner pages, navbar is always white. On home, it transitions.
  if (!isHome || window.scrollY > 50) {
    navbar.style.backgroundColor = '#ffffff';
    navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
  } else {
    navbar.style.backgroundColor = 'transparent';
    navbar.style.boxShadow = 'none';
  }
});

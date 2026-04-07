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
const checkNavbarScroll = () => {
  const currentPath = window.location.pathname.split('/').pop();
  const isHome = (currentPath === '' || currentPath === 'index.html');
  
  if (!isHome || window.scrollY > 30) {
    navbar.classList.add('nav-scrolled');
  } else {
    navbar.classList.remove('nav-scrolled');
  }
};
window.addEventListener('scroll', checkNavbarScroll);
checkNavbarScroll(); // check on load


// Search Overlay Logic dynamically bound
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');

    if (searchBtn && searchOverlay) {
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchOverlay.classList.toggle('active');
            if (searchOverlay.classList.contains('active')) {
                setTimeout(() => { searchInput.focus(); }, 200);
            }
        });
        
        document.addEventListener('click', (e) => {
            if (searchOverlay.classList.contains('active') && !searchOverlay.contains(e.target) && e.target !== searchBtn && !searchBtn.contains(e.target)) {
                searchOverlay.classList.remove('active');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                searchOverlay.classList.remove('active');
            }
        });
    }
});


// -----------------------------------------------------
// 🚀 WordPress CMS Core Fetch API Integration (Vercel Proxy Ready)
// -----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const newsList = document.getElementById('dynamic-news-list');
    if (newsList) {
        // Detect if running locally or on Vercel
        const isLocal = window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const apiBase = isLocal ? 'http://39.98.79.172/wp-json' : '/cms-api';
        
        fetch(`${apiBase}/wp/v2/posts?_embed`)
            .then(res => {
                if (!res.ok) throw new Error('API Unreachable');
                return res.json();
            })
            .then(posts => {
                if (!posts || posts.length === 0) {
                    newsList.innerHTML = '<div style="text-align:center; padding: 80px; color:#888;">目前数据库中没有上传文章，快去您的 WordPress 后台发一篇试试吧！</div>';
                    return;
                }
                
                newsList.innerHTML = ''; 
                
                posts.forEach((post, index) => {
                    let coverUrl = '';
                    if (post._embedded && post._embedded['wp:featuredmedia']) {
                        let originalUrl = post._embedded['wp:featuredmedia'][0].source_url;
                        // Vercel HTTPS proxy replacement for images to prevent Mixed Content security blocking
                        coverUrl = isLocal ? originalUrl : originalUrl.replace('http://39.98.79.172/wp-content/uploads/', '/cms-media/');
                    }
                    
                    const coverHtml = coverUrl ? 
                        '<img src="' + coverUrl + '" style="width:100%; height:100%; object-fit:cover; transition: transform 0.6s ease;">' : 
                        '<div class="news-img-placeholder"></div>';
                    
                    const dateObj = new Date(post.date);
                    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                    const delay = index * 0.15;
                    
                    const titleText = post.title.rendered;
                    let descText = post.excerpt.rendered.replace(/<[^>]+>/g, '').trim(); 
                    
                    const itemHtml = `<div class="news-item fade-up-element visible" style="transition-delay: ${delay}s; opacity: 1; transform: translateY(0); display: flex;">
                        <style>
                            .news-item:hover img { transform: scale(1.08) !important; }
                            .news-item .news-img-wrapper { overflow: hidden; }
                        </style>
                        <div class="news-img-wrapper">
                            ${coverHtml}
                        </div>
                        <div class="news-content">
                            <span class="news-date">${formattedDate}</span>
                            <h3 class="news-title">${titleText || 'Untitled'}</h3>
                            <p class="news-desc">${descText}</p>
                        </div>
                    </div>`;
                    
                    newsList.innerHTML += itemHtml;
                });
            })
            .catch(error => {
                console.error("WordPress fetch offline:", error);
                newsList.innerHTML = '<div style="text-align:center; padding: 80px; color:#A68952; border: 1px dashed #A68952; border-radius: 8px;">📡 连接到重型数据中台 (WordPress) 失败。<br><br>请确保您的阿里云服务器状态正常！</div>';
            });
    }
});

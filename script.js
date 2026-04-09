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
                const teamKeywords = ['pi', '教授', '负责人', '特岗', 'postdoc', '博士后', 'phd', '博士', '博士生', 'master', '硕士', '硕士生', 'alumni', '校友', '毕业'];
                const pubKeywords = ['publication', '论文', '学术文章', '科研成果', '专利', 'paper'];
                
                const newsPosts = posts ? posts.filter(post => {
                    if (post._embedded && post._embedded['wp:term']) {
                        const categories = post._embedded['wp:term'][0] || [];
                        const allFilterKeywords = [...teamKeywords, ...pubKeywords];
                        return !categories.some(cat => {
                            const catName = cat.name.toLowerCase();
                            return allFilterKeywords.some(kw => catName.includes(kw));
                        });
                    }
                    return true;
                }) : [];

                if (newsPosts.length === 0) {
                    newsList.innerHTML = '<div style="text-align:center; padding: 80px; color:#888;">目前数据库中没有上传文章，快去您的 WordPress 后台发一篇试试吧！</div>';
                    return;
                }
                
                newsList.innerHTML = ''; 
                
                newsPosts.forEach((post, index) => {
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



// -----------------------------------------------------
// 🚀 WordPress CMS Core Fetch API Integration (TEAM MEMBERS & DETAIL)
// -----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const isLocal = window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiBase = isLocal ? 'http://39.98.79.172/wp-json' : '/cms-api';

    // 1. Logic for team.html (Grid view)
    const teamContainer = document.getElementById('dynamic-team-container');
    if (teamContainer) {
        fetch(`${apiBase}/wp/v2/posts?per_page=100&_embed`)
            .then(res => res.json())
            .then(posts => {
                if (!posts || posts.length === 0) return;
                
                const groups = [
                    { id: 'pi', title: '负责人 / 教授', keywords: ['pi', '教授', '负责人', '特岗'], posts: [] },
                    { id: 'postdoc', title: '博士后研究员', keywords: ['postdoc', '博士后'], posts: [] },
                    { id: 'phd', title: '博士研究生', keywords: ['phd', '博士', '博士生'], posts: [] },
                    { id: 'master', title: '硕士研究生', keywords: ['master', '硕士', '硕士生'], posts: [] },
                    { id: 'alumni', title: '毕业校友', keywords: ['alumni', '校友', '毕业'], posts: [] }
                ];
                
                let hasTeamMembers = false;
                posts.forEach(post => {
                    if (post._embedded && post._embedded['wp:term']) {
                        const categories = post._embedded['wp:term'][0] || [];
                        categories.forEach(cat => {
                            const catName = cat.name.toLowerCase();
                            groups.forEach(group => {
                                if (group.keywords.some(kw => catName.includes(kw))) {
                                    post.matchedRole = group.title;
                                    group.posts.push(post);
                                    hasTeamMembers = true;
                                }
                            });
                        });
                    }
                });
                
                if (!hasTeamMembers) {
                    teamContainer.innerHTML = '<div style="text-align:center; padding: 80px; color:#888;">数据库中未检测到团队成员分组。</div>';
                    return;
                }
                
                teamContainer.innerHTML = '';
                groups.forEach((group, gIndex) => {
                    if (group.posts.length === 0) return;
                    let html = `
                        <div class="team-category fade-up-element visible" style="transition-delay: ${gIndex * 0.1}s; opacity: 1; transform: none;">
                            <h3 class="team-category-title">${group.title}</h3>
                            <div class="team-grid ${group.id === 'pi' ? 'pi-grid' : ''}">
                    `;
                    
                    group.posts.forEach((member) => {
                        let avatarUrl = '';
                        if (member._embedded && member._embedded['wp:featuredmedia']) {
                            let originalUrl = member._embedded['wp:featuredmedia'][0].source_url;
                            avatarUrl = isLocal ? originalUrl : originalUrl.replace('http://39.98.79.172/wp-content/uploads/', '/cms-media/');
                        }
                        const avatarHtml = avatarUrl ? 
                            `<div class="member-placeholder" style="background-image: url('${avatarUrl}'); background-size: cover; background-position: center top; transition: transform 0.4s;"></div>` : 
                            '<div class="member-placeholder" style="background: #2a2a2a; display:flex; align-items:center; justify-content:center; color:#666;">No Photo</div>';
                        
                        // Parse WP Excerpt by splitting newlines to extract lines
                        // Convention: line 1 = Direction, line 2 = Contact
                        let rawText = member.excerpt.rendered.replace(/<[^>]+>/g, '').trim();
                        let lines = rawText.split(/[\n\r]+/).map(r => r.trim()).filter(r => r !== '');
                        let direction = lines[0] || '暂无研究方向';
                        
                        html += `
                            <div class="team-card dynamic-team-card thfl-card" onclick="window.location.href='member_detail.html?id=${member.id}'">
                                <div class="member-img-wrapper thfl-img">
                                    ${avatarHtml}
                                </div>
                                <div class="member-info thfl-info">
                                    <h4 class="member-name thfl-name">${member.title.rendered}</h4>
                                    <p class="member-role thfl-role">${member.matchedRole}</p>
                                    <p class="member-direction thfl-direction">${direction}</p>
                                </div>
                            </div>
                        `;
                    });
                    
                    html += '</div></div>';
                    teamContainer.innerHTML += html;
                });
            })
            .catch(err => { console.error(err); });
    }

    // 2. Logic for member_detail.html (Detail View)
    const detailContainer = document.getElementById('dynamic-detail-container');
    if (detailContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const memberId = urlParams.get('id');
        
        if (!memberId) {
            document.getElementById('loading-spinner').innerHTML = '缺少成员 ID，无法加载资料。';
            return;
        }

        fetch(`${apiBase}/wp/v2/posts/${memberId}?_embed`)
            .then(res => {
                if(!res.ok) throw new Error('Not found');
                return res.json();
            })
            .then(member => {
                document.getElementById('loading-spinner').style.display = 'none';
                detailContainer.style.display = 'flex';
                
                // Determine Role
                let role = "前沿探索者";
                if (member._embedded && member._embedded['wp:term']) {
                    const cats = member._embedded['wp:term'][0];
                    if (cats && cats.length > 0) role = cats.map(c=>c.name).join(' / ');
                }
                
                // Determine Avatar
                let avatarUrl = '';
                if (member._embedded && member._embedded['wp:featuredmedia']) {
                    let originalUrl = member._embedded['wp:featuredmedia'][0].source_url;
                    avatarUrl = isLocal ? originalUrl : originalUrl.replace('http://39.98.79.172/wp-content/uploads/', '/cms-media/');
                }
                
                // Parse Excerpt lines for Direction and Contact
                let rawText = member.excerpt.rendered.replace(/<[^>]+>/g, '').trim();
                let lines = rawText.split(/[\n\r]+/).map(r => r.trim()).filter(r => r !== '');
                let direction = lines[0] || '暂无数据';
                let contact = lines[1] || '邮箱未公开';
                
                // Fill DOM
                if(avatarUrl) {
                    document.getElementById('member-avatar').innerHTML = `<img src="${avatarUrl}" alt="Profile">`;
                }
                document.getElementById('member-name').textContent = member.title.rendered;
                document.getElementById('member-role').textContent = role;
                document.getElementById('member-direction').textContent = direction;
                document.getElementById('member-contact').textContent = contact;
                
                let contentHTML = member.content.rendered.trim();
                document.getElementById('member-content').innerHTML = contentHTML || '<h2 style="margin-top:0;">个人履历</h2><p>该老师/同学很低调，暂且没有录入详细的个人成果和简介。</p>';
            })
            .catch(err => {
                document.getElementById('loading-spinner').innerHTML = '成员档案拉取失败或查无此人。';
            });
    }
});


// -----------------------------------------------------
// WordPress CMS: PUBLICATIONS LIST + DETAIL
// -----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const isLocal = window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiBase = isLocal ? 'http://39.98.79.172/wp-json' : '/cms-api';
    const pubKeywords = ['publication', '论文', '学术文章', '科研成果', '专利', 'paper'];

    // 1. Publications List Page (publications.html)
    const pubListContainer = document.getElementById('dynamic-pub-list');
    const pubFiltersContainer = document.getElementById('dynamic-pub-filters');
    if (pubListContainer) {
        fetch(`${apiBase}/wp/v2/posts?per_page=100&_embed`)
            .then(res => res.json())
            .then(posts => {
                if (!posts || posts.length === 0) {
                    pubListContainer.innerHTML = '<div style="text-align:center; padding: 80px; color:#888;">数据库中暂无科研成果记录。</div>';
                    return;
                }

                // Filter only posts with publication categories
                const pubPosts = posts.filter(post => {
                    if (post._embedded && post._embedded['wp:term']) {
                        const categories = post._embedded['wp:term'][0] || [];
                        return categories.some(cat => {
                            const catName = cat.name.toLowerCase();
                            return pubKeywords.some(kw => catName.includes(kw));
                        });
                    }
                    return false;
                });

                if (pubPosts.length === 0) {
                    pubListContainer.innerHTML = '<div style="text-align:center; padding: 80px; color:#888;">数据库中暂无科研成果记录。<br><br>请在 WordPress 后台发布文章，并将分类设为"论文"或"学术文章"。</div>';
                    return;
                }

                // ---- Render function ----
                function renderPubList(filteredPosts) {
                    pubListContainer.innerHTML = '';
                    if (filteredPosts.length === 0) {
                        pubListContainer.innerHTML = '<div style="text-align:center; padding: 60px; color:#888;">该分类下暂无论文。</div>';
                        return;
                    }
                    filteredPosts.forEach((post, index) => {
                        const titleText = post.title.rendered;
                        let citationText = post.excerpt.rendered.replace(/<[^>]+>/g, '').trim();
                        // Get category tags for display
                        let catTags = '';
                        if (post._embedded && post._embedded['wp:term']) {
                            const cats = post._embedded['wp:term'][0] || [];
                            catTags = cats
                                .filter(c => !pubKeywords.some(kw => c.name.toLowerCase().includes(kw)) && c.name !== '未分类')
                                .map(c => `<span class="pub-cat-tag">${c.name}</span>`)
                                .join('');
                        }

                        const entryHtml = `<div class="pub-entry fade-up-element visible" style="transition-delay: ${index * 0.05}s; opacity:1; transform:translateY(0);">
                            <h3 class="pub-entry-title" style="cursor:pointer;" onclick="window.location.href='pub_detail.html?id=${post.id}'">${titleText}</h3>
                            <p class="pub-entry-meta">${citationText}</p>
                            <div class="pub-entry-links">
                                <a href="pub_detail.html?id=${post.id}">[摘要]</a>
                                ${catTags}
                            </div>
                        </div>`;
                        pubListContainer.innerHTML += entryHtml;
                    });
                }

                // ---- Build sidebar filters ----
                if (pubFiltersContainer) {
                    // Collect all unique direction categories from the data
                    const directionMap = new Map(); // catId -> catName
                    pubPosts.forEach(post => {
                        if (post._embedded && post._embedded['wp:term']) {
                            const cats = post._embedded['wp:term'][0] || [];
                            cats.forEach(cat => {
                                if (!pubKeywords.some(kw => cat.name.toLowerCase().includes(kw)) && cat.name !== '未分类') {
                                    directionMap.set(cat.id, cat.name);
                                }
                            });
                        }
                    });

                    let filterHTML = '';

                    // "All" button
                    filterHTML += `<div class="sidebar-group">
                        <h5 class="sidebar-label">■ 研究方向</h5>
                        <ul class="sidebar-list">
                            <li><a href="#" class="filter-link active" data-filter="all"><span class="filter-icon active">■</span> 全部 (${pubPosts.length})</a></li>`;
                    
                    directionMap.forEach((name, id) => {
                        const count = pubPosts.filter(p => {
                            const cats = p._embedded?.['wp:term']?.[0] || [];
                            return cats.some(c => c.id === id);
                        }).length;
                        filterHTML += `<li><a href="#" class="filter-link" data-filter="${id}"><span class="filter-icon">□</span> ${name} (${count})</a></li>`;
                    });

                    filterHTML += `</ul></div>`;
                    pubFiltersContainer.innerHTML = filterHTML;

                    // Bind click events
                    pubFiltersContainer.querySelectorAll('.filter-link').forEach(link => {
                        link.addEventListener('click', (e) => {
                            e.preventDefault();
                            // Toggle active state
                            pubFiltersContainer.querySelectorAll('.filter-link').forEach(l => {
                                l.classList.remove('active');
                                l.querySelector('.filter-icon').classList.remove('active');
                                l.querySelector('.filter-icon').textContent = '□';
                            });
                            link.classList.add('active');
                            link.querySelector('.filter-icon').classList.add('active');
                            link.querySelector('.filter-icon').textContent = '■';

                            const filterVal = link.dataset.filter;
                            if (filterVal === 'all') {
                                renderPubList(pubPosts);
                            } else {
                                const catId = parseInt(filterVal);
                                const filtered = pubPosts.filter(p => {
                                    const cats = p._embedded?.['wp:term']?.[0] || [];
                                    return cats.some(c => c.id === catId);
                                });
                                renderPubList(filtered);
                            }
                        });
                    });
                }

                // Initial render
                renderPubList(pubPosts);
            })
            .catch(err => {
                console.error('Publication fetch error:', err);
                pubListContainer.innerHTML = '<div style="text-align:center; padding: 80px; color:#A68952; border: 1px dashed #A68952; border-radius: 8px;">连接到 WordPress 数据中台失败。<br><br>请确保服务器状态正常！</div>';
            });
    }

    // 2. Publication Detail Page (pub_detail.html)
    const pubDetailContainer = document.getElementById('pub-detail-container');
    if (pubDetailContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const pubId = urlParams.get('id');

        if (!pubId) {
            document.getElementById('pub-loading').innerHTML = '缺少论文 ID，无法加载详情。';
            return;
        }

        fetch(`${apiBase}/wp/v2/posts/${pubId}?_embed`)
            .then(res => {
                if (!res.ok) throw new Error('Not found');
                return res.json();
            })
            .then(post => {
                document.getElementById('pub-loading').style.display = 'none';
                pubDetailContainer.style.display = 'block';

                // Title
                document.getElementById('pub-title').textContent = post.title.rendered;

                // Excerpt as citation
                let citationText = post.excerpt.rendered.replace(/<[^>]+>/g, '').trim();
                document.getElementById('pub-authors').textContent = citationText;

                // Category as journal label
                let journalLabel = '学术论文';
                if (post._embedded && post._embedded['wp:term']) {
                    const cats = post._embedded['wp:term'][0];
                    if (cats && cats.length > 0) {
                        journalLabel = cats.map(c => c.name).join(' / ');
                    }
                }
                document.getElementById('pub-journal').textContent = journalLabel;

                // Content = abstract + keywords
                let contentHTML = post.content.rendered.trim();
                document.getElementById('pub-content').innerHTML = contentHTML || '<h2 style="margin-top:0;">摘要</h2><p>暂未录入摘要信息。</p>';
            })
            .catch(err => {
                document.getElementById('pub-loading').innerHTML = '论文详情加载失败或查无此文。';
            });
    }
});

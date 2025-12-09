(function() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scroll animations
  const animated = document.querySelectorAll('.animate-fade-up, .animate-fade-in');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const isFadeUp = el.classList.contains('animate-fade-up');
          el.classList.add('in-view', isFadeUp ? 'fade-up' : 'fade-in');
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    animated.forEach(el => observer.observe(el));
  } else {
    animated.forEach(el => el.classList.add('in-view'));
  }

  // Load products
  async function loadProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = '<p class="muted">Loading accessories...</p>';
    try {
      const res = await fetch('assets/data/products.json');
      if (!res.ok) throw new Error('Network error');
      const items = await res.json();
      if (!Array.isArray(items) || !items.length) {
        grid.innerHTML = '<p class="muted">No accessories available right now.</p>';
        return;
      }
      grid.innerHTML = '';
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card card-soft product-card';
        card.innerHTML = `
          <h3>${item.name}</h3>
          <p class="muted">${item.category} • ${item.device}</p>
          <p class="price">${item.price}</p>
        `;
        grid.appendChild(card);
      });
    } catch (err) {
      grid.innerHTML = '<p class="muted">Could not load accessories. Please try again later.</p>';
      console.error('Product load failed', err);
    }
  }

  loadProducts();

  // Form handling
  function wireForm(selector) {
    const form = document.querySelector(selector);
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      console.log(`${selector} submit`, data);
      form.reset();
    });
  }

  wireForm('#quote-form');
  wireForm('#contact-form');
})();

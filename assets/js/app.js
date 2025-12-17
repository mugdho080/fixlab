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
    const carousel = document.getElementById('products-carousel');
    if (!carousel) return;
    carousel.innerHTML = '<p class="muted" style="padding:16px;">Loading accessories...</p>';
    let items = [];
    try {
      const res = await fetch('assets/data/products.json');
      if (!res.ok) throw new Error('Network error');
      items = await res.json();
    } catch (err) {
      carousel.innerHTML = '<p class="muted" style="padding:16px;">Could not load accessories. Please try again later.</p>';
      console.error('Product load failed', err);
      return;
    }

    if (!Array.isArray(items) || !items.length) {
      carousel.innerHTML = '<p class="muted" style="padding:16px;">No accessories available right now.</p>';
      return;
    }

    carousel.innerHTML = '';
    const track = document.createElement('div');
    track.className = 'carousel-track';
    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    const slideGap = 16;
    items.forEach((item, index) => {
      const slide = document.createElement('div');
      slide.className = 'card card-soft product-card';
      const imgSrc = item.image || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=60';
      slide.innerHTML = `
        <img class="product-thumb" src="${imgSrc}" alt="${item.name || 'Accessory image'}">
        <div>
          <h3>${item.name}</h3>
          <p class="muted">${item.category} • ${item.device}</p>
          <p class="price">${item.price}</p>
        </div>
      `;
      track.appendChild(slide);

      const dot = document.createElement('button');
      dot.type = 'button';
      if (index === 0) dot.classList.add('active');
      dots.appendChild(dot);
    });

    carousel.appendChild(track);
    carousel.parentElement.appendChild(dots);

    const prevBtn = document.querySelector('.products-carousel-wrapper .prev');
    const nextBtn = document.querySelector('.products-carousel-wrapper .next');
    let current = 0;

    function slidesPerView() {
      const width = carousel.clientWidth;
      if (width < 540) return 1;
      if (width < 900) return 2;
      return 3;
    }

    function updateCarousel() {
      const visible = slidesPerView();
      const maxIndex = Math.max(0, items.length - visible);
      current = Math.min(current, maxIndex);
      const slideWidth = track.firstElementChild?.getBoundingClientRect().width || 0;
      const offset = (slideWidth + slideGap) * current;
      track.style.transform = `translateX(-${offset}px)`;
      dots.querySelectorAll('button').forEach((btn, i) => {
        btn.classList.toggle('active', i === current);
      });
    }

    prevBtn?.addEventListener('click', () => {
      current = Math.max(0, current - 1);
      updateCarousel();
    });

    nextBtn?.addEventListener('click', () => {
      const visible = slidesPerView();
      const maxIndex = Math.max(0, items.length - visible);
      current = Math.min(maxIndex, current + 1);
      updateCarousel();
    });

    dots.querySelectorAll('button').forEach((btn, index) => {
      btn.addEventListener('click', () => {
        current = index;
        updateCarousel();
      });
    });

    let autoInterval = setInterval(() => {
      const visible = slidesPerView();
      const maxIndex = Math.max(0, items.length - visible);
      current = current >= maxIndex ? 0 : current + 1;
      updateCarousel();
    }, 4500);

    carousel.addEventListener('mouseenter', () => clearInterval(autoInterval));
    carousel.addEventListener('mouseleave', () => {
      autoInterval = setInterval(() => {
        const visible = slidesPerView();
        const maxIndex = Math.max(0, items.length - visible);
        current = current >= maxIndex ? 0 : current + 1;
        updateCarousel();
      }, 4500);
    });

    window.addEventListener('resize', updateCarousel);
    updateCarousel();
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

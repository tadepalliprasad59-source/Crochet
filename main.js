document.addEventListener('DOMContentLoaded', function() {
  // --- Cart Logic ---
  let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  let cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const cartBadge = document.querySelector('.badge');
  function updateCartCountFromItems() {
    cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
    localStorage.setItem('cartCount', cartCount);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    if (cartBadge) cartBadge.textContent = cartCount;
  }
  updateCartCountFromItems();

  function showAddToCartPopup() {
    let popup = document.createElement('div');
    popup.className = 'add-cart-popup';
    popup.innerHTML = '<span>Added to cart!</span>';
    document.body.appendChild(popup);
    setTimeout(() => {
      popup.classList.add('show');
      setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
      }, 1200);
    }, 10);
  }

  function addProductToCart(btn) {
    const card = btn.closest('.card');
    const title = card.querySelector('h3').textContent;
    const img = card.querySelector('img').getAttribute('src');
    const desc = card.querySelector('p').textContent;
    let found = cartItems.find(item => item.title === title);
    if (found) {
      found.qty += 1;
    } else {
      cartItems.push({ title, img, desc, qty: 1 });
    }
    updateCartCountFromItems();
    cartBadge.classList.add('cart-bounce');
    setTimeout(() => cartBadge.classList.remove('cart-bounce'), 300);
    showAddToCartPopup();
  }

  document.querySelectorAll('.add-cart-btn').forEach((btn) => {
    btn.addEventListener('click', function() {
      addProductToCart(btn);
    });
  });

  // --- Cart Modal ---
  function createCartModal() {
    let modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.innerHTML = `
      <div class="cart-modal-content">
        <span class="cart-modal-close">&times;</span>
        <h2>Your Cart</h2>
        <div class="cart-modal-list"></div>
        <button class="shop-btn cart-modal-close-btn">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  let cartModal = null;
  function showCartModal() {
    if (!cartModal) cartModal = createCartModal();
    const list = cartModal.querySelector('.cart-modal-list');
    let items = JSON.parse(localStorage.getItem('cartItems')) || [];
    if (items.length === 0) {
      list.innerHTML = '<em>Your cart is empty.</em>';
    } else {
      list.innerHTML = items.map((item, idx) => `
        <div class="cart-modal-item">
          <img src="${item.img}" alt="${item.title}">
          <div style="flex:1;">
            <b>${item.title}</b><br>
            <span>${item.desc}</span>
            <div class="cart-qty-row">
              <button class="cart-qty-btn cart-qty-dec" data-idx="${idx}">-</button>
              <span class="cart-qty-num">${item.qty}</span>
              <button class="cart-qty-btn cart-qty-inc" data-idx="${idx}">+</button>
              <button class="cart-remove-btn" data-idx="${idx}" title="Remove">&times;</button>
            </div>
          </div>
        </div>
      `).join('');
    }
    cartModal.style.display = 'flex';

    // Add event listeners for qty and remove
    list.querySelectorAll('.cart-qty-inc').forEach(btn => {
      btn.addEventListener('click', function() {
        let idx = +btn.getAttribute('data-idx');
        cartItems[idx].qty++;
        updateCartCountFromItems();
        showCartModal();
      });
    });
    list.querySelectorAll('.cart-qty-dec').forEach(btn => {
      btn.addEventListener('click', function() {
        let idx = +btn.getAttribute('data-idx');
        if (cartItems[idx].qty > 1) {
          cartItems[idx].qty--;
        } else {
          cartItems.splice(idx, 1);
        }
        updateCartCountFromItems();
        showCartModal();
      });
    });
    list.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        let idx = +btn.getAttribute('data-idx');
        cartItems.splice(idx, 1);
        updateCartCountFromItems();
        showCartModal();
      });
    });
  }

  // Cart icon click
  const cartIcon = document.querySelector('.cart-icon');
  if (cartIcon) {
    cartIcon.addEventListener('click', showCartModal);
  }
  // Modal close
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('cart-modal-close') || e.target.classList.contains('cart-modal-close-btn')) {
      if (cartModal) cartModal.style.display = 'none';
    }
    // Click outside modal content
    if (cartModal && e.target === cartModal) {
      cartModal.style.display = 'none';
    }
  });

  // --- Wishlist Logic ---
  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  const productCards = document.querySelectorAll('.card');
  const wishlistBtns = document.querySelectorAll('.wishlist-btn');
  productCards.forEach((card, idx) => {
    const wishBtn = wishlistBtns[idx];
    wishBtn.classList.toggle('hearted', wishlist.includes(idx));
    wishBtn.addEventListener('click', function() {
      if (!wishlist.includes(idx)) {
        wishlist.push(idx);
        wishBtn.classList.add('hearted');
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
      } else {
        wishlist = wishlist.filter(i => i !== idx);
        wishBtn.classList.remove('hearted');
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
      }
    });
  });

  // --- Apple-style Product Gallery Carousel ---
  const galleryTrack = document.querySelector('.apple-gallery-track');
  const gallerySlides = document.querySelectorAll('.apple-gallery-slide');
  const galleryDots = document.querySelectorAll('.gallery-dots .dot');
  const leftArrow = document.querySelector('.gallery-arrow.left');
  const rightArrow = document.querySelector('.gallery-arrow.right');
  let galleryIndex = 0;

  function showGallerySlide(idx) {
    gallerySlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === idx);
    });
    galleryDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
    });
    galleryIndex = idx;
  }

  if (gallerySlides.length) {
    // Arrow navigation
    if (leftArrow) {
      leftArrow.addEventListener('click', function() {
        let idx = (galleryIndex - 1 + gallerySlides.length) % gallerySlides.length;
        showGallerySlide(idx);
        resetGalleryAutoSlide();
      });
    }
    if (rightArrow) {
      rightArrow.addEventListener('click', function() {
        let idx = (galleryIndex + 1) % gallerySlides.length;
        showGallerySlide(idx);
        resetGalleryAutoSlide();
      });
    }
    // Dot navigation
    galleryDots.forEach((dot, i) => {
      dot.addEventListener('click', function() {
        showGallerySlide(i);
        resetGalleryAutoSlide();
      });
    });
    // Swipe navigation (touch devices)
    let startX = null;
    if (galleryTrack) {
      galleryTrack.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
      });
      galleryTrack.addEventListener('touchend', function(e) {
        if (startX !== null) {
          let endX = e.changedTouches[0].clientX;
          if (endX - startX > 40) {
            let idx = (galleryIndex - 1 + gallerySlides.length) % gallerySlides.length;
            showGallerySlide(idx);
            resetGalleryAutoSlide();
          } else if (startX - endX > 40) {
            let idx = (galleryIndex + 1) % gallerySlides.length;
            showGallerySlide(idx);
            resetGalleryAutoSlide();
          }
        }
        startX = null;
      });
    }
    // Auto-slide every 3 seconds
    let galleryAutoSlide = setInterval(() => {
      let idx = (galleryIndex + 1) % gallerySlides.length;
      showGallerySlide(idx);
    }, 3000);
    function resetGalleryAutoSlide() {
      clearInterval(galleryAutoSlide);
      galleryAutoSlide = setInterval(() => {
        let idx = (galleryIndex + 1) % gallerySlides.length;
        showGallerySlide(idx);
      }, 3000);
    }
    // Initialize
    showGallerySlide(0);
  }

  // --- Highlight current nav link ---
  const navLinks = document.querySelectorAll('.nav-menu a');
  const page = window.location.pathname.split('/').pop().toLowerCase();
  navLinks.forEach(link => {
    const href = link.getAttribute('href').toLowerCase();
    if (page === href || (page === '' && href === 'home.html')) {
      link.classList.add('active');
    }
  });

  // --- Search Bar Autocomplete ---
  const productNames = [
    'Cozy Bag',
    'Amigurumi Teddy',
    'Winter Hat',
    'Crochet Bag',
    'Crochet Blue Bag',
    'Crochet Hand Bag',
    'Crochet Pink Bag',
    'Crochet Rose Bag',
    'Crochet White Bag'
  ];
  const searchBar = document.getElementById('searchBar');
  const searchSuggestions = document.getElementById('searchSuggestions');

  if (searchBar && searchSuggestions) {
    function goToShopForProduct(productName) {
      // Optionally, you could use anchors or query params for deep linking
      window.location.href = 'Shop.html#' + encodeURIComponent(productName.replace(/\s+/g, '-').toLowerCase());
    }
    searchBar.addEventListener('input', function() {
      const val = searchBar.value.trim().toLowerCase();
      if (!val) {
        searchSuggestions.classList.remove('active');
        searchSuggestions.innerHTML = '';
        return;
      }
      const matches = productNames.filter(name => name.toLowerCase().includes(val));
      if (matches.length) {
        searchSuggestions.innerHTML = '<ul>' + matches.map(name => `<li>${name}</li>`).join('') + '</ul>';
        searchSuggestions.classList.add('active');
      } else {
        searchSuggestions.innerHTML = '<ul><li>No results found</li></ul>';
        searchSuggestions.classList.add('active');
      }
    });
    searchSuggestions.addEventListener('mousedown', function(e) {
      if (e.target.tagName === 'LI' && e.target.textContent !== 'No results found') {
        searchBar.value = e.target.textContent;
        searchSuggestions.classList.remove('active');
        searchSuggestions.innerHTML = '';
        goToShopForProduct(e.target.textContent);
      }
    });
    searchBar.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        const val = searchBar.value.trim();
        if (productNames.includes(val)) {
          goToShopForProduct(val);
        }
      }
    });
    const searchIconBtn = document.getElementById('searchIconBtn');
    if (searchIconBtn) {
      searchIconBtn.addEventListener('click', function() {
        const val = searchBar.value.trim();
        if (productNames.includes(val)) {
          goToShopForProduct(val);
        }
      });
    }
    document.addEventListener('click', function(e) {
      if (!searchSuggestions.contains(e.target) && e.target !== searchBar) {
        searchSuggestions.classList.remove('active');
        searchSuggestions.innerHTML = '';
      }
    });
  }
});
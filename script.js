(function () {
  'use strict';


  // Traduções dos nomes e categorias da Fake Store API para português.
  const productTranslations = {
    1: { title: 'Mochila Fjällräven', category: 'Roupas e acessórios', description: 'Mochila compacta para uso diário, ideal para levar seus itens essenciais.' },
    2: { title: 'Camiseta masculina casual premium', category: 'Roupas masculinas', description: 'Camiseta masculina de manga curta, confortável para o dia a dia.' },
    3: { title: 'Jaqueta masculina de algodão', category: 'Roupas masculinas', description: 'Jaqueta casual masculina, ideal para compor diferentes combinações.' },
    4: { title: 'Camiseta masculina slim fit', category: 'Roupas masculinas', description: 'Camiseta masculina com caimento ajustado e estilo casual.' },
    5: { title: 'Pulseira de corrente dourada', category: 'Joias', description: 'Pulseira dourada para complementar seu visual.' },
    6: { title: 'Piercing de argola dourada', category: 'Joias', description: 'Argola dourada com design delicado para compor seu estilo.' },
    7: { title: 'Anel de princesa banhado a ouro', category: 'Joias', description: 'Anel com acabamento dourado e detalhes decorativos.' },
    8: { title: 'Brinco de argola em ouro branco', category: 'Joias', description: 'Brincos de argola com visual elegante para diversas ocasiões.' },
    9: { title: 'Disco rígido externo portátil', category: 'Eletrônicos', description: 'Armazenamento portátil para guardar arquivos e documentos.' },
    10: { title: 'SSD interno de 1 TB', category: 'Eletrônicos', description: 'Unidade de armazenamento de estado sólido para computadores.' },
    11: { title: 'SSD externo portátil SanDisk', category: 'Eletrônicos', description: 'Armazenamento externo compacto para transportar seus arquivos.' },
    12: { title: 'HD externo portátil', category: 'Eletrônicos', description: 'Disco rígido externo para armazenar fotos, vídeos e documentos.' },
    13: { title: 'Monitor curvo de 21,5 polegadas', category: 'Eletrônicos', description: 'Monitor curvo para uso doméstico, trabalho e entretenimento.' },
    14: { title: 'Monitor ultrawide de 49 polegadas', category: 'Eletrônicos', description: 'Monitor ultrawide com ampla área de visualização.' },
    15: { title: 'Jaqueta de moto com proteção', category: 'Roupas masculinas', description: 'Jaqueta para motociclistas com estilo esportivo.' },
    16: { title: 'Jaqueta de chuva para motociclista', category: 'Roupas masculinas', description: 'Jaqueta para ajudar a proteger contra chuva durante os deslocamentos.' },
    17: { title: 'Camiseta masculina de manga curta', category: 'Roupas masculinas', description: 'Camiseta básica para uso casual.' },
    18: { title: 'Jaqueta feminina de chuva', category: 'Roupas femininas', description: 'Jaqueta feminina para dias chuvosos.' },
    19: { title: 'Blusa feminina de manga curta', category: 'Roupas femininas', description: 'Blusa feminina casual para compor looks do dia a dia.' },
    20: { title: 'Camiseta feminina de algodão', category: 'Roupas femininas', description: 'Camiseta feminina confortável para uso diário.' }
  };

  // O catálogo é preenchido exclusivamente com os produtos retornados pela API.
  const products = [];
  const catalog = Object.create(null);
  let cart = [];
  const savedCartSnapshot = localStorage.getItem('hipposCartV4') || '[]';
  try {
    const savedCart = JSON.parse(savedCartSnapshot);
    if (Array.isArray(savedCart)) {
      cart = savedCart
        .map(item => {
          const product = catalog[String(item?.id)];
          if (!product) return null;
          return {
            ...product,
            qty: Math.max(1, Number(item?.qty) || 1)
          };
        })
        .filter(item => item && item.id && item.title && Number.isFinite(item.price));
    }
  } catch {
    cart = [];
  }

  let currentProduct = null;

  const cartDrawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('overlay');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const cartCount = document.querySelector('.cart b');
  const toast = document.getElementById('toast');
  const productModal = document.getElementById('productModal');
  const themeToggle = document.getElementById('themeToggle');
  const dataHora = document.getElementById('dataHora');
  const countdown = document.getElementById('countdown');
  const countHours = document.getElementById('countHours');
  const countMinutes = document.getElementById('countMinutes');
  const countSeconds = document.getElementById('countSeconds');
  const cartCouponRow = document.getElementById('cartCouponRow');
  const cartCouponLabel = document.getElementById('cartCouponLabel');
  const cartDiscount = document.getElementById('cartDiscount');
  const removeCoupon = document.getElementById('removeCoupon');
  const modalOffer = document.getElementById('modalOffer');
  const modalOldPrice = document.getElementById('modalOldPrice');
  const orderSuccess = document.getElementById('orderSuccess');
  const successDetails = document.getElementById('successDetails');
  const successContinue = document.getElementById('successContinue');

  let currentProductFeatured = false;

  let activeCoupon = JSON.parse(localStorage.getItem('hipposCouponV4') || 'null');

  function money(value) {
    return Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function saveCart() {
    localStorage.setItem('hipposCartV4', JSON.stringify(cart));
  }

  function cartQuantity() {
    return cart.reduce((total, item) => total + item.qty, 0);
  }

  function updateCartCount() {
    if (cartCount) cartCount.textContent = cartQuantity();
  }

  function showToast(message, type = '') {
    toast.textContent = message;
    toast.classList.toggle('coupon-toast', type === 'coupon');
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toast.classList.remove('show', 'coupon-toast');
    }, type === 'coupon' ? 6500 : 3200);
  }

  function renderCart() {
    updateCartCount();

    if (!cart.length) {
      cartItems.innerHTML = `
        <div class="empty-cart">
          <div>🛒</div>
          <strong>Seu carrinho está vazio</strong>
          <p>Adicione produtos para começar sua compra.</p>
          <button class="continue-btn" type="button" data-close-cart>Continuar comprando</button>
        </div>`;
    } else {
      cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="${item.img}" alt="${item.alt}" onerror="this.onerror=null;this.src='assets/logo.jpeg';">
          <div class="cart-item-info">
            <strong>${item.title}</strong>
            <span>${money(item.price)}</span>
            <div class="qty-controls">
              <button type="button" data-minus="${item.id}" aria-label="Diminuir quantidade">−</button>
              <b>${item.qty}</b>
              <button type="button" data-plus="${item.id}" aria-label="Aumentar quantidade">+</button>
              <button type="button" class="remove-item" data-remove="${item.id}">Remover</button>
            </div>
          </div>
        </div>`).join('');
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    if (!cart.length && activeCoupon) {
      activeCoupon = null;
      localStorage.removeItem('hipposCouponV4');
    }

    const couponOffer = getAvailableAutomaticCoupon();
    const couponAlreadyApplied = couponOffer && activeCoupon?.type === 'regular' && activeCoupon.code === couponOffer.code;
    const offerHtml = couponOffer
      ? `<button type="button" class="automatic-coupon-offer ${couponAlreadyApplied ? 'coupon-redeemed' : ''}" id="revealAutomaticCoupon" aria-label="${couponAlreadyApplied ? 'Cupom já resgatado' : 'Resgatar cupom de desconto'}"><strong>${couponAlreadyApplied ? '🎉 SEU PRESENTE EXCLUSIVO FOI RESGATADO!' : '🎁 PRESENTE EXCLUSIVO PARA VOCÊ!'}</strong><span>${couponAlreadyApplied ? `Você ganhou ${money(couponOffer.discount)} OFF nesta compra!` : `Você tem ${money(couponOffer.discount)} OFF esperando por você`}</span><em>${couponAlreadyApplied ? `CUPOM ${couponOffer.code} APLICADO ✓` : 'TOQUE AQUI PARA RESGATAR SEU CUPOM'}</em><small>${couponAlreadyApplied ? 'Seu desconto já está aplicado ao total 💝' : 'Uma oferta especial preparada para você 💝'}</small></button>`
      : '';
    const offerContainer = document.getElementById('cartAutomaticOffer');
    if (offerContainer) {
      offerContainer.innerHTML = offerHtml;
      offerContainer.hidden = !offerHtml;
    }

    const discount = getCouponDiscount(subtotal);

    if (activeCoupon && discount > 0) {
      cartCouponRow.hidden = false;
      cartCouponLabel.textContent = activeCoupon.type === 'featured'
        ? `Cupom do destaque ${activeCoupon.code}`
        : `Cupom ${activeCoupon.code}`;
      cartDiscount.textContent = `- ${money(discount)}`;
    } else {
      cartCouponRow.hidden = true;
      if (activeCoupon && subtotal < activeCoupon.minimum) {
        activeCoupon = null;
        localStorage.removeItem('hipposCouponV4');
      }
    }

    const total = Math.max(0, subtotal - discount);
    cartTotal.textContent = money(total);
    saveCart();
  }

  function getAvailableAutomaticCoupon() {
    const featuredIds = new Set(
      [...document.querySelectorAll('#featuredProductsGrid [data-featured-id]')]
        .map(card => String(card.dataset.featuredId))
    );
    const eligibleSubtotal = cart.reduce((sum, item) =>
      sum + (featuredIds.has(String(item.id)) ? 0 : item.price * item.qty), 0);
    if (eligibleSubtotal >= 250) return { code: 'HIPPO30', discount: 30, minimum: 250 };
    if (eligibleSubtotal >= 150) return { code: 'HIPPO20', discount: 20, minimum: 150 };
    if (eligibleSubtotal >= 80) return { code: 'HIPPO10', discount: 10, minimum: 80 };
    return null;
  }

  function revealAutomaticCoupon() {
    const coupon = getAvailableAutomaticCoupon();
    if (!coupon) return;
    applyCoupon(coupon);
    if (activeCoupon?.type === 'regular' && activeCoupon.code === coupon.code) {
      renderCart();
      showToast(`🎉 Você ganhou ${money(coupon.discount)} OFF! Seu presente exclusivo foi aplicado.`, 'coupon');
    }
  }

  function getCouponDiscount(subtotal) {
    if (!activeCoupon || !cart.length) return 0;

    if (activeCoupon.type === 'featured') {
      const featuredItem = cart.find(item => item.id === activeCoupon.productId);
      if (!featuredItem) return 0;
      return featuredItem.price * featuredItem.qty * activeCoupon.discountRate;
    }

    const featuredIds = new Set(
      [...document.querySelectorAll('#featuredProductsGrid [data-featured-id]')]
        .map(card => String(card.dataset.featuredId))
    );
    const featuredSubtotal = cart.reduce((sum, item) =>
      sum + (featuredIds.has(String(item.id)) ? item.price * item.qty : 0), 0);
    const eligibleSubtotal = cart.reduce((sum, item) =>
      sum + (featuredIds.has(String(item.id)) ? 0 : item.price * item.qty), 0);
    const featuredDiscount = featuredSubtotal * 0.05;
    if (eligibleSubtotal < activeCoupon.minimum) return featuredDiscount;
    return featuredDiscount + Math.min(activeCoupon.discount, eligibleSubtotal);
  }

  function applyCoupon(coupon) {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const featuredIds = new Set([...document.querySelectorAll('#featuredProductsGrid [data-featured-id]')].map(card => String(card.dataset.featuredId)));
    const eligibleSubtotal = cart.reduce((sum, item) => sum + (featuredIds.has(String(item.id)) ? 0 : item.price * item.qty), 0);

    if (eligibleSubtotal < coupon.minimum) {
      showToast(`Adicione mais produtos elegíveis. Este presente é liberado a partir de ${money(coupon.minimum)} em produtos sem desconto de destaque.`, 'coupon');
      return;
    }

    activeCoupon = {
      type: 'regular',
      code: coupon.code,
      discount: coupon.discount,
      minimum: coupon.minimum
    };
    localStorage.setItem('hipposCouponV4', JSON.stringify(activeCoupon));
    renderCart();
    showToast(`Cupom ${coupon.code} aplicado. Apenas um cupom pode ser usado por compra.`);
  }

  function openCart() {
    renderCart();
    cartDrawer.classList.add('open');
    overlay.classList.add('show');
    document.body.classList.add('no-scroll');
  }

  function closePanels() {
    cartDrawer.classList.remove('open');
    productModal.classList.remove('show');
    overlay.classList.remove('show');
    document.body.classList.remove('no-scroll');
  }

  function addToCart(product, quantity = 1) {
    const found = cart.find(item => item.id === product.id);
    if (found) {
      found.qty += quantity;
    } else {
      cart.push({ ...product, qty: quantity });
    }
    renderCart();
    const availableCoupon = getAvailableAutomaticCoupon();
    if (availableCoupon && activeCoupon?.type !== 'featured') {
      showToast(`🎁 VOCÊ GANHOU UM PRESENTE! Há ${money(availableCoupon.discount)} OFF exclusivo esperando por você. Abra o carrinho e toque no aviso vermelho para resgatar!`, 'coupon');
    } else {
      showToast(`${product.title} encaminhado ao carrinho!`);
    }
  }

  function productData(card) {
    return card ? catalog[card.dataset.id] || null : null;
  }

  function openProduct(product, featured = false) {
    currentProduct = product;
    currentProductFeatured = featured;
    document.getElementById('modalImg').src = product.img;
    document.getElementById('modalImg').alt = product.alt;
    document.getElementById('modalTitle').textContent = product.title;
    document.getElementById('modalCategory').textContent = product.category;

    const priceElement = document.getElementById('modalPrice');
    const modalAdd = document.getElementById('modalAdd');

    if (featured) {
      const featuredPrice = product.price * 0.95;
      modalOldPrice.hidden = false;
      modalOldPrice.textContent = money(product.price);
      modalOffer.hidden = false;
      priceElement.textContent = money(featuredPrice);
      priceElement.classList.add('featured-price-modal');
      modalAdd.textContent = 'Comprar com 5% OFF';
    } else {
      modalOldPrice.hidden = true;
      modalOffer.hidden = true;
      priceElement.textContent = money(product.price);
      priceElement.classList.remove('featured-price-modal');
      modalAdd.textContent = 'Adicionar ao carrinho';
    }

    document.getElementById('modalQty').value = 1;
    productModal.classList.add('show');
    overlay.classList.add('show');
    document.body.classList.add('no-scroll');
  }

  // Os destaques também são criados a partir dos produtos da API.
  document.getElementById('featuredProductsGrid')?.addEventListener('click', event => {
    const card = event.target.closest('.featured-card');
    if (!card) return;
    const product = catalog[card.dataset.featuredId];
    if (!product) return;

    if (event.target.closest('.featured-buy')) {
      event.stopPropagation();
      addFeaturedToCart(product);
    } else {
      openProduct(product, true);
    }
  });

  document.getElementById('featuredProductsGrid')?.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('.featured-card');
    if (!card || event.target.closest('button')) return;
    event.preventDefault();
    const product = catalog[card.dataset.featuredId];
    if (product) openProduct(product, true);
  });

  function addFeaturedToCart(product, quantity = 1) {
    // Produtos em destaque recebem 5% próprios; cupons automáticos valem apenas para os demais itens.
    if (activeCoupon?.type !== 'regular') {
      activeCoupon = { type: 'featured', code: 'DESTAQUE5', productId: product.id, discountRate: 0.05 };
      localStorage.setItem('hipposCouponV4', JSON.stringify(activeCoupon));
    }

    const found = cart.find(item => item.id === product.id);
    if (found) found.qty += quantity;
    else cart.push({ ...product, qty: quantity });

    renderCart();
    showToast(`${product.title} encaminhado ao carrinho! Desconto de 5% aplicado.`);
  }

  // 1) Carrinho: adicionar produtos e atualizar quantidade.
  document.querySelector('.cart')?.addEventListener('click', event => {
    event.preventDefault();
    openCart();
  });

  // Delegação de eventos permite interagir com cartões criados pela API.
  document.getElementById('productsGrid')?.addEventListener('click', event => {
    const card = event.target.closest('.product');
    if (!card) return;

    const product = catalog[card.dataset.id];
    if (!product) return;

    if (event.target.closest('.buy-btn')) {
      event.stopPropagation();
      addToCart(product);
    } else if (event.target.closest('.favorite-btn')) {
      event.stopPropagation();
      const button = event.target.closest('.favorite-btn');
      button.classList.toggle('liked');
      button.textContent = button.classList.contains('liked') ? '♥' : '♡';
      showToast(button.classList.contains('liked') ? 'Produto salvo nos favoritos.' : 'Produto removido dos favoritos.');
    } else {
      openProduct(product);
    }
  });

  cartItems.addEventListener('click', event => {
    const id = event.target.dataset.plus || event.target.dataset.minus || event.target.dataset.remove;
    if (!id) return;

    const item = cart.find(product => product.id === id);
    if (!item) return;

    if (event.target.dataset.plus) item.qty += 1;
    if (event.target.dataset.minus) item.qty = Math.max(1, item.qty - 1);
    if (event.target.dataset.remove) cart = cart.filter(product => product.id !== id);

    if (activeCoupon?.type === 'featured' && !cart.some(product => product.id === activeCoupon.productId)) {
      activeCoupon = null;
      localStorage.removeItem('hipposCouponV4');
    }

    renderCart();
  });

  document.querySelectorAll('[data-close-cart]').forEach(button => button.addEventListener('click', closePanels));
  document.getElementById('closeCart')?.addEventListener('click', closePanels);
  document.getElementById('closeModal')?.addEventListener('click', closePanels);
  overlay?.addEventListener('click', closePanels);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closePanels();
  });

  document.getElementById('modalPlus')?.addEventListener('click', () => {
    const input = document.getElementById('modalQty');
    input.value = Number(input.value) + 1;
  });

  document.getElementById('modalMinus')?.addEventListener('click', () => {
    const input = document.getElementById('modalQty');
    input.value = Math.max(1, Number(input.value) - 1);
  });

  document.getElementById('modalAdd')?.addEventListener('click', () => {
    if (!currentProduct) return;
    const quantity = Math.max(1, Number(document.getElementById('modalQty').value) || 1);

    if (currentProductFeatured) {
      addFeaturedToCart(currentProduct, quantity);
    } else {
      addToCart(currentProduct, quantity);
    }
    closePanels();
  });

  // 2) Pesquisa dinâmica dos produtos.
  function filterProducts(term = '') {
    const query = term.toLowerCase().trim();
    products.forEach(product => {
      const matches = !query || product.title.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
      if (product.card) product.card.style.display = matches ? '' : 'none';
    });

    document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });

    if (query && !products.some(product => product.card.style.display !== 'none')) {
      showToast('Nenhum produto encontrado.');
    }
  }

  document.querySelector('.search')?.addEventListener('submit', event => {
    event.preventDefault();
    filterProducts(document.getElementById('busca').value);
  });

  document.getElementById('busca')?.addEventListener('input', event => {
    if (event.target.value.length >= 2 || event.target.value.length === 0) {
      filterProducts(event.target.value);
    }
  });

  // 3) Favoritos e filtros.
  document.querySelectorAll('.filter').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      const filter = button.textContent.trim();
      products.forEach(product => { product.card.style.display = ''; });

      if (filter === 'Mais vendidos') {
        products.forEach(product => {
          if (Number(product.rating || 0) < 4.5) product.card.style.display = 'none';
        });
      } else if (filter === 'Novidades') {
        products.forEach(product => {
          if (Number(product.id.replace('api-', '')) <= Math.max(0, products.length - 6)) {
            product.card.style.display = 'none';
          }
        });
      }
    });
  });

  // 4) Tema claro/escuro com localStorage.
  function updateThemeButton(isDark) {
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', isDark ? 'Ativar modo claro' : 'Ativar modo escuro');
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.title = isDark ? 'Modo claro' : 'Modo escuro';
  }

  function applyTheme(isDark) {
    document.body.classList.toggle('dark-theme', isDark);
    updateThemeButton(isDark);
    localStorage.setItem('hipposTheme', isDark ? 'dark' : 'light');
  }

  const savedTheme = localStorage.getItem('hipposTheme');
  applyTheme(savedTheme === 'dark');

  themeToggle?.addEventListener('click', () => {
    applyTheme(!document.body.classList.contains('dark-theme'));
  });

  // 5) Data e hora atualizadas automaticamente.
  function updateDateTime() {
    if (!dataHora) return;
    const now = new Date();
    dataHora.textContent = `Atualizado em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`;
  }

  updateDateTime();
  setInterval(updateDateTime, 1000);

  // 6) Cupons funcionais.
  document.querySelectorAll('.coupon').forEach(card => {
    const button = card.querySelector('button');
    button.addEventListener('click', () => {
      applyCoupon({
        code: card.dataset.coupon,
        discount: Number(card.dataset.discount),
        minimum: Number(card.dataset.minimum)
      });

      document.querySelectorAll('.coupon button').forEach(item => {
        item.classList.remove('applied');
        item.textContent = 'Aplicar';
      });

      if (activeCoupon?.type === 'regular' && activeCoupon?.code === card.dataset.coupon) {
        button.classList.add('applied');
        button.textContent = 'Aplicado ✓';
      }
    });
  });

  document.getElementById('cartAutomaticOffer')?.addEventListener('click', event => {
    if (event.target.closest('#revealAutomaticCoupon')) revealAutomaticCoupon();
  });

  document.getElementById('flashProducts')?.addEventListener('click', event => {
    const button = event.target.closest('[data-flash-buy]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    const product = catalog[button.dataset.flashBuy];
    if (product) addToCart(product);
  });

  removeCoupon?.addEventListener('click', () => {
    activeCoupon = null;
    localStorage.removeItem('hipposCouponV4');
    renderCart();
    document.querySelectorAll('.coupon button').forEach(item => {
      item.classList.remove('applied');
      item.textContent = 'Aplicar';
    });
    showToast('Cupom removido.');
  });

  document.querySelector('.newsletter form')?.addEventListener('submit', event => {
    event.preventDefault();
    showToast('Cadastro realizado com sucesso!');
    event.target.reset();
  });

  // Finalização da compra: mostra uma página de confirmação com o resumo do pedido.
  document.getElementById('checkout')?.addEventListener('click', () => {
    if (!cart.length) {
      showToast('Seu carrinho está vazio.');
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discount = getCouponDiscount(subtotal);
    const total = Math.max(0, subtotal - discount);
    const orderNumber = `HP-${Date.now().toString().slice(-8)}`;
    const itemCount = cartQuantity();

    successDetails.innerHTML = `
      <div class="success-line"><span>Pedido</span><strong>#${orderNumber}</strong></div>
      <div class="success-line"><span>Itens</span><strong>${itemCount}</strong></div>
      <div class="success-line"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
      ${discount > 0 ? `<div class="success-line"><span>${activeCoupon?.type === 'featured' ? 'Desconto destaque (5%)' : `Cupom ${activeCoupon.code}`}</span><strong>- ${money(discount)}</strong></div>` : ''}
      <div class="success-line success-total"><span>Total</span><strong>${money(total)}</strong></div>
    `;

    document.getElementById('successMessage').textContent =
      `Seu pedido #${orderNumber} foi registrado. Esta versão acadêmica simula a confirmação da compra.`;

    closePanels();
    document.querySelector('main').hidden = true;
    document.querySelector('footer')?.setAttribute('hidden', '');
    orderSuccess.hidden = false;
    orderSuccess.scrollIntoView({ behavior: 'smooth' });

    // Guarda um resumo do último pedido e limpa o carrinho.
    localStorage.setItem('hipposLastOrder', JSON.stringify({
      orderNumber, items: cart, subtotal, discount, total,
      coupon: activeCoupon
    }));
    cart = [];
    activeCoupon = null;
    localStorage.removeItem('hipposCartV4');
    localStorage.removeItem('hipposCouponV4');
    renderCart();
  });

  successContinue?.addEventListener('click', () => {
    orderSuccess.hidden = true;
    document.querySelector('main').hidden = false;
    document.querySelector('footer')?.removeAttribute('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 7) Contador regressivo real das ofertas.
  function startCountdown() {
    if (!countdown) return;

    const storageKey = 'hipposFlashDeadlineV4';
    let deadline = Number(localStorage.getItem(storageKey));

    if (!deadline || deadline <= Date.now()) {
      deadline = Date.now() + ((2 * 60 * 60) + (45 * 60) + 18) * 1000;
      localStorage.setItem(storageKey, String(deadline));
    }

    function tick() {
      const remaining = Math.max(0, deadline - Date.now());
      const totalSeconds = Math.floor(remaining / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      countHours.textContent = String(hours).padStart(2, '0');
      countMinutes.textContent = String(minutes).padStart(2, '0');
      countSeconds.textContent = String(seconds).padStart(2, '0');

      if (remaining <= 0) {
        countdown.innerHTML = '<b>00</b><em>:</em><b>00</b><em>:</em><b>00</b>';
        clearInterval(countdown.timer);
      }
    }

    tick();
    countdown.timer = setInterval(tick, 1000);
  }

  // 8) Todos os produtos e destaques são carregados da API pública de produtos para casa.
  async function loadApiProducts() {
    const grid = document.getElementById('productsGrid');
    const featuredGrid = document.getElementById('featuredProductsGrid');
    const status = document.getElementById('productsStatus');
    if (!grid || !featuredGrid || !status) return;

    try {
      // A DummyJSON oferece categorias de casa, decoração, móveis e cozinha.
      const categoryEndpoints = [
        'https://dummyjson.com/products/category/home-decoration?limit=100',
        'https://dummyjson.com/products/category/furniture?limit=100',
        'https://dummyjson.com/products/category/kitchen-accessories?limit=100'
      ];
      const responses = await Promise.all(categoryEndpoints.map(url => fetch(url)));
      if (responses.some(response => !response.ok)) throw new Error('Não foi possível consultar todas as categorias da API.');
      const payloads = await Promise.all(responses.map(response => response.json()));
      const apiProducts = payloads.flatMap(payload => payload.products || []);
      if (!apiProducts.length) throw new Error('A API não retornou produtos para casa.');

      const categoryNames = {
        'home-decoration': 'Decoração',
        furniture: 'Móveis',
        'kitchen-accessories': 'Acessórios de cozinha'
      };
      // Traduzimos os nomes conhecidos da API para que nenhum título em inglês apareça na loja.
      const titleTranslations = {
        'Decoration Swing': 'Balanço decorativo',
        'Family Tree Photo Frame': 'Porta-retratos Árvore da Família',
        'House Showpiece': 'Enfeite decorativo de casa',
        'Plant Pot': 'Vaso para plantas',
        'Table Lamp': 'Luminária de mesa',
        'Wall Lamp': 'Luminária de parede',
        'Decorative Vase': 'Vaso decorativo',
        'Artificial Flower': 'Flor artificial decorativa',
        'Artificial Plant': 'Planta artificial decorativa',
        'Flower Pot': 'Vaso para flores',
        'Wooden Wall Decor': 'Decoração de parede em madeira',
        'Ceramic Vase': 'Vaso de cerâmica',
        'Decorative Shelf': 'Prateleira decorativa',
        'Wall Clock': 'Relógio de parede',
        'Candle Holder': 'Castiçal decorativo',
        'Photo Frame': 'Porta-retratos',
        'Sofa': 'Sofá',
        'Bed': 'Cama',
        'Chair': 'Cadeira',
        'Dining Table': 'Mesa de jantar',
        'Office Chair': 'Cadeira de escritório',
        'Wooden Dining Table': 'Mesa de jantar de madeira',
        'Kitchen Towel': 'Pano de cozinha',
        'Knife Set': 'Conjunto de facas',
        'Cutting Board': 'Tábua de corte',
        'Cooking Utensils': 'Utensílios de cozinha',
        'Kitchen Scale': 'Balança de cozinha',
        'Coffee Maker': 'Cafeteira',
        'Electric Kettle': 'Chaleira elétrica',
        'Dinner Set': 'Aparelho de jantar',
        'Storage Basket': 'Cesto organizador',
        'Decorative Pillow': 'Almofada decorativa'
      };
      const translateTitle = (item) => {
        const original = String(item.title || '').trim();
        if (titleTranslations[original]) return titleTranslations[original];
        const normalized = original.toLowerCase();
        const rules = [
          [/\b(photo frame|picture frame)\b/g, 'porta-retratos'],
          [/\b(family tree)\b/g, 'árvore da família'],
          [/\b(swing)\b/g, 'balanço'], [/\b(showpiece|show piece)\b/g, 'enfeite decorativo'],
          [/\b(plant pot|flower pot|pot)\b/g, 'vaso'], [/\b(vase)\b/g, 'vaso'],
          [/\b(table lamp)\b/g, 'luminária de mesa'], [/\b(wall lamp)\b/g, 'luminária de parede'],
          [/\b(lamp|lighting)\b/g, 'luminária'], [/\b(wooden|wood)\b/g, 'de madeira'],
          [/\b(shelf|shelves)\b/g, 'prateleira'], [/\b(wall clock|clock)\b/g, 'relógio de parede'],
          [/\b(candle holder)\b/g, 'castiçal'], [/\b(artificial flower)\b/g, 'flor artificial'],
          [/\b(artificial plant)\b/g, 'planta artificial'], [/\b(decorative|decoration|decor)\b/g, 'decorativo'],
          [/\b(kitchen towel)\b/g, 'pano de cozinha'], [/\b(knife set)\b/g, 'conjunto de facas'],
          [/\b(cutting board)\b/g, 'tábua de corte'], [/\b(cooking utensils|utensils)\b/g, 'utensílios'],
          [/\b(kitchen scale)\b/g, 'balança de cozinha'], [/\b(coffee maker)\b/g, 'cafeteira'],
          [/\b(electric kettle)\b/g, 'chaleira elétrica'], [/\b(dinner set)\b/g, 'aparelho de jantar'],
          [/\b(storage basket|basket)\b/g, 'cesto organizador'], [/\b(pillow)\b/g, 'almofada'],
          [/\b(dining table|table)\b/g, 'mesa'], [/\b(chair)\b/g, 'cadeira'], [/\b(sofa)\b/g, 'sofá'], [/\b(bed)\b/g, 'cama']
        ];
        let translated = normalized;
        rules.forEach(([pattern, replacement]) => { translated = translated.replace(pattern, replacement); });
        translated = translated.replace(/\s+/g, ' ').trim();
        // Se não houver tradução confiável, exibimos um nome em português baseado na categoria.
        if (translated === normalized || /[a-z]{3,}/i.test(translated) && !/[áéíóúãõç]/i.test(translated)) {
          return item.category === 'furniture' ? 'Item para mobiliar sua casa' :
            item.category === 'kitchen-accessories' ? 'Acessório para cozinha' : 'Item decorativo para sua casa';
        }
        return translated.charAt(0).toLocaleUpperCase('pt-BR') + translated.slice(1);
      };
      const cards = apiProducts.map((item, index) => {
        const titlePt = translateTitle(item);
        const categoryPt = categoryNames[item.category] || 'Utilidades para casa';
        const product = {
          id: `api-${item.id}`,
          title: titlePt,
          description: `Uma opção de ${categoryPt.toLowerCase()} para deixar sua casa mais prática e aconchegante. Confira os detalhes e aproveite!`,
          price: Number(item.price) || 0,
          category: categoryPt,
          img: String(item.thumbnail || item.images?.[0] || ''),
          alt: `Imagem de ${titlePt}`,
          rating: Number(item.rating || 0),
          reviewCount: Number(item.reviews?.length || 0),
          card: null,
          source: 'api'
        };
        catalog[product.id] = product;
        products.push(product);

        const card = document.createElement('article');
        card.className = 'product api-product-card';
        card.dataset.id = product.id;
        card.dataset.price = String(product.price);

        const imageArea = document.createElement('div');
        imageArea.className = 'p-img';
        const image = document.createElement('img');
        image.className = 'api-product-image';
        image.src = product.img;
        image.alt = product.alt;
        image.loading = 'lazy';
        image.onerror = () => { image.onerror = null; image.src = 'assets/logo.jpeg'; };
        const favoriteButton = document.createElement('button');
        favoriteButton.type = 'button';
        favoriteButton.className = 'favorite-btn';
        favoriteButton.setAttribute('aria-label', `Favoritar ${product.title}`);
        favoriteButton.textContent = '♡';
        imageArea.append(image, favoriteButton);

        const body = document.createElement('div');
        body.className = 'p-body';
        const category = document.createElement('small');
        category.textContent = product.category;
        const title = document.createElement('h3');
        title.textContent = product.title;
        const rating = document.createElement('div');
        rating.className = 'rating';
        rating.textContent = `★★★★★ ${product.rating.toFixed(1)} (${product.reviewCount} avaliações)`;
        const price = document.createElement('div');
        price.className = 'price';
        const currency = document.createElement('small');
        currency.textContent = 'R$';
        const amount = document.createElement('strong');
        amount.textContent = product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        price.append(currency, amount);
        const note = document.createElement('div');
        note.className = 'shipping';
        note.textContent = 'Preço demonstrativo da API';
        const buyButton = document.createElement('button');
        buyButton.type = 'button';
        buyButton.className = 'buy-btn';
        buyButton.textContent = 'Comprar';
        body.append(category, title, rating, price, note, buyButton);
        card.append(imageArea, body);
        product.card = card;
        grid.append(card);
      });

      // As ofertas da semana também usam imagens, títulos e preços reais retornados pela API.
      const flashGrid = document.getElementById('flashProducts');
      if (flashGrid) {
        flashGrid.replaceChildren();
        apiProducts.slice(0, 8).forEach((item, index) => {
          const product = catalog[`api-${item.id}`];
          if (!product) return;
          const flashCard = document.createElement('article');
          flashCard.className = 'flash-product';
          flashCard.dataset.productId = product.id;
          const imageArea = document.createElement('div');
          imageArea.className = `flash-img img${index + 1}`;
          const image = document.createElement('img');
          image.src = product.img;
          image.alt = product.alt;
          image.loading = 'lazy';
          image.onerror = () => { image.onerror = null; image.src = 'logo.jpeg'; };
          const badge = document.createElement('label');
          badge.textContent = 'Oferta API';
          imageArea.append(image, badge);
          const price = document.createElement('strong');
          price.textContent = money(product.price);
          const title = document.createElement('small');
          title.textContent = product.title;
          title.style.display = 'block';
          title.style.minHeight = '30px';
          const buyButton = document.createElement('button');
          buyButton.type = 'button';
          buyButton.className = 'flash-buy-btn';
          buyButton.dataset.flashBuy = product.id;
          buyButton.textContent = 'Aproveitar oferta';
          buyButton.setAttribute('aria-label', `Adicionar ${product.title} ao carrinho`);
          flashCard.append(imageArea, price, title, buyButton);
          flashGrid.append(flashCard);
        });
      }

      // Os três primeiros itens da API são usados também na área de destaques.
      apiProducts.slice(0, 3).forEach((item) => {
        const product = catalog[`api-${item.id}`];
        if (!product) return;
        const card = document.createElement('article');
        card.className = 'featured-card';
        card.dataset.featuredId = product.id;
        card.tabIndex = 0;

        const imageArea = document.createElement('div');
        imageArea.className = 'featured-image';
        const image = document.createElement('img');
        image.src = product.img;
        image.alt = product.alt;
        image.loading = 'lazy';
        image.onerror = () => { image.onerror = null; image.src = 'assets/logo.jpeg'; };
        const badge = document.createElement('span');
        badge.textContent = '5% OFF';
        imageArea.append(image, badge);

        const info = document.createElement('div');
        info.className = 'featured-info';
        const category = document.createElement('small');
        category.textContent = product.category;
        const title = document.createElement('h3');
        title.textContent = product.title;
        const description = document.createElement('p');
        description.textContent = product.description || 'Produto carregado dinamicamente da API pública.';
        const price = document.createElement('div');
        price.className = 'featured-price';
        const oldPrice = document.createElement('del');
        oldPrice.textContent = money(product.price);
        const discountedPrice = document.createElement('strong');
        discountedPrice.textContent = money(product.price * 0.95);
        price.append(oldPrice, discountedPrice);
        const buyButton = document.createElement('button');
        buyButton.className = 'featured-buy';
        buyButton.type = 'button';
        buyButton.textContent = 'Comprar com 5% OFF';
        info.append(category, title, description, price, buyButton);
        card.append(imageArea, info);
        featuredGrid.append(card);
      });

      // Restaura o carrinho depois de reconstruir o catálogo a partir da API.
      try {
        const savedItems = JSON.parse(savedCartSnapshot);
        savedItems.forEach((item) => {
          const id = String(item?.id || '').startsWith('api-') ? String(item.id) : `api-${item?.id}`;
          const apiProduct = catalog[id];
          if (apiProduct && !cart.some(cartItem => cartItem.id === apiProduct.id)) {
            cart.push({ ...apiProduct, qty: Math.max(1, Number(item.qty) || 1) });
          }
        });
      } catch (storageError) {
        console.warn('Não foi possível recuperar itens anteriores do carrinho.', storageError);
      }

      status.textContent = `${apiProducts.length} produtos carregados da API`;
      renderCart();
    } catch (error) {
      console.error('Erro ao carregar produtos da API:', error);
      status.textContent = 'API indisponível no momento';
      const message = document.createElement('p');
      message.className = 'api-error';
      message.textContent = 'Não foi possível carregar os produtos. Verifique sua conexão e tente novamente.';
      grid.replaceChildren(message);
      featuredGrid.replaceChildren();
    }
  }

  // Categorias filtram a vitrine usando os grupos disponíveis na Fake Store API.
  document.querySelectorAll('.categories a[data-category]').forEach((link) => {
    link.addEventListener('click', () => {
      const selectedCategory = link.dataset.category;
      document.querySelectorAll('.categories a').forEach(item => item.classList.toggle('active', item === link));
      const visibleProducts = products.filter(product => {
        if (selectedCategory === 'all') return true;
        return product.category.toLowerCase() === selectedCategory.toLowerCase();
      });
      const grid = document.getElementById('productsGrid');
      if (grid) {
        grid.replaceChildren();
        visibleProducts.forEach(product => { if (product.card) grid.append(product.card); });
        const status = document.getElementById('productsStatus');
        if (status) status.textContent = `${visibleProducts.length} produtos encontrados nesta categoria da API`;
      }
      document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
      if (!visibleProducts.length) showToast('A API não possui produtos nesta categoria. Tente outra categoria.');
    });
  });

  loadApiProducts();

  // Reflexão Clean Code: usei nomes descritivos, funções com responsabilidades
  // específicas, tratamento de erros na API e comentários apenas nos trechos-chave.
  // Posso melhorar futuramente separando o JavaScript em módulos e adicionando testes.

  startCountdown();

  renderCart();

  if (activeCoupon?.type === 'featured') {
    document.querySelectorAll('.coupon button').forEach(item => {
      item.classList.remove('applied');
      item.textContent = 'Aplicar';
    });
  }
})();

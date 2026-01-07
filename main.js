/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  LEGADO MUEBLES - MAIN JAVASCRIPT v3.1                                       ║
 * ║  Arquitectura: Modular ES6+ con Observer Pattern                             ║
 * ║  Funcionalidades: State Management, Event Delegation, Lazy Loading           ║
 * ║  Performance: Debounce, Throttle, Intersection Observer                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════════════════
   1. CONFIG - Global Configuration
   ═══════════════════════════════════════════════════════════════════════════════ */

const CONFIG = Object.freeze({
    WHATSAPP_NUMBER: '5492604364497',
    WHATSAPP_URL: 'https://wa.me/',
    EMAIL: 'contacto@legadomuebles.com',
    PHONE: '+54 9 260 436-4497',

    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 100,
    ANIMATION_DURATION: 600,
    TOAST_DURATION: 4000,
    SCROLL_OFFSET: 90,

    BREAKPOINTS: {
        xs: 475,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536
    },

    STORAGE: {
        THEME: 'legado_theme',
        FAVORITES: 'legado_favorites',
        RECENT_VIEWS: 'legado_recent',
        FORM_DATA: 'legado_form'
    },

    MAX_RECENT_VIEWS: 10,
    PRODUCTS_PER_PAGE: 8,
    MAX_FAVORITES: 50,

    SELECTORS: {
        header: '#header',
        headerBg: '#header-bg',
        mobileMenuBtn: '#mobile-menu-btn',
        mobileMenuIcon: '#mobile-menu-icon',
        mobileMenu: '#mobile-menu',
        themeToggle: '#theme-toggle',

        searchBtn: '#search-btn',
        searchModal: '#search-modal',
        searchContainer: '#search-container',
        searchInput: '#search-input',
        searchResults: '#search-results',
        searchClose: '#search-close',

        categoryPills: '#category-pills',
        productsGrid: '#products-grid',
        loadMoreBtn: '#load-more-btn',
        productSearch: '#product-search',
        sortSelect: '#sort-select',

        testimonialsCarousel: '#testimonials-carousel',
        testimonialPrev: '#testimonial-prev',
        testimonialNext: '#testimonial-next',

        galleryGrid: '#gallery-grid',

        contactCards: '#contact-cards',

        quoteForm: '#quote-form',

        lightbox: '#lightbox',
        lightboxImg: '#lightbox-img',
        lightboxClose: '#lightbox-close',

        toast: '#toast',

        whatsappBtn: '#whatsapp-btn',

        scrollProgress: '.scroll-progress',

        footerSocial: '#footer-social',
        currentYear: '#current-year'
    },

    CLASSES: {
        active: 'active',
        visible: 'visible',
        hidden: 'hidden',
        open: 'open',
        scrolled: 'c-header--scrolled',
        revealed: 'reveal--visible',
        pillActive: 'c-pill--active',
        lightboxActive: 'c-lightbox--active',
        toastShow: 'c-toast--show',
        mobileMenuOpen: 'c-mobile-menu--open'
    }
});

/* ═══════════════════════════════════════════════════════════════════════════════
   2. UTILS - Utility Functions
   ═══════════════════════════════════════════════════════════════════════════════ */

const Utils = {
    $(selector, context = document) {
        return context.querySelector(selector);
    },

    $$(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    },

    debounce(fn, delay = CONFIG.DEBOUNCE_DELAY) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    throttle(fn, delay = CONFIG.THROTTLE_DELAY) {
        let lastCall = 0;
        let timeoutId;
        return function (...args) {
            const now = Date.now();
            const remaining = delay - (now - lastCall);

            clearTimeout(timeoutId);

            if (remaining <= 0) {
                lastCall = now;
                fn.apply(this, args);
            } else {
                timeoutId = setTimeout(() => {
                    lastCall = Date.now();
                    fn.apply(this, args);
                }, remaining);
            }
        };
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    formatNumber(num) {
        return new Intl.NumberFormat('es-AR').format(num);
    },

    getWhatsAppUrl(message = '') {
        const encoded = encodeURIComponent(message);
        return `${CONFIG.WHATSAPP_URL}${CONFIG.WHATSAPP_NUMBER}${message ? `?text=${encoded}` : ''}`;
    },

    createElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    },

    parseJSON(str, fallback = null) {
        try {
            return JSON.parse(str);
        } catch {
            return fallback;
        }
    },

    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch {
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch {
                console.warn('LocalStorage not available');
                return false;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch {
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch {
                return false;
            }
        }
    },

    isInViewport(element, threshold = 0) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.top <= windowHeight - threshold && rect.bottom >= threshold;
    },

    scrollTo(target, offset = CONFIG.SCROLL_OFFSET) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const y = element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    },

    getBreakpoint() {
        const width = window.innerWidth;
        const breakpoints = CONFIG.BREAKPOINTS;

        if (width >= breakpoints['2xl']) return '2xl';
        if (width >= breakpoints.xl) return 'xl';
        if (width >= breakpoints.lg) return 'lg';
        if (width >= breakpoints.md) return 'md';
        if (width >= breakpoints.sm) return 'sm';
        if (width >= breakpoints.xs) return 'xs';
        return 'base';
    },

    isMobile() {
        return window.innerWidth < CONFIG.BREAKPOINTS.md;
    },

    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    normalizeString(str) {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    },

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    isOnline() {
        return navigator.onLine;
    },

    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    getScrollPercentage() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        return docHeight > 0 ? scrollTop / docHeight : 0;
    }
};

/* ═══════════════════════════════════════════════════════════════════════════════
   3. STORE - State Management (Observer Pattern)
   ═══════════════════════════════════════════════════════════════════════════════ */

class Store {
    constructor(initialState = {}) {
        this._state = initialState;
        this._listeners = new Map();
        this._history = [];
        this._maxHistory = 10;
    }

    get(key = null) {
        if (key === null) return { ...this._state };
        return this._state[key];
    }

    set(key, value) {
        const oldValue = this._state[key];

        if (oldValue === value) return this;

        this._saveHistory(key, oldValue);
        this._state[key] = value;
        this._notify(key, value, oldValue);

        return this;
    }

    setMany(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.set(key, value);
        });
        return this;
    }

    subscribe(key, callback) {
        if (!this._listeners.has(key)) {
            this._listeners.set(key, new Set());
        }
        this._listeners.get(key).add(callback);

        return () => {
            this._listeners.get(key)?.delete(callback);
        };
    }

    subscribeAll(callback) {
        return this.subscribe('*', callback);
    }

    _notify(key, newValue, oldValue) {
        this._listeners.get(key)?.forEach(cb => {
            try {
                cb(newValue, oldValue, key);
            } catch (error) {
                console.error(`Store listener error for "${key}":`, error);
            }
        });

        this._listeners.get('*')?.forEach(cb => {
            try {
                cb(newValue, oldValue, key);
            } catch (error) {
                console.error('Store global listener error:', error);
            }
        });
    }

    _saveHistory(key, value) {
        this._history.push({ key, value, timestamp: Date.now() });
        if (this._history.length > this._maxHistory) {
            this._history.shift();
        }
    }

    getHistory() {
        return [...this._history];
    }

    reset(initialState = {}) {
        this._state = initialState;
        this._history = [];
    }
}

const AppStore = new Store({
    theme: 'light',

    mobileMenuOpen: false,
    searchModalOpen: false,
    lightboxOpen: false,
    lightboxImage: null,
    lightboxAlt: '',

    currentCategory: 'all',
    searchQuery: '',
    sortBy: 'featured',
    productsPage: 1,

    scrollY: 0,
    headerVisible: true,

    isOnline: navigator.onLine,

    isLoading: false
});

/* ═══════════════════════════════════════════════════════════════════════════════
   4. DATA - Application Data
   ═══════════════════════════════════════════════════════════════════════════════ */

const Data = {
    categories: [
        { id: 'mesitas', name: 'Mesitas de Luz', icon: 'bed', count: 12 },
        { id: 'racks', name: 'Racks TV', icon: 'tv', count: 8 },
        { id: 'escritorios', name: 'Escritorios', icon: 'desk', count: 6 },
        { id: 'cocina', name: 'Cocina', icon: 'kitchen', count: 15 },
        { id: 'roperos', name: 'Placards', icon: 'door_sliding', count: 10 },
        { id: 'espejos', name: 'Espejos', icon: 'checkroom', count: 5 },
        { id: 'estanterias', name: 'Estanterías', icon: 'shelves', count: 7 },
        { id: 'vanitory', name: 'Vanitorys', icon: 'water_drop', count: 4 },
        { id: 'organizadores', name: 'Organizadores', icon: 'view_agenda', count: 9 }
    ],

    products: [
        { id: 1, cat: 'mesitas', name: '2 Mesitas 2 Cajones', dimensions: '92x40x33 cm', price: 126000, image: 'https://images.unsplash.com/photo-1532323544230-7191fd510c59?auto=format&fit=crop&w=400&q=80', featured: true, new: false },
        { id: 2, cat: 'mesitas', name: 'Mesita Nórdica 3P', dimensions: '60x35x27 cm', price: 27000, image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80', featured: false, new: true },
        { id: 3, cat: 'racks', name: 'Rack TV Nórdico 1.60', dimensions: '160x60x30 cm', price: 94000, image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=400&q=80', featured: true, new: false },
        { id: 4, cat: 'racks', name: 'Bahiut Multifuncional', dimensions: '140x90x40 cm', price: 190000, image: 'https://images.unsplash.com/photo-1595514020173-066c91d4e9d9?auto=format&fit=crop&w=400&q=80', featured: false, new: false },
        { id: 5, cat: 'escritorios', name: 'Escritorio Nórdico', dimensions: '120x50 cm', price: 182000, image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&q=80', featured: true, new: false },
        { id: 6, cat: 'escritorios', name: 'Escritorio con Estantes', dimensions: 'Standard', price: 159000, image: 'https://images.unsplash.com/photo-1515542706656-8e6ef1763e38?auto=format&fit=crop&w=400&q=80', featured: false, new: true },
        { id: 7, cat: 'cocina', name: 'Bajo Mesada en L', dimensions: 'A medida', price: 1100000, image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=400&q=80', featured: true, new: false },
        { id: 8, cat: 'cocina', name: 'Alacena y Bajo', dimensions: '140 cm ancho', price: 340000, image: 'https://images.unsplash.com/photo-1484154218962-a197022b25ba?auto=format&fit=crop&w=400&q=80', featured: false, new: false },
        { id: 9, cat: 'roperos', name: 'Ropero 6 Puertas', dimensions: '230x180 cm', price: 850000, image: 'https://images.unsplash.com/photo-1595515106968-4319803d5264?auto=format&fit=crop&w=400&q=80', featured: true, new: false },
        { id: 10, cat: 'espejos', name: 'Espejo Cuerpo Entero', dimensions: '180x70 cm', price: 192000, image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=400&q=80', featured: false, new: true },
        { id: 11, cat: 'estanterias', name: 'Estantería Flotante', dimensions: '120x30 cm', price: 85000, image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=400&q=80', featured: false, new: false },
        { id: 12, cat: 'vanitory', name: 'Vanitory Suspendido', dimensions: '80x45 cm', price: 245000, image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=400&q=80', featured: true, new: false }
    ],

    testimonials: [
        {
            id: 1,
            name: 'María José L.',
            location: 'San Rafael',
            product: 'Mesa de Comedor',
            text: 'Excelente atención y calidad. La mesa de comedor quedó perfecta, justo como la imaginaba. Super recomendables.',
            rating: 5,
            date: '2024-11'
        },
        {
            id: 2,
            name: 'Carlos R.',
            location: 'Mendoza',
            product: 'Placard a Medida',
            text: 'El placard superó mis expectativas. Muy profesionales y cumplieron con los tiempos de entrega prometidos.',
            rating: 5,
            date: '2024-10'
        },
        {
            id: 3,
            name: 'Luciana M.',
            location: 'San Rafael',
            product: 'Living Completo',
            text: 'Hermosos muebles y muy buena comunicación durante todo el proceso. La calidad de los materiales es excelente.',
            rating: 5,
            date: '2024-09'
        },
        {
            id: 4,
            name: 'Pablo S.',
            location: 'General Alvear',
            product: 'Cocina Integral',
            text: 'La cocina quedó increíble. Calidad premium y diseño impecable. El equipo fue muy atento y profesional.',
            rating: 5,
            date: '2024-08'
        },
        {
            id: 5,
            name: 'Ana García',
            location: 'Malargüe',
            product: 'Escritorio + Mesitas',
            text: 'Compramos el escritorio y las mesitas de luz. Excelente terminación, muy buen precio y atención de primera.',
            rating: 5,
            date: '2024-07'
        }
    ],

    gallery: [
        { id: 1, src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', alt: 'Cocina moderna integral', category: 'cocina' },
        { id: 2, src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', alt: 'Living completo nórdico', category: 'living', featured: true },
        { id: 3, src: 'https://images.unsplash.com/photo-1595515106968-4319803d5264?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1595515106968-4319803d5264?w=400&q=80', alt: 'Vestidor placard', category: 'roperos' },
        { id: 4, src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80', alt: 'Sillón nórdico', category: 'living' },
        { id: 5, src: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80', alt: 'Mesa de centro', category: 'living' },
        { id: 6, src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80', alt: 'Escritorio home office', category: 'escritorios' }
    ],

    contact: {
        address: 'Av. Mitre 839, San Rafael, Mendoza',
        phone: '+5492604364497',
        phoneDisplay: '+54 9 260 436-4497',
        email: 'contacto@legadomuebles.com',
        hours: {
            weekdays: '9:00 - 13:00 / 17:00 - 21:00',
            saturday: '9:00 - 13:00',
            sunday: 'Cerrado'
        },
        social: {
            instagram: 'https://instagram.com/legadomuebles',
            facebook: 'https://facebook.com/legadomuebles',
            whatsapp: 'https://wa.me/5492604364497'
        },
        map: {
            lat: -34.6177,
            lng: -68.3301,
            zoom: 15
        }
    }
};

/* ═══════════════════════════════════════════════════════════════════════════════
   5. MODULES - Feature Modules
   ═══════════════════════════════════════════════════════════════════════════════ */

const ThemeModule = {
    init() {
        this.loadTheme();
        this.bindEvents();
        this.watchSystemPreference();
    },

    loadTheme() {
        const savedTheme = Utils.storage.get(CONFIG.STORAGE.THEME);
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (systemDark ? 'dark' : 'light');
        this.setTheme(theme, false);
    },

    setTheme(theme, save = true) {
        const root = document.documentElement;

        root.classList.remove('light', 'dark');
        root.classList.add(theme);

        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', theme === 'dark' ? '#0F1412' : '#F5F7F6');
        }

        if (save) {
            Utils.storage.set(CONFIG.STORAGE.THEME, theme);
        }

        AppStore.set('theme', theme);
    },

    toggle() {
        const current = AppStore.get('theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    },

    bindEvents() {
        const toggle = Utils.$(CONFIG.SELECTORS.themeToggle);
        toggle?.addEventListener('click', () => this.toggle());
    },

    watchSystemPreference() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (!Utils.storage.get(CONFIG.STORAGE.THEME)) {
                this.setTheme(e.matches ? 'dark' : 'light', false);
            }
        });
    }
};

const HeaderModule = {
    lastScrollY: 0,
    ticking: false,

    init() {
        this.header = Utils.$(CONFIG.SELECTORS.header);
        this.headerBg = Utils.$(CONFIG.SELECTORS.headerBg);

        if (!this.header) return;

        this.bindEvents();
        this.update();
    },

    bindEvents() {
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    },

    onScroll() {
        this.lastScrollY = window.scrollY;

        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.update();
                this.ticking = false;
            });
            this.ticking = true;
        }
    },

    update() {
        const scrollY = this.lastScrollY;

        if (scrollY > 50) {
            this.headerBg.style.opacity = '1';
            this.header.classList.add(CONFIG.CLASSES.scrolled);
        } else {
            this.headerBg.style.opacity = '0';
            this.header.classList.remove(CONFIG.CLASSES.scrolled);
        }

        const progress = Utils.getScrollPercentage();
        document.documentElement.style.setProperty('--scroll-progress', progress);

        AppStore.set('scrollY', scrollY);
    }
};

const MobileMenuModule = {
    init() {
        this.btn = Utils.$(CONFIG.SELECTORS.mobileMenuBtn);
        this.icon = Utils.$(CONFIG.SELECTORS.mobileMenuIcon);
        this.menu = Utils.$(CONFIG.SELECTORS.mobileMenu);

        if (!this.btn || !this.menu) return;

        this.bindEvents();
    },

    bindEvents() {
        this.btn.addEventListener('click', () => this.toggle());

        Utils.$$('a', this.menu).forEach(link => {
            link.addEventListener('click', () => this.close());
        });

        document.addEventListener('click', (e) => {
            if (AppStore.get('mobileMenuOpen') &&
                !this.menu.contains(e.target) &&
                !this.btn.contains(e.target)) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && AppStore.get('mobileMenuOpen')) {
                this.close();
            }
        });

        window.addEventListener('resize', Utils.debounce(() => {
            if (window.innerWidth >= CONFIG.BREAKPOINTS.lg && AppStore.get('mobileMenuOpen')) {
                this.close();
            }
        }, 150));
    },

    toggle() {
        AppStore.get('mobileMenuOpen') ? this.close() : this.open();
    },

    open() {
        this.menu.classList.remove('hidden');
        this.menu.classList.add(CONFIG.CLASSES.mobileMenuOpen);
        this.btn.setAttribute('aria-expanded', 'true');
        this.icon.textContent = 'close';
        document.body.style.overflow = 'hidden';
        AppStore.set('mobileMenuOpen', true);
    },

    close() {
        this.menu.classList.remove(CONFIG.CLASSES.mobileMenuOpen);
        setTimeout(() => this.menu.classList.add('hidden'), 300);
        this.btn.setAttribute('aria-expanded', 'false');
        this.icon.textContent = 'menu';
        document.body.style.overflow = '';
        AppStore.set('mobileMenuOpen', false);
    }
};

const SearchModule = {
    init() {
        this.btn = Utils.$(CONFIG.SELECTORS.searchBtn);
        this.modal = Utils.$(CONFIG.SELECTORS.searchModal);
        this.container = Utils.$(CONFIG.SELECTORS.searchContainer);
        this.input = Utils.$(CONFIG.SELECTORS.searchInput);
        this.results = Utils.$(CONFIG.SELECTORS.searchResults);
        this.closeBtn = Utils.$(CONFIG.SELECTORS.searchClose);

        if (!this.modal) return;

        this.bindEvents();
    },

    bindEvents() {
        this.btn?.addEventListener('click', () => this.open());
        this.closeBtn?.addEventListener('click', () => this.close());

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && AppStore.get('searchModalOpen')) {
                this.close();
            }
        });

        this.input?.addEventListener('input', Utils.debounce((e) => {
            this.search(e.target.value);
        }, 200));
    },

    toggle() {
        AppStore.get('searchModalOpen') ? this.close() : this.open();
    },

    open() {
        this.modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            this.modal.classList.add('opacity-100');
            this.container.classList.add('scale-100');
        });
        this.input?.focus();
        document.body.style.overflow = 'hidden';
        AppStore.set('searchModalOpen', true);
    },

    close() {
        this.modal.classList.remove('opacity-100');
        this.container.classList.remove('scale-100');
        this.container.classList.add('scale-95');
        setTimeout(() => {
            this.modal.classList.add('hidden');
            this.container.classList.remove('scale-95');
        }, 300);
        document.body.style.overflow = '';
        if (this.input) this.input.value = '';
        this.renderEmptyState();
        AppStore.set('searchModalOpen', false);
    },

    search(query) {
        const normalized = Utils.normalizeString(query);

        if (!normalized) {
            this.renderEmptyState();
            return;
        }

        const results = Data.products.filter(product => {
            const name = Utils.normalizeString(product.name);
            const cat = Utils.normalizeString(product.cat);
            return name.includes(normalized) || cat.includes(normalized);
        });

        this.renderResults(results, query);
    },

    renderEmptyState() {
        this.results.innerHTML = `
            <p class="text-center text-gray-500 dark:text-gray-400 py-12">
                <span class="material-symbols-outlined text-4xl mb-3 block opacity-50" aria-hidden="true">search</span>
                Escribí para buscar productos...
            </p>
        `;
    },

    renderResults(results, query) {
        if (results.length === 0) {
            this.results.innerHTML = `
                <p class="text-center text-gray-500 dark:text-gray-400 py-12">
                    <span class="material-symbols-outlined text-4xl mb-3 block opacity-50" aria-hidden="true">search_off</span>
                    No se encontraron resultados para "${Utils.escapeHtml(query)}"
                </p>
            `;
            return;
        }

        this.results.innerHTML = results.map(product => `
            <a href="#productos" 
               class="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
               onclick="SearchModule.close(); ProductsModule.filterByCategory('${product.cat}');">
                <img src="${product.image}" alt="${product.name}" class="w-16 h-16 object-cover rounded-lg" loading="lazy">
                <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-900 dark:text-white truncate">${product.name}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${product.dimensions}</p>
                    <p class="text-sm font-bold text-primary-600 dark:text-secondary-400">${Utils.formatCurrency(product.price)}</p>
                </div>
                <span class="material-symbols-outlined text-gray-400" aria-hidden="true">arrow_forward</span>
            </a>
        `).join('');
    }
};

const ProductsModule = {
    init() {
        this.pillsContainer = Utils.$(CONFIG.SELECTORS.categoryPills);
        this.grid = Utils.$(CONFIG.SELECTORS.productsGrid);
        this.loadMoreBtn = Utils.$(CONFIG.SELECTORS.loadMoreBtn);
        this.searchInput = Utils.$(CONFIG.SELECTORS.productSearch);
        this.sortSelect = Utils.$(CONFIG.SELECTORS.sortSelect);

        if (!this.grid) return;

        this.renderCategories();
        this.renderProducts();
        this.bindEvents();
    },

    bindEvents() {
        this.searchInput?.addEventListener('input', Utils.debounce((e) => {
            AppStore.set('searchQuery', e.target.value);
            AppStore.set('productsPage', 1);
            this.renderProducts();
        }, CONFIG.DEBOUNCE_DELAY));

        this.sortSelect?.addEventListener('change', (e) => {
            AppStore.set('sortBy', e.target.value);
            this.renderProducts();
        });

        this.loadMoreBtn?.addEventListener('click', () => {
            const currentPage = AppStore.get('productsPage');
            AppStore.set('productsPage', currentPage + 1);
            this.renderProducts(true);
        });
    },

    filterByCategory(category) {
        AppStore.set('currentCategory', category);
        AppStore.set('productsPage', 1);
        this.updatePillsUI(category);
        this.renderProducts();
        Utils.scrollTo('#productos');
    },

    getFilteredProducts() {
        const category = AppStore.get('currentCategory');
        const search = Utils.normalizeString(AppStore.get('searchQuery'));
        const sortBy = AppStore.get('sortBy');

        let products = category === 'all'
            ? [...Data.products]
            : Data.products.filter(p => p.cat === category);

        if (search) {
            products = products.filter(p => {
                const name = Utils.normalizeString(p.name);
                const cat = Utils.normalizeString(p.cat);
                return name.includes(search) || cat.includes(search);
            });
        }

        switch (sortBy) {
            case 'price-asc':
                products.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                products.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                products.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'featured':
            default:
                products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        }

        return products;
    },

    renderCategories() {
        if (!this.pillsContainer) return;

        const categories = [
            { id: 'all', name: 'Todos', icon: 'grid_view' },
            ...Data.categories
        ];

        this.pillsContainer.innerHTML = categories.map(cat => `
            <button class="c-pill ${cat.id === 'all' ? CONFIG.CLASSES.pillActive : ''}" 
                    role="tab"
                    aria-selected="${cat.id === 'all'}"
                    data-category="${cat.id}">
                <span class="material-symbols-outlined" aria-hidden="true">${cat.icon}</span>
                ${cat.name}
            </button>
        `).join('');

        Utils.$$('button', this.pillsContainer).forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                this.filterByCategory(category);
            });
        });
    },

    updatePillsUI(activeCategory) {
        Utils.$$('button', this.pillsContainer).forEach(btn => {
            const isActive = btn.dataset.category === activeCategory;
            btn.classList.toggle(CONFIG.CLASSES.pillActive, isActive);
            btn.setAttribute('aria-selected', isActive);
        });
    },

    renderProducts(append = false) {
        const products = this.getFilteredProducts();
        const page = AppStore.get('productsPage');
        const perPage = CONFIG.PRODUCTS_PER_PAGE;
        const paginated = products.slice(0, page * perPage);
        const hasMore = paginated.length < products.length;

        if (this.loadMoreBtn) {
            this.loadMoreBtn.style.display = hasMore ? 'inline-flex' : 'none';
        }

        if (products.length === 0) {
            this.grid.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <span class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 block mb-4" aria-hidden="true">search_off</span>
                    <p class="text-gray-500 dark:text-gray-400 mb-4">No se encontraron productos</p>
                    <button onclick="ProductsModule.filterByCategory('all')" class="c-btn c-btn--outline">
                        Ver todos los productos
                    </button>
                </div>
            `;
            return;
        }

        const cardsHtml = paginated.map((product, index) => this.renderProductCard(product, index)).join('');

        if (append) {
            this.grid.insertAdjacentHTML('beforeend', cardsHtml);
        } else {
            this.grid.innerHTML = cardsHtml;
        }

        this.animateCards();
    },

    renderProductCard(product, index) {
        return `
            <article class="c-card c-card--hover reveal stagger-${(index % 4) + 1}" 
                     data-product-id="${product.id}"
                     role="listitem">
                <div class="c-card__image cursor-pointer" 
                     onclick="LightboxModule.open('${product.image}', '${Utils.escapeHtml(product.name)}')">
                    <img src="${product.image}" 
                         alt="${product.name}"
                         loading="lazy"
                         decoding="async">
                    <div class="c-card__overlay">
                        <span class="material-symbols-outlined c-card__zoom" aria-hidden="true">zoom_in</span>
                    </div>
                    ${product.featured ? '<span class="c-badge c-badge--secondary absolute top-3 left-3">Destacado</span>' : ''}
                    ${product.new ? '<span class="c-badge c-badge--primary absolute top-3 right-3">Nuevo</span>' : ''}
                </div>
                <div class="c-card__body">
                    <div class="flex items-start justify-between gap-2 mb-2">
                        <h3 class="c-card__title">${product.name}</h3>
                        <button class="c-chip" onclick="ProductsModule.consultWhatsApp('${Utils.escapeHtml(product.name)}')">
                            <span class="material-symbols-outlined text-sm" aria-hidden="true">chat</span>
                            Consultar
                        </button>
                    </div>
                    <p class="c-card__meta">${product.dimensions}</p>
                    <p class="c-card__price">${Utils.formatCurrency(product.price)}</p>
                </div>
            </article>
        `;
    },

    animateCards() {
        if (Utils.prefersReducedMotion()) return;

        const cards = Utils.$$('.reveal:not(.reveal--visible)', this.grid);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(CONFIG.CLASSES.revealed);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        cards.forEach(card => observer.observe(card));
    },

    consultWhatsApp(productName) {
        const message = `Hola Legado Muebles, me interesa el producto: *${productName}*. ¿Tienen stock y disponibilidad?`;
        window.open(Utils.getWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
    }
};

const TestimonialsModule = {
    autoplayInterval: null,

    init() {
        this.container = Utils.$(CONFIG.SELECTORS.testimonialsCarousel);
        this.prevBtn = Utils.$(CONFIG.SELECTORS.testimonialPrev);
        this.nextBtn = Utils.$(CONFIG.SELECTORS.testimonialNext);

        if (!this.container) return;

        this.render();
        this.bindEvents();
        this.startAutoplay();
    },

    render() {
        this.container.innerHTML = Data.testimonials.map(t => `
            <article class="c-testimonial" role="listitem">
                <div class="c-testimonial__stars" aria-label="${t.rating} estrellas">
                    ${'<span class="material-symbols-outlined" style="font-variation-settings: \'FILL\' 1;" aria-hidden="true">star</span>'.repeat(t.rating)}
                </div>
                <blockquote class="c-testimonial__text">"${t.text}"</blockquote>
                <footer class="c-testimonial__author">
                    <div class="c-testimonial__avatar" aria-hidden="true">
                        ${t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <cite class="c-testimonial__name">${t.name}</cite>
                        <p class="c-testimonial__location">${t.location} · ${t.product}</p>
                    </div>
                </footer>
            </article>
        `).join('');
    },

    bindEvents() {
        this.prevBtn?.addEventListener('click', () => this.prev());
        this.nextBtn?.addEventListener('click', () => this.next());

        this.container.addEventListener('mouseenter', () => this.stopAutoplay());
        this.container.addEventListener('mouseleave', () => this.startAutoplay());
        this.container.addEventListener('focusin', () => this.stopAutoplay());
        this.container.addEventListener('focusout', () => this.startAutoplay());
    },

    prev() {
        this.container.scrollBy({ left: -400, behavior: 'smooth' });
    },

    next() {
        this.container.scrollBy({ left: 400, behavior: 'smooth' });
    },

    startAutoplay() {
        if (Utils.prefersReducedMotion()) return;

        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => this.next(), 5000);
    },

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
};

const GalleryModule = {
    init() {
        this.grid = Utils.$(CONFIG.SELECTORS.galleryGrid);

        if (!this.grid) return;

        this.render();
    },

    render() {
        this.grid.innerHTML = Data.gallery.map((item, index) => `
            <div class="group relative ${item.featured ? 'md:col-span-2 md:row-span-2' : ''} aspect-square rounded-2xl overflow-hidden cursor-pointer reveal stagger-${(index % 4) + 1}"
                 onclick="LightboxModule.open('${item.src}', '${Utils.escapeHtml(item.alt)}')"
                 role="button"
                 tabindex="0"
                 aria-label="Ver imagen: ${item.alt}">
                <img src="${item.thumb}" 
                     alt="${item.alt}" 
                     class="w-full h-full object-cover img-zoom"
                     loading="lazy"
                     decoding="async">
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <span class="material-symbols-outlined text-white ${item.featured ? 'text-4xl' : 'text-3xl'} opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all" aria-hidden="true">zoom_in</span>
                </div>
            </div>
        `).join('');

        ScrollRevealModule.observeElements(this.grid);
    }
};

const ContactModule = {
    init() {
        this.container = Utils.$(CONFIG.SELECTORS.contactCards);

        if (!this.container) return;

        this.render();
    },

    render() {
        const { address, phoneDisplay, hours } = Data.contact;

        this.container.innerHTML = `
            <div class="bg-white dark:bg-neutral-surface-dark p-8 rounded-2xl border border-gray-100 dark:border-gray-800 text-center card-lift reveal stagger-1">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-5">
                    <span class="material-symbols-outlined text-3xl text-primary-600 dark:text-primary-400" aria-hidden="true">location_on</span>
                </div>
                <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">Ubicación</h3>
                <p class="text-gray-500 dark:text-gray-400">${address}</p>
                <a href="https://maps.google.com/?q=${encodeURIComponent(address)}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 font-semibold mt-4 hover:underline">
                    Ver en mapa
                    <span class="material-symbols-outlined text-sm" aria-hidden="true">open_in_new</span>
                </a>
            </div>
            
            <div class="bg-white dark:bg-neutral-surface-dark p-8 rounded-2xl border border-gray-100 dark:border-gray-800 text-center card-lift reveal stagger-2">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-5">
                    <span class="material-symbols-outlined text-3xl text-primary-600 dark:text-primary-400" aria-hidden="true">schedule</span>
                </div>
                <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">Horarios</h3>
                <p class="text-gray-500 dark:text-gray-400">Lunes a Viernes<br>${hours.weekdays}</p>
                <p class="text-gray-500 dark:text-gray-400 mt-2">Sábados: ${hours.saturday}</p>
            </div>
            
            <div class="bg-white dark:bg-neutral-surface-dark p-8 rounded-2xl border border-gray-100 dark:border-gray-800 text-center card-lift reveal stagger-3">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-5">
                    <span class="material-symbols-outlined text-3xl text-primary-600 dark:text-primary-400" aria-hidden="true">call</span>
                </div>
                <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">Teléfono</h3>
                <p class="text-gray-500 dark:text-gray-400">WhatsApp / Llamadas</p>
                <a href="tel:${Data.contact.phone}" class="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-lg mt-4 hover:underline">
                    ${phoneDisplay}
                </a>
            </div>
        `;

        ScrollRevealModule.observeElements(this.container);
    }
};

const FormModule = {
    init() {
        this.form = Utils.$(CONFIG.SELECTORS.quoteForm);

        if (!this.form) return;

        this.render();
        this.bindEvents();
        this.loadSavedData();
    },

    render() {
        this.form.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <label for="form-nombre" class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Nombre completo <span class="text-error" aria-hidden="true">*</span>
                    </label>
                    <input type="text" 
                           id="form-nombre" 
                           name="nombre" 
                           required 
                           autocomplete="name"
                           class="c-input"
                           placeholder="Tu nombre">
                </div>
                <div class="space-y-2">
                    <label for="form-whatsapp" class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        WhatsApp <span class="text-error" aria-hidden="true">*</span>
                    </label>
                    <input type="tel" 
                           id="form-whatsapp" 
                           name="whatsapp" 
                           required 
                           autocomplete="tel"
                           class="c-input"
                           placeholder="Ej: 2604...">
                </div>
            </div>
            
            <div class="space-y-2">
                <label for="form-interes" class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    ¿Qué te interesa? <span class="text-error" aria-hidden="true">*</span>
                </label>
                <select id="form-interes" 
                        name="interes" 
                        required 
                        class="c-input">
                    <option value="">Seleccionar...</option>
                    <option value="Muebles de Cocina">Muebles de Cocina / Bajo Mesada</option>
                    <option value="Placard / Ropero">Placard / Ropero / Vestidor</option>
                    <option value="Rack TV">Rack TV / Mueble de Living</option>
                    <option value="Mesitas de Luz">Mesitas de Luz</option>
                    <option value="Escritorio">Escritorio / Home Office</option>
                    <option value="Mesa de Comedor">Mesa de Comedor</option>
                    <option value="Vanitory">Vanitory / Baño</option>
                    <option value="Otro">Otro / Proyecto especial</option>
                </select>
            </div>
            
            <div class="space-y-2">
                <label for="form-mensaje" class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Contanos más <span class="text-gray-400">(opcional)</span>
                </label>
                <textarea id="form-mensaje" 
                          name="mensaje" 
                          rows="4" 
                          class="c-input resize-none"
                          placeholder="Medidas aproximadas, materiales preferidos, presupuesto..."></textarea>
            </div>
            
            <button type="submit" 
                    id="form-submit"
                    class="c-btn c-btn--primary c-btn--lg c-btn--shine w-full">
                <span>Solicitar Asesoramiento</span>
                <span class="material-symbols-outlined" aria-hidden="true">send</span>
            </button>
            
            <p class="text-center text-xs text-gray-500 dark:text-gray-400">
                Al enviar, aceptás ser contactado por WhatsApp. Respondemos en menos de 24hs.
            </p>
        `;
    },

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        Utils.$$('input, select, textarea', this.form).forEach(field => {
            field.addEventListener('change', () => this.saveFormData());
        });
    },

    loadSavedData() {
        const savedData = Utils.storage.get(CONFIG.STORAGE.FORM_DATA, {});

        Object.entries(savedData).forEach(([name, value]) => {
            const field = this.form.querySelector(`[name="${name}"]`);
            if (field) field.value = value;
        });
    },

    saveFormData() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        Utils.storage.set(CONFIG.STORAGE.FORM_DATA, data);
    },

    handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(this.form);
        const nombre = formData.get('nombre');
        const whatsapp = formData.get('whatsapp');
        const interes = formData.get('interes');
        const mensaje = formData.get('mensaje');

        const wppMessage = `Hola Legado Muebles, soy *${nombre}*.

📦 Me interesa: *${interes}*
${mensaje ? `\n💬 Mensaje: ${mensaje}` : ''}

📱 Mi WhatsApp: ${whatsapp}`;

        Utils.storage.remove(CONFIG.STORAGE.FORM_DATA);

        window.open(Utils.getWhatsAppUrl(wppMessage), '_blank', 'noopener,noreferrer');

        ToastModule.show('¡Mensaje enviado! Te redirigimos a WhatsApp.', 'success');

        this.form.reset();
    }
};

/* ═══════════════════════════════════════════════════════════════════════════════
   6. COMPONENTS - UI Components
   ═══════════════════════════════════════════════════════════════════════════════ */

const LightboxModule = {
    init() {
        this.lightbox = Utils.$(CONFIG.SELECTORS.lightbox);
        this.image = Utils.$(CONFIG.SELECTORS.lightboxImg);
        this.closeBtn = Utils.$(CONFIG.SELECTORS.lightboxClose);

        if (!this.lightbox) return;

        this.bindEvents();
    },

    bindEvents() {
        this.closeBtn?.addEventListener('click', () => this.close());

        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && AppStore.get('lightboxOpen')) {
                this.close();
            }
        });
    },

    open(src, alt = '') {
        this.image.src = src;
        this.image.alt = alt;
        this.lightbox.classList.add(CONFIG.CLASSES.lightboxActive);
        document.body.style.overflow = 'hidden';

        AppStore.setMany({
            lightboxOpen: true,
            lightboxImage: src,
            lightboxAlt: alt
        });
    },

    close() {
        this.lightbox.classList.remove(CONFIG.CLASSES.lightboxActive);
        document.body.style.overflow = '';

        AppStore.setMany({
            lightboxOpen: false,
            lightboxImage: null,
            lightboxAlt: ''
        });

        setTimeout(() => {
            this.image.src = '';
            this.image.alt = '';
        }, 300);
    }
};

const ToastModule = {
    init() {
        this.toast = Utils.$(CONFIG.SELECTORS.toast);
        this.timeout = null;
    },

    show(message, type = 'default', duration = CONFIG.TOAST_DURATION) {
        if (!this.toast) return;

        this.toast.textContent = message;
        this.toast.dataset.type = type;
        this.toast.classList.add(CONFIG.CLASSES.toastShow);

        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.hide(), duration);
    },

    hide() {
        if (!this.toast) return;
        this.toast.classList.remove(CONFIG.CLASSES.toastShow);
    }
};

const ScrollRevealModule = {
    observer: null,

    init() {
        if (Utils.prefersReducedMotion()) {
            Utils.$$('.reveal').forEach(el => el.classList.add(CONFIG.CLASSES.revealed));
            return;
        }

        this.createObserver();
        this.observeElements();
    },

    createObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(CONFIG.CLASSES.revealed);
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
    },

    observeElements(container = document) {
        if (!this.observer) return;

        const elements = Utils.$$('.reveal, .reveal-left, .reveal-right, .reveal-scale', container);
        elements.forEach(el => this.observer.observe(el));
    }
};

const SmoothScrollModule = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        Utils.$$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');

                if (href && href !== '#') {
                    e.preventDefault();
                    Utils.scrollTo(href);

                    if (AppStore.get('mobileMenuOpen')) {
                        MobileMenuModule.close();
                    }
                }
            });
        });
    }
};

const FooterModule = {
    init() {
        this.renderSocial();
        this.updateYear();
    },

    renderSocial() {
        const container = Utils.$(CONFIG.SELECTORS.footerSocial);
        if (!container) return;

        container.innerHTML = `
            <a href="${Data.contact.social.instagram}" target="_blank" rel="noopener noreferrer" 
               class="w-11 h-11 bg-white/10 hover:bg-primary-500 rounded-full flex items-center justify-center transition-all" 
               aria-label="Instagram">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 2.695.272.272 2.695.072 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.357 2.623 6.78 6.98 6.98C8.332 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.357-.2 6.78-2.623 6.98-6.98.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.668-.072-4.948-.2-4.357-2.623-6.78-6.98-6.98C15.668.014 15.259 0 12 0z"/></svg>
            </a>
            <a href="${Data.contact.social.facebook}" target="_blank" rel="noopener noreferrer" 
               class="w-11 h-11 bg-white/10 hover:bg-[#3b5998] rounded-full flex items-center justify-center transition-all" 
               aria-label="Facebook">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="${Data.contact.social.whatsapp}" target="_blank" rel="noopener noreferrer" 
               class="w-11 h-11 bg-white/10 hover:bg-[#25D366] rounded-full flex items-center justify-center transition-all" 
               aria-label="WhatsApp">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.099 3.2 5.086 4.487.711.307 1.267.491 1.7.63.714.227 1.365.195 1.88.118.574-.085 1.758-.718 2.006-1.412.248-.694.248-1.289.173-1.412-.074-.123-.272-.198-.57-.347zM12.003 2C6.479 2 2 6.477 2 11.997c0 1.993.522 3.953 1.51 5.67L2 22l4.42-1.478c1.648.9 3.493 1.378 5.58 1.378h.003c5.523 0 10.003-4.477 10.003-9.997C21.998 6.477 17.526 2 12.003 2z"/></svg>
            </a>
        `;
    },

    updateYear() {
        const yearEl = Utils.$(CONFIG.SELECTORS.currentYear);
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    }
};

const NetworkModule = {
    init() {
        this.banner = Utils.$('#offline-banner');
        this.bindEvents();
        this.checkStatus();
    },

    bindEvents() {
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    },

    checkStatus() {
        if (!navigator.onLine) {
            this.handleOffline();
        }
    },

    handleOnline() {
        AppStore.set('isOnline', true);
        this.banner?.classList.add('hidden');
        ToastModule.show('Conexión restaurada', 'success');
    },

    handleOffline() {
        AppStore.set('isOnline', false);
        this.banner?.classList.remove('hidden');
    }
};

/* ═══════════════════════════════════════════════════════════════════════════════
   7. INIT - Application Bootstrap
   ═══════════════════════════════════════════════════════════════════════════════ */

const App = {
    modules: [
        ThemeModule,
        HeaderModule,
        MobileMenuModule,
        SearchModule,
        ProductsModule,
        TestimonialsModule,
        GalleryModule,
        ContactModule,
        FormModule,
        LightboxModule,
        ToastModule,
        ScrollRevealModule,
        SmoothScrollModule,
        FooterModule,
        NetworkModule
    ],

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bootstrap());
        } else {
            this.bootstrap();
        }
    },

    bootstrap() {
        const startTime = performance.now();

        console.log('%c🪑 Legado Muebles', 'font-size: 24px; font-weight: bold; color: #2E5C48;');
        console.log('%cInitializing application...', 'color: #6b7a73;');

        this.modules.forEach(module => {
            try {
                if (typeof module.init === 'function') {
                    module.init();
                }
            } catch (error) {
                console.error(`Error initializing module:`, error);
            }
        });

        window.ProductsModule = ProductsModule;
        window.LightboxModule = LightboxModule;
        window.SearchModule = SearchModule;

        const endTime = performance.now();
        console.log(`%c✓ App ready in ${(endTime - startTime).toFixed(2)}ms`, 'color: #22c55e; font-weight: bold;');
    }
};

App.init();

/* ═══════════════════════════════════════════════════════════════════════════════
   8. SERVICE WORKER REGISTRATION (PWA)
   ═══════════════════════════════════════════════════════════════════════════════ */

// Uncomment to enable PWA
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('ServiceWorker registered:', registration.scope);
        } catch (error) {
            console.log('ServiceWorker registration failed:', error);
        }
    });
}
*/

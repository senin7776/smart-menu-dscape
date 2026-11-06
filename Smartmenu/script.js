/* ===========================
   NAVBAR SCROLL EFFECT
   =========================== */
const navbar = document.getElementById('navbar') || document.getElementById('main-navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ===========================
   ACTIVE NAV LINK
   =========================== */
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.nav-links .nav-link');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObserver.observe(s));

/* ===========================
   SCROLL REVEAL ANIMATION
   =========================== */
const revealElements = document.querySelectorAll(
  '.step-card, .feature-card, .feature-small, .ar-menu-item, .marquee-names span, .section-title, .features-title, .ar-demo-title, .story-card, .testimonial-card, .cta-card'
);

revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach(el => revealObserver.observe(el));

/* ===========================
   AR DISH SWITCHER (LANDING PAGE)
   =========================== */
const arMenuItems = document.querySelectorAll('.ar-menu-item');
const arPhoneImg  = document.getElementById('ar-phone-img');
const arDishName  = document.getElementById('ar-dish-name');
const arDishPrice = document.getElementById('ar-dish-price');

const dishData = [
  { img: 'saffron_butter_chicken.png', name: 'Saffron Butter Chicken', price: '₹680' },
  { img: 'wild_mushroom_pasta.png',    name: 'Wild Mushroom Pasta',    price: '₹520' },
  { img: 'garden_burrata_bowl.png',    name: 'Garden Burrata Bowl',    price: '₹460' },
];

arMenuItems.forEach((item, i) => {
  item.addEventListener('click', () => {
    arMenuItems.forEach(m => m.classList.remove('active'));
    item.classList.add('active');
    if (arPhoneImg && dishData[i]) {
      arPhoneImg.style.opacity = '0';
      setTimeout(() => {
        arPhoneImg.src = dishData[i].img;
        arPhoneImg.alt = dishData[i].name;
        arPhoneImg.style.opacity = '1';
      }, 250);
    }
    if (arDishName  && dishData[i]) arDishName.textContent  = dishData[i].name;
    if (arDishPrice && dishData[i]) arDishPrice.textContent = dishData[i].price;
  });
});

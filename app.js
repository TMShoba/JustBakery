const PRODUCTS = [
  { id: 1, name: 'Sourdough Loaf', cat: 'Bread', price: 65, emoji: '🍞', tag: 'Bestseller', desc: '48-hour ferment, crackly crust, tender crumb.' },
  { id: 2, name: 'Seeded Rye', cat: 'Bread', price: 70, emoji: '🥖', desc: 'Dense, nutty and packed with seeds.' },
  { id: 3, name: 'Butter Croissant', cat: 'Pastry', price: 38, emoji: '🥐', tag: 'Fresh daily', desc: 'Laminated by hand with real butter.' },
  { id: 4, name: 'Cinnamon Swirl', cat: 'Pastry', price: 42, emoji: '🌀', desc: 'Soft, sticky and finished with cream-cheese glaze.' },
  { id: 5, name: 'Double Choc Brownie', cat: 'Sweet', price: 45, emoji: '🍫', tag: 'Bestseller', desc: 'Fudgy centre, crisp top, dark chocolate chunks.' },
  { id: 6, name: 'Chocolate Chip Cookies (6)', cat: 'Sweet', price: 85, emoji: '🍪', desc: 'Brown butter, sea salt, still gooey inside.' },
  { id: 7, name: 'Vanilla Cupcakes (4)', cat: 'Cakes', price: 95, emoji: '🧁', desc: 'Vanilla bean sponge with buttercream swirl.' },
  { id: 8, name: 'Red Velvet Cake', cat: 'Cakes', price: 420, emoji: '🍰', desc: 'Serves 8–10. Cream-cheese frosting.' },
];

const FREE_DELIVERY_AT = 500, DELIVERY_FEE = 50;
const $ = s => document.querySelector(s);
const rand = n => 'R' + n.toLocaleString('en-ZA');
let cart = {};
try { cart = JSON.parse(localStorage.getItem('just-cart')) || {}; } catch {}
let filter = 'All';

const save = () => { try { localStorage.setItem('just-cart', JSON.stringify(cart)); } catch {} };

function renderFilters() {
  const cats = ['All', ...new Set(PRODUCTS.map(p => p.cat))];
  $('#filters').innerHTML = cats.map(c =>
    `<button class="chip" role="tab" aria-selected="${c === filter}" data-c="${c}">${c}</button>`).join('');
}
function renderGrid() {
  $('#grid').innerHTML = PRODUCTS.filter(p => filter === 'All' || p.cat === filter).map(p => `
    <article class="card">
      <div class="thumb" aria-hidden="true">${p.emoji}${p.tag ? `<span class="tag">${p.tag}</span>` : ''}</div>
      <div class="card-body">
        <h3>${p.name}</h3><p>${p.desc}</p>
        <div class="card-foot"><span class="price">${rand(p.price)}</span>
          <button class="add" data-id="${p.id}" aria-label="Add ${p.name} to cart">Add to cart</button></div>
      </div>
    </article>`).join('');
}
function totals() {
  const sub = Object.entries(cart).reduce((s, [id, q]) => s + PRODUCTS.find(p => p.id == id).price * q, 0);
  const del = sub === 0 || sub >= FREE_DELIVERY_AT ? 0 : DELIVERY_FEE;
  return { sub, del, total: sub + del };
}
function renderCart() {
  const ids = Object.keys(cart);
  $('#cartCount').textContent = ids.reduce((s, id) => s + cart[id], 0);
  $('#cartItems').innerHTML = ids.length ? ids.map(id => {
    const p = PRODUCTS.find(x => x.id == id), q = cart[id];
    return `<div class="line"><div class="em">${p.emoji}</div>
      <div><b>${p.name}</b><br><small>${rand(p.price)}</small>
        <div class="qty"><button data-d="-1" data-id="${id}" aria-label="Decrease">−</button><span>${q}</span><button data-d="1" data-id="${id}" aria-label="Increase">+</button></div></div>
      <div style="text-align:right"><b>${rand(p.price * q)}</b><br><button class="rm" data-rm="${id}">Remove</button></div></div>`;
  }).join('') : '<p class="empty">Your cart is empty.</p>';
  const t = totals();
  $('#subtotal').textContent = rand(t.sub);
  $('#delivery').textContent = t.sub && !t.del ? 'Free' : rand(t.del);
  $('#total').textContent = rand(t.total);
  $('#checkoutBtn').disabled = !ids.length;
  $('#checkoutBtn').style.opacity = ids.length ? 1 : .4;
  save();
}
const openDrawer = on => {
  $('#drawer').classList.toggle('on', on);
  $('#overlay').classList.toggle('on', on);
  $('#drawer').setAttribute('aria-hidden', !on);
};

$('#filters').addEventListener('click', e => {
  const c = e.target.closest('.chip'); if (!c) return;
  filter = c.dataset.c; renderFilters(); renderGrid();
});
$('#grid').addEventListener('click', e => {
  const b = e.target.closest('.add'); if (!b) return;
  cart[b.dataset.id] = (cart[b.dataset.id] || 0) + 1;
  renderCart(); openDrawer(true);
});
$('#cartItems').addEventListener('click', e => {
  const d = e.target.closest('[data-d]'), r = e.target.closest('[data-rm]');
  if (d) { const id = d.dataset.id; cart[id] += +d.dataset.d; if (cart[id] <= 0) delete cart[id]; }
  if (r) delete cart[r.dataset.rm];
  renderCart();
});
$('#openCart').onclick = () => openDrawer(true);
$('#closeCart').onclick = $('#overlay').onclick = () => openDrawer(false);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { openDrawer(false); closeCheckout(); } });

function closeCheckout() { $('#checkout').hidden = true; }
$('#checkoutBtn').onclick = () => {
  openDrawer(false);
  $('#coTotal').textContent = rand(totals().total);
  $('#checkoutForm').hidden = false; $('#orderDone').hidden = true;
  const tom = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  $('#checkoutForm [name=date]').min = tom;
  $('#checkout').hidden = false;
};
$('#closeCheckout').onclick = closeCheckout;
$('#checkoutForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target), ref = 'JB-' + Math.floor(1000 + Math.random() * 9000);
  $('#doneMsg').textContent = `Order ${ref} received for ${f.get('name')}. We'll confirm by email to ${f.get('email')} and deliver on ${f.get('date')}.`;
  cart = {}; renderCart(); e.target.reset();
  $('#checkoutForm').hidden = true; $('#orderDone').hidden = false;
});
$('#doneClose').onclick = closeCheckout;

$('#yr').textContent = new Date().getFullYear();
renderFilters(); renderGrid(); renderCart();

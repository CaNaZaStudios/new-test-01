const apiKey = '7b51dfa5081149e8a891de32f81b555e';

const selectedGames = [
    "half-life",
    "half-life-2",
    "half-life-alyx",
    "counter-strike",
    "counter-strike-2-2",
    "left-4-dead-2",
    "left-4-dead",
    "call-of-duty-wwii",
    "call-of-duty-black-ops-6",
    "call-of-duty-vanguard"
];

// Precios personalizados por juego
const pricesPerSlug = {
    "half-life": 3.99,
    "half-life-2": 5.99,
    "half-life-alyx": 29.99,
    "counter-strike": 2.99,
    "counter-strike-2-2": 6.99,
    "left-4-dead-2": 3.99,
    "left-4-dead": 1.99,
    "call-of-duty-wwii": 49.99,
    "call-of-duty-black-ops-6": 69.99,
    "call-of-duty-vanguard": 49.99
};

let cart = [];

const container = document.getElementById('game-container');

// Cargamos carrito desde localStorage si existe
loadCartFromStorage();

// Cargamos juegos desde caché si existe
const cache = localStorage.getItem("gamesRAWG");

if (cache) {
    const games = JSON.parse(cache);
    showGames(games);
} else {
    const promises = selectedGames.map(slug => {
        const url = `https://api.rawg.io/api/games/${slug}?key=${apiKey}`;
        return fetch(url).then(res => res.json());
    });

    Promise.all(promises)
        .then(games => {
            localStorage.setItem("gamesRAWG", JSON.stringify(games));
            showGames(games);
        })
        .catch(err => console.error("Error fetching RAWG data:", err));
}

// Muestra las cards de los juegos
function showGames(games) {
    games.forEach(game => {
        const slug = game.slug;
        const price = pricesPerSlug[slug] !== undefined ? `$${pricesPerSlug[slug].toFixed(2)}` : "Not available";

        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <h3>${game.name}</h2>
            ${game.background_image ? `<img src="${game.background_image}" alt="${game.name}">` : ''}
            <p>Fecha de lanzamiento: ${game.released || 'Unknown'}</p>
            <p>Clasificación: ${game.rating} ⭐</p>
            <p>Pricio: ${price}</p>
            <button onclick="addToCart('${slug}', '${game.name}', ${pricesPerSlug[slug]})">Comprar</button>
        `;
        container.appendChild(card);
    });
}

// Agrega un juego al carrito (incrementa si ya existe)
function addToCart(slug, name, price) {
    const existing = cart.find(item => item.slug === slug);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ slug, name, price, quantity: 1 });
    }

    updateCart();
}

// Actualiza el DOM del carrito y guarda en localStorage
function updateCart() {
    const list = document.getElementById("cart-list");
    const totalElement = document.getElementById("cart-total");

    list.innerHTML = "";

    let total = 0;

    cart.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
        list.appendChild(li);
        total += item.price * item.quantity;
    });

    totalElement.textContent = `Total: $${total.toFixed(2)}`;
    localStorage.setItem("cartRAWG", JSON.stringify(cart));
}

// Vacía el carrito
function emptyCart() {
    cart = [];
    updateCart();
    localStorage.removeItem("cartRAWG");
}

// Carga el carrito desde localStorage si existe
function loadCartFromStorage() {
    const savedCart = localStorage.getItem("cartRAWG");

    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}
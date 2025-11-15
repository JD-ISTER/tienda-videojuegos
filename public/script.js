const API_BASE = 'https://www.cheapshark.com/api/1.0';

let currentPage = 0;
let currentGames = [];

const gamesGrid = document.getElementById('gamesGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const storeFilter = document.getElementById('storeFilter');
const sortSelect = document.getElementById('sortSelect');

// Funcion para obtener los juegos
async function fetchGames(page = 0, store = '', search = '') {
  try {
    showLoading();
    const endpoint = search
      ? `/games?title=${encodeURIComponent(search)}&limit=20`
      : `/deals?storeID=${store || 1}&pageSize=20&pageNumber=${page}`;
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) throw new Error('Error de API');
    const data = await response.json();
    currentGames = [...currentGames, ...data];
    renderGames(currentGames);
  } catch (error) {
    showError();
  } finally {
    hideLoading();
  }
}

// Funcion para mostrar los juegos
function renderGames(games) {
  gamesGrid.innerHTML = '';
  games.forEach(game => {
    const gameCard = document.createElement('div');
    gameCard.className = 'bg-white rounded-lg shadow p-4';
    gameCard.innerHTML = `
      <img src="${game.thumb}" alt="${game.title}" class="w-full h-40 object-cover rounded">
      <h3 class="font-bold mt-2">${game.title}</h3>
      <p class="text-green-600 font-bold">$${game.salePrice || 'N/A'}</p>
      <p class="text-gray-500 line-through">$${game.normalPrice || 'N/A'}</p>
      <button class="viewDetailBtn mt-2 bg-blue-500 text-white px-3 py-1 rounded" data-id="${game.gameID}">Ver detalle</button>
    `;
    gamesGrid.appendChild(gameCard);
  });

  // Añadir eventos a los botones de los detalles
  document.querySelectorAll('.viewDetailBtn').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.id));
  });
}

// Funcion para mostrar los detalle
async function openModal(gameID) {
  try {
    const response = await fetch(`${API_BASE}/games?id=${gameID}`);
    const data = await response.json();
    const game = data[0];
    document.getElementById('modalTitle').textContent = game.external;
    document.getElementById('modalImage').src = game.thumb;
    document.getElementById('modalNormalPrice').textContent = `$${game.normalPrice}`;
    document.getElementById('modalSalePrice').textContent = `$${game.salePrice}`;
    document.getElementById('modalStoreLink').href = game.stores[0].url;
    document.getElementById('modal').classList.remove('hidden');
  } catch (error) {
    alert('Error al cargar los detalles del juego');
  }
}

// Loseventos
document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('modal').classList.add('hidden');
});

loadMoreBtn.addEventListener('click', () => {
  currentPage++;
  fetchGames(currentPage, storeFilter.value, searchInput.value);
});

searchBtn.addEventListener('click', () => {
  currentGames = [];
  currentPage = 0;
  fetchGames(0, storeFilter.value, searchInput.value);
});

storeFilter.addEventListener('change', () => {
  currentGames = [];
  currentPage = 0;
  fetchGames(0, storeFilter.value, searchInput.value);
});

// Indicadores
function showLoading() {
  loadingSpinner.classList.remove('hidden');
  errorMessage.classList.add('hidden');
}

function hideLoading() {
  loadingSpinner.classList.add('hidden');
}

function showError() {
  errorMessage.classList.remove('hidden');
}

// Carga inicial
fetchGames();
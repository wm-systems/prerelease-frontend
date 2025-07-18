// Replace with your actual Apps Script exec URL:
const GAS_BASE =
  'https://script.google.com/macros/s/AKfycbwDfGg8zWKZMo_M-WqPxrgT3OWPGwpv0VSDYbsOC3uk7pbWWhTzC0vipfaJBvjRVv8_sQ/exec';

function hideAll() {
  ['signinPage', 'login', 'appContainer'].forEach(id =>
    document.getElementById(id).classList.add('hidden')
  );
}

function showSignIn() {
  hideAll();
  const signin = document.getElementById('signinPage');
  signin.classList.remove('hidden');
  document.getElementById('signinButton')
    .addEventListener('click', () => location.reload());
}

function showLogin(message) {
  hideAll();
  const login = document.getElementById('login');
  if (message) login.querySelector('h2').textContent = message;
  login.classList.remove('hidden');
}

function renderApp(tiles, systems) {
  hideAll();
  document.getElementById('appContainer').classList.remove('hidden');

  const processingEl = document.getElementById('processingMessage');
  processingEl.classList.add('hidden');

  const container = document.getElementById('tiles');
  container.innerHTML = '';

  tiles.forEach(tile => {
    const tileEl = document.createElement('div');
    tileEl.className = 'tile';

    const h2 = document.createElement('h2');
    h2.textContent = tile.Name;
    tileEl.appendChild(h2);

    const systemsDiv = document.createElement('div');
    systemsDiv.className = 'systems';

    systems
      .filter(s => s.Tile === tile.Name)
      .forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'system';
        btn.textContent = s.System;
        btn.onclick = () => goToSystem(s.Link, btn);
        systemsDiv.appendChild(btn);
      });

    tileEl.appendChild(systemsDiv);
    container.appendChild(tileEl);
  });
}

function goToSystem(url, btn) {
  const msg = document.createElement('div');
  msg.className = 'button-processing-message';
  msg.textContent = 'Accessing… Please wait…';
  btn.insertAdjacentElement('afterend', msg);
  window.location.href = url;
}

async function init() {
  // 1) Register the SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('service-worker.js')
      .then(reg => console.log('✅ SW registered; scope=', reg.scope))
      .catch(err => console.error('❌ SW failed:', err));
  }

  // 2) Show processing message
  const proc = document.getElementById('processingMessage');
  proc.textContent = 'Loading…';
  proc.classList.remove('hidden');

  try {
    // 3) Fetch signed-in email
    const email = await fetch(`${GAS_BASE}?rpc=getUserEmail`).then(r => r.text());
    if (!email) {
      showSignIn();
      return;
    }

    // 4) Fetch settings
    const settings = await fetch(
      `${GAS_BASE}?rpc=getSettings&email=${encodeURIComponent(email)}`
    ).then(r => r.json());

    if (settings.error) {
      showLogin(settings.error);
      return;
    }

    // 5) Render tiles
    const [tiles, systems] = settings;
    renderApp(tiles, systems);

  } catch (err) {
    showLogin('Error: ' + err.message);
  }
}

// Boot on load
window.addEventListener('load', init);

// Your GAS exec URL
const GAS_BASE =
  'https://script.google.com/macros/s/AKfycbwDfGg8zWKZMo_M-WqPxrgT3OWPGwpv0VSDYbsOC3uk7pbWWhTzC0vipfaJBvjRVv8_sQ/exec';

// Helper to load a JSONP endpoint
function loadJSONP(url) {
  return new Promise((resolve, reject) => {
    const fnName = 'jsonp_' + Date.now();
    // Create global callback
    window[fnName] = data => {
      delete window[fnName];
      script.remove();
      resolve(data);
    };
    const script = document.createElement('script');
    script.src = url + '&callback=' + fnName;
    script.onerror = e => {
      delete window[fnName];
      script.remove();
      reject(new Error('JSONP load error: ' + url));
    };
    document.body.appendChild(script);
  });
}

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
    .addEventListener('click', () => {
      // Kick off the OAuth flow on script.google.com, then bounce back here
      const redirect = encodeURIComponent(window.location.href);
      window.location.href =
        `${GAS_BASE}?loginRedirect=${redirect}`;
    });
}

function showLogin(msg) {
  hideAll();
  const login = document.getElementById('login');
  if (msg) login.querySelector('h2').textContent = msg;
  login.classList.remove('hidden');
}

function renderApp(tiles, systems) {
  hideAll();
  document.getElementById('appContainer').classList.remove('hidden');
  document.getElementById('processingMessage').classList.add('hidden');

  const container = document.getElementById('tiles');
  container.innerHTML = '';
  tiles.forEach(tile => {
    const box = document.createElement('div');
    box.className = 'tile';
    box.innerHTML = `<h2>${tile.Name}</h2><div class="systems"></div>`;
    const sysDiv = box.querySelector('.systems');
    systems
      .filter(s => s.Tile === tile.Name)
      .forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'system';
        btn.textContent = s.System;
        btn.onclick = () => goToSystem(s.Link, btn);
        sysDiv.appendChild(btn);
      });
    container.appendChild(box);
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
  // Show loading
  const proc = document.getElementById('processingMessage');
  proc.textContent = 'Loading…';
  proc.classList.remove('hidden');

  try {
    // 1) Get user email
    const email = await loadJSONP(`${GAS_BASE}?rpc=getUserEmail`);
    if (!email) {
      showSignIn();
      return;
    }

    // 2) Get settings
    const settings = await loadJSONP(
      `${GAS_BASE}?rpc=getSettings&email=${encodeURIComponent(email)}`
    );
    if (settings.error) {
      showLogin(settings.error);
      return;
    }

    // 3) Render
    const [tiles, systems] = settings;
    renderApp(tiles, systems);

  } catch (err) {
    showLogin('Error: ' + err.message);
  }
}

// Boot on load
window.addEventListener('load', init);

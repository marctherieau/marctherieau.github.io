// ─────────────────────────────────────────────────────────────────────────
// main.js — Marc Portfolio
//
// Responsibilities:
//   1. Detect OS color scheme preference
//   2. Load saved user preference from localStorage
//   3. Apply the correct theme on page load (no flash)
//   4. Handle manual toggle button clicks
//   5. Save preference to localStorage for next visit
//   6. Update toggle button aria-label for screen readers
// ─────────────────────────────────────────────────────────────────────────

(function () {

  // ── Constants ───────────────────────────────────────────────────────────
  const STORAGE_KEY   = 'marctherieau-portfolio-theme';
  const ATTR          = 'data-theme';
  const DARK          = 'dark';
  const LIGHT         = 'light';

  // ── Detect preferred theme ───────────────────────────────────────────────
  // Priority: saved preference > OS preference > light default
  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === DARK || saved === LIGHT) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? DARK
      : LIGHT;
  }

  // ── Apply theme to <html> element ────────────────────────────────────────
  function applyTheme(theme) {
    document.documentElement.setAttribute(ATTR, theme);
  }

  // ── Update toggle button accessibility label ─────────────────────────────
  function updateToggleLabel(theme, btn) {
    if (!btn) return;
    btn.setAttribute(
      'aria-label',
      theme === DARK
        ? 'Switch to light mode'
        : 'Switch to dark mode'
    );
    btn.setAttribute('aria-pressed', theme === DARK ? 'true' : 'false');
  }

  // ── Apply saved/preferred theme immediately on load ──────────────────────
  // This runs before DOMContentLoaded to prevent a flash of wrong theme
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  // ── Wire up toggle button once DOM is ready ──────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    // Set initial label
    updateToggleLabel(initialTheme, toggleBtn);

    // Handle click
    toggleBtn.addEventListener('click', function () {
      const currentTheme = document.documentElement.getAttribute(ATTR);
      const nextTheme    = currentTheme === DARK ? LIGHT : DARK;

      applyTheme(nextTheme);
      localStorage.setItem(STORAGE_KEY, nextTheme);
      updateToggleLabel(nextTheme, toggleBtn);
    });

    // Listen for OS preference changes (e.g. user switches system theme)
    // Only applies if the user hasn't manually overridden it
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', function (e) {
        const savedPreference = localStorage.getItem(STORAGE_KEY);
        if (!savedPreference) {
          const osTheme = e.matches ? DARK : LIGHT;
          applyTheme(osTheme);
          updateToggleLabel(osTheme, toggleBtn);
        }
      });
  });

})();

// ── Contact Modal ──────────────────────────────────────────────────────────
function openModal() {
  const overlay = document.getElementById('contact-modal');
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  // Move focus to modal for accessibility
  setTimeout(function() {
    overlay.querySelector('.modal-close').focus();
  }, 50);
}

function closeModal() {
  const overlay = document.getElementById('contact-modal');
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

// Close modal when clicking the overlay background
document.addEventListener('DOMContentLoaded', function() {
  const overlay = document.getElementById('contact-modal');

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeModal();
  });

  // Close modal on Escape key — keyboard accessibility
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });

  // Handle Formspree form submission with success state
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const data = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    })
    .then(function(response) {
      if (response.ok) {
        form.style.display = 'none';
        document.getElementById('form-success').style.display = 'block';

        // Reset form and close modal after 3 seconds
        setTimeout(function() {
          closeModal();
          setTimeout(function() {
            form.reset();
            form.style.display = 'flex';
            document.getElementById('form-success').style.display = 'none';
          }, 300);
        }, 3000);
      }
    })
    .catch(function() {
      alert('Something went wrong. Please email me directly.');
    });
  });
});
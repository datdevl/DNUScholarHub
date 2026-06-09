function getCurrentTheme() {
    return localStorage.getItem('scholarhub_theme') || 'light';
}

function setTheme(theme) {
    if (theme === 'light' || theme === 'dark') {
        localStorage.setItem('scholarhub_theme', theme);
        applyTheme();
    }
}

function applyTheme() {
    const theme = getCurrentTheme();
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

function toggleTheme() {
    const current = getCurrentTheme();
    setTheme(current === 'light' ? 'dark' : 'light');
    // Update icon if exists
    const iconEl = document.getElementById('theme-icon');
    if (iconEl) {
        if (getCurrentTheme() === 'dark') {
            iconEl.classList.remove('fa-moon');
            iconEl.classList.add('fa-sun');
        } else {
            iconEl.classList.remove('fa-sun');
            iconEl.classList.add('fa-moon');
        }
    }
}

// Apply theme immediately on load
document.addEventListener('DOMContentLoaded', applyTheme);
applyTheme();

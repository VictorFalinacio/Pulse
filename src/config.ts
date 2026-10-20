export const API_URL = (() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000';
    }
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}`;
})();

export const SESSION_IDLE_TIMEOUT_MS = 10 * 60 * 1000;
export const SESSION_COUNTDOWN_SECONDS = 60;

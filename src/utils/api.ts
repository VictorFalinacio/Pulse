import { API_URL } from '../config';

interface ApiOptions extends Omit<RequestInit, 'body'> {
    body?: BodyInit | Record<string, unknown> | null;
    requireAuth?: boolean;
}

/**
 * Utilitário centralizado para chamadas à API.
 * Gerencia automaticamente a inserção do token JWT e formatação de JSON/FormData.
 */
export const apiFetch = async (endpoint: string, options: ApiOptions = {}) => {
    const { requireAuth = true, headers, body, ...customConfig } = options;
    const token = localStorage.getItem('agile_pulse_token');

    const requestHeaders = new Headers(headers);
    const config: RequestInit = {
        ...customConfig,
        headers: requestHeaders,
    };

    if (requireAuth && token) {
        requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    if (body) {
        if (body instanceof FormData || body instanceof Blob || typeof body === 'string') {
            config.body = body;
            // O Fetch seta o Content-Type automaticamente para FormData com o boundary correto.
        } else {
            config.body = JSON.stringify(body);
            requestHeaders.set('Content-Type', 'application/json');
        }
    }
    config.headers = requestHeaders;

    // Endpoint pode vir com ou sem barra inicial, tratamos para evitar `//`
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const response = await fetch(`${API_URL}${formattedEndpoint}`, config);
    if (response.status === 401 && requireAuth && token) {
        window.dispatchEvent(new Event('agile-pulse:unauthorized'));
    }
    return response;
};

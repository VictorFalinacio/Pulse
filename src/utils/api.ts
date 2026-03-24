import { API_URL } from '../config';

interface ApiOptions extends RequestInit {
    body?: any;
    requireAuth?: boolean;
}

/**
 * Utilitário centralizado para chamadas à API.
 * Gerencia automaticamente a inserção do token JWT e formatação de JSON/FormData.
 */
export const apiFetch = async (endpoint: string, options: ApiOptions = {}) => {
    const { requireAuth = true, headers, body, ...customConfig } = options;
    const token = localStorage.getItem('agile_pulse_token');

    const config: RequestInit = {
        ...customConfig,
        headers: {
            ...headers,
        },
    };

    if (requireAuth && token) {
        config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${token}`
        };
    }

    if (body) {
        if (body instanceof FormData) {
            config.body = body;
            // O Fetch seta o Content-Type automaticamente para FormData com o boundary correto.
        } else {
            config.body = JSON.stringify(body);
            config.headers = {
                ...config.headers,
                'Content-Type': 'application/json'
            };
        }
    }

    // Endpoint pode vir com ou sem barra inicial, tratamos para evitar `//`
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const response = await fetch(`${API_URL}${formattedEndpoint}`, config);
    return response;
};

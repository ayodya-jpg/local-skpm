import csrfToken from './csrf';

async function parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        return await response.json();
    }

    const text = await response.text();

    if (!response.ok) {
        throw {
            message: 'Terjadi error dari server Laravel.',
            status: response.status,
            detail: text,
        };
    }

    return text;
}

export async function apiGet(url) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
    });

    const data = await parseResponse(response);

    if (!response.ok) {
        throw data;
    }

    return data;
}

export async function apiSend(url, method, body = {}) {
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify(body),
    });

    const data = await parseResponse(response);

    if (!response.ok) {
        throw data;
    }

    return data;
}

export async function apiSendForm(url, method, formData) {
    const response = await fetch(url, {
        method,
        headers: {
            Accept: 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: formData,
    });

    const data = await parseResponse(response);

    if (!response.ok) {
        throw data;
    }

    return data;
}

export function getErrorMessage(error) {
    if (error?.errors) {
        return Object.values(error.errors)[0][0];
    }

    if (error?.error) {
        return `${error.message || 'Terjadi error dari Laravel.'}

Error:
${error.error}

File:
${error.file || '-'}

Line:
${error.line || '-'}`;
    }

    if (error?.detail) {
        return `${error.message || 'Terjadi error dari server.'}

Status:
${error.status || '-'}

Detail:
${String(error.detail).slice(0, 500)}`;
    }

    if (error?.message) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'Terjadi kesalahan.';
}

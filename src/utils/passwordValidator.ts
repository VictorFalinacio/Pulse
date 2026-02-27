
export const validatePasswordStrength = (password: string) => {
    const errors: string[] = [];

    if (!password || password.length < 12) {
        errors.push('A senha deve ter no mínimo 12 caracteres.');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('A senha deve conter pelo menos 1 letra maiúscula.');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('A senha deve conter pelo menos 1 letra minúscula.');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('A senha deve conter pelo menos 1 número.');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('A senha deve conter pelo menos 1 caractere especial (!@#$%^&*).');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const getPasswordStrengthLevel = (password: string) => {
    let score = 0;

    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

    if (score <= 2) return { level: 'fraco', color: '#ef4444' };
    if (score <= 4) return { level: 'mediano', color: '#f59e0b' };
    return { level: 'forte', color: '#10b981' };
};

export const validatePasswordStrength = (password) => {
    const errors = [];

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

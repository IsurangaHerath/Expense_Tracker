const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function validateEmail(email) {
    const errors  = [];
    if (!email || !email.trim()) {
        errors.push("Email is required.");
    } else if (!EMAIL_REGEX.test(email.trim())) {
        errors.push("Invalid email format.");
    }
    return { isValid: errors.length === 0, errors };
}

function validatePassword(password) {
    const errors = [];
    if(!password){
        errors.push('Password is required.');
    } else{
        if (password.length < 8) errors.push("Password must be at least 8 characters long.");
        if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter.");
        if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter.");
    }
    return { isValid: errors.length === 0, errors };
}

module.exports = { validateEmail, validatePassword };
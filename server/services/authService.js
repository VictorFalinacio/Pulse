import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import validator from 'validator';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/mailer.js';
import { validatePasswordStrength } from '../utils/passwordValidator.js';

export const registerUser = async (name, email, password) => {
    if (!email || !validator.isEmail(email)) throw new Error('EMAIL_INVALID');
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) throw new Error(`PASSWORD_WEAK:${passwordValidation.errors[0]}`);
    if (!name || name.trim().length < 2) throw new Error('NAME_INVALID');
    
    let user = await User.findOne({ email });
    if (user) throw new Error('USER_EXISTS');

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user = new User({ name, email, password, verificationToken, verificationTokenExpiresAt });
    await user.save();

    try {
        await sendVerificationEmail(user.email, verificationToken);
    } catch(err) {
        throw new Error('EMAIL_SEND_ERROR');
    }
};

export const loginUser = async (email, password) => {
    if (!email || !password) throw new Error('MISSING_CREDENTIALS');
    let user = await User.findOne({ email });
    if (!user) throw new Error('INVALID_CREDENTIALS');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('INVALID_CREDENTIALS');
    if (!user.isVerified) throw new Error('UNVERIFIED');
    
    if (!process.env.JWT_SECRET) {
        console.error('CRITICAL: JWT_SECRET must be set');
        throw new Error('INTERNAL_ERROR');
    }

    const payload = { user: { id: user.id, name: user.name, email: user.email } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30m' });

    return { token, user: payload.user };
};

export const verifyEmail = async (token) => {
    if (!token) throw new Error('MISSING_TOKEN');
    const user = await User.findOne({ verificationToken: token, verificationTokenExpiresAt: { $gt: new Date() } });
    if (!user) throw new Error('INVALID_TOKEN');

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
};

export const requestPasswordReset = async (email) => {
    if (!email || !validator.isEmail(email)) throw new Error('EMAIL_INVALID');
    const user = await User.findOne({ email });
    if (!user) return; // Don't reveal account existence

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    await user.save();

    try {
        await sendPasswordResetEmail(user.email, resetToken);
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        throw new Error('EMAIL_SEND_ERROR');
    }
};

export const verifyResetToken = async (token) => {
    if (!token) throw new Error('MISSING_TOKEN');
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpire: { $gt: new Date() } });
    if (!user) throw new Error('INVALID_TOKEN');
};

export const resetPassword = async (token, password) => {
    if (!token || !password) throw new Error('MISSING_CREDENTIALS');
    
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) throw new Error(`PASSWORD_WEAK:${passwordValidation.errors[0]}`);

    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpire: { $gt: new Date() } });
    if (!user) throw new Error('INVALID_TOKEN');

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
};

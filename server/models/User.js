import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationTokenHash: { type: String },
    verificationTokenExpiresAt: { type: Date }, // Add expiration for verification token - 24 hours
    resetPasswordTokenHash: { type: String },
    resetPasswordExpire: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Hashea a senha antes de salvar
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Do not use a TTL index on createdAt: it would also expire verified accounts.

export default mongoose.model('User', UserSchema);

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiresAt: { type: Date }, // Add expiration for verification token - 24 hours
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Hashea a senha antes de salvar
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Auto-delete unverified users after 24 hours TTL
UserSchema.index(
    { createdAt: 1 },
    { 
        expireAfterSeconds: 86400, // 24 hours
        partialFilterExpression: { isVerified: false }
    }
);

export default mongoose.model('User', UserSchema);

import 'dotenv/config';
import crypto from 'node:crypto';
import mongoose from 'mongoose';

if (!process.env.MONGO_URI) throw new Error('MONGO_URI não configurado.');

const hash = value => crypto.createHash('sha256').update(value).digest('hex');

try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = mongoose.connection.collection('users');
    const cursor = users.find({}, { projection: { verificationToken: 1, resetPasswordToken: 1 } });
    let migratedTokens = 0;

    for await (const user of cursor) {
        const set = {};
        const unset = {};
        if (typeof user.verificationToken === 'string') {
            set.verificationTokenHash = hash(user.verificationToken);
            unset.verificationToken = '';
            migratedTokens += 1;
        }
        if (typeof user.resetPasswordToken === 'string') {
            set.resetPasswordTokenHash = hash(user.resetPasswordToken);
            unset.resetPasswordToken = '';
            migratedTokens += 1;
        }
        if (Object.keys(set).length) await users.updateOne({ _id: user._id }, { $set: set, $unset: unset });
    }

    const indexes = await users.indexes();
    const legacyTtlIndex = indexes.find(index => index.key?.createdAt === 1 && index.expireAfterSeconds === 86400);
    if (legacyTtlIndex) await users.dropIndex(legacyTtlIndex.name);

    console.log(`Migração concluída: ${migratedTokens} tokens protegidos; índice TTL legado ${legacyTtlIndex ? 'removido' : 'não encontrado'}.`);
} finally {
    await mongoose.disconnect();
}

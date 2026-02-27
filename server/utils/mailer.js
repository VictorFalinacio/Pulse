import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Detect the correct frontend URL for email links
const getFrontendUrl = () => {
    if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL;
    if (process.env.VERCEL) return `https://tracker-pulse.vercel.app`;
    return 'http://localhost:5173';
};

export const sendVerificationEmail = async (email, token) => {
    const frontendUrl = getFrontendUrl();
    // Use direct link to verification page with token
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
    
    await transporter.sendMail({
        from: `"Agile Pulse" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verifique sua conta - Agile Pulse",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Bem-vindo ao Agile Pulse!</h2>
                <p style="color: #666; line-height: 1.6;">
                    Para ativar sua conta, por favor clique no link abaixo. 
                    Este link expira em <strong>24 horas</strong>.
                </p>
                <a href="${verificationUrl}" 
                   style="display: inline-block; padding: 12px 24px; background-color: #8B5CF6; 
                          color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                    Verificar Email
                </a>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    Se você não criou esta conta, ignore este email.
                </p>
            </div>
        `
    });
};

export const sendPasswordResetEmail = async (email, token) => {
    const frontendUrl = getFrontendUrl();
    // Use direct link with token - user can then submit password via form
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    
    await transporter.sendMail({
        from: `"Agile Pulse" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Redefinir Senha - Agile Pulse",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Recuperação de Senha</h2>
                <p style="color: #666; line-height: 1.6;">
                    Você solicitou uma alteração de senha. Clique no link abaixo para redefinir.
                    Este link expira em <strong>1 hora</strong>.
                </p>
                <a href="${resetUrl}" 
                   style="display: inline-block; padding: 12px 24px; background-color: #8B5CF6; 
                          color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                    Redefinir Senha
                </a>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    Se você não solicitou isso, ignore este email.
                </p>
            </div>
        `
    });
};

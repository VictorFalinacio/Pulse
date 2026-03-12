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
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
    
    await transporter.sendMail({
        from: `"Agile Pulse" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Ative sua conta - Agile Pulse",
        html: `
            <div style="background-color: #000000; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center; color: #ffffff;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #222; border-radius: 16px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
                    <h1 style="color: #ff3e3e; font-size: 28px; margin-bottom: 20px; font-weight: 800; letter-spacing: -1px;">Agile Pulse</h1>
                    <div style="height: 1px; background: #222; margin: 20px 0;"></div>
                    <h2 style="font-size: 22px; margin-bottom: 20px; font-weight: 700;">Bem-vindo ao Time!</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #a0a0a0; margin-bottom: 30px;">
                        Estamos felizes em ter você conosco. Para começar a potencializar a entrega da sua equipe com métricas claras, você precisa validar seu endereço de e-mail.
                    </p>
                    <a href="${verificationUrl}" 
                       style="display: inline-block; padding: 16px 36px; background-color: #ff3e3e; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; transition: background-color 0.3s ease;">
                        Validar Minha Conta
                    </a>
                    <p style="font-size: 14px; color: #555; margin-top: 30px;">
                        Este link expirará em 24 horas.<br>
                        Se o botão acima não funcionar, copie e cole este link no seu navegador:<br>
                        <span style="color: #ff3e3e;">${verificationUrl}</span>
                    </p>
                    <div style="height: 1px; background: #222; margin: 30px 0;"></div>
                    <p style="font-size: 12px; color: #444;">
                        © 2026 Agile Pulse. Se você não criou esta conta, por favor ignore este e-mail.
                    </p>
                </div>
            </div>
        `
    });
};

export const sendPasswordResetEmail = async (email, token) => {
    const frontendUrl = getFrontendUrl();
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    
    await transporter.sendMail({
        from: `"Agile Pulse" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Recuperação de Acesso - Agile Pulse",
        html: `
            <div style="background-color: #000000; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center; color: #ffffff;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #222; border-radius: 16px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
                    <h1 style="color: #ff3e3e; font-size: 28px; margin-bottom: 20px; font-weight: 800; letter-spacing: -1px;">Agile Pulse</h1>
                    <div style="height: 1px; background: #222; margin: 20px 0;"></div>
                    <h2 style="font-size: 22px; margin-bottom: 20px; font-weight: 700;">Recuperação de Senha</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #a0a0a0; margin-bottom: 30px;">
                        Recebemos uma solicitação para redefinir a senha da sua conta no Agile Pulse. Clique no botão abaixo para prosseguir com a alteração.
                    </p>
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 16px 36px; background-color: #ff3e3e; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; transition: background-color 0.3s ease;">
                        Redefinir Minha Senha
                    </a>
                    <p style="font-size: 14px; color: #555; margin-top: 30px;">
                        Este link expirará em 1 hora por motivos de segurança.<br>
                        Se você não solicitou esta redefinição, sua senha permanecerá a mesma e você pode ignorar este e-mail com segurança.
                    </p>
                    <div style="height: 1px; background: #222; margin: 30px 0;"></div>
                    <p style="font-size: 12px; color: #444;">
                        © 2026 Agile Pulse. Monitoramento e Insights para Equipes de Alta Performance.
                    </p>
                </div>
            </div>
        `
    });
};

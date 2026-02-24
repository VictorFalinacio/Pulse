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

export const sendVerificationEmail = async (email, token) => {
    const url = `http://localhost:5173/verify-email?token=${token}`;
    await transporter.sendMail({
        from: `"Agile Pulse" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verifique sua conta - Agile Pulse",
        html: `<h3>Bem-vindo ao Agile Pulse!</h3>
               <p>Para ativar sua conta, por favor clique no link abaixo:</p>
               <a href="${url}">Verificar Email</a>`,
    });
};

export const sendPasswordResetEmail = async (email, token) => {
    const url = `http://localhost:5173/reset-password?token=${token}`;
    await transporter.sendMail({
        from: `"Agile Pulse" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Redefinir Senha - Agile Pulse",
        html: `<h3>Recuperação de Senha</h3>
               <p>Você solicitou uma alteração de senha. Clique no link para redefinir:</p>
               <a href="${url}">Redefinir Senha</a>
               <p>Se você não fez essa solicitação, ignore este email.</p>`,
    });
};

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function findWorkingModel() {
    const modelsToTry = [
        "models/gemini-1.5-flash",
        "gemini-pro",
        "models/gemini-2.0-flash-lite",
        "models/gemini-2.5-flash",
        "gemini-1.5-flash"
    ];

    console.log("--- TESTANDO MODELOS COM NOMES COMPLETOS ---");

    for (const modelName of modelsToTry) {
        try {
            console.log(`Testando: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Oi");
            const response = await result.response;
            console.log(`✅ SUCESSO com ${modelName}:`, response.text());
            return;
        } catch (error) {
            console.log(`❌ ${modelName}: [${error.status}] ${error.message.split('\n')[0]}`);
        }
    }
}

findWorkingModel();

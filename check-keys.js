import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function testKey(keyName, key) {
    console.log(`\n--- Testando ${keyName} ---`);
    if (!key) {
        console.log("Chave não configurada.");
        return;
    }
    
    const genAI = new GoogleGenerativeAI(key);
    
    const modelsToTry = [
        "models/gemini-2.0-flash",
        "models/gemini-1.5-flash",
        "models/gemini-2.5-flash"
    ];

    for (const modelName of modelsToTry) {
        try {
            console.log(`Testando ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Olá, como você está?");
            const response = await result.response;
            console.log(`✅ SUCESSO com ${modelName}: ${response.text().substring(0, 20)}...`);
        } catch (error) {
            console.log(`❌ ERRO com ${modelName}: [${error.status}] ${error.message.split('\n')[0]}`);
        }
    }
}

async function run() {
    await testKey("GEMINI_API_KEY", process.env.GEMINI_API_KEY);
    await testKey("GEMINI_API_KEY_2", process.env.GEMINI_API_KEY_2);
}

run();

// src/index.ts - Ponto de Entrada Principal

import { SistemaAerocode } from './sistema/SistemaAerocode';

async function main(): Promise<void> {
    try {
        const sistema = new SistemaAerocode();
        await sistema.iniciar();
    } catch (error) {
        console.error("❌ Erro crítico no sistema:", error);
        process.exit(1);
    }
}

// Executar apenas se este arquivo for executado diretamente
if (require.main === module) {
    main();
}
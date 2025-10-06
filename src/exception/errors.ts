// src/exceptions/errors.ts

export class DependenciaExistenteError extends Error {
    constructor(entidade: string, dependencias: string[]) {
        super(
            `❌ Não é possível deletar ${entidade}. Existem dependências:\n   ${dependencias.join("\n   ")}`
        );
        this.name = "DependenciaExistenteError";
    }
}

export class PermissaoNegadaError extends Error {
    constructor(operacao: string, nivelNecessario: string) {
        super(
            `❌ Permissão negada para ${operacao}. Nível necessário: ${nivelNecessario}`
        );
        this.name = "PermissaoNegadaError";
    }
}
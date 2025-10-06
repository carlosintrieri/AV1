// src/models/Peca.ts

import { TipoPeca, StatusPeca } from '../enums';

export class Peca {
    private static pecasCadastradas: Map<string, Peca> = new Map();

    constructor(
        public nome: string,
        public tipo: TipoPeca,
        public fornecedor: string,
        public status: StatusPeca,
        public codigo?: string, // Opcional, será gerado se não fornecido
        public dataRegistro: Date = new Date() // Data de registro da peça no sistema, com valor padrão
    ) {
        if (!this.codigo) {
            this.codigo = this.gerarCodigoUnico();
        }

        // Garante que dataRegistro é sempre um objeto Date
        if (!(this.dataRegistro instanceof Date)) {
            this.dataRegistro = new Date(this.dataRegistro);
        }

        if (!Peca.pecasCadastradas.has(this.codigo)) {
            Peca.pecasCadastradas.set(this.codigo, this);
        }
    }

    private gerarCodigoUnico(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 5);
        let newCode = `PEC-${timestamp}-${random}`.toUpperCase();
        while (Peca.pecasCadastradas.has(newCode)) {
            newCode = `PEC-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`.toUpperCase();
        }
        return newCode;
    }

    // ==================== MÉTODO DE STATUS ====================
    atualizarStatus(novoStatus: StatusPeca): void {
        const statusAnterior = this.status;
        this.status = novoStatus;
        console.log(`Status da peça '${this.nome}' atualizado:`);
        console.log(` De: ${statusAnterior}`);
        console.log(` Para: ${novoStatus}`);
        console.log(` Código: ${this.codigo}`);
    }

    // ==================== MÉTODOS DE INFORMAÇÃO ====================
    obterDetalhes(): string {
        // 'dataInstalacao' removida
        return `=== DETALHES DA PEÇA ===
Código: ${this.codigo}
Nome: ${this.nome}
Tipo: ${this.tipo}
Fornecedor: ${this.fornecedor}
Status: ${this.status}
Data de Registro: ${this.dataRegistro.toLocaleDateString('pt-BR')}`;
    }

    obterResumo(): string {
        return `${this.nome} (${this.tipo}) - ${this.status}`;
    }

    // ==================== MÉTODOS ESTÁTICOS ====================
    static listarTodasPecasCadastradas(): Peca[] {
        return Array.from(this.pecasCadastradas.values());
    }

    static listarPecasPorStatus(status: StatusPeca): Peca[] {
        return Array.from(this.pecasCadastradas.values()).filter((peca) => peca.status === status);
    }

    static listarPecasPorTipo(tipo: TipoPeca): Peca[] {
        return Array.from(this.pecasCadastradas.values()).filter((peca) => peca.tipo === tipo);
    }

    static obterPecaPorCodigo(codigo: string): Peca | undefined {
        return this.pecasCadastradas.get(codigo);
    }

    static contarPecasCadastradas(): number {
        return this.pecasCadastradas.size;
    }

    static limparPecasCadastradas(): void {
        this.pecasCadastradas.clear();
    }

    // ==================== MÉTODOS DE PERSISTÊNCIA ====================
    salvar(): string {
        return JSON.stringify(
            {
                codigo: this.codigo,
                nome: this.nome,
                tipo: this.tipo,
                fornecedor: this.fornecedor,
                status: this.status,
                dataRegistro: this.dataRegistro.toISOString(), // Usando dataRegistro
                dataUltimaAtualizacao: new Date().toISOString()
            },
            null,
            2
        );
    }

    /**
     * Carrega uma peça a partir de uma string JSON.
     * @param data A string JSON da peça.
     * @returns A instância da Peca carregada ou atualizada.
     */
    static carregar(data: string): Peca {
        try {
            const obj = JSON.parse(data);
            if (!obj.nome || !obj.tipo || !obj.fornecedor || !obj.status || !obj.codigo) {
                throw new Error('Dados da peça incompletos ou código ausente');
            }
            let peca: Peca;
            const pecaExistente = Peca.pecasCadastradas.get(obj.codigo);
            if (pecaExistente) {
                peca = pecaExistente;
                peca.nome = obj.nome;
                peca.tipo = obj.tipo;
                peca.fornecedor = obj.fornecedor;
                peca.status = obj.status;
                peca.dataRegistro = obj.dataRegistro ? new Date(obj.dataRegistro) : new Date(); // Garante que é um Date
            } else {
                peca = new Peca(
                    obj.nome,
                    obj.tipo,
                    obj.fornecedor,
                    obj.status,
                    obj.codigo,
                    obj.dataRegistro ? new Date(obj.dataRegistro) : undefined // Passa undefined para usar o default do construtor se não houver
                );
                Peca.pecasCadastradas.set(peca.codigo!, peca); // 'codigo' é garantido após o construtor
            }
            return peca;
        } catch (error) {
            console.error('Erro ao carregar peça:', error);
            throw new Error('Falha ao carregar dados da peça');
        }
    }

    // ==================== MÉTODO PARA RELATÓRIOS ====================
    obterDadosRelatorio(): any {
        return {
            codigo: this.codigo,
            nome: this.nome,
            tipo: this.tipo,
            fornecedor: this.fornecedor,
            status: this.status,
            dataRegistro: this.dataRegistro.toISOString(), // Usando dataRegistro
            resumo: this.obterResumo()
        };
    }
}

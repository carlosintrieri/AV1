import { TipoPeca, StatusPeca } from '../enums';
import { Funcionario } from '../models/Funcionario'; // Importando a classe Funcionario

export class Peca {
    private static pecasCadastradas: Map<string, Peca> = new Map();
    private responsaveis: Funcionario[] = [];

    constructor(
        public nome: string,
        public tipo: TipoPeca,
        public fornecedor: string,
        public status: StatusPeca,
        public codigo?: string
    ) {
        if (!this.codigo) {
            this.codigo = this.gerarCodigoUnico();
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

    // ==================== MÉTODOS DE ASSOCIAÇÃO DE FUNCIONÁRIOS ====================
    /**
     * Associa um funcionário a esta peça.
     * @param funcionario O objeto Funcionario a ser associado.
     * @returns true se o funcionário foi associado, false se já estava associado.
     */
    associarFuncionario(funcionario: Funcionario): boolean {
        if (!this.responsaveis.some(f => f.codigo === funcionario.codigo)) {
            this.responsaveis.push(funcionario);
            return true;
        }
        return false;
    }

    /**
     * Remove um funcionário desta peça.
     * @param funcionario O objeto Funcionario a ser removido.
     * @returns true se o funcionário foi removido, false se não foi encontrado.
     */
    removerFuncionario(funcionario: Funcionario): boolean {
        const index = this.responsaveis.findIndex(f => f.codigo === funcionario.codigo);
        if (index > -1) {
            this.responsaveis.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Lista todos os funcionários associados a esta peça.
     * @returns Um array de objetos Funcionario.
     */
    listarFuncionarios(): Funcionario[] {
        return [...this.responsaveis];
    }

    /**
     * Retorna um array com os nomes dos funcionários associados a esta peça.
     * @returns Um array de strings com os nomes dos funcionários.
     */
    getFuncionariosNomes(): string[] {
        return this.responsaveis.map(f => f.nome);
    }

    // ==================== MÉTODOS DE INFORMAÇÃO ====================
    obterDetalhes(): string {
        const funcionariosNomes = this.responsaveis.map(f => f.nome).join(', ') || 'Nenhum';
        return `=== DETALHES DA PEÇA ===
Código: ${this.codigo}
Nome: ${this.nome}
Tipo: ${this.tipo}
Fornecedor: ${this.fornecedor}
Status: ${this.status}
Responsáveis: ${funcionariosNomes}`;
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
                responsaveisCodigos: this.responsaveis.map(f => f.codigo),
                dataUltimaAtualizacao: new Date().toISOString()
            },
            null,
            2
        );
    }

    /**
     * Carrega uma peça a partir de uma string JSON.
     * Requer uma lista de todos os funcionários para reassociar os responsáveis.
     * @param data A string JSON da peça.
     * @param todosFuncionarios Uma lista de todos os funcionários disponíveis no sistema.
     * @returns A instância da Peca carregada ou atualizada.
     */
    static carregar(data: string, todosFuncionarios: Funcionario[] = []): Peca {
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
                peca.responsaveis = [];
            } else {
                peca = new Peca(obj.nome, obj.tipo, obj.fornecedor, obj.status, obj.codigo);
                Peca.pecasCadastradas.set(peca.codigo, peca);
            }

            if (obj.responsaveisCodigos && Array.isArray(obj.responsaveisCodigos)) {
                obj.responsaveisCodigos.forEach((codigoFunc: string) => {
                    const func = todosFuncionarios.find(f => f.codigo === codigoFunc);
                    if (func) {
                        peca.associarFuncionario(func);
                    }
                });
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
            responsaveis: this.responsaveis.map(f => ({ codigo: f.codigo, nome: f.nome })),
            resumo: this.obterResumo()
        };
    }
}

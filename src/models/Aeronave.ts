import { TipoAeronave, StatusEtapa } from '../enums';
import { Peca } from './Peca';
import { Etapa } from './Etapa';
import { Teste } from './Teste';
import { Funcionario } from './Funcionario';

export class Aeronave {
    private pecas: Peca[] = [];
    private etapas: Etapa[] = [];
    private testes: Teste[] = [];

    constructor(
        public codigo: string,
        public modelo: string,
        public tipo: TipoAeronave,
        public capacidade: number,
        public alcance: number,
        public cliente: string = "",
        public fabricante: string = "Aerocode",
        public anoFabricacao: number = new Date().getFullYear(),
        public numeroSerie?: string,
        public observacoes?: string,
        public dataEntrega?: Date
    ) {
        // Gerar número de série automaticamente se não fornecido
        if (!this.numeroSerie) {
            this.numeroSerie = this.gerarNumeroSerie();
        }
    }

    private gerarNumeroSerie(): string {
        const ano = this.anoFabricacao.toString().slice(-2);
        const timestamp = Date.now().toString().slice(-6);
        return `${this.codigo}-${ano}-${timestamp}`;
    }

    // ==================== MÉTODOS DE PEÇAS ====================

    adicionarPeca(peca: Peca): void {
        this.pecas.push(peca);
    }

    getPecas(): Peca[] {
        return [...this.pecas];
    }

    // ==================== MÉTODOS DE ETAPAS ====================

    adicionarEtapa(etapa: Etapa): void {
        this.etapas.push(etapa);
        this.etapas.sort((a, b) => a.ordem - b.ordem);
    }

    podeFinalizarEtapa(etapa: Etapa): boolean {
        const indiceEtapa = this.etapas.findIndex(e => e.nome === etapa.nome);
        if (indiceEtapa === -1) return false;
        if (indiceEtapa === 0) return etapa.status === StatusEtapa.ANDAMENTO;
        const etapaAnterior = this.etapas[indiceEtapa - 1];
        return etapaAnterior.status === StatusEtapa.CONCLUIDA && etapa.status === StatusEtapa.ANDAMENTO;
    }

    getEtapas(): Etapa[] {
        return [...this.etapas];
    }

    // ==================== MÉTODOS DE TESTES ====================

    adicionarTeste(teste: Teste): void {
        this.testes.push(teste);
    }

    getTestes(): Teste[] {
        return [...this.testes];
    }

    // ==================== MÉTODOS DE DATA DE ENTREGA ====================

    definirDataEntrega(data: Date): void {
        this.dataEntrega = data;
    }

    // ==================== MÉTODOS DE EXIBIÇÃO ====================

    exibirDetalhes(): void {
        console.log("\n" + "=".repeat(70));
        console.log(`DETALHES DA AERONAVE`);
        console.log("=".repeat(70));
        console.log(`Código: ${this.codigo}`);
        console.log(`Modelo: ${this.modelo}`);
        console.log(`Tipo: ${this.tipo}`);
        console.log(`Fabricante: ${this.fabricante}`);
        console.log(`Ano de Fabricação: ${this.anoFabricacao}`);
        console.log(`Número de Série: ${this.numeroSerie}`);
        console.log(`Capacidade: ${this.capacidade} passageiros`);
        console.log(`Alcance: ${this.alcance} km`);
        console.log(`Cliente: ${this.cliente || 'Não informado'}`);
        console.log(`Data de Entrega: ${this.dataEntrega ? this.dataEntrega.toLocaleDateString('pt-BR') : 'Não definida'}`);
        if (this.observacoes) {
            console.log(`Observações: ${this.observacoes}`);
        }

        console.log("\n--- PEÇAS ---");
        if (this.pecas.length === 0) {
            console.log("Nenhuma peça cadastrada.");
        } else {
            this.pecas.forEach((peca, index) => {
                console.log(`${index + 1}. ${peca.nome} (${peca.tipo}) - Status: ${peca.status}`);
                console.log(`   Fornecedor: ${peca.fornecedor}`);
            });
        }

        console.log("\n--- ETAPAS DE PRODUÇÃO ---");
        if (this.etapas.length === 0) {
            console.log("Nenhuma etapa cadastrada.");
        } else {
            this.etapas.forEach((etapa, index) => {
                console.log(`${index + 1}. ${etapa.nome} - Status: ${etapa.status} - Prazo: ${etapa.prazo.toLocaleDateString('pt-BR')}`);
                const funcionarios = etapa.listarFuncionarios();
                if (funcionarios.length > 0) {
                    console.log(`   Funcionários: ${funcionarios.map(f => f.nome).join(', ')}`);
                }
            });
        }

        console.log("\n--- TESTES REALIZADOS ---");
        if (this.testes.length === 0) {
            console.log("Nenhum teste realizado.");
        } else {
            this.testes.forEach((teste, index) => {
                console.log(`${index + 1}. ${teste.tipo} - Resultado: ${teste.resultado} - Data: ${teste.dataRealizacao.toLocaleDateString('pt-BR')}`);
            });
        }
        console.log("=".repeat(70));
    }

    // ==================== MÉTODOS DE PERSISTÊNCIA ====================

    salvar(): string {
        return JSON.stringify({
            codigo: this.codigo,
            modelo: this.modelo,
            tipo: this.tipo,
            capacidade: this.capacidade,
            alcance: this.alcance,
            cliente: this.cliente,
            fabricante: this.fabricante,
            anoFabricacao: this.anoFabricacao,
            numeroSerie: this.numeroSerie,
            observacoes: this.observacoes,
            dataEntrega: this.dataEntrega,
            pecas: this.pecas.map(p => p.salvar()),
            etapas: this.etapas.map(e => e.salvar()),
            testes: this.testes.map(t => t.salvar())
        });
    }

    static carregar(data: string, funcionarios: Funcionario[]): Aeronave {
        const obj = JSON.parse(data);
        const aeronave = new Aeronave(
            obj.codigo,
            obj.modelo,
            obj.tipo,
            obj.capacidade,
            obj.alcance,
            obj.cliente,
            obj.fabricante || "Aerocode",
            obj.anoFabricacao || new Date().getFullYear(),
            obj.numeroSerie,
            obj.observacoes,
            obj.dataEntrega ? new Date(obj.dataEntrega) : undefined
        );

        if (obj.pecas) {
            obj.pecas.forEach((pecaData: string) => {
                aeronave.pecas.push(Peca.carregar(pecaData));
            });
        }

        if (obj.etapas) {
            obj.etapas.forEach((etapaData: string) => {
                aeronave.etapas.push(Etapa.carregar(etapaData, funcionarios));
            });
            aeronave.etapas.sort((a, b) => a.ordem - b.ordem);
        }

        if (obj.testes) {
            obj.testes.forEach((testeData: string) => {
                aeronave.testes.push(Teste.carregar(testeData));
            });
        }

        return aeronave;
    }
}
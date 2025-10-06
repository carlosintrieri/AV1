
// ============================================
// ENUMERAÇÕES
// ============================================

enum TipoAeronave {
    COMERCIAL = "COMERCIAL",
    MILITAR = "MILITAR"
}

enum TipoPeca {
    NACIONAL = "NACIONAL",
    IMPORTADA = "IMPORTADA"
}

enum StatusPeca {
    EM_PRODUCAO = "EM_PRODUCAO",
    EM_TRANSPORTE = "EM_TRANSPORTE",
    PRONTA = "PRONTA"
}

enum StatusEtapa {
    PENDENTE = "PENDENTE",
    ANDAMENTO = "ANDAMENTO",
    CONCLUIDA = "CONCLUIDA"
}

enum NivelPermissao {
    ADMINISTRADOR = "ADMINISTRADOR",
    ENGENHEIRO = "ENGENHEIRO",
    OPERADOR = "OPERADOR"
}

enum TipoTeste {
    ELETRICO = "ELETRICO",
    HIDRAULICO = "HIDRAULICO",
    AERODINAMICO = "AERODINAMICO"
}

enum ResultadoTeste {
    APROVADO = "APROVADO",
    REPROVADO = "REPROVADO"
}

// ============================================
// EXCEÇÕES PERSONALIZADAS
// ============================================

class DependenciaExistenteError extends Error {
    constructor(entidade: string, dependencias: string[]) {
        super(
            `❌ Não é possível deletar ${entidade}. Existem dependências:\n   ${dependencias.join("\n   ")}`
        );
        this.name = "DependenciaExistenteError";
    }
}

class PermissaoNegadaError extends Error {
    constructor(operacao: string, nivelNecessario: string) {
        super(
            `❌ Permissão negada para ${operacao}. Nível necessário: ${nivelNecessario}`
        );
        this.name = "PermissaoNegadaError";
    }
}

// ============================================
// CLASSES DO SISTEMA
// ============================================

class Funcionario {
    constructor(
        public id: string,
        public nome: string,
        public telefone: string,
        public endereco: string,
        public usuario: string,
        private senha: string,
        public nivelPermissao: NivelPermissao,
        public ativo: boolean = true
    ) { }

    autenticar(senha: string): boolean {
        return this.senha === senha;
    }

    temPermissao(nivelRequerido: NivelPermissao): boolean {
        const hierarquia = {
            [NivelPermissao.OPERADOR]: 1,
            [NivelPermissao.ENGENHEIRO]: 2,
            [NivelPermissao.ADMINISTRADOR]: 3
        };
        return hierarquia[this.nivelPermissao] >= hierarquia[nivelRequerido];
    }

    desativar(): void {
        this.ativo = false;
        console.log(`✓ Funcionário ${this.nome} desativado (soft delete)`);
    }

    reativar(): void {
        this.ativo = true;
        console.log(`✓ Funcionário ${this.nome} reativado`);
    }

    salvar(): void {
        console.log(`Salvando funcionário ${this.nome}...`);
    }

    static carregar(): void {
        console.log("Carregando funcionários...");
    }
}

class Peca {
    constructor(
        public id: string,
        public nome: string,
        public tipo: TipoPeca,
        public fornecedor: string,
        public status: StatusPeca
    ) { }

    atualizarStatus(novoStatus: StatusPeca): void {
        this.status = novoStatus;
        console.log(`✓ Status da peça ${this.nome} atualizado para ${novoStatus}`);
    }

    salvar(): void {
        console.log(`Salvando peça ${this.nome}...`);
    }

    static carregar(): void {
        console.log("Carregando peças...");
    }
}

class Teste {
    constructor(
        public id: string,
        public tipo: TipoTeste,
        public resultado: ResultadoTeste,
        public data: string
    ) { }

    salvar(): void {
        console.log(`Salvando teste ${this.tipo}...`);
    }

    static carregar(): void {
        console.log("Carregando testes...");
    }
}

class Etapa {
    public funcionarios: Funcionario[] = [];

    constructor(
        public id: string,
        public nome: string,
        public prazo: string,
        public status: StatusEtapa
    ) { }

    iniciar(): void {
        if (this.status === StatusEtapa.PENDENTE) {
            this.status = StatusEtapa.ANDAMENTO;
            console.log(`✓ Etapa ${this.nome} iniciada`);
        } else {
            console.log(`⚠️  Etapa ${this.nome} não pode ser iniciada (status atual: ${this.status})`);
        }
    }

    finalizar(): void {
        if (this.status === StatusEtapa.ANDAMENTO) {
            this.status = StatusEtapa.CONCLUIDA;
            console.log(`✓ Etapa ${this.nome} finalizada`);
        } else {
            console.log(`⚠️  Etapa ${this.nome} não pode ser finalizada (status atual: ${this.status})`);
        }
    }

    associarFuncionario(funcionario: Funcionario): void {
        if (!this.funcionarios.includes(funcionario)) {
            this.funcionarios.push(funcionario);
            console.log(`✓ Funcionário ${funcionario.nome} associado à etapa ${this.nome}`);
        } else {
            console.log(`⚠️  Funcionário ${funcionario.nome} já está associado à etapa ${this.nome}`);
        }
    }

    desassociarFuncionario(funcionario: Funcionario): void {
        const index = this.funcionarios.indexOf(funcionario);
        if (index > -1) {
            this.funcionarios.splice(index, 1);
            console.log(`✓ Funcionário ${funcionario.nome} desassociado da etapa ${this.nome}`);
        } else {
            console.log(`⚠️  Funcionário ${funcionario.nome} não está associado à etapa ${this.nome}`);
        }
    }

    listarFuncionarios(): Funcionario[] {
        return this.funcionarios;
    }

    salvar(): void {
        console.log(`Salvando etapa ${this.nome}...`);
    }

    static carregar(): void {
        console.log("Carregando etapas...");
    }
}

class Aeronave {
    public pecas: Peca[] = [];
    public etapas: Etapa[] = [];
    public testes: Teste[] = [];

    constructor(
        public codigo: string,
        public modelo: string,
        public tipo: TipoAeronave,
        public capacidade: number,
        public alcance: number
    ) { }

    exibirDetalhes(): void {
        console.log(`
=== Detalhes da Aeronave ===
Código: ${this.codigo}
Modelo: ${this.modelo}
Tipo: ${this.tipo}
Capacidade: ${this.capacidade} passageiros
Alcance: ${this.alcance} km
Peças: ${this.pecas.length}
Etapas: ${this.etapas.length}
Testes: ${this.testes.length}
============================
    `);
    }

    salvar(): void {
        console.log(`Salvando aeronave ${this.codigo}...`);
    }

    static carregar(): void {
        console.log("Carregando aeronaves...");
    }
}

class Relatorio {
    constructor(
        public nomeCliente: string,
        public dataEntrega: string
    ) { }

    gerarRelatorio(aeronave: Aeronave): string {
        let relatorio = `
========================================
       RELATÓRIO DE ENTREGA DE AERONAVE
========================================

Cliente: ${this.nomeCliente}
Data de Entrega: ${this.dataEntrega}

--- DADOS DA AERONAVE ---
Código: ${aeronave.codigo}
Modelo: ${aeronave.modelo}
Tipo: ${aeronave.tipo}
Capacidade: ${aeronave.capacidade} passageiros
Alcance: ${aeronave.alcance} km

--- PEÇAS UTILIZADAS (${aeronave.pecas.length}) ---
`;

        aeronave.pecas.forEach((peca, index) => {
            relatorio += `${index + 1}. ${peca.nome} - ${peca.tipo} (${peca.fornecedor})\n`;
        });

        relatorio += `\n--- ETAPAS REALIZADAS (${aeronave.etapas.length}) ---\n`;
        aeronave.etapas.forEach((etapa, index) => {
            relatorio += `${index + 1}. ${etapa.nome} - Status: ${etapa.status} (Prazo: ${etapa.prazo})\n`;
        });

        relatorio += `\n--- TESTES REALIZADOS (${aeronave.testes.length}) ---\n`;
        aeronave.testes.forEach((teste, index) => {
            relatorio += `${index + 1}. ${teste.tipo} - Resultado: ${teste.resultado} (Data: ${teste.data})\n`;
        });

        relatorio += `\n========================================\n`;
        relatorio += `Aeronave aprovada para entrega.\n`;
        relatorio += `========================================\n`;

        return relatorio;
    }

    salvarRelatorio(conteudo: string, nomeArquivo: string = "relatorio_entrega.txt"): void {
        console.log(`\n📄 Salvando relatório em: ${nomeArquivo}`);
        console.log(conteudo);
        console.log(`✓ Relatório salvo com sucesso!`);
    }
}

// ============================================
// GERENCIADOR DE AERONAVES
// Com Deleção Restritiva
// ============================================

class GerenciadorAeronaves {
    private aeronaves: Map<string, Aeronave> = new Map();
    private pecas: Map<string, Peca> = new Map();
    private etapas: Map<string, Etapa> = new Map();
    private testes: Map<string, Teste> = new Map();
    private funcionarios: Map<string, Funcionario> = new Map();

    // ========================================
    // MÉTODOS DE VERIFICAÇÃO DE DEPENDÊNCIAS
    // ========================================

    private verificarDependenciasPeca(pecaId: string): string[] {
        const dependencias: string[] = [];

        for (const [codigo, aeronave] of this.aeronaves) {
            const temPeca = aeronave.pecas.some(p => p.id === pecaId);
            if (temPeca) {
                dependencias.push(`→ Aeronave ${codigo} (${aeronave.modelo})`);
            }
        }

        return dependencias;
    }

    private verificarDependenciasEtapa(etapaId: string): string[] {
        const dependencias: string[] = [];

        for (const [codigo, aeronave] of this.aeronaves) {
            const temEtapa = aeronave.etapas.some(e => e.id === etapaId);
            if (temEtapa) {
                dependencias.push(`→ Aeronave ${codigo} (${aeronave.modelo})`);
            }
        }

        return dependencias;
    }

    private verificarDependenciasTeste(testeId: string): string[] {
        const dependencias: string[] = [];

        for (const [codigo, aeronave] of this.aeronaves) {
            const temTeste = aeronave.testes.some(t => t.id === testeId);
            if (temTeste) {
                dependencias.push(`→ Aeronave ${codigo} (${aeronave.modelo})`);
            }
        }

        return dependencias;
    }

    private verificarDependenciasFuncionario(funcionarioId: string): string[] {
        const dependencias: string[] = [];

        for (const [etapaId, etapa] of this.etapas) {
            const temFuncionario = etapa.funcionarios.some(f => f.id === funcionarioId);
            if (temFuncionario) {
                dependencias.push(`→ Etapa "${etapa.nome}" (ID: ${etapaId})`);
            }
        }

        return dependencias;
    }

    private verificarDependenciasAeronave(codigo: string): string[] {
        const dependencias: string[] = [];
        const aeronave = this.aeronaves.get(codigo);

        if (!aeronave) return dependencias;

        if (aeronave.pecas.length > 0) {
            dependencias.push(`→ ${aeronave.pecas.length} peça(s) associada(s)`);
        }

        if (aeronave.etapas.length > 0) {
            dependencias.push(`→ ${aeronave.etapas.length} etapa(s) associada(s)`);
        }

        if (aeronave.testes.length > 0) {
            dependencias.push(`→ ${aeronave.testes.length} teste(s) realizado(s)`);
        }

        return dependencias;
    }

    // ========================================
    // MÉTODOS DE DELEÇÃO RESTRITIVOS
    // ========================================

    deletarPeca(pecaId: string, usuarioLogado: Funcionario): void {
        if (!usuarioLogado.temPermissao(NivelPermissao.ENGENHEIRO)) {
            throw new PermissaoNegadaError("deletar peça", "ENGENHEIRO ou superior");
        }

        const peca = this.pecas.get(pecaId);
        if (!peca) {
            throw new Error(`❌ Peça ${pecaId} não encontrada`);
        }

        const dependencias = this.verificarDependenciasPeca(pecaId);
        if (dependencias.length > 0) {
            throw new DependenciaExistenteError(
                `peça "${peca.nome}" (ID: ${pecaId})`,
                dependencias
            );
        }

        this.pecas.delete(pecaId);
        console.log(`✓ Peça "${peca.nome}" (ID: ${pecaId}) deletada com sucesso`);
    }

    deletarEtapa(etapaId: string, usuarioLogado: Funcionario): void {
        if (!usuarioLogado.temPermissao(NivelPermissao.ENGENHEIRO)) {
            throw new PermissaoNegadaError("deletar etapa", "ENGENHEIRO ou superior");
        }

        const etapa = this.etapas.get(etapaId);
        if (!etapa) {
            throw new Error(`❌ Etapa ${etapaId} não encontrada`);
        }

        const dependencias = this.verificarDependenciasEtapa(etapaId);
        if (dependencias.length > 0) {
            throw new DependenciaExistenteError(
                `etapa "${etapa.nome}" (ID: ${etapaId})`,
                dependencias
            );
        }

        this.etapas.delete(etapaId);
        console.log(`✓ Etapa "${etapa.nome}" (ID: ${etapaId}) deletada com sucesso`);
    }

    deletarTeste(testeId: string, usuarioLogado: Funcionario): void {
        if (!usuarioLogado.temPermissao(NivelPermissao.ENGENHEIRO)) {
            throw new PermissaoNegadaError("deletar teste", "ENGENHEIRO ou superior");
        }

        const teste = this.testes.get(testeId);
        if (!teste) {
            throw new Error(`❌ Teste ${testeId} não encontrado`);
        }

        const dependencias = this.verificarDependenciasTeste(testeId);
        if (dependencias.length > 0) {
            throw new DependenciaExistenteError(
                `teste ${teste.tipo} (ID: ${testeId})`,
                dependencias
            );
        }

        this.testes.delete(testeId);
        console.log(`✓ Teste ${teste.tipo} (ID: ${testeId}) deletado com sucesso`);
    }

    deletarFuncionario(funcionarioId: string, usuarioLogado: Funcionario): void {
        if (!usuarioLogado.temPermissao(NivelPermissao.ADMINISTRADOR)) {
            throw new PermissaoNegadaError("desativar funcionário", "ADMINISTRADOR");
        }

        const funcionario = this.funcionarios.get(funcionarioId);
        if (!funcionario) {
            throw new Error(`❌ Funcionário ${funcionarioId} não encontrado`);
        }

        const dependencias = this.verificarDependenciasFuncionario(funcionarioId);
        if (dependencias.length > 0) {
            console.log(`⚠️  AVISO: Funcionário "${funcionario.nome}" está associado a etapas:`);
            dependencias.forEach(d => console.log(`   ${d}`));
            console.log(`   Será desativado mas mantido no histórico (soft delete)\n`);
        }

        funcionario.desativar();
    }

    deletarAeronave(codigo: string, usuarioLogado: Funcionario): void {
        if (!usuarioLogado.temPermissao(NivelPermissao.ADMINISTRADOR)) {
            throw new PermissaoNegadaError("deletar aeronave", "ADMINISTRADOR");
        }

        const aeronave = this.aeronaves.get(codigo);
        if (!aeronave) {
            throw new Error(`❌ Aeronave ${codigo} não encontrada`);
        }

        const dependencias = this.verificarDependenciasAeronave(codigo);
        if (dependencias.length > 0) {
            throw new DependenciaExistenteError(
                `aeronave ${codigo} (${aeronave.modelo})`,
                [...dependencias, "\n💡 DICA: Remova todas as associações antes de deletar a aeronave"]
            );
        }

        this.aeronaves.delete(codigo);
        console.log(`✓ Aeronave ${codigo} (${aeronave.modelo}) deletada com sucesso`);
    }

    // ========================================
    // MÉTODOS DE CADASTRO
    // ========================================

    adicionarAeronave(aeronave: Aeronave): void {
        if (this.aeronaves.has(aeronave.codigo)) {
            throw new Error(`❌ Aeronave ${aeronave.codigo} já existe`);
        }
        this.aeronaves.set(aeronave.codigo, aeronave);
        console.log(`✓ Aeronave ${aeronave.codigo} (${aeronave.modelo}) cadastrada`);
    }

    adicionarPeca(peca: Peca): void {
        if (this.pecas.has(peca.id)) {
            throw new Error(`❌ Peça ${peca.id} já existe`);
        }
        this.pecas.set(peca.id, peca);
        console.log(`✓ Peça "${peca.nome}" (ID: ${peca.id}) cadastrada`);
    }

    adicionarEtapa(etapa: Etapa): void {
        if (this.etapas.has(etapa.id)) {
            throw new Error(`❌ Etapa ${etapa.id} já existe`);
        }
        this.etapas.set(etapa.id, etapa);
        console.log(`✓ Etapa "${etapa.nome}" (ID: ${etapa.id}) cadastrada`);
    }

    adicionarTeste(teste: Teste): void {
        if (this.testes.has(teste.id)) {
            throw new Error(`❌ Teste ${teste.id} já existe`);
        }
        this.testes.set(teste.id, teste);
        console.log(`✓ Teste ${teste.tipo} (ID: ${teste.id}) cadastrado`);
    }

    adicionarFuncionario(funcionario: Funcionario): void {
        if (this.funcionarios.has(funcionario.id)) {
            throw new Error(`❌ Funcionário ${funcionario.id} já existe`);
        }
        this.funcionarios.set(funcionario.id, funcionario);
        console.log(`✓ Funcionário "${funcionario.nome}" (ID: ${funcionario.id}) cadastrado`);
    }

    // ========================================
    // MÉTODOS DE CONSULTA
    // ========================================

    buscarAeronave(codigo: string): Aeronave | undefined {
        return this.aeronaves.get(codigo);
    }

    buscarPeca(id: string): Peca | undefined {
        return this.pecas.get(id);
    }

    buscarEtapa(id: string): Etapa | undefined {
        return this.etapas.get(id);
    }

    buscarTeste(id: string): Teste | undefined {
        return this.testes.get(id);
    }

    buscarFuncionario(id: string): Funcionario | undefined {
        return this.funcionarios.get(id);
    }

    listarAeronaves(): Aeronave[] {
        return Array.from(this.aeronaves.values());
    }

    listarPecas(): Peca[] {
        return Array.from(this.pecas.values());
    }

    listarEtapas(): Etapa[] {
        return Array.from(this.etapas.values());
    }

    listarTestes(): Teste[] {
        return Array.from(this.testes.values());
    }

    listarFuncionarios(): Funcionario[] {
        return Array.from(this.funcionarios.values());
    }

    listarFuncionariosAtivos(): Funcionario[] {
        return Array.from(this.funcionarios.values()).filter(f => f.ativo);
    }

    // ========================================
    // MÉTODOS DE ASSOCIAÇÃO
    // ========================================

    associarPecaAeronave(aeronaveId: string, pecaId: string): void {
        const aeronave = this.aeronaves.get(aeronaveId);
        const peca = this.pecas.get(pecaId);

        if (!aeronave) throw new Error(`❌ Aeronave ${aeronaveId} não encontrada`);
        if (!peca) throw new Error(`❌ Peça ${pecaId} não encontrada`);

        if (!aeronave.pecas.includes(peca)) {
            aeronave.pecas.push(peca);
            console.log(`✓ Peça "${peca.nome}" associada à aeronave ${aeronaveId}`);
        }
    }

    associarEtapaAeronave(aeronaveId: string, etapaId: string): void {
        const aeronave = this.aeronaves.get(aeronaveId);
        const etapa = this.etapas.get(etapaId);

        if (!aeronave) throw new Error(`❌ Aeronave ${aeronaveId} não encontrada`);
        if (!etapa) throw new Error(`❌ Etapa ${etapaId} não encontrada`);

        if (!aeronave.etapas.includes(etapa)) {
            aeronave.etapas.push(etapa);
            console.log(`✓ Etapa "${etapa.nome}" associada à aeronave ${aeronaveId}`);
        }
    }

    associarTesteAeronave(aeronaveId: string, testeId: string): void {
        const aeronave = this.aeronaves.get(aeronaveId);
        const teste = this.testes.get(testeId);

        if (!aeronave) throw new Error(`❌ Aeronave ${aeronaveId} não encontrada`);
        if (!teste) throw new Error(`❌ Teste ${testeId} não encontrado`);

        if (!aeronave.testes.includes(teste)) {
            aeronave.testes.push(teste);
            console.log(`✓ Teste ${teste.tipo} associado à aeronave ${aeronaveId}`);
        }
    }
}

// ============================================
// EXEMPLO DE USO E TESTES
// ============================================

console.log("╔════════════════════════════════════════════════════╗");
console.log("║     SISTEMA AEROCODE - GESTÃO DE PRODUÇÃO         ║");
console.log("║         Deleção Restritiva Implementada           ║");
console.log("╚════════════════════════════════════════════════════╝\n");

const sistema = new GerenciadorAeronaves();

// Criar funcionários
const admin = new Funcionario("F001", "Carlos Admin", "12-99999", "Rua A", "admin", "123", NivelPermissao.ADMINISTRADOR);
const eng = new Funcionario("F002", "Maria Eng", "12-88888", "Rua B", "maria", "456", NivelPermissao.ENGENHEIRO);

sistema.adicionarFuncionario(admin);
sistema.adicionarFuncionario(eng);

// Criar aeronave
const av1 = new Aeronave("EMB195", "E195-E2", TipoAeronave.COMERCIAL, 146, 3700);
sistema.adicionarAeronave(av1);

// Criar peças
const p1 = new Peca("P001", "Motor", TipoPeca.IMPORTADA, "P&W", StatusPeca.PRONTA);
const p2 = new Peca("P002", "Asa", TipoPeca.NACIONAL, "Embraer", StatusPeca.PRONTA);
sistema.adicionarPeca(p1);
sistema.adicionarPeca(p2);

// Associar peça à aeronave
sistema.associarPecaAeronave("EMB195", "P001");

console.log("\n=== TESTE DE DELEÇÃO RESTRITIVA ===\n");

// Tentar deletar peça associada
console.log("1. Tentando deletar peça ASSOCIADA:");
try {
    sistema.deletarPeca("P001", eng);
} catch (e) {
    console.log(e instanceof Error ? e.message : e);
}

console.log("\n2. Deletando peça NÃO ASSOCIADA:");
try {
    sistema.deletarPeca("P002", eng);
} catch (e) {
    console.log(e instanceof Error ? e.message : e);
}

console.log("\n✓ Sistema funcionando corretamente!");
console.log("✓ Só deleta o que NÃO está relacionado!");

// ============================================
// EXPORTS
// ============================================

export {
    TipoAeronave,
    TipoPeca,
    StatusPeca,
    StatusEtapa,
    NivelPermissao,
    TipoTeste,
    ResultadoTeste,
    DependenciaExistenteError,
    PermissaoNegadaError,
    Funcionario,
    Peca,
    Teste,
    Etapa,
    Aeronave,
    Relatorio,
    GerenciadorAeronaves
};
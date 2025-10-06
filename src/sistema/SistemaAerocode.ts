const readline = require('readline');
import {
    TipoAeronave, TipoPeca, StatusPeca, StatusEtapa,
    NivelPermissao, TipoTeste, ResultadoTeste
} from '../enums/index';
import { Aeronave } from '../models/Aeronave';
import { Peca } from '../models/Peca';
import { Etapa } from '../models/Etapa';
import { Teste } from '../models/Teste';
import { Funcionario } from '../models/Funcionario';
import { Relatorio } from '../services/Relatorio';
import { GerenciadorArquivos } from '../services/GerenciadorArquivos';
import { CatalogoPecas } from '../services/CatalogoPecas';
// Interface para o formato das peças retornadas pelo CatalogoPecas
interface PecaCatalogo {
    nome: string;
    tipo: TipoPeca;
    fornecedor: string;
}
export class SistemaAerocode {
    private funcionarios: Funcionario[] = [];
    private aeronaves: Aeronave[] = [];
    private usuarioLogado: Funcionario | null = null;
    private interfaceReadline: any;
    private readonly SEPARADOR_GRANDE = "=".repeat(80);
    private readonly SEPARADOR_MEDIO = "=".repeat(60);
    constructor() {
        this.interfaceReadline = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        GerenciadorArquivos.inicializar();
        this.carregarDados();
        this.criarUsuarioAdminPadrao();
    }
    // ==================== INICIALIZACAO ====================
    private criarUsuarioAdminPadrao(): void {
        const adminJaExiste = this.funcionarios.some(f => f.usuario === 'admin');
        if (!adminJaExiste) {
            const admin = new Funcionario(
                '1',
                'Administrador do Sistema',
                '(00) 0000-0000',
                'Sistema',
                'admin',
                '123456',
                NivelPermissao.ADMINISTRADOR
            );
            this.funcionarios.push(admin);
            this.salvarDados();
            console.log('Usuario administrador criado: admin / 123456');
        }
    }
    private carregarDados(): void {
        this.funcionarios = GerenciadorArquivos.carregarFuncionarios();
        this.aeronaves = GerenciadorArquivos.carregarAeronaves(this.funcionarios);
    }
    private salvarDados(): void {
        GerenciadorArquivos.salvarFuncionarios(this.funcionarios);
        GerenciadorArquivos.salvarAeronaves(this.aeronaves);
    }
    private gerarProximoCodigoFuncionario(): string {
        if (this.funcionarios.length === 0) return "1";
        const codigos = this.funcionarios
            .map(f => parseInt(f.codigo))
            .filter(c => !isNaN(c));
        if (codigos.length === 0) return "1";
        return (Math.max(...codigos) + 1).toString();
    }
    private gerarProximoCodigoAeronave(): string {
        if (this.aeronaves.length === 0) return "AER001";
        const codigos = this.aeronaves
            .map(a => {
                const num = a.codigo.replace(/[^0-9]/g, '');
                return parseInt(num);
            })
            .filter(c => !isNaN(c));
        if (codigos.length === 0) return "AER001";
        const proximo = Math.max(...codigos) + 1;
        return `AER${proximo.toString().padStart(3, '0')}`;
    }
    // Método adicionado para obter funcionário por código, conforme sua sugestão
    public obterFuncionarioPorCodigo(codigo: string): Funcionario | null {
        return this.funcionarios.find(f => f.codigo === codigo) || null;
    }
    private async pergunta(texto: string): Promise<string> {
        return new Promise((resolve) => {
            this.interfaceReadline.question(texto, resolve);
        });
    }
    private exibirCabecalho(titulo: string): void {
        console.log("\n" + this.SEPARADOR_GRANDE);
        console.log(` ${titulo}`);
        console.log(this.SEPARADOR_GRANDE);
    }
    // SELECAO ROBUSTA DE AERONAVE
    private async selecionarAeronave(): Promise<Aeronave | null> {
        if (this.aeronaves.length === 0) {
            console.log("\nNenhuma aeronave cadastrada no sistema.");
            return null;
        }
        console.log("\n--- AERONAVES DISPONIVEIS ---");
        this.aeronaves.forEach((a, i) => {
            console.log(`${i + 1}. [${a.codigo}] ${a.modelo} (${a.tipo}) - Cliente: ${a.cliente}`);
        });
        console.log("-".repeat(60));
        const opcao = await this.pergunta("Digite o NUMERO (1,2,3...) ou CODIGO (AER001): ");
        if (!opcao || opcao.trim() === "") {
            console.log("Selecao cancelada.");
            return null;
        }
        // Tentar como numero da lista
        const numero = parseInt(opcao);
        if (!isNaN(numero) && numero >= 1 && numero <= this.aeronaves.length) {
            const aeronave = this.aeronaves[numero - 1];
            console.log(`Aeronave selecionada: ${aeronave.codigo} - ${aeronave.modelo}`);
            return aeronave;
        }
        // Tentar como codigo
        const aeronave = this.aeronaves.find(a =>
            a.codigo.toUpperCase() === opcao.toUpperCase().trim()
        );
        if (aeronave) {
            console.log(`Aeronave selecionada: ${aeronave.codigo} - ${aeronave.modelo}`);
            return aeronave;
        }
        console.log("Aeronave nao encontrada!");
        return null;
    }
    // ==================== LOGIN E PERMISSOES ====================
    private async login(): Promise<boolean> {
        console.log("\n" + "=".repeat(50));
        console.log(" SISTEMA AEROCODE");
        console.log(" Gestao de Producao de Aeronaves");
        console.log("=".repeat(50));
        const usuario = await this.pergunta("Usuario: ");
        const senha = await this.pergunta("Senha: ");
        const func = this.funcionarios.find(f => f.autenticar(usuario, senha));
        if (func) {
            this.usuarioLogado = func;
            console.log(`\nBem-vindo, ${func.nome}! (${func.nivelPermissao})`);
            return true;
        }
        console.log("\nCredenciais invalidas!");
        return false;
    }
    private verificarPermissao(nivel: NivelPermissao): boolean {
        if (!this.usuarioLogado) return false;
        const hierarquia: Record<string, number> = {
            [NivelPermissao.OPERADOR]: 1,
            [NivelPermissao.ENGENHEIRO]: 2,
            [NivelPermissao.ADMINISTRADOR]: 3
        };
        return hierarquia[this.usuarioLogado.nivelPermissao] >= hierarquia[nivel];
    }
    // ==================== MENU PRINCIPAL ====================
    private async menuPrincipal(): Promise<void> {
        while (true) {
            console.log("\n" + "=".repeat(40));
            console.log(" MENU PRINCIPAL");
            console.log("=".repeat(40));
            console.log("1. Gerenciar Aeronaves");
            console.log("2. Gerenciar Pecas");
            console.log("3. Gerenciar Etapas");
            console.log("4. Gerenciar Funcionarios");
            console.log("5. Gerenciar Testes");
            console.log("6. Gerar Relatorio");
            console.log("7. Ver Catalogo de Pecas");
            console.log("8. Sair");
            console.log("=".repeat(40));
            const opcao = await this.pergunta("Escolha uma opcao: ");
            switch (opcao) {
                case '1': await this.menuAeronaves(); break;
                case '2': await this.menuPecas(); break;
                case '3': await this.menuEtapas(); break;
                case '4': await this.menuFuncionarios(); break;
                case '5': await this.menuTestes(); break;
                case '6': await this.gerarRelatorio(); break;
                case '7': await this.visualizarCatalogoPecas(); break;
                case '8': return;
                default: console.log("Opcao invalida!");
            }
        }
    }
    // ==================== AERONAVES ====================
    private async menuAeronaves(): Promise<void> {
        while (true) {
            console.log("\n--- GERENCIAR AERONAVES ---");
            console.log("1. Cadastrar Aeronave");
            console.log("2. Listar Aeronaves");
            console.log("3. Voltar");
            const opcao = await this.pergunta("Escolha: ");
            switch (opcao) {
                case '1': await this.cadastrarAeronave(); break;
                case '2': await this.listarAeronavesDetalhado(); break;
                case '3': return;
                default: console.log("Opcao invalida!");
            }
        }
    }
    private async cadastrarAeronave(): Promise<void> {
        if (!this.verificarPermissao(NivelPermissao.ENGENHEIRO)) {
            console.log("\nPermissao insuficiente! Apenas ENGENHEIRO e ADMINISTRADOR.");
            return;
        }
        const codigo = this.gerarProximoCodigoAeronave();
        console.log(`\nCodigo gerado: ${codigo}`);
        const modelo = await this.pergunta("Modelo: ");
        const tipoStr = await this.pergunta("Tipo (COMERCIAL/MILITAR): ");
        const capacidade = parseInt(await this.pergunta("Capacidade (passageiros): "));
        const alcance = parseInt(await this.pergunta("Alcance (km): "));
        const cliente = await this.pergunta("Cliente: ");
        const tipo = tipoStr.toUpperCase() === "COMERCIAL"
            ? TipoAeronave.COMERCIAL
            : TipoAeronave.MILITAR;
        // Correção para a linha 221: Convertendo Date para string ISO
        const aeronave = new Aeronave(codigo, modelo, tipo, capacidade, alcance, cliente, new Date().toISOString());
        // Criar etapas padrao
        const hoje = Date.now();
        const dia = 24 * 60 * 60 * 1000; // Um dia em milissegundos
        [
            new Etapa("Montagem da Fuselagem", new Date(hoje + 7 * dia), StatusEtapa.PENDENTE, 1),
            new Etapa("Instalacao das Asas", new Date(hoje + 14 * dia), StatusEtapa.PENDENTE, 2),
            new Etapa("Montagem do Trem de Pouso", new Date(hoje + 21 * dia), StatusEtapa.PENDENTE, 3),
            new Etapa("Instalacao dos Motores", new Date(hoje + 28 * dia), StatusEtapa.PENDENTE, 4),
            new Etapa("Testes Finais", new Date(hoje + 35 * dia), StatusEtapa.PENDENTE, 5)
        ].forEach(e => aeronave.adicionarEtapa(e));
        this.aeronaves.push(aeronave);
        this.salvarDados();
        console.log("\nAeronave cadastrada com sucesso!");
        console.log(`Codigo: ${codigo}`);
        console.log(`Modelo: ${modelo}`);
        console.log(`5 etapas criadas automaticamente`);
    }
    private async listarAeronavesDetalhado(): Promise<void> {
        if (this.aeronaves.length === 0) {
            console.log("\nNenhuma aeronave cadastrada.");
            return;
        }
        this.exibirCabecalho("AERONAVES CADASTRADAS");
        this.aeronaves.forEach((a, i) => {
            const etapas = a.getEtapas();
            const concluidas = etapas.filter(e => e.status === StatusEtapa.CONCLUIDA).length;
            const progresso = etapas.length > 0 ? Math.round((concluidas / etapas.length) * 100) : 0;
            console.log(`\n${i + 1}. [${a.codigo}] ${a.modelo}`);
            console.log(` Tipo: ${a.tipo} | Capacidade: ${a.capacidade} pass. | Alcance: ${a.alcance} km`);
            console.log(` Cliente: ${a.cliente}`);
            console.log(` Progresso: ${progresso}% (${concluidas}/${etapas.length} etapas concluidas)`);
            console.log(` Pecas: ${a.getPecas().length} | Testes: ${a.getTestes().length}`);
        });
        console.log(this.SEPARADOR_GRANDE);
        await this.pergunta("\nPressione Enter para continuar...");
    }
    private async visualizarCatalogoPecas(): Promise<void> {
        this.exibirCabecalho("CATALOGO DE PECAS DISPONIVEIS");
        const pecas = CatalogoPecas.obterPecasDisponiveis();
        console.log(`\nTotal: ${pecas.length} pecas disponiveis\n`);
        const nacionais = pecas.filter(p => p.tipo === TipoPeca.NACIONAL);
        const importadas = pecas.filter(p => p.tipo === TipoPeca.IMPORTADA);
        console.log("--- PECAS NACIONAIS ---");
        nacionais.forEach((p, i) => {
            console.log(`${i + 1}. ${p.nome} - ${p.fornecedor}`);
        });
        console.log("\n--- PECAS IMPORTADAS ---");
        importadas.forEach((p, i) => {
            console.log(`${i + 1}. ${p.nome} - ${p.fornecedor}`);
        });
        console.log(`\nResumo: ${nacionais.length} nacionais, ${importadas.length} importadas`);
        console.log(this.SEPARADOR_GRANDE);
        await this.pergunta("\nPressione Enter para continuar...");
    }
    // ==================== PECAS ====================
    private async menuPecas(): Promise<void> {
        while (true) {
            console.log("\n--- GERENCIAR PECAS ---");
            console.log("1. Adicionar Peca a Aeronave");
            console.log("2. Atualizar Status de Peca");
            console.log("3. Associar Funcionario a Peca");
            console.log("4. Remover Funcionario de Peca");
            console.log("5. Listar Todas as Pecas (Detalhado)");
            console.log("6. Voltar");
            const opcao = await this.pergunta("Escolha: ");
            switch (opcao) {
                case '1': await this.adicionarPeca(); break;
                case '2': await this.atualizarStatusPeca(); break;
                case '3': await this.associarFuncionarioPeca(); break;
                case '4': await this.removerFuncionarioPeca(); break; // Corrigido e completado
                case '5': await this.listarTodasPecasComDetalhes(); break;
                case '6': return;
                default: console.log("Opcao invalida!");
            }
        }
    }
    private async adicionarPeca(): Promise<void> {
        if (!this.verificarPermissao(NivelPermissao.ENGENHEIRO)) {
            console.log("\nPermissao insuficiente!");
            return;
        }
        const aeronave = await this.selecionarAeronave();
        if (!aeronave) return;
        console.log("\nDigite o nome ou categoria da peca (ex: 'motor', 'asa', 'todas' para listar tudo):");
        const busca = await this.pergunta("Buscar: ");
        if (!busca) return;
        // Alterado para usar a interface PecaCatalogo
        let resultadosCatalogo: PecaCatalogo[] = [];
        if (busca.toLowerCase() === 'todas') {
            resultadosCatalogo = CatalogoPecas.obterPecasDisponiveis();
        } else {
            resultadosCatalogo = CatalogoPecas.buscarPecas(busca);
        }
        if (resultadosCatalogo.length === 0) {
            console.log("Nenhuma peca encontrada com o termo de busca.");
            return;
        }
        console.log(`\nEncontradas ${resultadosCatalogo.length} peca(s):`);
        // Agrupando e exibindo por tipo
        const pecasNacionais = resultadosCatalogo.filter(p => p.tipo === TipoPeca.NACIONAL);
        const pecasImportadas = resultadosCatalogo.filter(p => p.tipo === TipoPeca.IMPORTADA);
        let currentNumber = 1;
        // Array para armazenar as peças do catálogo com numeração para seleção
        const numberedPecasParaSelecao: PecaCatalogo[] = [];
        if (pecasNacionais.length > 0) {
            console.log("\n--- PECAS NACIONAIS ---");
            pecasNacionais.forEach(p => {
                console.log(`${currentNumber}. ${p.nome} - ${p.fornecedor}`);
                numberedPecasParaSelecao.push(p);
                currentNumber++;
            });
        }
        if (pecasImportadas.length > 0) {
            console.log("\n--- PECAS IMPORTADAS ---");
            pecasImportadas.forEach(p => {
                console.log(`${currentNumber}. ${p.nome} - ${p.fornecedor}`);
                numberedPecasParaSelecao.push(p);
                currentNumber++;
            });
        }
        const numero = parseInt(await this.pergunta(`\nEscolha (1-${numberedPecasParaSelecao.length}): `));
        if (isNaN(numero) || numero < 1 || numero > numberedPecasParaSelecao.length) {
            console.log("Numero invalido!");
            return;
        }
        // Pega o objeto PecaCatalogo selecionado
        const pecaEscolhidaCatalogo = numberedPecasParaSelecao[numero - 1];
        console.log("\n--- STATUS INICIAL ---");
        console.log("1. EM_PRODUCAO");
        console.log("2. EM_TRANSPORTE");
        console.log("3. PRONTA");
        const opcao = await this.pergunta("Status (1-3) - Usar a opção numérica: ");
        let status: StatusPeca;
        switch (opcao) {
            case '1': status = StatusPeca.EM_PRODUCAO; break;
            case '2': status = StatusPeca.EM_TRANSPORTE; break;
            case '3': status = StatusPeca.PRONTA; break;
            default:
                status = StatusPeca.EM_PRODUCAO;
                console.log("Status invalido. Usando EM_PRODUCAO.");
        }
        // CRIA UMA NOVA INSTANCIA DA CLASSE PECA com base na seleção do catálogo
        const novaPeca = new Peca(pecaEscolhidaCatalogo.nome, pecaEscolhidaCatalogo.tipo, pecaEscolhidaCatalogo.fornecedor, status);
        aeronave.adicionarPeca(novaPeca);
        // Permitir associar funcionario durante a criacao da peca
        if (this.verificarPermissao(NivelPermissao.ENGENHEIRO)) {
            const perguntaAssociar = await this.pergunta("Deseja associar um funcionario responsavel agora? (s/n): ");
            if (perguntaAssociar.toLowerCase() === 's') {
                if (this.funcionarios.length === 0) {
                    console.log("Nenhum funcionario cadastrado no sistema.");
                } else {
                    console.log("\n--- FUNCIONARIOS DISPONIVEIS ---");
                    this.funcionarios.forEach((funcionario, indice) => {
                        const numeroNaLista = indice + 1;
                        console.log(`${numeroNaLista}. ${funcionario.nome} (${funcionario.nivelPermissao})`);
                    });
                    const numeroFuncionario = parseInt(
                        await this.pergunta("Numero do funcionario (0 para pular): ")
                    );
                    const indiceFuncionario = numeroFuncionario - 1;
                    if (indiceFuncionario >= 0 && indiceFuncionario < this.funcionarios.length) {
                        novaPeca.associarFuncionario(this.funcionarios[indiceFuncionario]);
                        console.log(`Funcionario '${this.funcionarios[indiceFuncionario].nome}' associado a peca!`);
                    } else if (numeroFuncionario !== 0) {
                        console.log("Numero de funcionario invalido.");
                    }
                }
            }
        }
        this.salvarDados();
        console.log(`Peca '${pecaEscolhidaCatalogo.nome}' adicionada com sucesso a aeronave ${aeronave.codigo}!`);
    }
    private async atualizarStatusPeca(): Promise<void> {
        // CORREÇÃO AQUI: NivelPermissao.OPERADOR foi alterado para NivelPermissao.ENGENHEIRO
        if (!this.verificarPermissao(NivelPermissao.ENGENHEIRO)) {
            console.log("\nPermissao insuficiente! Apenas ENGENHEIRO e ADMINISTRADOR podem atualizar o status de pecas.");
            return;
        }
        const aeronave = await this.selecionarAeronave();
        if (!aeronave) return;
        const pecas = aeronave.getPecas();
        if (pecas.length === 0) {
            console.log("\nNenhuma peca cadastrada nesta aeronave.");
            return;
        }
        console.log("\n--- PECAS DA AERONAVE ---");
        pecas.forEach((p, i) => {
            console.log(`${i + 1}. ${p.nome}`);
            console.log(` Status atual: ${p.status}`);
            console.log(` Tipo: ${p.tipo} | Fornecedor: ${p.fornecedor}`);
        });
        const numero = parseInt(await this.pergunta("\nNumero da peca: "));
        const indice = numero - 1;
        if (isNaN(numero) || indice < 0 || indice >= pecas.length) {
            console.log("Numero invalido!");
            return;
        }
        const peca = pecas[indice];
        console.log(`\n--- ALTERAR STATUS DE: ${peca.nome} ---`);
        console.log(`Status atual: ${peca.status}`);
        console.log("\n--- NOVO STATUS (pode escolher qualquer um) ---");
        console.log("1. EM_PRODUCAO");
        console.log("2. EM_TRANSPORTE");
        console.log("3. PRONTA");
        const opcao = await this.pergunta("Novo status (1-3) Utilizar opção numérica: ");
        let novoStatus: StatusPeca;
        switch (opcao) {
            case '1': novoStatus = StatusPeca.EM_PRODUCAO; break;
            case '2': novoStatus = StatusPeca.EM_TRANSPORTE; break;
            case '3': novoStatus = StatusPeca.PRONTA; break;
            default:
                console.log("Opcao invalida!");
                return;
        }
        // PERMITE MUDANCA LIVRE DE STATUS - SEM RESTRICOES
        peca.atualizarStatus(novoStatus);
        this.salvarDados();
        console.log(`\nStatus atualizado com sucesso!`);
        console.log(` ${peca.nome}: ${peca.status}`);
        console.log("\nPecas podem alternar livremente entre os status!");
    }
    private async associarFuncionarioPeca(): Promise<void> {
        if (!this.verificarPermissao(NivelPermissao.ENGENHEIRO)) {
            console.log("\nPermissao insuficiente!");
            return;
        }
        const aeronave = await this.selecionarAeronave();
        if (!aeronave) return;
        const pecasDaAeronave = aeronave.getPecas();
        if (pecasDaAeronave.length === 0) {
            console.log("\nNenhuma peca cadastrada para esta aeronave.");
            return;
        }
        console.log("\n--- PECAS DA AERONAVE ---");
        pecasDaAeronave.forEach((p, i) => {
            console.log(`${i + 1}. ${p.nome} (Status: ${p.status})`);
            const funcsAssociados = p.listarFuncionarios();
            if (funcsAssociados.length > 0) {
                console.log(`   Responsáveis: ${funcsAssociados.map(f => f.nome).join(', ')}`);
            } else {
                console.log(`   Responsáveis: Nenhum`);
            }
        });

        const numeroPeca = parseInt(await this.pergunta("Numero da peca para associar funcionario: "));
        const indicePeca = numeroPeca - 1;

        if (isNaN(numeroPeca) || indicePeca < 0 || indicePeca >= pecasDaAeronave.length) {
            console.log("Numero de peca invalido.");
            return;
        }
        const pecaAlvo = pecasDaAeronave[indicePeca];

        if (this.funcionarios.length === 0) {
            console.log("Nenhum funcionario cadastrado no sistema.");
            return;
        }

        console.log("\n--- FUNCIONARIOS DISPONIVEIS ---");
        this.funcionarios.forEach((funcionario, indice) => {
            const numeroNaLista = indice + 1;
            console.log(`${numeroNaLista}. ${funcionario.nome} (${funcionario.nivelPermissao})`);
        });

        const numeroFuncionario = parseInt(await this.pergunta("Numero do funcionario para associar: "));
        const indiceFuncionario = numeroFuncionario - 1;

        if (isNaN(numeroFuncionario) || indiceFuncionario < 0 || indiceFuncionario >= this.funcionarios.length) {
            console.log("Numero de funcionario invalido.");
            return;
        }
        const funcionarioParaAssociar = this.funcionarios[indiceFuncionario];

        const sucesso = pecaAlvo.associarFuncionario(funcionarioParaAssociar);
        if (sucesso) {
            console.log(`Funcionario '${funcionarioParaAssociar.nome}' associado a peca '${pecaAlvo.nome}'!`);
        } else {
            console.log(`Funcionario '${funcionarioParaAssociar.nome}' ja esta associado a peca '${pecaAlvo.nome}'.`);
        }
        this.salvarDados();
    }

    private async removerFuncionarioPeca(): Promise<void> {
        if (!this.verificarPermissao(NivelPermissao.ENGENHEIRO)) {
            console.log("\nPermissao insuficiente!");
            return;
        }
        const aeronave = await this.selecionarAeronave();
        if (!aeronave) return;

        const pecasDaAeronave = aeronave.getPecas();
        if (pecasDaAeronave.length === 0) {
            console.log("\nNenhuma peca cadastrada para esta aeronave.");
            return;
        }

        console.log("\n--- PECAS DA AERONAVE ---");
        pecasDaAeronave.forEach((p, i) => {
            console.log(`${i + 1}. ${p.nome} (Status: ${p.status})`);
            const funcsAssociados = p.listarFuncionarios();
            if (funcsAssociados.length > 0) {
                console.log(`   Responsáveis: ${funcsAssociados.map(f => f.nome).join(', ')}`);
            } else {
                console.log(`   Responsáveis: Nenhum`);
            }
        });

        const numeroPeca = parseInt(await this.pergunta("Numero da peca para remover funcionario: "));
        const indicePeca = numeroPeca - 1;

        if (isNaN(numeroPeca) || indicePeca < 0 || indicePeca >= pecasDaAeronave.length) {
            console.log("Numero de peca invalido.");
            return;
        }
        const pecaAlvo = pecasDaAeronave[indicePeca];

        const funcionariosDaPeca = pecaAlvo.listarFuncionarios();
        if (funcionariosDaPeca.length === 0) {
            console.log(`Nenhum funcionario associado a peca '${pecaAlvo.nome}'.`);
            return;
        }

        console.log(`\n--- FUNCIONARIOS ASSOCIADOS A '${pecaAlvo.nome}' ---`);
        funcionariosDaPeca.forEach((func, i) => {
            console.log(`${i + 1}. ${func.nome} (${func.nivelPermissao})`);
        });

        const numeroFuncionario = parseInt(await this.pergunta("Numero do funcionario para remover: "));
        const indiceFuncionario = numeroFuncionario - 1;

        if (isNaN(numeroFuncionario) || indiceFuncionario < 0 || indiceFuncionario >= funcionariosDaPeca.length) {
            console.log("Numero de funcionario invalido.");
            return;
        }
        const funcionarioARemover = funcionariosDaPeca[indiceFuncionario];

        // CORREÇÃO AQUI: Passando o objeto Funcionario completo, não apenas o código.
        const sucesso = pecaAlvo.removerFuncionario(funcionarioARemover);
        if (sucesso) {
            console.log(`Funcionario '${funcionarioARemover.nome}' removido da peca '${pecaAlvo.nome}'!`);
        } else {
            console.log("Erro ao remover funcionario. Ele pode nao estar associado a esta peca.");
        }
        this.salvarDados();
    }
    private async listarTodasPecasComDetalhes(): Promise<void> {
        if (this.aeronaves.length === 0) {
            console.log("\nNenhuma aeronave cadastrada.");
            return;
        }
        this.exibirCabecalho("RELATORIO DETALHADO DE PECAS E RESPONSAVEIS");
        let totalPecas = 0;
        const contadoresStatus = {
            [StatusPeca.EM_PRODUCAO]: 0,
            [StatusPeca.EM_TRANSPORTE]: 0,
            [StatusPeca.PRONTA]: 0
        };
        this.aeronaves.forEach(aeronave => {
            const pecasDaAeronave = aeronave.getPecas();
            if (pecasDaAeronave.length > 0) {
                console.log(`\n--- AERONAVE ${aeronave.codigo} (${aeronave.modelo}) ---`);
                pecasDaAeronave.forEach((peca, pecaIndex) => {
                    const funcionariosDaPeca = peca.listarFuncionarios();
                    contadoresStatus[peca.status]++;
                    totalPecas++;
                    console.log(`\n${pecaIndex + 1}. Peca: ${peca.nome}`);
                    console.log(` Status: ${peca.status} | Tipo: ${peca.tipo}`);
                    console.log(` Fornecedor: ${peca.fornecedor}`);
                    if (funcionariosDaPeca.length === 0) {
                        console.log(` Funcionarios: Nenhum responsavel`);
                    } else {
                        console.log(` Funcionarios (${funcionariosDaPeca.length}):`);
                        funcionariosDaPeca.forEach((func, funcIndex) => {
                            console.log(` ${funcIndex + 1}. [${func.codigo}] ${func.nome} (${func.nivelPermissao})`);
                            console.log(` Telefone: ${func.telefone}`);
                        });
                    }
                    console.log("------------------------------------------------------------"); // Separador para cada peca
                });
            } else {
                console.log(`\n--- AERONAVE ${aeronave.codigo} (${aeronave.modelo}) ---`);
                console.log(" Nenhuma peca cadastrada para esta aeronave.");
            }
        });
        console.log(`\n${this.SEPARADOR_GRANDE}`);
        console.log("RESUMO GERAL DE PECAS:");
        console.log(`Total de pecas no sistema: ${totalPecas}`);
        console.log(`Em producao: ${contadoresStatus[StatusPeca.EM_PRODUCAO]}`);
        console.log(`Em transporte: ${contadoresStatus[StatusPeca.EM_TRANSPORTE]}`);
        console.log(`Prontas: ${contadoresStatus[StatusPeca.PRONTA]}`);
        console.log(this.SEPARADOR_GRANDE);
        await this.pergunta("\nPressione Enter para continuar...");
    }
    // ==================== FUNCIONARIOS ====================
    private async menuFuncionarios(): Promise<void> {
        while (true) {
            console.log("\n--- GERENCIAR FUNCIONARIOS ---");
            console.log("1. Cadastrar Funcionario");
            console.log("2. Listar Funcionarios");
            console.log("3. Voltar");
            const opcao = await this.pergunta("Escolha: ");
            switch (opcao) {
                case '1': await this.cadastrarFuncionario(); break;
                case '2': await this.listarFuncionarios(); break;
                case '3': return;
                default: console.log("Opcao invalida!");
            }
        }
    }
    private async cadastrarFuncionario(): Promise<void> {
        if (!this.verificarPermissao(NivelPermissao.ADMINISTRADOR)) {
            console.log("\nPermissao insuficiente! Apenas ADMINISTRADOR pode cadastrar funcionarios.");
            return;
        }
        const codigo = this.gerarProximoCodigoFuncionario();
        console.log(`\nCodigo gerado: ${codigo}`);
        const nome = await this.pergunta("Nome: ");
        const telefone = await this.pergunta("Telefone: ");
        const endereco = await this.pergunta("Endereco: ");
        const usuario = await this.pergunta("Usuario: ");
        if (this.funcionarios.some(f => f.usuario === usuario)) {
            console.log("Usuario ja existe!");
            return;
        }
        const senha = await this.pergunta("Senha: ");
        const nivelStr = await this.pergunta("Nivel (ADMINISTRADOR/ENGENHEIRO/OPERADOR): ");
        let nivel: NivelPermissao;
        switch (nivelStr.toUpperCase()) {
            case "ADMINISTRADOR": nivel = NivelPermissao.ADMINISTRADOR; break;
            case "ENGENHEIRO": nivel = NivelPermissao.ENGENHEIRO; break;
            case "OPERADOR": nivel = NivelPermissao.OPERADOR; break;
            default:
                console.log("Nivel invalido!");
                return;
        }
        const func = new Funcionario(codigo, nome, telefone, endereco, usuario, senha, nivel);
        this.funcionarios.push(func);
        this.salvarDados();
        console.log(`\nFuncionario cadastrado!`);
        console.log(`Codigo: ${codigo}`);
        console.log(`Nome: ${nome}`);
        console.log(`Nivel: ${nivel}`);
    }
    private async listarFuncionarios(): Promise<void> {
        if (this.funcionarios.length === 0) {
            console.log("\nNenhum funcionario cadastrado.");
            return;
        }
        this.exibirCabecalho("FUNCIONARIOS CADASTRADOS");
        const podeVerCredenciais = this.usuarioLogado?.nivelPermissao !== NivelPermissao.OPERADOR;
        this.funcionarios.forEach((f, i) => {
            console.log(`\n${i + 1}. [Codigo: ${f.codigo}] ${f.nome}`);
            console.log(` Nivel: ${f.nivelPermissao}`);
            console.log(` Tel: ${f.telefone}`);
            console.log(` Endereco: ${f.endereco}`);
            if (podeVerCredenciais) {
                console.log(` Login: ${f.usuario} | Senha: ${f.senha}`);
            }
        });
        console.log(this.SEPARADOR_GRANDE);
        await this.pergunta("\nPressione Enter...");
    }
    // ==================== ETAPAS ====================
    private async menuEtapas(): Promise<void> {
        while (true) {
            console.log("\n--- GERENCIAR ETAPAS ---");
            console.log("1. Iniciar Etapa");
            console.log("2. Finalizar Etapa");
            console.log("3. Associar Funcionario a Etapa");
            console.log("4. Listar Etapas Detalhadas");
            console.log("5. Voltar");
            const opcao = await this.pergunta("Escolha: ");
            switch (opcao) {
                case '1': await this.iniciarEtapa(); break;
                case '2': await this.finalizarEtapa(); break;
                case '3': await this.associarFuncionarioEtapa(); break;
                case '4': await this.listarEtapasDetalhadas(); break;
                case '5': return;
                default: console.log("Opcao invalida!");
            }
        }
    }
    private async iniciarEtapa(): Promise<void> {
        if (!this.verificarPermissao(NivelPermissao.ENGENHEIRO)) {
            console.log("\nPermissao insuficiente!");
            return;
        }
        const aeronave = await this.selecionarAeronave();
        if (!aeronave) return;
        const etapas = aeronave.getEtapas();
        console.log("\n--- ETAPAS ---");
        etapas.forEach((e, i) => {
            console.log(`${i + 1}. ${e.nome} - ${e.status}`);
        });
        const numero = parseInt(await this.pergunta("Numero da etapa: "));
        const indice = numero - 1;
        if (isNaN(numero) || indice < 0 || indice >= etapas.length) {
            console.log("Etapa invalida!");
            return;
        }
        const sucesso = etapas[indice].iniciar();
        if (sucesso) {
            this.salvarDados();
            console.log("\nEtapa iniciada!");
        } else {
            console.log(`Nao foi possivel iniciar a etapa '${etapas[indice].nome}'. Status atual: ${etapas[indice].status}`);
        }
    }
    private async finalizarEtapa(): Promise<void> {
        if (!this.verificarPermissao(NivelPermissao.ENGENHEIRO)) {
            console.log("\nPermissao insuficiente!");
            return;
        }
        const aeronave = await this.selecionarAeronave();
        if (!aeronave) return;
        const etapas = aeronave.getEtapas();
        console.log("\n--- ETAPAS ---");
        etapas.forEach((e, i) => {
            console.log(`${i + 1}. ${e.nome} - ${e.status}`);
        });
        const numero = parseInt(await this.pergunta("Numero da etapa: "));
        const indice = numero - 1;
        if (isNaN(numero) || indice < 0 || indice >= etapas.length) {
            console.log("Etapa invalida!");
            return;
        }
        const etapa = etapas[indice];
        if (etapa.status === StatusEtapa.PENDENTE) {
            console.log("Etapa pendente. Iniciando automaticamente...");
            etapa.iniciar();
        }
        if (aeronave.podeFinalizarEtapa(etapa)) {
            const sucesso = etapa.finalizar();
            if (sucesso) {
                this.salvarDados();
                console.log(`\nEtapa '${etapa.nome}' finalizada!`);
            }
        } else {
            console.log("Nao e possivel finalizar. Verifique a etapa anterior.");
        }
    }
    private async associarFuncionarioEtapa(): Promise<void> {
        if (!this.verificarPermissao(NivelPermissao.ENGENHEIRO)) {
            console.log("\nPermissao insuficiente!");
            return;
        }
        const aeronave = await this.selecionarAeronave();
        if (!aeronave) return;
        const etapas = aeronave.getEtapas();
        console.log("\n--- ETAPAS ---");
        etapas.forEach((e, i) => {
            console.log(`${i + 1}. ${e.nome} - ${e.status}`);
        });
        const numeroEtapa = parseInt(await this.pergunta("Numero da etapa: "));
        const indiceEtapa = numeroEtapa - 1;
        if (isNaN(numeroEtapa) || indiceEtapa < 0 || indiceEtapa >= etapas.length) {
            console.log("Etapa invalida!");
            return;
        }
        const etapa = etapas[indiceEtapa];
        console.log("\n--- FUNCIONARIOS ---");
        this.funcionarios.forEach((f, i) => {
            console.log(`${i + 1}. [${f.codigo}] ${f.nome} (${f.nivelPermissao})`);
        });
        const numeroFunc = parseInt(await this.pergunta("Numero do funcionario: "));
        const indiceFunc = numeroFunc - 1;
        if (isNaN(numeroFunc) || indiceFunc < 0 || indiceFunc >= this.funcionarios.length) {
            console.log("Funcionario invalido!");
            return;
        }
        const func = this.funcionarios[indiceFunc];
        const sucesso = etapa.associarFuncionario(func);
        if (sucesso) {
            this.salvarDados();
            console.log(`\nFuncionario '${func.nome}' associado a etapa '${etapa.nome}'!`);
            // Mostrar funcionarios da etapa
            const funcionarios = etapa.listarFuncionarios();
            console.log(`\n--- FUNCIONARIOS DA ETAPA ---`);
            funcionarios.forEach((f, i) => {
                console.log(`${i + 1}. ${f.nome} (${f.nivelPermissao})`);
            });
        } else {
            console.log(`Funcionario '${func.nome}' ja esta associado a esta etapa.`);
        }
    }
    private async listarEtapasDetalhadas(): Promise<void> {
        const aeronave = await this.selecionarAeronave();
        if (!aeronave) return;
        const etapas = aeronave.getEtapas();
        this.exibirCabecalho(`ETAPAS - AERONAVE ${aeronave.codigo}`);
        if (etapas.length === 0) {
            console.log("Nenhuma etapa cadastrada.");
        } else {
            etapas.forEach((e, i) => {
                const funcs = e.listarFuncionarios();
                console.log(`\n${i + 1}. ${e.nome}`);
                console.log(` Status: ${e.status}`);
                console.log(` Prazo: ${e.prazo.toLocaleDateString('pt-BR')}`);
                console.log(` Ordem: ${e.ordem}`);
                if (funcs.length === 0) {
                    console.log(` Funcionarios: Nenhum`);
                } else {
                    console.log(` Funcionarios (${funcs.length}):`);
                    funcs.forEach(f => {
                        console.log(` - ${f.nome} (${f.nivelPermissao})`);
                    });
                }
                console.log(` Acoes Possiveis:`);
                if (e.status === StatusEtapa.PENDENTE) {
                    console.log(` Pode ser iniciada`);
                } else if (e.status === StatusEtapa.ANDAMENTO) {
                    if (aeronave.podeFinalizarEtapa(e)) {
                        console.log(` Pode ser finalizada`);
                    } else {
                        console.log(` Aguardando etapa anterior`);
                    }
                } else {
                    console.log(` Etapa concluida`);
                }
            });
            const pendentes = etapas.filter(e => e.status === StatusEtapa.PENDENTE).length;
            const andamento = etapas.filter(e => e.status === StatusEtapa.ANDAMENTO).length;
            const concluidas = etapas.filter(e => e.status === StatusEtapa.CONCLUIDA).length;
            const progresso = etapas.length > 0 ? Math.round((concluidas / etapas.length) * 100) : 0;
            console.log(`\nRESUMO: ${etapas.length} etapas | Progresso: ${progresso}%`);
            console.log(`Pendentes: ${pendentes} | Andamento: ${andamento} | Concluidas: ${concluidas}`);
        }
        console.log(this.SEPARADOR_GRANDE);
        await this.pergunta("\nPressione Enter...");
    }
    // ==================== TESTES ====================
    private async menuTestes(): Promise<void> {
        while (true) {
            console.log("\n--- GERENCIAR TESTES ---");
            console.log("1. Adicionar Teste");
            console.log("2. Listar Testes de Aeronave");
            console.log("3. Voltar");
            const opcao = await this.pergunta("Escolha: ");
            switch (opcao) {
                case '1': await this.adicionarTeste(); break;
                case '2': await this.listarTestes(); break;
                case '3': return;
                default: console.log("Opcao invalida!");
            }
        }
    }
    private async adicionarTeste(): Promise<void> {
        if (!this.verificarPermissao(NivelPermissao.ENGENHEIRO)) {
            console.log("\nPermissao insuficiente!");
            return;
        }
        const aeronave = await this.selecionarAeronave();
        if (!aeronave) return;
        const tipoStr = await this.pergunta("Tipo (ELETRICO/HIDRAULICO/AERODINAMICO): ");
        let tipo: TipoTeste;
        switch (tipoStr.toUpperCase()) {
            case "ELETRICO": tipo = TipoTeste.ELETRICO; break;
            case "HIDRAULICO": tipo = TipoTeste.HIDRAULICO; break;
            case "AERODINAMICO": tipo = TipoTeste.AERODINAMICO; break;
            default:
                console.log("Tipo invalido!");
                return;
        }
        // Validar duplicidade
        const testes = aeronave.getTestes();
        if (testes.some(t => t.tipo === tipo)) {
            console.log(`\nJa existe teste do tipo ${tipo} para esta aeronave!`);
            console.log("Testes cadastrados:");
            testes.forEach((t, i) => {
                console.log(`${i + 1}. ${t.tipo} - ${t.resultado}`);
            });
            return;
        }
        const resultadoStr = await this.pergunta("Resultado (APROVADO/REPROVADO): ");
        let resultado: ResultadoTeste;
        switch (resultadoStr.toUpperCase()) {
            case "APROVADO": resultado = ResultadoTeste.APROVADO; break;
            case "REPROVADO": resultado = ResultadoTeste.REPROVADO; break;
            default:
                console.log("Resultado invalido!");
                return;
        }
        const teste = new Teste(tipo, resultado);
        aeronave.adicionarTeste(teste);
        this.salvarDados();
        console.log(`Teste ${tipo} adicionado com sucesso!`);
        console.log(`Resultado: ${resultado}`);
    }
    private async listarTestes(): Promise<void> {
        const aeronave = await this.selecionarAeronave();
        if (!aeronave) return;
        const testes = aeronave.getTestes();
        if (testes.length === 0) {
            console.log("\nNenhum teste realizado para esta aeronave.");
        } else {
            console.log(`\n--- TESTES DA AERONAVE ${aeronave.codigo} ---`);
            testes.forEach((t, i) => {
                const data = t.dataRealizacao.toLocaleDateString('pt-BR');
                console.log(`${i + 1}. ${t.tipo}`);
                console.log(` Resultado: ${t.resultado}`);
                console.log(` Data: ${data}`);
            });
        }
        await this.pergunta("\nPressione Enter...");
    }
    // ==================== RELATORIO ====================
    private async gerarRelatorio(): Promise<void> {
        if (!this.verificarPermissao(NivelPermissao.ENGENHEIRO)) {
            console.log("\nPermissao insuficiente!");
            return;
        }
        const aeronave = await this.selecionarAeronave();
        if (!aeronave) return;
        const etapas = aeronave.getEtapas();
        const todasConcluidas = etapas.every(e => e.status === StatusEtapa.CONCLUIDA);
        if (!todasConcluidas) {
            console.log("\nNem todas as etapas foram concluidas.");
            const resposta = await this.pergunta("Gerar relatorio mesmo assim? (s/n): ");
            if (resposta.toLowerCase() !== 's') return;
        }
        if (!aeronave.dataEntrega) {
            const pergunta = await this.pergunta("Definir data de entrega? (s/n): ");
            if (pergunta.toLowerCase() === 's') {
                const dataStr = await this.pergunta("Data (DD/MM/AAAA): ");
                try {
                    const partes = dataStr.split('/');
                    if (partes.length === 3) {
                        const dia = parseInt(partes[0]);
                        const mes = parseInt(partes[1]) - 1; // Mês é 0-indexado
                        const ano = parseInt(partes[2]);
                        const novaData = new Date(ano, mes, dia);
                        aeronave.definirDataEntrega(novaData);
                        this.salvarDados();
                    } else {
                        console.log("Formato de data invalido. Use DD/MM/AAAA.");
                    }
                } catch (erro) {
                    console.log("Data invalida. Continuando sem definir.");
                }
            }
        }
        const relatorio = Relatorio.gerar(aeronave);
        console.log(relatorio);
        const salvar = await this.pergunta("Salvar relatorio em arquivo? (s/n): ");
        if (salvar.toLowerCase() === 's') {
            Relatorio.salvarArquivo(aeronave, relatorio);
        }
    }
    // ==================== INICIALIZACAO ====================
    async iniciar(): Promise<void> {
        try {
            console.log("Iniciando Sistema Aerocode...\n");
            let loginOk = false;
            let tentativas = 0;
            const maxTentativas = 3;
            while (!loginOk && tentativas < maxTentativas) {
                try {
                    loginOk = await this.login();
                    if (!loginOk) {
                        tentativas++;
                        if (tentativas < maxTentativas) {
                            console.log(`Tentativa ${tentativas}/${maxTentativas}. Tente novamente.\n`);
                        }
                    }
                } catch (erro) {
                    // Captura erros durante o login, como interrupção do readline
                    console.log("\n" + this.SEPARADOR_GRANDE);
                    console.log(" SISTEMA ENCERRADO");
                    console.log(this.SEPARADOR_GRANDE);
                    console.log("\nO sistema foi interrompido.");
                    console.log("\n" + this.SEPARADOR_GRANDE);
                    console.log(" Obrigado por usar o Sistema Aerocode!");
                    console.log(" Ate a proxima!");
                    console.log(this.SEPARADOR_GRANDE + "\n");
                    this.interfaceReadline.close();
                    return;
                }
            }
            if (!loginOk) {
                console.log("Numero maximo de tentativas excedido. Sistema encerrado.");
                this.interfaceReadline.close();
                return;
            }
            await this.menuPrincipal();
            console.log("\n" + this.SEPARADOR_GRANDE);
            console.log(" Sistema encerrado com sucesso!");
            console.log(" Dados salvos automaticamente.");
            console.log(" Ate a proxima!");
            console.log(this.SEPARADOR_GRANDE + "\n");
            this.interfaceReadline.close();
        } catch (erro) {
            console.log("\n" + this.SEPARADOR_GRANDE);
            console.log(" SISTEMA ENCERRADO INESPERADAMENTE");
            console.log(this.SEPARADOR_GRANDE);
            console.log("\n" + this.SEPARADOR_GRANDE);
            console.log(" Obrigado por usar o Sistema Aerocode!");
            console.log(" Ate a proxima!");
            console.log(this.SEPARADOR_GRANDE + "\n");
            this.interfaceReadline.close();
        }
    }
}
export default SistemaAerocode;

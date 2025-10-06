const fs = require('fs');
const path = require('path');
import { Funcionario } from '../models/Funcionario';
import { Aeronave } from '../models/Aeronave';

export class GerenciadorArquivos {
    private static readonly DIRETORIO_DADOS = path.join(process.cwd(), 'dados');

    static inicializar(): void {
        if (!fs.existsSync(this.DIRETORIO_DADOS)) {
            fs.mkdirSync(this.DIRETORIO_DADOS, { recursive: true });
        }
    }

    static salvarFuncionarios(funcionarios: Funcionario[]): void {
        const dados = funcionarios.map(func => func.salvar());
        const arquivo = path.join(this.DIRETORIO_DADOS, 'funcionarios.txt');
        fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2), 'utf8');
    }

    static carregarFuncionarios(): Funcionario[] {
        const arquivo = path.join(this.DIRETORIO_DADOS, 'funcionarios.txt');
        if (!fs.existsSync(arquivo)) return [];

        try {
            const conteudo = fs.readFileSync(arquivo, 'utf8');
            const dados = JSON.parse(conteudo);
            return dados.map((data: string) => Funcionario.carregar(data));
        } catch (error) {
            console.error('Erro ao carregar funcionários:', error);
            return [];
        }
    }

    static salvarAeronaves(aeronaves: Aeronave[]): void {
        const dados = aeronaves.map(aero => aero.salvar());
        const arquivo = path.join(this.DIRETORIO_DADOS, 'aeronaves.txt');
        fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2), 'utf8');
    }

    static carregarAeronaves(funcionarios: Funcionario[]): Aeronave[] {
        const arquivo = path.join(this.DIRETORIO_DADOS, 'aeronaves.txt');
        if (!fs.existsSync(arquivo)) return [];

        try {
            const conteudo = fs.readFileSync(arquivo, 'utf8');
            const dados = JSON.parse(conteudo);
            return dados.map((data: string) => Aeronave.carregar(data, funcionarios));
        } catch (error) {
            console.error('Erro ao carregar aeronaves:', error);
            return [];
        }
    }
}
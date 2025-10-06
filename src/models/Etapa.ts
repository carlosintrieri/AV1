import { StatusEtapa } from '../enums';
import { Funcionario } from './Funcionario';

export class Etapa {
    private funcionariosAssociados: Funcionario[] = [];

    constructor(
        public nome: string,
        public prazo: Date,
        public status: StatusEtapa = StatusEtapa.PENDENTE,
        public ordem: number
    ) { }

    iniciar(): boolean {
        if (this.status === StatusEtapa.PENDENTE) {
            this.status = StatusEtapa.ANDAMENTO;
            return true;
        }
        return false;
    }

    finalizar(): boolean {
        if (this.status === StatusEtapa.ANDAMENTO) {
            this.status = StatusEtapa.CONCLUIDA;
            return true;
        }
        return false;
    }

    associarFuncionario(funcionario: Funcionario): boolean {
        const jaAssociado = this.funcionariosAssociados.some(f => f.codigo === funcionario.codigo);
        if (!jaAssociado) {
            this.funcionariosAssociados.push(funcionario);
            return true;
        }
        return false;
    }

    listarFuncionarios(): Funcionario[] {
        return [...this.funcionariosAssociados];
    }

    salvar(): string {
        return JSON.stringify({
            nome: this.nome,
            prazo: this.prazo,
            status: this.status,
            ordem: this.ordem,
            funcionariosCodigos: this.funcionariosAssociados.map(f => f.codigo)
        });
    }

    static carregar(data: string, funcionarios: Funcionario[]): Etapa {
        const obj = JSON.parse(data);
        const etapa = new Etapa(obj.nome, new Date(obj.prazo), obj.status, obj.ordem);

        if (obj.funcionariosCodigos) {
            obj.funcionariosCodigos.forEach((codigo: string) => {
                const funcionario = funcionarios.find(f => f.codigo === codigo);
                if (funcionario) {
                    etapa.funcionariosAssociados.push(funcionario);
                }
            });
        }

        return etapa;
    }
}

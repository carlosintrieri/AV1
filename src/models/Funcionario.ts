import { NivelPermissao } from '../enums';

export class Funcionario {
    public codigo: string;
    public nome: string;
    public telefone: string;
    public endereco: string;
    public usuario: string;
    public senha: string;
    public nivelPermissao: NivelPermissao;
    public ativo: boolean;

    constructor(
        codigo: string,
        nome: string,
        telefone: string,
        endereco: string,
        usuario: string,
        senha: string,
        nivelPermissao: NivelPermissao
    ) {
        this.codigo = codigo;
        this.nome = nome;
        this.telefone = telefone;
        this.endereco = endereco;
        this.usuario = usuario;
        this.senha = senha;
        this.nivelPermissao = nivelPermissao;
        this.ativo = true;
    }

    autenticar(usuario: string, senha: string): boolean {
        return this.usuario === usuario && this.senha === senha;
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
        console.log(`Funcionário ${this.nome} desativado (soft delete)`);
    }

    reativar(): void {
        this.ativo = true;
        console.log(`Funcionário ${this.nome} reativado`);
    }

    salvar(): string {
        return JSON.stringify({
            codigo: this.codigo,
            nome: this.nome,
            telefone: this.telefone,
            endereco: this.endereco,
            usuario: this.usuario,
            senha: this.senha,
            nivelPermissao: this.nivelPermissao,
            ativo: this.ativo
        });
    }

    static carregar(data: string): Funcionario {
        const obj = JSON.parse(data);
        const funcionario = new Funcionario(
            obj.codigo,
            obj.nome,
            obj.telefone,
            obj.endereco,
            obj.usuario,
            obj.senha,
            obj.nivelPermissao
        );
        funcionario.ativo = obj.ativo !== undefined ? obj.ativo : true;
        return funcionario;
    }
}
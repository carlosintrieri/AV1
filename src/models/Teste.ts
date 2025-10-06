export class Teste {
    public tipo: string;
    public resultado: string;
    public dataRealizacao: Date;

    constructor(
        tipo: string,
        resultado: string,
        dataRealizacao: Date = new Date()
    ) {
        this.tipo = tipo;
        this.resultado = resultado;
        this.dataRealizacao = dataRealizacao;
    }

    salvar(): string {
        return JSON.stringify({
            tipo: this.tipo,
            resultado: this.resultado,
            dataRealizacao: this.dataRealizacao
        });
    }

    static carregar(data: string): Teste {
        const obj = JSON.parse(data);
        return new Teste(
            obj.tipo,
            obj.resultado,
            new Date(obj.dataRealizacao)
        );
    }
}
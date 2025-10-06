import { TipoPeca } from '../enums';

export interface PecaPadrao {
    nome: string;
    tipo: TipoPeca;
    fornecedor: string;
}

export interface PecaComIndice extends PecaPadrao {
    indice: number;
}

export class CatalogoPecas {
    // ==========================================
    // CATÁLOGO DEFINITIVO - 36 PEÇAS
    // ==========================================
    private static readonly pecasPadrao: PecaPadrao[] = [
        // MOTORES (3)
        { nome: "Motor Pratt & Whitney PW1100G", tipo: TipoPeca.IMPORTADA, fornecedor: "Pratt & Whitney" },
        { nome: "Motor CFM56-7B", tipo: TipoPeca.IMPORTADA, fornecedor: "CFM International" },
        { nome: "Motor Rolls-Royce BR725", tipo: TipoPeca.IMPORTADA, fornecedor: "Rolls-Royce" },

        // FUSELAGEM (4)
        { nome: "Fuselagem Dianteira", tipo: TipoPeca.NACIONAL, fornecedor: "Embraer Fabricação" },
        { nome: "Fuselagem Central", tipo: TipoPeca.NACIONAL, fornecedor: "Embraer Fabricação" },
        { nome: "Fuselagem Traseira", tipo: TipoPeca.NACIONAL, fornecedor: "Embraer Fabricação" },
        { nome: "Cone de Cauda", tipo: TipoPeca.NACIONAL, fornecedor: "Embraer Fabricação" },

        // ASAS (4)
        { nome: "Asa Principal", tipo: TipoPeca.NACIONAL, fornecedor: "Embraer Aeroestruturas" },
        { nome: "Winglet", tipo: TipoPeca.NACIONAL, fornecedor: "Embraer Aeroestruturas" },
        { nome: "Flap", tipo: TipoPeca.NACIONAL, fornecedor: "Liebherr Brasil" },
        { nome: "Aileron", tipo: TipoPeca.NACIONAL, fornecedor: "Liebherr Brasil" },

        // TREM DE POUSO (2)
        { nome: "Trem de Pouso Principal", tipo: TipoPeca.IMPORTADA, fornecedor: "Liebherr Aerospace" },
        { nome: "Trem de Pouso do Nariz", tipo: TipoPeca.IMPORTADA, fornecedor: "Liebherr Aerospace" },

        // SISTEMAS (4)
        { nome: "Sistema Hidráulico Principal", tipo: TipoPeca.IMPORTADA, fornecedor: "Parker Hannifin" },
        { nome: "Sistema Hidráulico Reserva", tipo: TipoPeca.IMPORTADA, fornecedor: "Parker Hannifin" },
        { nome: "Sistema de Controle de Voo", tipo: TipoPeca.IMPORTADA, fornecedor: "Honeywell" },
        { nome: "Computador de Voo", tipo: TipoPeca.IMPORTADA, fornecedor: "Thales" },

        // AVIÔNICOS (4)
        { nome: "Radar Meteorológico", tipo: TipoPeca.IMPORTADA, fornecedor: "Honeywell" },
        { nome: "Sistema de Navegação GPS", tipo: TipoPeca.IMPORTADA, fornecedor: "Garmin" },
        { nome: "Transceptor VHF", tipo: TipoPeca.IMPORTADA, fornecedor: "Collins Aerospace" },
        { nome: "Transponder", tipo: TipoPeca.IMPORTADA, fornecedor: "Collins Aerospace" },

        // INTERIOR (4)
        { nome: "Assentos Executivos", tipo: TipoPeca.NACIONAL, fornecedor: "Recaro Brasil" },
        { nome: "Assentos Econômicos", tipo: TipoPeca.NACIONAL, fornecedor: "Recaro Brasil" },
        { nome: "Galley Compacta", tipo: TipoPeca.IMPORTADA, fornecedor: "Zodiac Aerospace" },
        { nome: "Banheiro Executivo", tipo: TipoPeca.IMPORTADA, fornecedor: "Zodiac Aerospace" },

        // AUXILIARES (4)
        { nome: "APU (Auxiliary Power Unit)", tipo: TipoPeca.IMPORTADA, fornecedor: "Honeywell" },
        { nome: "Sistema de Ar Condicionado", tipo: TipoPeca.IMPORTADA, fornecedor: "Liebherr Aerospace" },
        { nome: "Sistema de Pressurização", tipo: TipoPeca.IMPORTADA, fornecedor: "Liebherr Aerospace" },
        { nome: "Sistema de Combustível", tipo: TipoPeca.IMPORTADA, fornecedor: "Parker Hannifin" },

        // ELÉTRICOS (4)
        { nome: "Gerador Elétrico Principal", tipo: TipoPeca.IMPORTADA, fornecedor: "Hamilton Sundstrand" },
        { nome: "Gerador Elétrico Auxiliar", tipo: TipoPeca.IMPORTADA, fornecedor: "Hamilton Sundstrand" },
        { nome: "Bateria Principal", tipo: TipoPeca.IMPORTADA, fornecedor: "Saft" },
        { nome: "Sistema de Iluminação LED", tipo: TipoPeca.NACIONAL, fornecedor: "Helibras" },

        // SEGURANÇA (3)
        { nome: "Sistema de Oxigênio", tipo: TipoPeca.IMPORTADA, fornecedor: "Air Liquide" },
        { nome: "Sistema de Extinção de Incêndio", tipo: TipoPeca.IMPORTADA, fornecedor: "Kidde Aerospace" },
        { nome: "Colete Salva-Vidas", tipo: TipoPeca.NACIONAL, fornecedor: "Embraer Safety" }
    ];
    // TOTAL: 3 + 4 + 4 + 2 + 4 + 4 + 4 + 4 + 4 + 3 = 36 PEÇAS

    static obterPecasDisponiveis(): PecaPadrao[] {
        return [...this.pecasPadrao];
    }

    static obterPecaPorIndice(indice: number): PecaPadrao | null {
        if (indice >= 0 && indice < this.pecasPadrao.length) {
            return this.pecasPadrao[indice];
        }
        return null;
    }

    static buscarPecas(termo: string): PecaComIndice[] {
        const termoBusca = termo.toLowerCase().trim();
        if (!termoBusca) return [];
        return this.pecasPadrao
            .map((peca, indice) => ({ ...peca, indice }))
            .filter(peca =>
                peca.nome.toLowerCase().includes(termoBusca) ||
                peca.fornecedor.toLowerCase().includes(termoBusca)
            );
    }

    static obterQuantidadePecas(): number {
        return this.pecasPadrao.length;
    }

    static obterPecasPorTipo(tipo: TipoPeca): PecaPadrao[] {
        return this.pecasPadrao.filter(peca => peca.tipo === tipo);
    }

    static obterPecasPorFornecedor(fornecedor: string): PecaPadrao[] {
        const fornecedorBusca = fornecedor.toLowerCase().trim();
        return this.pecasPadrao.filter(peca =>
            peca.fornecedor.toLowerCase().includes(fornecedorBusca)
        );
    }

    static obterPecasPorCategoria(): Record<string, PecaPadrao[]> {
        return {
            "MOTORES": this.pecasPadrao.filter(p => p.nome.includes("Motor")),
            "FUSELAGEM": this.pecasPadrao.filter(p => p.nome.includes("Fuselagem") || p.nome.includes("Cone")),
            "ASAS": this.pecasPadrao.filter(p => p.nome.includes("Asa") || p.nome.includes("Winglet") || p.nome.includes("Flap") || p.nome.includes("Aileron")),
            "TREM_DE_POUSO": this.pecasPadrao.filter(p => p.nome.includes("Trem de Pouso")),
            "SISTEMAS": this.pecasPadrao.filter(p => p.nome.includes("Sistema") && (p.nome.includes("Hidráulico") || p.nome.includes("Controle de Voo")) || p.nome.includes("Computador")),
            "AVIONICOS": this.pecasPadrao.filter(p => p.nome.includes("Radar") || p.nome.includes("GPS") || p.nome.includes("Transceptor") || p.nome.includes("Transponder")),
            "INTERIOR": this.pecasPadrao.filter(p => p.nome.includes("Assento") || p.nome.includes("Galley") || p.nome.includes("Banheiro")),
            "AUXILIARES": this.pecasPadrao.filter(p => p.nome.includes("APU") || p.nome.includes("Ar Condicionado") || p.nome.includes("Pressurização") || p.nome.includes("Combustível")),
            "ELETRICOS": this.pecasPadrao.filter(p => p.nome.includes("Gerador") || p.nome.includes("Bateria") || p.nome.includes("Iluminação")),
            "SEGURANCA": this.pecasPadrao.filter(p => p.nome.includes("Oxigênio") || p.nome.includes("Extinção") || p.nome.includes("Colete"))
        };
    }

    static obterEstatisticas() {
        const categorias = this.obterPecasPorCategoria();
        const fornecedoresUnicos = [...new Set(this.pecasPadrao.map(p => p.fornecedor))];

        return {
            total: this.pecasPadrao.length,
            nacionais: this.pecasPadrao.filter(p => p.tipo === TipoPeca.NACIONAL).length,
            importadas: this.pecasPadrao.filter(p => p.tipo === TipoPeca.IMPORTADA).length,
            fornecedores: fornecedoresUnicos.sort(),
            categorias: Object.fromEntries(
                Object.entries(categorias).map(([nome, pecas]) => [nome, pecas.length])
            )
        };
    }

    static validarPeca(nome: string, fornecedor?: string): boolean {
        return this.pecasPadrao.some(peca => {
            const nomeValido = peca.nome.toLowerCase() === nome.toLowerCase();
            const fornecedorValido = !fornecedor || peca.fornecedor.toLowerCase() === fornecedor.toLowerCase();
            return nomeValido && fornecedorValido;
        });
    }
}
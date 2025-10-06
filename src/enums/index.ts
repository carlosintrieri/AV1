// 
// ENUMERAÇÕES DO SISTEMA AEROCODE
// Arquivo: src/types/enums.ts
// 

/**
 * Tipo de aeronave produzida
 */
export enum TipoAeronave {
    COMERCIAL = "COMERCIAL",
    MILITAR = "MILITAR"
}

/**
 * Origem da peça
 */
export enum TipoPeca {
    NACIONAL = "NACIONAL",
    IMPORTADA = "IMPORTADA"
}

/**
 * Status atual da peça no processo produtivo
 */
export enum StatusPeca {
    EM_PRODUCAO = "EM_PRODUCAO",
    EM_TRANSPORTE = "EM_TRANSPORTE",
    PRONTA = "PRONTA"
}

/**
 * Status da etapa de produção
 */
export enum StatusEtapa {
    PENDENTE = "PENDENTE",
    ANDAMENTO = "ANDAMENTO",
    CONCLUIDA = "CONCLUIDA"
}

/**
 * Nível de permissão do funcionário
 */
export enum NivelPermissao {
    ADMINISTRADOR = "ADMINISTRADOR",
    ENGENHEIRO = "ENGENHEIRO",
    OPERADOR = "OPERADOR"
}

/**
 * Tipo de teste realizado na aeronave
 */
export enum TipoTeste {
    ELETRICO = "ELETRICO",
    HIDRAULICO = "HIDRAULICO",
    AERODINAMICO = "AERODINAMICO"
}

/**
 * Resultado do teste
 */
export enum ResultadoTeste {
    APROVADO = "APROVADO",
    REPROVADO = "REPROVADO"
}
const fs = require('fs');
const path = require('path');
import { Aeronave } from '../models/Aeronave';

export class Relatorio {
    static gerar(aeronave: Aeronave): string {
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        const horaAtual = new Date().toLocaleTimeString('pt-BR');

        let relatorio = `
${"=".repeat(80)}
                    RELATÓRIO FINAL DE PRODUÇÃO
${"=".repeat(80)}

INFORMAÇÕES GERAIS:
-------------------
Data do Relatório: ${dataAtual} - ${horaAtual}
Código da Aeronave: ${aeronave.codigo}
Modelo: ${aeronave.modelo}
Tipo: ${aeronave.tipo}
Capacidade: ${aeronave.capacidade} passageiros
Alcance: ${aeronave.alcance} km
Cliente: ${aeronave.cliente || 'Não informado'}
Data de Entrega: ${aeronave.dataEntrega ? aeronave.dataEntrega.toLocaleDateString('pt-BR') : 'Não definida'}

PEÇAS UTILIZADAS:
-----------------`;

        const pecas = aeronave.getPecas();
        if (pecas.length === 0) {
            relatorio += '\nNenhuma peça cadastrada.';
        } else {
            pecas.forEach((peca, index) => {
                const numeroPeca = index + 1;
                relatorio += `\n${numeroPeca}. ${peca.nome}
   Tipo: ${peca.tipo}
   Fornecedor: ${peca.fornecedor}
   Status Final: ${peca.status}`;
            });
        }

        relatorio += `\n\nETAPAS DE PRODUÇÃO:
--------------------`;

        const etapas = aeronave.getEtapas();
        if (etapas.length === 0) {
            relatorio += '\nNenhuma etapa cadastrada.';
        } else {
            etapas.forEach((etapa, index) => {
                const funcionarios = etapa.listarFuncionarios();
                const nomesFuncionarios = funcionarios.length > 0
                    ? funcionarios.map(funcionario => `${funcionario.nome} (${funcionario.nivelPermissao})`).join(', ')
                    : 'Nenhum funcionário designado';

                const numeroEtapa = index + 1;
                relatorio += `\n${numeroEtapa}. ${etapa.nome}
   Status: ${etapa.status}
   Prazo: ${etapa.prazo.toLocaleDateString('pt-BR')}
   Funcionários Envolvidos: ${nomesFuncionarios}`;
            });
        }

        relatorio += `\n\nRESULTADOS DOS TESTES:
-----------------------`;

        const testes = aeronave.getTestes();
        if (testes.length === 0) {
            relatorio += '\nNenhum teste realizado.';
        } else {
            testes.forEach((teste, index) => {
                const numeroTeste = index + 1;
                relatorio += `\n${numeroTeste}. Teste ${teste.tipo}
   Resultado: ${teste.resultado}
   Data: ${teste.dataRealizacao.toLocaleDateString('pt-BR')}`;
            });
        }

        // ==================== RESUMO DE RECURSOS HUMANOS ====================

        relatorio += `\n\nRESUMO DE RECURSOS HUMANOS:
----------------------------`;

        // Coletar todos os funcionários únicos envolvidos nas etapas
        const todosFuncionarios = new Map<string, any>();

        // Funcionários das etapas
        etapas.forEach(etapa => {
            etapa.listarFuncionarios().forEach(funcionario => {
                if (!todosFuncionarios.has(funcionario.codigo)) {
                    todosFuncionarios.set(funcionario.codigo, {
                        funcionario: funcionario,
                        etapas: []
                    });
                }
                todosFuncionarios.get(funcionario.codigo).etapas.push(etapa.nome);
            });
        });

        if (todosFuncionarios.size === 0) {
            relatorio += '\nNenhum funcionário envolvido neste projeto.';
        } else {
            let contador = 1;
            todosFuncionarios.forEach((dados, codigo) => {
                const { funcionario, etapas: etapasList } = dados;
                relatorio += `\n${contador}. ${funcionario.nome} (${funcionario.nivelPermissao})
   Código: ${funcionario.codigo} | Tel: ${funcionario.telefone}`;

                if (etapasList.length > 0) {
                    relatorio += `\n   Etapas Envolvidas: ${etapasList.join(', ')}`;
                }

                contador = contador + 1;
            });

            relatorio += `\n\nTOTAL DE FUNCIONÁRIOS ENVOLVIDOS: ${todosFuncionarios.size}`;
        }

        relatorio += `\n\n${"=".repeat(80)}
AERONAVE PRONTA PARA ENTREGA
Todos os funcionários envolvidos na produção estão documentados acima.
${"=".repeat(80)}`;

        return relatorio;
    }

    static salvarArquivo(aeronave: Aeronave, relatorio: string): void {
        const agora = new Date();
        const ano = agora.getFullYear();
        const mes = String(agora.getMonth() + 1).padStart(2, '0');
        const dia = String(agora.getDate()).padStart(2, '0');
        const dataFormatada = `${ano}-${mes}-${dia}`;

        const nomeArquivo = `relatorio_${aeronave.codigo}_${dataFormatada}.txt`;
        const diretorio = path.join(process.cwd(), 'relatorios');

        try {
            if (!fs.existsSync(diretorio)) {
                fs.mkdirSync(diretorio, { recursive: true });
            }

            const caminhoCompleto = path.join(diretorio, nomeArquivo);
            fs.writeFileSync(caminhoCompleto, relatorio, 'utf8');
            console.log(`\nRelatório salvo em: ${caminhoCompleto}`);
        } catch (error) {
            console.error('Erro ao salvar relatório:', error);
        }
    }
}
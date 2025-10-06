# Sistema Aerocode — Gestão Completa de Produção Aeronáutica

## Inicialização do Sistema

```bash
npm start
# ou
ts-node src/index.ts
```

## Login Padrão (Administrador)

O primeiro acesso deve ser feito com o usuário administrador. Depois, o administrador poderá cadastrar outros usuários (Engenheiros e Operadores).

**Usuário:** `admin`  
**Senha:** `123456`

---

## Níveis de Permissão e Funcionalidades

### ADMINISTRADOR

**Pode fazer:**
- Cadastrar e gerenciar funcionários
- Cadastrar e gerenciar aeronaves
- Adicionar e atualizar peças
- Iniciar e finalizar etapas de produção
- Associar funcionários a etapas
- Adicionar e visualizar testes
- Gerar relatórios completos
- Visualizar todos os dados do sistema
- Acessar catálogo de peças

**Permissões exclusivas:**
- Gerenciar funcionários (cadastrar e editar)

---

### ENGENHEIRO

**Pode fazer:**
- Cadastrar e gerenciar aeronaves
- Adicionar e atualizar peças
- Iniciar e finalizar etapas de produção
- **Associar funcionários a etapas** (gestão de produção)
- Adicionar e visualizar testes
- Gerar relatórios completos
- Visualizar todos os dados do sistema
- Acessar catálogo de peças

**Não pode fazer:**
- Cadastrar ou editar funcionários

---

### OPERADOR

**Pode fazer:**
- Visualizar aeronaves cadastradas
- Consultar detalhes de aeronaves
- Visualizar status de peças
- Ver etapas de produção
- Consultar testes realizados
- Acessar catálogo de peças disponíveis (36 peças)
- Visualizar lista de funcionários (sem login/senha)

**Não pode fazer:**
- Cadastrar ou modificar qualquer informação
- Adicionar peças, testes ou etapas
- Gerar relatórios
- Gerenciar funcionários
- Associar funcionários a etapas

---

## Resumo de Permissões

| Funcionalidade                     | ADMINISTRADOR | ENGENHEIRO | OPERADOR |
|-----------------------------------|---------------|------------|----------|
| Gerenciar Funcionários             | ✅            | ❌         | ❌       |
| Cadastrar Aeronaves                | ✅            | ✅         | ❌       |
| Adicionar/Atualizar Peças          | ✅            | ✅         | ❌       |
| Iniciar/Finalizar Etapas           | ✅            | ✅         | ❌       |
| Associar Funcionários a Etapas     | ✅            | ✅         | ❌       |
| Adicionar Testes                   | ✅            | ✅         | ❌       |
| Gerar Relatórios                   | ✅            | ✅         | ❌       |
| Visualizar Dados                   | ✅            | ✅         | ✅       |
| Listar Informações                 | ✅            | ✅         | ✅       |
| Ver Login/Senha de Funcionários    | ✅            | ✅         | ❌       |

---

## Fluxo de Trabalho Típico

### ADMINISTRADOR
1. Criar usuários do sistema (Engenheiros e Operadores)
2. Configurar permissões de acesso
3. Supervisionar operações gerais
4. Executar tarefas de Engenheiro quando necessário

### ENGENHEIRO
1. Cadastrar novas aeronaves
2. Adicionar peças necessárias (busca por nome ou categoria)
3. **Associar funcionários às etapas de produção**
4. Gerenciar etapas de produção (iniciar/finalizar em ordem)
5. Atualizar status das peças
6. Registrar testes (ELETRICO, HIDRAULICO, AERODINAMICO)
7. Gerar relatórios finais

### OPERADOR
1. Consultar status de aeronaves
2. Verificar progresso das etapas
3. Visualizar responsáveis por etapas
4. Acompanhar testes realizadoa

---

## Dados do Sistema

- **36 peças no catálogo** (13 nacionais, 23 importadas)
- **5 etapas padrão por aeronave**
- **3 tipos de teste disponíveis**
- Arquivos salvos automaticamente em `/dados/` e `/relatorios/`

---

## Como Funciona o Sistema de Peças

### Conceito: Catálogo vs. Peças da Aeronave

O sistema trabalha com dois conceitos diferentes:

#### 1. CATÁLOGO DE PEÇAS (36 peças disponíveis)
- São modelos/templates de peças disponíveis para uso
- Acesse em: **Menu → 7. Ver Catálogo de Peças**
- Usado apenas para consulta e para adicionar peças às aeronaves

#### 2. PEÇAS DA AERONAVE (instâncias específicas)
- São cópias reais das peças do catálogo, criadas para uma aeronave específica
- Cada peça tem seu próprio:
  - Status (EM_PRODUCAO, EM_TRANSPORTE, PRONTA)
  - Histórico único

**Exemplo:** "Motor Rolls-Royce" na aeronave AER001 é diferente do "Motor Rolls-Royce" na aeronave AER002.

---

## Fluxo de Trabalho com Peças

### Passo 1: Adicionar Peças à Aeronave
```
Menu → 2. Gerenciar Peças → 1. Adicionar Peça a Aeronave
- Escolha a aeronave (ex: AER001)
- Busque peças: "motor", "asa", "fuselagem", "todas"
- Adicione quantas peças precisar
- Defina o status inicial
```

### Passo 2: Atualizar Status das Peças
```
Menu → 2. Gerenciar Peças → 2. Atualizar Status de Peça
- Escolha a aeronave
- Selecione a peça
- Atualize o status conforme o progresso
```

### Categorias de Busca no Catálogo
- **"motor"** - 3 opções de motores
- **"asa"** - 4 opções (asas, winglets, flaps, ailerons)
- **"fuselagem"** - 4 opções de fuselagem
- **"radar"** ou **"avionicos"** - 4 opções
- **"bateria"** ou **"eletrico"** - 4 opções
- **"trem"** - 2 opções de trem de pouso
- **"sistema"** - 7 opções de sistemas
- **"todas"** - ver todas as 36 peças

---

## Gestão de Etapas e Funcionários

### Associação de Funcionários a Etapas

**Quem pode associar:** ADMINISTRADOR e ENGENHEIRO

**Como funciona:**
1. O ADMINISTRADOR cadastra os funcionários no sistema
2. O ENGENHEIRO associa esses funcionários às etapas de produção
3. Cada etapa pode ter vários funcionários responsáveis

**Menu de associação:**
```
Menu → 3. Gerenciar Etapas → 3. Associar Funcionário a Etapa
- Escolha a aeronave
- Selecione a etapa
- Escolha o funcionário
```

**Lógica de permissões:**
- **ADMINISTRADOR:** Gerencia RH (cadastra funcionários)
- **ENGENHEIRO:** Gerencia produção (aloca funcionários nas etapas)
- **OPERADOR:** Apenas visualiza

---

## Exemplo Prático Completo

### Cenário: Produção da Aeronave AER001

**1. Administrador cria funcionários:**
```
- João Silva (ENGENHEIRO)
- Maria Santos (OPERADOR)
- Carlos Oliveira (OPERADOR)
```

**2. Engenheiro cadastra aeronave:**
```
Código: AER001
Modelo: Embraer E195-E2
Tipo: COMERCIAL
Cliente: LATAM Airlines
```

**3. Engenheiro adiciona peças:**
```
- Motor Rolls-Royce BR725 (EM_PRODUCAO)
- Asa Direita (EM_PRODUCAO)
- Sistema Hidráulico (EM_TRANSPORTE)
- Fuselagem Dianteira (PRONTA)
```

**4. Engenheiro associa funcionários às etapas:**
```
Etapa 1 - Montagem da Fuselagem: Carlos Oliveira
Etapa 2 - Instalação das Asas: Maria Santos
Etapa 3 - Montagem do Trem de Pouso: Carlos Oliveira
```

**5. Engenheiro gerencia produção:**
```
- Iniciar Etapa 1
- Atualizar status das peças
- Finalizar Etapa 1
- Iniciar Etapa 2
```

**6. Engenheiro adiciona testes:**
```
- Teste ELETRICO: APROVADO
- Teste HIDRAULICO: APROVADO
- Teste AERODINAMICO: APROVADO
```

**7. Engenheiro gera relatório final:**
```
Menu → 6. Gerar Relatório
- Relatório salvo em /relatorios/
```

---

## Observações Importantes

### Sobre Funcionários
- **Apenas ADMINISTRADOR** pode cadastrar funcionários
- **ENGENHEIRO e ADMINISTRADOR** podem associar funcionários às etapas
- **Funcionários não são associados a peças** (conforme especificação do projeto)

### Sobre Peças
- Peças são associadas a aeronaves, não a funcionários
- Status de peça: EM_PRODUCAO → EM_TRANSPORTE → PRONTA
- Cada aeronave pode ter múltiplas instâncias da mesma peça

### Sobre Etapas
- Etapas devem ser finalizadas em ordem sequencial
- Uma etapa só pode ser finalizada se a anterior foi concluída
- Funcionários podem ser associados a múltiplas etapas

### Sobre Testes
- Não é permitido adicionar testes duplicados do mesmo tipo
- Cada aeronave pode ter no máximo 3 testes (um de cada tipo)
- Tipos: ELETRICO, HIDRAULICO, AERODINAMICO

---

## Suporte Técnico

Para dúvidas ou problemas, consulte:
- Documentação do código-fonte
- Comentários inline no código
- Diagramas UML fornecidos

---

**Sistema desenvolvido conforme especificação do projeto acadêmico.**  
**Professor: Eng. Dr. Gerson Penha**

 

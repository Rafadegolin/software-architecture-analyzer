import * as vscode from "vscode";
import * as cp from "child_process";
import * as util from "util";
import * as path from "path";

const exec = util.promisify(cp.exec);

type AnalysisMode =
  | "summary-pt"
  | "summary-en"
  | "technical-pt"
  | "technical-en";

export function activate(context: vscode.ExtensionContext) {
  // Comandos de Análise
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "project-architect-ai.analyzeSummaryPt",
      () => analyzeProject("summary-pt")
    ),
    vscode.commands.registerCommand(
      "project-architect-ai.analyzeSummaryEn",
      () => analyzeProject("summary-en")
    ),
    vscode.commands.registerCommand(
      "project-architect-ai.analyzeTechnicalPt",
      () => analyzeProject("technical-pt")
    ),
    vscode.commands.registerCommand(
      "project-architect-ai.analyzeTechnicalEn",
      () => analyzeProject("technical-en")
    )
  );

  // Comando de Commit
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "project-architect-ai.generateCommit",
      () => generateCommit()
    )
  );
}

async function analyzeProject(mode: AnalysisMode) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("❌ Nenhum projeto aberto!");
    return;
  }

  // Verificar API Key
  const config = vscode.workspace.getConfiguration("projectArchitectAI");
  const apiKey = config.get<string>("apiKey");
  const apiProvider = config.get<string>("provider") || "openai";

  if (!apiKey) {
    vscode.window.showErrorMessage("❌ Configure sua API Key nas settings!");
    return;
  }

  const titles = {
    "summary-pt": "🔍 Analisando resumo (PT)...",
    "summary-en": "🔍 Analyzing summary (EN)...",
    "technical-pt": "📋 Gerando análise técnica (PT)...",
    "technical-en": "📋 Generating technical analysis (EN)...",
  };

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: titles[mode],
      cancellable: true,
    },
    async (progress, token) => {
      try {
        // Passo 1: Buscar arquivos
        progress.report({
          message:
            mode.includes("en") ? "Scanning files..." : "Escaneando arquivos...",
        });
        const files = await vscode.workspace.findFiles(
          "**/*.{ts,tsx,js,jsx,py,java,go,rs,json,md,yml,yaml,sql,prisma}",
          "{**/node_modules/**,**/dist/**,**/build/**,**/.next/**,**/venv/**,**/__pycache__/**}"
        );

        if (token.isCancellationRequested) {
          return;
        }

        // Passo 2: Montar estrutura do projeto
        progress.report({
          message:
            (mode.includes("en")
              ? "Reading "
              : "Lendo ") +
            `${files.length} files...`,
        });
        const projectStructure = await buildProjectStructure(files);

        if (token.isCancellationRequested) {
          return;
        }

        // Passo 3: Enviar para LLM
        progress.report({
          message:
            mode.includes("en")
              ? "Analyzing with AI..."
              : "Analisando com IA...",
        });
        const prompt = getPromptForMode(mode, projectStructure);
        const systemRole =
          "You are a senior software architect with expertise in code analysis and documentation.";

        const summary = await sendToLLM(
          prompt,
          systemRole,
          apiKey,
          apiProvider
        );

        if (token.isCancellationRequested) {
          return;
        }

        // Passo 4: Mostrar resultado
        const doc = await vscode.workspace.openTextDocument({
          content: summary,
          language: "markdown",
        });
        await vscode.window.showTextDocument(doc, { preview: false });

        vscode.window.showInformationMessage(
          mode.includes("en")
            ? "✅ Analysis complete!"
            : "✅ Análise concluída!"
        );
      } catch (error: any) {
        vscode.window.showErrorMessage(
          `❌ Error: ${error.message}`
        );
        console.error(error);
      }
    }
  );
}

async function generateCommit() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("❌ Nenhum projeto aberto!");
    return;
  }

  const config = vscode.workspace.getConfiguration("projectArchitectAI");
  const apiKey = config.get<string>("apiKey");
  const apiProvider = config.get<string>("provider") || "openai";

  if (!apiKey) {
    vscode.window.showErrorMessage("❌ Configure sua API Key nas settings!");
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "📝 Gerando commit...",
      cancellable: false,
    },
    async (progress) => {
      try {
        const cwd = workspaceFolders[0].uri.fsPath;
        
        // Tentar pegar diff staged primeiro
        let diff = "";
        try {
          const { stdout } = await exec("git diff --cached", { cwd });
          diff = stdout;
        } catch (e) {
          // git pode não estar iniciado
        }

        if (!diff.trim()) {
            // Se não tem staged, tenta pegar tudo modificado
            try {
                const { stdout } = await exec("git diff HEAD", { cwd });
                diff = stdout;
            } catch (e) {
                // Ignore
            }
        }

        if (!diff.trim()) {
          vscode.window.showWarningMessage(
            "⚠️ Nenhuma alteração detectada (staged ou unstaged) para gerar commit."
          );
          return;
        }

        if (diff.length > 10000) {
            diff = diff.substring(0, 10000) + "\n... (truncated)";
        }

        const prompt = `Analise o diff abaixo e gere uma mensagem de commit seguindo o padrão Conventional Commits.
        Responda APENAS com a mensagem do commit, sem explicações extras.
        Formato: <tipo>(<escopo opcional>): <descrição>

        [corpo opcional]

        [rodapé opcional]

        Tipos comuns: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.

        Diff:
        ${diff}`;

        const commitMessage = await sendToLLM(
          prompt,
          "You are a helpful assistant that writes semantic git commit messages.",
          apiKey,
          apiProvider
        );

        // Copiar para o clipboard e mostrar opção
        await vscode.env.clipboard.writeText(commitMessage.trim());
        const selection = await vscode.window.showInformationMessage(
          `Commit gerado e copiado! \n\n${commitMessage}`,
          "Inserir no Source Control",
          "Fechar"
        );

        if (selection === "Inserir no Source Control") {
            const gitExtension = vscode.extensions.getExtension('vscode.git');
            if (gitExtension) {
                const extension = gitExtension.exports;
                const api = extension.getAPI(1);
                const repo = api.repositories[0];
                if (repo) {
                    repo.inputBox.value = commitMessage.trim();
                }
            }
        }

      } catch (error: any) {
        vscode.window.showErrorMessage(`❌ Erro ao gerar commit: ${error.message}`);
      }
    }
  );
}

function getPromptForMode(mode: AnalysisMode, projectData: string): string {
  if (mode === "summary-pt") {
    return `Você é um arquiteto de software sênior. Analise a estrutura do projeto abaixo e gere um resumo técnico em PORTUGUÊS (PT-BR) contendo:
    1. **Visão Geral**: O que é o projeto.
    2. **Tecnologias**: Principais linguagens e libs.
    3. **Estrutura**: Breve explicação das pastas.
    4. **Pontos Chave**: Destaques da arquitetura.

    ${projectData}`;
  }

  if (mode === "summary-en") {
    return `You are a senior software architect. Analyze the project structure below and generate a technical summary in ENGLISH containing:
    1. **Overview**: What the project is.
    2. **Technologies**: Main languages and libs.
    3. **Structure**: Brief explanation of folders.
    4. **Key Points**: Architecture highlights.

    ${projectData}`;
  }

  if (mode === "technical-pt") {
    return `Você é um arquiteto de software sênior especializado em análise profunda de código e segurança. Analise MINUCIOSAMENTE a estrutura do projeto abaixo e gere um relatório técnico EXTREMAMENTE DETALHADO em PORTUGUÊS (PT-BR).

**IMPORTANTE**: Este deve ser um relatório PROFUNDO e COMPLETO. Não seja superficial. Analise cada aspecto com profundidade e forneça exemplos de código reais quando relevante.

## ESTRUTURA DO RELATÓRIO:

### 1. 📋 Visão Geral e Tipo de Aplicação
- Descreva detalhadamente o tipo e propósito da aplicação
- Domínio de negócio e casos de uso principais
- Público-alvo e escala esperada

### 2. 🛠️ Stack Tecnológica Completa
- **Linguagens**: Versões e justificativa de uso
- **Frameworks e Bibliotecas**: Liste TODAS as dependências principais com versões
- **Ferramentas de Desenvolvimento**: Linters, formatters, pre-commit hooks
- **Análise de Dependências**: Dependências desatualizadas ou vulneráveis (se visível em package.json/requirements.txt)

### 3. 🏗️ Arquitetura e Padrões
- **Padrão Arquitetural**: (MVC, Clean Architecture, Hexagonal, Microservices, Monolito Modular, etc.)
- **Padrões de Design Identificados**: Factory, Singleton, Repository, Strategy, etc.
- **Separação de Responsabilidades**: Como o código está organizado em camadas
- **Fluxo de Dados**: Como os dados transitam pela aplicação
- **MOSTRE TRECHOS DE CÓDIGO** que exemplificam os padrões identificados

### 4. 📂 Estrutura de Pastas e Organização
- Análise DETALHADA da organização de diretórios
- Convenções de nomenclatura
- Separação de concerns (controllers, services, models, utils, etc.)
- Estrutura de testes (se houver)
- Avaliação: A estrutura facilita manutenção e escalabilidade?

### 5. 💾 Banco de Dados e Persistência
- Tipo de banco (SQL/NoSQL/In-Memory/etc.)
- ORM/Query Builder utilizado
- **Análise de Schemas**: Se houver arquivos Prisma/migrations/models, MOSTRE e COMENTE a estrutura
- Estratégias de migração
- Índices e otimizações de performance (se visível)

### 6. 🔌 APIs, Integrações e Comunicação
- APIs REST/GraphQL/gRPC/WebSockets
- Serviços externos integrados (Stripe, SendGrid, AWS, etc.)
- Autenticação e Autorização (JWT, OAuth, Sessions, etc.)
- **MOSTRE exemplos de rotas/endpoints** se disponíveis no código
- Validação de entrada e tratamento de erros

### 7. 🚀 Build, Deploy e DevOps
- Sistema de build (Webpack, Vite, esbuild, etc.)
- Containerização (Docker, docker-compose)
- CI/CD (GitHub Actions, GitLab CI, Jenkins)
- Variáveis de ambiente e configuração
- Estratégia de versionamento

### 8. ✅ Boas Práticas e Qualidade de Código
- **SOLID**: O código respeita os princípios? Dê exemplos ESPECÍFICOS
- **DRY (Don't Repeat Yourself)**: Há código duplicado visível?
- **Clean Code**: Nomenclatura, funções pequenas, comentários
- **Testes**: Cobertura de testes (unitários, integração, e2e)
- **Error Handling**: Como erros são tratados?
- **Logging e Monitoramento**: Há estratégia de logs?

### 9. 🔒 ANÁLISE DE SEGURANÇA PROFUNDA
**ESTA É UMA SEÇÃO CRÍTICA - SEJA EXTREMAMENTE DETALHADO**

Analise e identifique:

#### 9.1. Vulnerabilidades Potenciais
- **Injeção SQL/NoSQL**: Há queries concatenadas sem sanitização?
- **XSS (Cross-Site Scripting)**: Output não escapado?
- **CSRF**: Proteção contra CSRF implementada?
- **Autenticação e Sessões**: Tokens armazenados com segurança?
- **Secrets e Credenciais**: API keys ou senhas hardcoded no código?
- **Dependências Vulneráveis**: Bibliotecas com falhas de segurança conhecidas
- **CORS**: Configuração permissiva ou insegura?
- **Rate Limiting**: Proteção contra DDoS/brute force?

#### 9.2. Exposição de Dados Sensíveis
- Logs que podem vazar informações sensíveis
- Dados pessoais sem criptografia
- Backup e recuperação de dados

#### 9.3. Compliance e Regulamentações
- LGPD/GDPR compliance (se aplicável)
- Auditoria e rastreabilidade

**PARA CADA VULNERABILIDADE ENCONTRADA**:
- ❌ MOSTRE o trecho de código problemático
- ⚠️ Explique o risco e impact potential
- ✅ Sugira a correção ESPECÍFICA com código de exemplo

### 10. 💡 SUGESTÕES DE MELHORIA DETALHADAS
**SEJA ESPECÍFICO E ACIONÁVEL - NÃO DÊ SUGESTÕES GENÉRICAS**

Para cada sugestão, forneça:
1. **Problema/Oportunidade**: O que pode ser melhorado
2. **Impacto**: Por que isso importa (performance, manutenibilidade, segurança)
3. **Solução**: COMO implementar a melhoria
4. **Exemplo de Código**: Mostre ANTES e DEPOIS quando possível
5. **Prioridade**: 🔴 Alta / 🟡 Média / 🟢 Baixa

#### Categorias de Sugestões:
- **Performance e Otimização**
  - Lazy loading, code splitting
  - Caching strategies
  - Database query optimization
  - Bundle size reduction
  
- **Arquitetura e Escalabilidade**
  - Refatorações para melhor separação de concerns
  - Introdução de padrões de design
  - Modularização
  
- **Segurança** (baseado na seção 9)
  - Correções de vulnerabilidades
  - Hardening
  
- **Manutenibilidade**
  - Redução de código duplicado
  - Melhoria de nomenclatura
  - Documentação
  - Testes adicionais
  
- **Developer Experience**
  - Melhoria de tooling
  - Automação de tarefas
  - Type safety

### 11. 📊 Métricas e Indicadores (se calculável)
- Linhas de código por arquivo (complexidade)
- Número de dependências
- Debt técnico estimado
- Pontos de atenção críticos

---

**LEMBRE-SE**: Este relatório deve ser uma análise PROFUNDA e VALIOSA. Não seja genérico. Use os dados reais do projeto para dar insights específicos e acionáveis. MOSTRE CÓDIGO sempre que relevante.

${projectData}`;
  }

  if (mode === "technical-en") {
    return `You are a senior software architect specialized in deep code analysis and security. THOROUGHLY analyze the project structure below and generate an EXTREMELY DETAILED technical report in ENGLISH.

**IMPORTANT**: This should be a DEEP and COMPREHENSIVE report. Don't be superficial. Analyze each aspect in depth and provide real code examples when relevant.

## REPORT STRUCTURE:

### 1. 📋 Overview and Application Type
- Describe in detail the application type and purpose
- Business domain and main use cases
- Target audience and expected scale

### 2. 🛠️ Complete Tech Stack
- **Languages**: Versions and usage rationale
- **Frameworks and Libraries**: List ALL main dependencies with versions
- **Development Tools**: Linters, formatters, pre-commit hooks
- **Dependency Analysis**: Outdated or vulnerable dependencies (if visible in package.json/requirements.txt)

### 3. 🏗️ Architecture and Patterns
- **Architectural Pattern**: (MVC, Clean Architecture, Hexagonal, Microservices, Modular Monolith, etc.)
- **Identified Design Patterns**: Factory, Singleton, Repository, Strategy, etc.
- **Separation of Responsibilities**: How code is organized in layers
- **Data Flow**: How data flows through the application
- **SHOW CODE SNIPPETS** that exemplify identified patterns

### 4. 📂 Folder Structure and Organization
- DETAILED analysis of directory organization
- Naming conventions
- Separation of concerns (controllers, services, models, utils, etc.)
- Test structure (if present)
- Assessment: Does the structure facilitate maintenance and scalability?

### 5. 💾 Database and Persistence
- Database type (SQL/NoSQL/In-Memory/etc.)
- ORM/Query Builder used
- **Schema Analysis**: If there are Prisma/migrations/models files, SHOW and COMMENT on the structure
- Migration strategies
- Indexes and performance optimizations (if visible)

### 6. 🔌 APIs, Integrations, and Communication
- REST/GraphQL/gRPC/WebSockets APIs
- Integrated external services (Stripe, SendGrid, AWS, etc.)
- Authentication and Authorization (JWT, OAuth, Sessions, etc.)
- **SHOW route/endpoint examples** if available in code
- Input validation and error handling

### 7. 🚀 Build, Deploy, and DevOps
- Build system (Webpack, Vite, esbuild, etc.)
- Containerization (Docker, docker-compose)
- CI/CD (GitHub Actions, GitLab CI, Jenkins)
- Environment variables and configuration
- Versioning strategy

### 8. ✅ Best Practices and Code Quality
- **SOLID**: Does the code respect the principles? Give SPECIFIC examples
- **DRY (Don't Repeat Yourself)**: Is there visible duplicate code?
- **Clean Code**: Naming, small functions, comments
- **Tests**: Test coverage (unit, integration, e2e)
- **Error Handling**: How are errors handled?
- **Logging and Monitoring**: Is there a logging strategy?

### 9. 🔒 DEEP SECURITY ANALYSIS
**THIS IS A CRITICAL SECTION - BE EXTREMELY DETAILED**

Analyze and identify:

#### 9.1. Potential Vulnerabilities
- **SQL/NoSQL Injection**: Are there concatenated queries without sanitization?
- **XSS (Cross-Site Scripting)**: Unescaped output?
- **CSRF**: CSRF protection implemented?
- **Authentication and Sessions**: Are tokens stored securely?
- **Secrets and Credentials**: Hardcoded API keys or passwords in code?
- **Vulnerable Dependencies**: Libraries with known security flaws
- **CORS**: Permissive or insecure configuration?
- **Rate Limiting**: Protection against DDoS/brute force?

#### 9.2. Sensitive Data Exposure
- Logs that may leak sensitive information
- Personal data without encryption
- Data backup and recovery

#### 9.3. Compliance and Regulations
- GDPR/LGPD compliance (if applicable)
- Audit and traceability

**FOR EACH VULNERABILITY FOUND**:
- ❌ SHOW the problematic code snippet
- ⚠️ Explain the risk and potential impact
- ✅ Suggest SPECIFIC correction with example code

### 10. 💡 DETAILED IMPROVEMENT SUGGESTIONS
**BE SPECIFIC AND ACTIONABLE - DON'T GIVE GENERIC SUGGESTIONS**

For each suggestion, provide:
1. **Problem/Opportunity**: What can be improved
2. **Impact**: Why it matters (performance, maintainability, security)
3. **Solution**: HOW to implement the improvement
4. **Code Example**: Show BEFORE and AFTER when possible
5. **Priority**: 🔴 High / 🟡 Medium / 🟢 Low

#### Suggestion Categories:
- **Performance and Optimization**
  - Lazy loading, code splitting
  - Caching strategies
  - Database query optimization
  - Bundle size reduction
  
- **Architecture and Scalability**
  - Refactoring for better separation of concerns
  - Introduction of design patterns
  - Modularization
  
- **Security** (based on section 9)
  - Vulnerability fixes
  - Hardening
  
- **Maintainability**
  - Duplicate code reduction
  - Naming improvements
  - Documentation
  - Additional tests
  
- **Developer Experience**
  - Tooling improvements
  - Task automation
  - Type safety

### 11. 📊 Metrics and Indicators (if calculable)
- Lines of code per file (complexity)
- Number of dependencies
- Estimated technical debt
- Critical attention points

---

**REMEMBER**: This report should be a DEEP and VALUABLE analysis. Don't be generic. Use real project data to give specific and actionable insights. SHOW CODE whenever relevant.

${projectData}`;
  }

  return "";
}

async function buildProjectStructure(files: vscode.Uri[]): Promise<string> {
  let structure = "# Project Structure\n\n";

  // Agrupar arquivos por tipo/pasta
  const filesByFolder: { [key: string]: string[] } = {};

  for (const file of files) {
    const relativePath = vscode.workspace.asRelativePath(file);
    const folder = relativePath.split("/")[0];

    if (!filesByFolder[folder]) {
      filesByFolder[folder] = [];
    }
    filesByFolder[folder].push(relativePath);
  }

  // Construir estrutura hierárquica
  structure += "## Directory Tree\n```\n";
  for (const [folder, fileList] of Object.entries(filesByFolder)) {
    structure += `📁 ${folder}/\n`;
    for (const file of fileList.slice(0, 10)) {
      structure += `  └─ ${file.split("/").pop()}\n`;
    }
    if (fileList.length > 10) {
      structure += `  └─ ... (+${fileList.length - 10} files)\n`;
    }
  }
  structure += "```\n\n";

  // Ler conteúdo dos arquivos de configuração
  structure += "## Configuration Files\n\n";
  const configFiles = files.filter((f) => {
    const name = f.path.toLowerCase();
    return (
      name.includes("package.json") ||
      name.includes("tsconfig") ||
      name.includes("docker") ||
      name.includes("readme") ||
      name.includes("prisma") ||
      name.includes(".env.example") ||
      name.endsWith(".xml") || // Maven/Gradle
      name.endsWith(".gradle") ||
      name.includes("requirements.txt") || // Python
      name.includes("go.mod") || // Go
      name.includes("cargo.toml") // Rust
    );
  });

  for (const file of configFiles.slice(0, 15)) {
    try {
      const content = await vscode.workspace.fs.readFile(file);
      const relativePath = vscode.workspace.asRelativePath(file);
      structure += `### ${relativePath}\n\`\`\`\n${content
        .toString()
        .slice(0, 3000)}\n\`\`\`\n\n`;
    } catch (err) {
      // Ignorar erros
    }
  }

  // NOVO: Incluir exemplos de arquivos de código para análise profunda
  structure += "## Code Samples (for deep analysis)\n\n";
  const codeFiles = files.filter((f) => {
    const name = f.path.toLowerCase();
    const fileName = f.path.split(/[\\/]/).pop()?.toLowerCase() || "";
    return (
      // Controllers, Routes, API
      name.includes("/controller") ||
      name.includes("/route") ||
      name.includes("/api/") ||
      // Services, Business Logic
      name.includes("/service") ||
      name.includes("/usecase") ||
      name.includes("/handler") ||
      // Models, Entities, Schemas
      name.includes("/model") ||
      name.includes("/entity") ||
      name.includes("/schema") ||
      // Repositories, Database
      name.includes("/repository") ||
      name.includes("/dao") ||
      // Main entry points
      fileName === "index.ts" ||
      fileName === "index.js" ||
      fileName === "main.ts" ||
      fileName === "main.js" ||
      fileName === "app.ts" ||
      fileName === "app.js" ||
      fileName === "server.ts" ||
      fileName === "server.js"
    );
  });

  // Pegar uma amostra representativa de código
  const sampledCodeFiles = codeFiles.slice(0, 12);
  
  for (const file of sampledCodeFiles) {
    try {
      const content = await vscode.workspace.fs.readFile(file);
      const relativePath = vscode.workspace.asRelativePath(file);
      const fileContent = content.toString();
      
      // Limitar a 2000 caracteres por arquivo para não exceder limites de token
      const truncatedContent = fileContent.length > 2000 
        ? fileContent.slice(0, 2000) + "\n... (truncated)"
        : fileContent;
      
      structure += `### ${relativePath}\n\`\`\`\n${truncatedContent}\n\`\`\`\n\n`;
    } catch (err) {
      // Ignorar erros
    }
  }

  return structure;
}

async function sendToLLM(
  prompt: string,
  systemRole: string,
  apiKey: string,
  provider: string
): Promise<string> {
  if (provider === "openai") {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemRole,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const error = (await response.json()) as any;
      throw new Error(
        `OpenAI API Error: ${error.error?.message || "Unknown error"}`
      );
    }

    interface OpenAIResponse {
      choices: {
        message: {
          content: string;
        };
      }[];
    }

    const data = (await response.json()) as OpenAIResponse;
    return data.choices[0].message.content;
  } else {
    throw new Error('Provider não suportado ainda. Use "openai".');
  }
}

export function deactivate() {}

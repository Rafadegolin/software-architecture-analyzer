# 🏗️ Project Architect AI

> Analise a arquitetura de qualquer projeto usando Inteligência Artificial

![VS Code Version](https://img.shields.io/badge/VS%20Code-1.85.0+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Sobre

Project Architect AI é uma extensão para VS Code que utiliza modelos de linguagem (LLMs) para analisar automaticamente a estrutura e arquitetura de seus projetos de software, gerando relatórios técnicos detalhados em segundos.

## ✨ Funcionalidades

### 📊 Análises de Projeto Multilíngues

#### 🇧🇷 **Relatório: Resumo do Projeto (PT-BR)**
Gera um resumo executivo em português contendo:
- Visão geral do projeto
- Principais tecnologias e bibliotecas
- Estrutura de pastas
- Pontos-chave da arquitetura

**Comando:** `Project Architect: Project Summary (PT)`

#### 🇺🇸 **Report: Project Summary (EN)**
Generates an executive summary in English including:
- Project overview
- Main technologies and libraries
- Folder structure
- Architecture key points

**Command:** `Project Architect: Project Summary (EN)`

---

### 🔍 Análises Técnicas Detalhadas e Profundas

#### 🇧🇷 **Relatório: Análise Técnica Detalhada (PT-BR)**
Análise arquitetural EXTREMAMENTE COMPLETA em português com:
- 📋 Visão geral e tipo de aplicação
- 🛠️ Stack tecnológica completa (todas as dependências)
- 🏗️ Arquitetura e padrões de design **com trechos de código**
- 📂 Estrutura de pastas detalhada
- 💾 Banco de dados e persistência
- 🔌 APIs, integrações e comunicação
- 🚀 Build, deploy e DevOps
- ✅ Boas práticas (SOLID, DRY, Clean Code)
- 🔒 **ANÁLISE DE SEGURANÇA PROFUNDA**:
  - Vulnerabilidades (SQL Injection, XSS, CSRF)
  - Secrets hardcoded
  - Dependências vulneráveis
  - **Código problemático + correções sugeridas**
- 💡 **Sugestões de melhoria ESPECÍFICAS**:
  - Performance e otimização
  - Arquitetura e escalabilidade
  - Segurança
  - Manutenibilidade
  - **Exemplos de código ANTES/DEPOIS**
  - Prioridades (🔴 Alta / 🟡 Média / 🟢 Baixa)
- 📊 Métricas e indicadores

**Comando:** `Project Architect: Technical Analysis (PT)`

#### 🇺🇸 **Report: Detailed Technical Analysis (EN)**
EXTREMELY COMPREHENSIVE architectural analysis in English with:
- 📋 Overview and application type
- 🛠️ Complete tech stack (all dependencies)
- 🏗️ Architecture and design patterns **with code snippets**
- 📂 Detailed folder structure
- 💾 Database and persistence
- 🔌 APIs, integrations, and communication
- 🚀 Build, deploy, and DevOps
- ✅ Best practices (SOLID, DRY, Clean Code)
- 🔒 **DEEP SECURITY ANALYSIS**:
  - Vulnerabilities (SQL Injection, XSS, CSRF)
  - Hardcoded secrets
  - Vulnerable dependencies
  - **Problematic code + suggested fixes**
- 💡 **SPECIFIC improvement suggestions**:
  - Performance and optimization
  - Architecture and scalability
  - Security
  - Maintainability
  - **BEFORE/AFTER code examples**
  - Priorities (🔴 High / 🟡 Medium / 🟢 Low)
- 📊 Metrics and indicators

**Command:** `Project Architect: Technical Analysis (EN)`

---

### 🚀 Geração Inteligente de Commits

#### 📝 **Gerar Commit Inteligente (Conventional Commits)**
Analisa suas mudanças no Git e gera automaticamente mensagens de commit seguindo o padrão **Conventional Commits**:
- ✅ Detecta mudanças staged ou unstaged
- 🤖 Gera mensagem semântica com tipo, escopo e descrição
- 📋 Inclui corpo e rodapé quando necessário
- 📎 Copia para clipboard automaticamente
- ⚡ Opção de inserir direto no Source Control

**Tipos suportados:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Comando:** `Project Architect: Generate Smart Commit`

---

### ⚡ Características Gerais

- 🔍 **Varredura Automática**: Escaneia todo o projeto identificando arquivos relevantes
- 🤖 **Análise com IA**: Utiliza GPT-4o para análise profunda
- 📊 **Trechos de Código Reais**: Mostra exemplos do seu projeto
- ⚡ **Rápido e Eficiente**: Análise completa em poucos segundos
- 🎯 **Suporte Multi-linguagem**: TypeScript, JavaScript, Python, Java, Go, Rust e mais

## 🚀 Como Usar

### 📊 Gerar Análises de Projeto

1. Abra qualquer projeto no VS Code
2. Pressione `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac)
3. Escolha um dos comandos:
   - **`Project Architect: Project Summary (PT)`** - Resumo em português
   - **`Project Architect: Project Summary (EN)`** - Resumo em inglês
   - **`Project Architect: Technical Analysis (PT)`** - Análise técnica detalhada em português
   - **`Project Architect: Technical Analysis (EN)`** - Detailed technical analysis in English
4. Aguarde a análise (pode levar 10-30 segundos)
5. Visualize o relatório em Markdown gerado automaticamente

![Project Analysis Demo](https://via.placeholder.com/800x450/1e1e1e/ffffff?text=Análise+de+Projeto+-+Demo+em+breve)

### 📝 Como Usar Smart Commit

O **Smart Commit** analisa suas mudanças no Git e gera automaticamente mensagens de commit seguindo o padrão Conventional Commits.

#### Passo-a-Passo:

1. **Faça suas alterações no código**
   ```bash
   # Edite seus arquivos normalmente
   ```

2. **Stage suas mudanças** (opcional)
   ```bash
   git add .
   # ou selecione arquivos específicos
   git add src/meu-arquivo.ts
   ```
   > 💡 **Nota:** O Smart Commit também funciona com mudanças **unstaged**! Se você não tiver feito `git add`, ele analisará todas as mudanças detectáveis.

3. **Execute o comando Smart Commit**
   - Pressione `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac)
   - Digite: **`Project Architect: Generate Smart Commit`**
   - Aguarde alguns segundos

4. **Revise a mensagem gerada**
   - Uma notificação aparecerá mostrando a mensagem de commit
   - A mensagem já estará **copiada para seu clipboard** 📋
   - Revise se está adequada

5. **Escolha como proceder:**
   
   **Opção A - Inserir diretamente no Source Control:**
   - Clique no botão **"Inserir no Source Control"**
   - A mensagem será inserida automaticamente no campo de commit do Git
   - Clique em "Commit" para finalizar

   **Opção B - Commit manual via terminal:**
   ```bash
   # Cole do clipboard (Ctrl+V)
   git commit -m "feat(auth): add JWT token validation"
   ```

#### Exemplos de Mensagens Geradas:

```
feat(api): add user authentication endpoint

Implemented POST /api/auth/login with JWT token generation
and refresh token support.

BREAKING CHANGE: API now requires authentication header
```

```
fix(database): resolve connection pool timeout issue

Updated pool max connections from 10 to 50 to handle
increased load during peak hours.
```

```
refactor(components): extract reusable Button component

Moved Button logic to separate component for better
code reusability and maintainability.
```
---

## ⚙️ Configuração

### Requisitos

- VS Code 1.85.0 ou superior
- API Key da OpenAI ([obtenha aqui](https://platform.openai.com/api-keys))
- **Git instalado** e **repositório inicializado** (necessário apenas para Smart Commit)

### Configurar API Key

1. Abra as Settings (`Ctrl+,`)
4. Busque por "Project Architect AI"
3. Cole sua API Key da OpenAI no campo **"Api Key"**

Ou adicione diretamente no `settings.json`:

```json
{
  "projectArchitectAI.apiKey": "sk-proj-sua-chave-aqui",
  "projectArchitectAI.provider": "openai"
}
```

## 📦 Instalação

### Via Marketplace (em breve)

1. Abra a aba de Extensions no VS Code (`Ctrl+Shift+X`)
2. Busque por "Project Architect AI"
3. Clique em "Install"

### Manual (VSIX)

1. Baixe o arquivo `.vsix` da [página de releases](https://github.com/Rafadegolin/project-architect-ai/releases)
2. No VS Code: `Ctrl+Shift+P` → "Install from VSIX..."
3. Selecione o arquivo baixado

## 🛠️ Tecnologias

- TypeScript
- VS Code Extension API
- OpenAI GPT-4
- esbuild

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja como você pode ajudar:

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: minha nova feature'`
4. Push para a branch: `git push origin feature/minha-feature`
5. Abra um Pull Request

## 📝 Roadmap

- [x] ✅ Geração inteligente de commits (Conventional Commits)
- [x] ✅ Análises multilíngues (PT-BR e EN)
- [x] ✅ Análise de segurança profunda
- [ ] Suporte para Claude (Anthropic)
- [ ] Suporte para modelos locais (Ollama)
- [ ] Exportar relatório em PDF
- [ ] Comparação de arquiteturas entre versões
- [ ] Dashboard interativo
- [ ] Análise de performance e complexidade ciclomática
- [ ] Integração com GitHub Actions para análise automática em PRs

## 📄 Licença

MIT © 2025 Rafael Degolin da Silva

## 🔗 Links

- [Repositório GitHub](https://github.com/Rafadegolin/project-architect-ai)
- [Reportar Bug](https://github.com/Rafadegolin/project-architect-ai/issues)
- [Solicitar Feature](https://github.com/Rafadegolin/project-architect-ai/issues/new)

---

**Desenvolvido com ❤️ no Brasil 🇧🇷**

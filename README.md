# Painel de Releases para QA

Painel web para consulta e acompanhamento de entregas por release, desenvolvido para apoiar atividades de QA.

## 🎯 Objetivo

Organizar informações de versões e entregas em uma interface simples, facilitando a consulta durante o acompanhamento de testes e validações.

## 🚀 Como funciona

O projeto funciona diretamente no navegador e não possui integração com banco de dados.

Os dados são carregados por meio de um arquivo JSON.

```text
Arquivo JSON
     ↓
Upload
     ↓
Painel
     ↓
Consulta das releases
```

## 💻 Como utilizar

Acesse o painel:

**[Abrir Painel de Releases](https://ericasouzaqa.github.io/releases/)**

Depois:

1. Selecione o arquivo JSON.
2. Faça o upload.
3. Consulte as releases disponíveis.
4. Utilize as informações para acompanhar as entregas.

## 📄 Dados de exemplo

O repositório possui o arquivo:

`rav-backup-2026-05-16.json`

Ele contém dados de exemplo para utilização do painel.

## 🧪 Aplicação em QA

O painel pode apoiar atividades como:

* consulta de versões;
* acompanhamento de entregas;
* identificação das funcionalidades incluídas em uma release;
* apoio à execução de testes;
* conferência das entregas antes da validação;
* organização das informações de versões.

### Exemplo de utilização

```text
Release
   ↓
Funcionalidades entregues
   ↓
Cenários de teste
   ↓
Execução
   ↓
Resultado
```

## 🔍 Cenários de teste

### Carregamento válido

**Dado:** um arquivo JSON válido.

**Quando:** o arquivo é carregado.

**Então:** as informações devem ser apresentadas corretamente.

### Arquivo inválido

**Dado:** um arquivo que não possui o formato esperado.

**Quando:** o usuário tenta carregá-lo.

**Então:** a aplicação deve tratar a situação adequadamente.

### Dados incompletos

**Dado:** um JSON sem informações esperadas.

**Quando:** o arquivo é carregado.

**Então:** o comportamento apresentado deve ser validado.

### Consulta de release

**Dado:** uma release disponível.

**Quando:** o usuário consulta suas informações.

**Então:** os dados apresentados devem corresponder ao conteúdo do arquivo carregado.

## 🛠️ Tecnologias

* HTML
* CSS
* JavaScript
* JSON
* GitHub Pages

## 📁 Estrutura do projeto

```text
releases/
├── index.html
├── rav-backup-2026-05-16.json
└── README.md
```

| Arquivo                      | Descrição               |
| ---------------------------- | ----------------------- |
| `index.html`                 | Aplicação web           |
| `rav-backup-2026-05-16.json` | Dados de exemplo        |
| `README.md`                  | Documentação do projeto |

## 🌐 Publicação

O projeto está publicado utilizando GitHub Pages.

**[Acessar o painel](https://ericasouzaqa.github.io/releases/)**

## 📚 O que este projeto demonstra?

* Desenvolvimento de interface web;
* Manipulação de dados JSON;
* Organização de informações;
* Validação de arquivos;
* Aplicação prática de conceitos de QA;
* Criação de ferramenta de apoio à qualidade;
* Publicação de aplicação web estática.

## 👩‍💻 Autora

**Erica de Souza**

QA Analyst com foco em qualidade de software, testes de API, automação e aplicações de Inteligência Artificial.

---

> Projeto desenvolvido para estudo e aplicação prática de conceitos relacionados a QA e desenvolvimento de ferramentas de apoio à qualidade.

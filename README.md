# v1.0.0 — Primeira versão do QA Release Dashboard

## Resumo

Primeira versão funcional do QA Release Dashboard, uma aplicação web para documentação, consulta e acompanhamento de versões, entregas, implementações, melhorias e correções de produtos.

A versão inicial foi desenvolvida como uma aplicação front-end independente de backend e banco de dados, utilizando `localStorage` para persistência dos dados no navegador.

A estrutura foi organizada para permitir evolução futura para uma arquitetura com API, backend e banco de dados.

---

## Funcionalidades

### Área pública

- Consulta de produtos.
- Consulta do histórico de versões.
- Visualização da data de cada versão.
- Visualização da descrição da versão.
- Consulta das entregas realizadas.
- Separação das entregas por:
  - Implementação;
  - Melhoria;
  - Correção.
- Visualização de tickets.
- Visualização do caminho ou localização da funcionalidade.
- Links para documentação.
- Informações de suporte.
- Interface sem acesso às funcionalidades administrativas.

### Área administrativa

- Acesso através de login.
- Controle de perfil de usuário.
- Perfil `admin`.
- Perfil `user`.
- Cadastro de usuários.
- Edição de usuários.
- Remoção de usuários.
- Gerenciamento de produtos.
- Cadastro de produtos.
- Edição de produtos.
- Remoção de produtos.
- Organização dos produtos.
- Gerenciamento de versões.
- Cadastro de versões.
- Edição de versões.
- Remoção de versões.
- Gerenciamento das entregas de cada versão.
- Cadastro de múltiplas entregas por versão.
- Edição de entregas.
- Remoção de entregas.

---

## Documentação de entregas

Cada entrega pode ser classificada como:

### Implementação

Utilizada para novas funcionalidades ou recursos adicionados ao produto.

### Melhoria

Utilizada para alterações que aprimoram funcionalidades existentes.

### Correção

Utilizada para problemas ou comportamentos incorretos que foram corrigidos.

Cada entrega pode possuir informações como:

- tipo;
- título;
- descrição;
- ticket;
- caminho ou localização da funcionalidade;
- link para documentação.

Uma mesma versão pode conter múltiplas entregas.

---

## Persistência dos dados

Nesta versão não existe banco de dados.

As informações são armazenadas localmente utilizando o `localStorage` do navegador.

São armazenados localmente dados como:

- usuários;
- produtos;
- versões;
- entregas;
- configurações da aplicação.

### Importante

O armazenamento em `localStorage` significa que os dados pertencem ao navegador e à origem onde foram cadastrados.

Consequentemente:

- os dados não são sincronizados entre computadores;
- os dados não são compartilhados entre navegadores;
- os dados não são compartilhados entre dispositivos;
- limpar os dados do navegador pode remover as informações;
- não existe persistência centralizada;
- não existe backend;
- não existe banco de dados.

A aplicação possui mecanismos de exportação e importação dos dados para facilitar backup e restauração.

---

## Autenticação

A versão `v1.0.0` possui autenticação e controle básico de perfis utilizando recursos do próprio front-end.

Os perfis disponíveis são:

```text
admin
user
```

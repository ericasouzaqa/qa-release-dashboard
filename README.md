# QA Release Dashboard

## v1.2.0 — Demo / Frontend + LocalStorage

O QA Release Dashboard é uma demonstração de uma solução para consulta, administração e distribuição de informações de releases sob a perspectiva de Quality Assurance.

A versão 1.2.0 foi estruturada para demonstrar um fluxo completo de gestão de releases sem dependência de banco de dados.

## O que a versão entrega

- Login com controle de perfil.
- Usuário administrador e usuário comum.
- Primeiro acesso por código.
- Recuperação de senha simulada.
- Perfil do usuário.
- Cadastro de produtos.
- Cadastro de versões dentro do produto.
- Cadastro de entregas dentro da versão.
- Tipos de entrega:
  - Implementação
  - Melhoria
  - Correção
- Publicação e desativação de versões por toggle.
- Consulta somente de versões publicadas para usuários comuns.
- Filtro por produto.
- Filtro por versão.
- Busca por card, título, descrição, ticket e tipo.
- Filtro por data.
- Paginação.
- Geração de CSV.
- Geração de relatório para impressão em PDF.
- Envio de relatório por e-mail.
- Seleção de e-mails individuais.
- Seleção de grupos de destinatários.
- Grupos de e-mail administráveis.
- Até 25 destinatários por grupo.
- Ativação e inativação de grupos.
- Grupos inativos não aparecem para usuários comuns no envio de relatórios.
- Dados fictícios pré-cadastrados.
- Interface responsiva.
- Layout limpo inspirado em padrões de interfaces modernas.
- Persistência local com LocalStorage.

## Regras de negócio

### Produto

Produto representa um menu ou módulo do sistema.

O fluxo de cadastro é hierárquico:

Produto
→ Versão
→ Entregas

Uma versão não é cadastrada isoladamente.

Primeiro o administrador cria ou seleciona um produto. Dentro desse produto são cadastradas as versões. Dentro de cada versão são cadastradas as entregas de QA.

Isso evita que o relatório seja cumulativo entre produtos diferentes.

### Versão

Cada versão possui:

- Número da versão.
- Data.
- Descrição.
- Status de publicação.
- Entregas.

O administrador pode publicar ou desativar uma versão utilizando o toggle.

Quando uma versão está publicada, ela pode aparecer para usuários comuns.

Quando uma versão está desativada, ela deixa de aparecer na consulta pública do dashboard.

### Entrega

Cada entrega possui:

- Ticket.
- Tipo.
- Título.
- Descrição.
- Caminho da funcionalidade.
- Link de documentação.

Os tipos disponíveis são:

- Implementação
- Melhoria
- Correção

### Usuários

Existem dois perfis:

#### Administrador

Pode:

- Cadastrar produtos.
- Editar produtos.
- Excluir produtos.
- Cadastrar versões.
- Editar versões.
- Excluir versões.
- Publicar versões.
- Desativar versões.
- Cadastrar entregas.
- Editar entregas.
- Excluir entregas.
- Cadastrar usuários.
- Editar usuários.
- Ativar usuários.
- Inativar usuários.
- Cadastrar grupos de e-mail.
- Editar grupos.
- Ativar grupos.
- Inativar grupos.
- Excluir grupos.

#### Usuário de QA

Pode:

- Consultar releases publicadas.
- Filtrar releases.
- Selecionar produto.
- Selecionar versão.
- Filtrar por data.
- Pesquisar cards, tickets, títulos e descrições.
- Gerar CSV.
- Gerar relatório para PDF.
- Solicitar envio de relatório por e-mail.
- Selecionar e-mails individuais.
- Selecionar grupos de e-mail ativos.

Usuários comuns não possuem acesso à administração.

## Login de demonstração

Administrador:

Usuário:
erica

Senha:
QA@123456

Usuários de QA:

ana.qa
bruno.qa
carla.qa

Senha:

QA@123456

Os dados são fictícios e servem exclusivamente para demonstração.

## Primeiro acesso

O fluxo de primeiro acesso está disponível na tela de login.

Código demonstrativo:

QA-FIRST-120

O usuário informa:

- Usuário.
- Código de primeiro acesso.
- Nova senha.
- Confirmação da nova senha.

## Recuperação de senha

A recuperação de senha é simulada porque a aplicação não possui banco de dados nem serviço real de identidade.

Código demonstrativo:

QA-RECOVERY-120

O usuário informa:

- Usuário.
- Código de recuperação.
- Nova senha.
- Confirmação da nova senha.

A nova senha é gravada no LocalStorage do navegador.

## Persistência

A aplicação não possui banco de dados.

Os dados são armazenados no LocalStorage do navegador.

Isso significa que:

- Os dados pertencem ao navegador utilizado.
- Outro navegador não terá os mesmos dados.
- Outro computador não terá os mesmos dados.
- Limpar os dados do site remove os registros locais.
- O repositório pode ser clonado normalmente.
- O projeto não depende de banco de dados para funcionar como demonstração.

Esta decisão é intencional para a versão 1.2.0.

## Dados de demonstração

A aplicação já inicia com dados fictícios.

Existem:

- 3 produtos.
- 3 versões por produto.
- Entregas distribuídas entre Implementação, Melhoria e Correção.
- Usuários fictícios.
- 3 grupos de e-mail.

Os dados podem ser alterados pelo administrador.

## Exportação CSV

Cada release possui a opção:

Gerar CSV

O arquivo contém:

- Produto.
- Versão.
- Data.
- Tipo.
- Ticket.
- Título.
- Descrição.
- Caminho da funcionalidade.

O CSV é gerado diretamente pelo navegador.

## Relatório PDF

Cada release possui a opção:

Gerar PDF

Na demonstração, o relatório é aberto em uma janela de impressão do navegador.

No diálogo de impressão, selecione:

Salvar como PDF

Essa abordagem mantém a aplicação frontend independente de serviços externos.

## Envio de e-mail

O envio de e-mail possui duas modalidades:

### E-mails individuais

O usuário pode informar um ou mais e-mails.

Os endereços podem ser separados por:

- ponto e vírgula;
- vírgula;
- quebra de linha.

### Grupos

O usuário pode selecionar um grupo de destinatários.

Somente grupos ativos ficam disponíveis para usuários comuns.

Cada grupo pode possuir no máximo 25 destinatários.

Cada destinatário possui:

- Nome.
- Cargo.
- E-mail.

O administrador pode:

- Criar grupos.
- Editar grupos.
- Ativar grupos.
- Inativar grupos.
- Excluir grupos.

## MailHog

O MailHog é utilizado somente para simulação de envio de e-mail.

Ele não envia mensagens reais para os destinatários.

O MailHog disponibiliza uma interface web para visualizar as mensagens enviadas pela aplicação.

Configuração padrão:

SMTP:
127.0.0.1:1025

Interface:
http://127.0.0.1:8025

### Executando localmente

Para utilizar o envio de e-mail com o servidor Node:

1. Instale as dependências do projeto.

npm install

2. Instale as dependências do servidor.

cd server
npm install
cd ..

3. Crie:

server/.env

a partir de:

server/.env.example

4. Inicie o MailHog no ambiente local.

5. Inicie o dashboard:

npm start

6. Abra:

http://127.0.0.1:3000

7. Abra o MailHog:

http://127.0.0.1:8025

8. No dashboard, selecione uma release.

9. Clique em:

Enviar por e-mail

10. Informe um destinatário ou selecione um grupo.

11. Envie o relatório.

12. Abra o MailHog e confirme a mensagem.

### Importante sobre GitHub Pages

GitHub Pages publica arquivos estáticos HTML, CSS e JavaScript.

O servidor Node presente neste projeto não é executado pelo GitHub Pages.

Portanto:

- O dashboard frontend pode ser publicado no GitHub Pages.
- Login demonstrativo funciona no navegador.
- LocalStorage funciona no navegador.
- Filtros funcionam.
- Paginação funciona.
- CSV funciona.
- Geração de relatório para PDF funciona.
- Administração funciona no navegador.
- Dados ficam no navegador.
- O servidor Node não funciona dentro do GitHub Pages.
- MailHog local não fica disponível para quem apenas abrir o GitHub Pages.
- O envio SMTP pelo MailHog exige que o servidor Node e o MailHog estejam disponíveis no ambiente local ou em um servidor.

Portanto, para demonstrar somente o frontend, utilize o GitHub Pages.

Para demonstrar o envio de e-mail, clone o repositório e execute o ambiente local com Node e MailHog.

O GitHub Pages é um serviço de hospedagem estática e publica HTML, CSS e JavaScript diretamente do repositório. Ele não executa linguagens server-side.

## Executando sem servidor de e-mail

Para avaliação do frontend, o projeto pode ser aberto por um servidor estático ou pelo GitHub Pages.

Nesta modalidade:

- Login funciona.
- Administração funciona.
- LocalStorage funciona.
- Cadastro funciona.
- Filtros funcionam.
- Paginação funciona.
- CSV funciona.
- PDF funciona.
- O botão de e-mail depende do backend local para efetivamente enviar.

## Executando localmente

Na raiz:

npm install

Depois:

npm start

Abra:

http://127.0.0.1:3000

## Estrutura

qa-release-dashboard/

├── css/
│ └── style.css
│
├── images/
│ └── icone.png
│
├── js/
│ ├── app.js
│ ├── auth.js
│ ├── data.js
│ ├── email.js
│ ├── export.js
│ ├── release.js
│ ├── storage.js
│ └── ui.js
│
├── server/
│ ├── package.json
│ ├── server.js
│ └── .env.example
│
├── admin.html
├── index.html
├── login.html
├── package.json
├── .gitignore
└── README.md

## Arquitetura

A versão 1.2.0 é propositalmente simples.

Frontend:

HTML
CSS
JavaScript
LocalStorage

Backend opcional:

Node.js
Express
Nodemailer

SMTP de demonstração:

MailHog

Não existe banco de dados nesta versão.

## Segurança

Esta versão é uma demonstração frontend.

As credenciais são fictícias e ficam no código de demonstração/LocalStorage.

Não utilize esta implementação como sistema de autenticação real.

Não coloque credenciais reais, dados pessoais reais ou informações confidenciais no projeto.

## Publicação

O projeto pode ser clonado normalmente:

git clone <URL_DO_REPOSITORIO>

Depois:

cd qa-release-dashboard

npm install

Para utilizar somente o frontend, publique o projeto como GitHub Pages.

Para testar envio de e-mail, utilize o ambiente local com Node e MailHog.

## Escopo da v1.2.0

Esta versão representa um protótipo funcional para demonstração de:

- gestão de releases;
- organização por produto;
- controle de versão;
- registro de entregas de QA;
- consulta;
- filtros;
- publicação;
- administração;
- exportação;
- geração de relatório;
- distribuição simulada por e-mail.

Banco de dados, autenticação real, controle de sessão no servidor, envio de e-mail real e infraestrutura de produção não fazem parte desta versão.

## Versão

1.2.0

Status:

Demo / Frontend + LocalStorage

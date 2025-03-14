# NexusBugTracker - API

## Descrição

NexusBugTracker é um sistema de gerenciamento de bugs desenvolvido com Node.js para a API. Ele permite o rastreamento e gestão de erros em sistemas, proporcionando organização e comunicação eficiente entre desenvolvedores e testers.

## Funcionalidades

1. **Autenticação de Usuário** - Registro e login de usuários.
2. **Cadastro de Bugs** - Inclusão de bugs com título, descrição, prioridade, status e responsável.
3. **Lista e Filtro de Bugs** - Consulta de bugs filtrando por status, prioridade e responsável.
4. **Comentários nos Bugs** - Possibilidade de discutir soluções nos bugs.
5. **Histórico de Mudanças** - Registro de alterações de status e responsáveis.
6. **Notificações** - Envio de notificações por e-mail ou in-app quando um bug for atualizado.

## Tecnologias Utilizadas

- **Node.js**
- **Express.js**
- **Firebase** (Banco de dados a definir)

## Instalação e Uso

1. Clone o repositório:
   ```bash
   git clone https://github.com/BrunoReiis/NexusBugTracker.git
   ```
2. Acesse a pasta da API:
   ```bash
   cd NexusBugTracker/api
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Configure as variáveis de ambiente criando um arquivo `.json` com as credenciais necessárias.
5. Inicie o servidor:
   ```bash
   npm start
   ```

## Endpoints Principais

### Autenticação

- `POST /api/auth/register` - Registro de usuário.
- `POST /api/auth/login` - Login de usuário.

### Bugs

- `POST /api/bugs` - Cadastro de um novo bug.
- `GET /api/bugs` - Listagem de bugs com filtros.
- `PUT /api/bugs/:id` - Atualização de um bug.
- `DELETE /api/bugs/:id` - Exclusão de um bug.

### Comentários

- `POST /api/bugs/:id/comments` - Adiciona um comentário ao bug.
- `GET /api/bugs/:id/comments` - Lista comentários do bug.

### Notificações

- `GET /api/notifications` - Lista notificações do usuário.

## Contribuição

Sinta-se à vontade para contribuir com o projeto. Para isso:

1. Faça um fork do repositório.
2. Crie uma branch para sua feature: `git checkout -b minha-feature`.
3. Faça suas alterações e commit: `git commit -m 'Minha nova feature'`.
4. Envie para o repositório remoto: `git push origin minha-feature`.
5. Abra um Pull Request.

## Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para mais detalhes.


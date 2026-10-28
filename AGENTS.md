<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

# Contexto do Projeto

Este repositório contém o "CRM Modelo Propulsão", um template base gerado via Lovable. Ele é utilizado para criar CRMs personalizados (forks) para diferentes clientes. A IA deve atuar priorizando a estabilidade do template e aplicando regras de negócio apenas no escopo do cliente atual.

## Stack Tecnológico

- **Gerenciador de Pacotes:** Bun (NUNCA utilize npm, yarn ou pnpm).
- **Framework:** React + TypeScript + Vite.
- **Roteamento:** TanStack Router (rotas baseadas em arquivos na pasta `src/routes/`).
- **Estilização:** Tailwind CSS + Componentes UI em `src/components/ui/`.
- **Backend/BaaS:** Supabase.
- **Database ORM:** Drizzle ORM.

## Padrões de Desenvolvimento

1. **Instalação de Dependências:** Sempre utilize `bun add <pacote>`.
2. **Criação de Componentes:** Antes de criar um componente do zero ou instalar uma lib externa, verifique se já existe um equivalente em `src/components/ui/`.
3. **Banco de Dados:** Qualquer modificação de dados deve ocorrer em `drizzle/schema.ts`. Após alterar o schema, oriente o desenvolvedor a rodar a geração da migration Drizzle.
4. **Autenticação e Permissões:** Use os hooks existentes (como `use-is-admin.ts`) e siga o padrão estabelecido no `auth-middleware.ts` para proteger rotas.
5. **Manipulação de Dados:** Ao trabalhar com listagens, exportações ou CSVs, utilize e expanda os utilitários já existentes (como `src/lib/export-csv.ts` e `src/lib/crm-data.ts`).

## Diretrizes para Novos Clientes (Setup)

Quando iniciar a customização para um novo cliente, a IA deve focar nos seguintes passos:

1. Requisitar e atualizar as variáveis no arquivo `.env` com as credenciais do Supabase do novo cliente.
2. Substituir o `public/favicon.ico`, logomarca do cliente e atualizar títulos/metadados no arquivo de indexação.
3. Ajustar as variáveis de cor primária e tipografia em `src/styles.css` para bater com o branding do cliente.
4. Expandir campos customizados de Leads de forma incremental no Drizzle sem quebrar as views padrões existentes.

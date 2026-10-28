# Exportar leads em CSV

Adicionar um botão "Exportar CSV" no topo do funil que baixa um arquivo com todas as informações de cada lead.

## Comportamento

- Botão ao lado de "Filtrar", no cabeçalho do CRM.
- Exporta **os leads atualmente filtrados** (respeita filtros ativos: responsável, status, motivo de perda, canal, datas). Se nenhum filtro estiver ativo, exporta todos.
- Nome do arquivo: `leads-AAAA-MM-DD.csv`.
- Download direto no navegador, sem backend.

## Colunas exportadas (todas as informações do lead)

Nome, Telefone, E-mail, Cidade, Tipo de esquadria (rótulos legíveis), Estágio da obra, Faixa de investimento (rótulo), Valor do projeto, Mensagem, Etapa do funil (rótulo), Status (Aberto/Ganho/Perdido), Qualidade (quality_score), Motivo da perda, Responsável (nome), Canal detectado, utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, wbraid, gbraid, Referrer, Landing page, Data de criação, Data de fechamento, Última atualização, ID.

## Detalhes técnicos

- Novo helper `src/lib/export-csv.ts`: gera CSV com separador `;` e BOM UTF-8 (abre certo no Excel em pt-BR), escapa aspas/quebras de linha, formata datas em `dd/MM/aaaa HH:mm` e valores numéricos no padrão brasileiro.
- Em `src/routes/_authenticated/crm.tsx`: usa a lista já derivada dos filtros (o `useMemo` existente por volta da linha 176) e o mapa de responsáveis para resolver `responsavel_id` → nome; rótulos vêm de `ESQUADRIA_LABELS`, `INVESTIMENTO_LABELS`, `STATUS_LABELS`, `STAGES`, `ESTAGIO_OBRA_LABELS` e `resolveChannel` em `src/lib/leads.ts`.
- Download via `Blob` + link temporário; toast de confirmação com a quantidade exportada e aviso quando não há leads para exportar.

## Fora de escopo

- Exportar anotações, anexos e tarefas (ficam em tabelas separadas). Posso incluir depois, como colunas agregadas ou arquivos extras, se quiser.

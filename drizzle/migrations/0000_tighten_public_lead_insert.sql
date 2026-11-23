DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
CREATE POLICY "Anyone can insert valid new leads" ON public.leads
FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(nome)) BETWEEN 1 AND 200
  AND char_length(btrim(telefone)) BETWEEN 6 AND 40
  AND (email IS NULL OR char_length(email) <= 255)
  AND (mensagem IS NULL OR char_length(mensagem) <= 5000)
  AND (cidade IS NULL OR char_length(cidade) <= 200)
  AND stage = 'novos'::lead_stage
  AND status = 'aberto'::lead_status
  AND quality_score IS NULL
  AND motivo_perda IS NULL
  AND fechado_em IS NULL
  AND (responsavel_id IS NULL OR public.is_crm_member(auth.uid()))
);
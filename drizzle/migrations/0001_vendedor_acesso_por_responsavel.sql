ALTER TABLE public.responsaveis ADD COLUMN IF NOT EXISTS user_id uuid UNIQUE;

CREATE OR REPLACE FUNCTION public.current_responsavel_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.responsaveis WHERE user_id = auth.uid()
$$;
REVOKE EXECUTE ON FUNCTION public.current_responsavel_ids() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.current_responsavel_ids() TO authenticated, service_role;

CREATE INDEX IF NOT EXISTS leads_responsavel_id_idx ON public.leads(responsavel_id);
CREATE INDEX IF NOT EXISTS lead_tarefas_responsavel_id_idx ON public.lead_tarefas(responsavel_id);

-- leads
DROP POLICY IF EXISTS "CRM members can select leads" ON public.leads;
DROP POLICY IF EXISTS "CRM members can update leads" ON public.leads;
CREATE POLICY "Admins or assigned seller select leads" ON public.leads FOR SELECT TO authenticated
USING ((select public.has_role((select auth.uid()), 'admin')) OR responsavel_id IN (select public.current_responsavel_ids()));
CREATE POLICY "Admins or assigned seller update leads" ON public.leads FOR UPDATE TO authenticated
USING ((select public.has_role((select auth.uid()), 'admin')) OR responsavel_id IN (select public.current_responsavel_ids()))
WITH CHECK ((select public.has_role((select auth.uid()), 'admin')) OR responsavel_id IN (select public.current_responsavel_ids()));

-- lead_tarefas
DROP POLICY IF EXISTS "CRM members manage lead_tarefas" ON public.lead_tarefas;
CREATE POLICY "Admins or own seller select tarefas" ON public.lead_tarefas FOR SELECT TO authenticated
USING ((select public.has_role((select auth.uid()), 'admin')) OR responsavel_id IN (select public.current_responsavel_ids()));
CREATE POLICY "Admins or own seller insert tarefas" ON public.lead_tarefas FOR INSERT TO authenticated
WITH CHECK ((select public.has_role((select auth.uid()), 'admin')) OR responsavel_id IN (select public.current_responsavel_ids()));
CREATE POLICY "Admins or own seller update tarefas" ON public.lead_tarefas FOR UPDATE TO authenticated
USING ((select public.has_role((select auth.uid()), 'admin')) OR responsavel_id IN (select public.current_responsavel_ids()))
WITH CHECK ((select public.has_role((select auth.uid()), 'admin')) OR responsavel_id IN (select public.current_responsavel_ids()));
CREATE POLICY "Admins or own seller delete tarefas" ON public.lead_tarefas FOR DELETE TO authenticated
USING ((select public.has_role((select auth.uid()), 'admin')) OR responsavel_id IN (select public.current_responsavel_ids()));

-- lead_notes (lead visibility via leads RLS)
DROP POLICY IF EXISTS "CRM members read lead_notes" ON public.lead_notes;
DROP POLICY IF EXISTS "CRM members insert lead_notes" ON public.lead_notes;
DROP POLICY IF EXISTS "CRM members update lead_notes" ON public.lead_notes;
CREATE POLICY "Visible lead read notes" ON public.lead_notes FOR SELECT TO authenticated USING (lead_id IN (SELECT id FROM public.leads));
CREATE POLICY "Visible lead insert notes" ON public.lead_notes FOR INSERT TO authenticated WITH CHECK (lead_id IN (SELECT id FROM public.leads));
CREATE POLICY "Visible lead update notes" ON public.lead_notes FOR UPDATE TO authenticated USING (lead_id IN (SELECT id FROM public.leads)) WITH CHECK (lead_id IN (SELECT id FROM public.leads));

DROP POLICY IF EXISTS "CRM members read lead_attachments" ON public.lead_attachments;
DROP POLICY IF EXISTS "CRM members insert lead_attachments" ON public.lead_attachments;
DROP POLICY IF EXISTS "CRM members update lead_attachments" ON public.lead_attachments;
CREATE POLICY "Visible lead read attachments" ON public.lead_attachments FOR SELECT TO authenticated USING (lead_id IN (SELECT id FROM public.leads));
CREATE POLICY "Visible lead insert attachments" ON public.lead_attachments FOR INSERT TO authenticated WITH CHECK (lead_id IN (SELECT id FROM public.leads));
CREATE POLICY "Visible lead update attachments" ON public.lead_attachments FOR UPDATE TO authenticated USING (lead_id IN (SELECT id FROM public.leads)) WITH CHECK (lead_id IN (SELECT id FROM public.leads));

-- responsaveis
DROP POLICY IF EXISTS "CRM members manage responsaveis" ON public.responsaveis;
CREATE POLICY "Members read responsaveis" ON public.responsaveis FOR SELECT TO authenticated USING ((select public.is_crm_member((select auth.uid()))));
CREATE POLICY "Admins insert responsaveis" ON public.responsaveis FOR INSERT TO authenticated WITH CHECK ((select public.has_role((select auth.uid()), 'admin')));
CREATE POLICY "Admins update responsaveis" ON public.responsaveis FOR UPDATE TO authenticated USING ((select public.has_role((select auth.uid()), 'admin'))) WITH CHECK ((select public.has_role((select auth.uid()), 'admin')));
CREATE POLICY "Admins delete responsaveis" ON public.responsaveis FOR DELETE TO authenticated USING ((select public.has_role((select auth.uid()), 'admin')));

-- motivos_perda
DROP POLICY IF EXISTS "CRM members manage motivos_perda" ON public.motivos_perda;
CREATE POLICY "Members read motivos_perda" ON public.motivos_perda FOR SELECT TO authenticated USING ((select public.is_crm_member((select auth.uid()))));
CREATE POLICY "Admins insert motivos_perda" ON public.motivos_perda FOR INSERT TO authenticated WITH CHECK ((select public.has_role((select auth.uid()), 'admin')));
CREATE POLICY "Admins update motivos_perda" ON public.motivos_perda FOR UPDATE TO authenticated USING ((select public.has_role((select auth.uid()), 'admin'))) WITH CHECK ((select public.has_role((select auth.uid()), 'admin')));
CREATE POLICY "Admins delete motivos_perda" ON public.motivos_perda FOR DELETE TO authenticated USING ((select public.has_role((select auth.uid()), 'admin')));
DROP POLICY IF EXISTS "Admins or assigned seller select leads" ON public.leads;
DROP POLICY IF EXISTS "Admins or assigned seller update leads" ON public.leads;
CREATE POLICY "Admins, assigned seller or open queue select leads" ON public.leads FOR SELECT TO authenticated
USING ((select public.has_role((select auth.uid()), 'admin'))
  OR responsavel_id IN (select public.current_responsavel_ids())
  OR (responsavel_id IS NULL AND stage = 'novos' AND (select public.is_crm_member((select auth.uid())))));
CREATE POLICY "Admins, assigned seller or open queue update leads" ON public.leads FOR UPDATE TO authenticated
USING ((select public.has_role((select auth.uid()), 'admin'))
  OR responsavel_id IN (select public.current_responsavel_ids())
  OR (responsavel_id IS NULL AND stage = 'novos' AND (select public.is_crm_member((select auth.uid())))))
WITH CHECK ((select public.has_role((select auth.uid()), 'admin'))
  OR responsavel_id IN (select public.current_responsavel_ids())
  OR responsavel_id IS NULL);
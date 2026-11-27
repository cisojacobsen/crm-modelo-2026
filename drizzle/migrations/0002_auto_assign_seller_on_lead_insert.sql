CREATE OR REPLACE FUNCTION public.auto_assign_seller_on_lead_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.responsavel_id IS NULL AND auth.uid() IS NOT NULL
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    SELECT id INTO NEW.responsavel_id FROM public.responsaveis
      WHERE user_id = auth.uid() LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.auto_assign_seller_on_lead_insert() FROM public, anon, authenticated;
CREATE TRIGGER leads_auto_assign_seller BEFORE INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_seller_on_lead_insert();
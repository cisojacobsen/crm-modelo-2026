import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShieldCheck, UserPlus, Ban, Trash2, Eye, EyeOff } from "lucide-react";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { listUsers, createUser, setUserAdmin, setUserBlocked, deleteUser, type AppUser } from "@/lib/users.functions";

export const Route = createFileRoute("/_authenticated/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários · Modelo CRM" },
      { name: "description", content: "Gerencie usuários e permissões do Modelo CRM." },
      { property: "og:title", content: "Usuários · Modelo CRM" },
      { property: "og:description", content: "Gerencie usuários e permissões do Modelo CRM." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UsuariosPage,
});

const fmt = (d: string | null) => (d ? format(new Date(d), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "Nunca");

function UsuariosPage() {
  const { isAdmin, isLoading } = useIsAdmin();
  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Carregando...</div>;
  if (!isAdmin)
    return (
      <div className="p-6">
        <h1 className="font-display text-xl font-bold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">Apenas administradores podem acessar esta tela.</p>
        <Button asChild className="mt-4" size="sm">
          <Link to="/crm">Voltar ao funil</Link>
        </Button>
      </div>
    );
  return <UsuariosAdmin />;
}

function UsuariosAdmin() {
  const qc = useQueryClient();
  const list = useServerFn(listUsers);
  const create = useServerFn(createUser);
  const setAdmin = useServerFn(setUserAdmin);
  const setBlocked = useServerFn(setUserBlocked);
  const remove = useServerFn(deleteUser);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", isAdmin: false });
  const [show, setShow] = useState(false);

  const me = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await supabase.auth.getUser()).data.user?.id ?? null,
  });
  const users = useQuery({ queryKey: ["app-users"], queryFn: () => list() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["app-users"] });
  const onError = (e: Error) => toast.error(e.message);

  const createM = useMutation({
    mutationFn: () => create({ data: form }),
    onSuccess: () => {
      toast.success("Usuário criado.");
      setOpen(false);
      setForm({ email: "", password: "", isAdmin: false });
      refresh();
    },
    onError,
  });
  const adminM = useMutation({
    mutationFn: (v: { userId: string; isAdmin: boolean }) => setAdmin({ data: v }),
    onSuccess: () => {
      toast.success("Permissão atualizada.");
      refresh();
    },
    onError,
  });
  const blockM = useMutation({
    mutationFn: (v: { userId: string; blocked: boolean }) => setBlocked({ data: v }),
    onSuccess: (_, v) => {
      toast.success(v.blocked ? "Usuário bloqueado." : "Usuário desbloqueado.");
      refresh();
    },
    onError,
  });
  const deleteM = useMutation({
    mutationFn: (userId: string) => remove({ data: { userId } }),
    onSuccess: () => {
      toast.success("Usuário excluído.");
      refresh();
    },
    onError,
  });

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-bold">Usuários</h1>
          <p className="text-sm text-muted-foreground">Gerencie acessos e permissões.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Novo usuário
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-3">E-mail</th>
              <th className="p-3">Cadastro</th>
              <th className="p-3">Último acesso</th>
              <th className="p-3">Status</th>
              <th className="p-3">Admin</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.isLoading && (
              <tr>
                <td className="p-3 text-muted-foreground" colSpan={6}>
                  Carregando...
                </td>
              </tr>
            )}
            {users.error && (
              <tr>
                <td className="p-3 text-destructive" colSpan={6}>
                  {(users.error as Error).message}
                </td>
              </tr>
            )}
            {(users.data ?? []).map((u: AppUser) => {
              const isMe = u.id === me.data;
              return (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="p-3">
                    {u.email}
                    {isMe && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}
                  </td>
                  <td className="p-3">{fmt(u.created_at)}</td>
                  <td className="p-3">{fmt(u.last_sign_in_at)}</td>
                  <td className="p-3">
                    {u.banned ? <Badge variant="destructive">Bloqueado</Badge> : <Badge variant="outline">Ativo</Badge>}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={u.is_admin}
                        disabled={adminM.isPending || isMe || (u.auto_admin && u.is_admin)}
                        onCheckedChange={(v) => adminM.mutate({ userId: u.id, isAdmin: v })}
                      />
                      {u.auto_admin && (
                        <ShieldCheck
                          className="h-4 w-4 text-muted-foreground"
                          aria-label="Admin automático (@propulsao.digital)"
                        />
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isMe || blockM.isPending}
                        onClick={() => blockM.mutate({ userId: u.id, blocked: !u.banned })}
                      >
                        <Ban className="mr-1 h-4 w-4" />
                        {u.banned ? "Desbloquear" : "Bloquear"}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" disabled={isMe}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {u.email} perderá o acesso definitivamente. Essa ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteM.mutate(u.id)}>Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>E-mail</Label>
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Senha inicial</Label>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShow(!show)}
                  aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isAdmin} onCheckedChange={(v) => setForm({ ...form, isAdmin: v })} />
              <Label>Administrador</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={createM.isPending} onClick={() => createM.mutate()}>
              {createM.isPending ? "Criando..." : "Criar usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

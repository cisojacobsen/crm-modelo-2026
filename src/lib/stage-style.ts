import { Inbox, PhoneCall, MessageSquare, FileText, Trophy, Archive, type LucideIcon } from "lucide-react";

export const STAGE_STYLE: Record<string, { icon: LucideIcon; bar: string; text: string; pill: string }> = {
  novos: { icon: Inbox, bar: "bg-sky-500", text: "text-sky-500", pill: "bg-sky-500/15 text-sky-600 ring-sky-500/40" },
  primeiro_contato: { icon: PhoneCall, bar: "bg-indigo-500", text: "text-indigo-500", pill: "bg-indigo-500/15 text-indigo-600 ring-indigo-500/40" },
  atendimento: { icon: MessageSquare, bar: "bg-amber-500", text: "text-amber-500", pill: "bg-amber-500/15 text-amber-600 ring-amber-500/40" },
  orcamento: { icon: FileText, bar: "bg-violet-500", text: "text-violet-500", pill: "bg-violet-500/15 text-violet-600 ring-violet-500/40" },
  vendas: { icon: Trophy, bar: "bg-emerald-500", text: "text-emerald-500", pill: "bg-emerald-500/15 text-emerald-600 ring-emerald-500/40" },
  arquivo: { icon: Archive, bar: "bg-muted-foreground", text: "text-muted-foreground", pill: "bg-muted text-muted-foreground ring-border" },
};

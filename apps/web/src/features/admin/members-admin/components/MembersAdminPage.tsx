import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminDataTable, type AdminDataTableColumn } from "@/shared/components";
import type { MembershipApplicationDTO, MembershipDTO } from "@/shared/types/api";
import {
  useMembershipApplications,
  useApproveApplication,
  useRejectApplication,
  useMembers,
  useUpdateMemberRole,
} from "../api/useMembersAdmin";

function ApplicationsTab() {
  const { data, isLoading } = useMembershipApplications("pending");
  const approve = useApproveApplication();
  const reject = useRejectApplication();

  const columns: AdminDataTableColumn<MembershipApplicationDTO>[] = [
    { key: "full_name", header: "Nama", render: (a) => <span className="font-medium">{a.full_name}</span> },
    { key: "email", header: "Email", render: (a) => a.email },
    { key: "phone", header: "Telepon", render: (a) => a.phone },
    { key: "motivation", header: "Motivasi", className: "max-w-xs truncate", render: (a) => a.motivation ?? "-" },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (a) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Setujui"
            onClick={() =>
              approve.mutate(a.id, {
                onSuccess: () => toast.success(`${a.full_name} disetujui sebagai member`),
                onError: () => toast.error("Gagal menyetujui aplikasi"),
              })
            }
          >
            <Check className="h-4 w-4 text-success" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Tolak"
            onClick={() =>
              reject.mutate(a.id, {
                onSuccess: () => toast.success(`Aplikasi ${a.full_name} ditolak`),
                onError: () => toast.error("Gagal menolak aplikasi"),
              })
            }
          >
            <X className="h-4 w-4 text-danger" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      columns={columns}
      rows={data ?? []}
      rowKey={(a) => a.id}
      isLoading={isLoading}
      emptyMessage="Tidak ada aplikasi pending."
    />
  );
}

function MembersTab() {
  const { data, isLoading } = useMembers();
  const updateRole = useUpdateMemberRole();

  const columns: AdminDataTableColumn<MembershipDTO>[] = [
    {
      key: "user_id",
      header: "User ID",
      render: (m) => <span className="font-mono text-xs text-muted-foreground">{m.user_id.slice(0, 8)}…</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (m) => <Badge variant={m.status === "active" ? "success" : "default"}>{m.status}</Badge>,
    },
    {
      key: "role",
      header: "Role",
      render: (m) => (
        <Select
          value={m.role}
          onValueChange={(role) =>
            updateRole.mutate(
              { id: m.id, role: role as MembershipDTO["role"] },
              {
                onSuccess: () => toast.success("Role diperbarui"),
                onError: () => toast.error("Gagal memperbarui role"),
              },
            )
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="officer">Officer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <div>
      <p className="mb-4 text-xs text-muted-foreground">
        Kontrak API belum menyertakan nama/email langsung di data member — hanya User ID.
      </p>
      <AdminDataTable columns={columns} rows={data ?? []} rowKey={(m) => m.id} isLoading={isLoading} emptyMessage="Belum ada member." />
    </div>
  );
}

export function MembersAdminPage() {
  return (
    <div>
      <h1 className="font-display text-h2">Member</h1>
      <Tabs defaultValue="applications" className="mt-6">
        <TabsList>
          <TabsTrigger value="applications">Aplikasi Baru</TabsTrigger>
          <TabsTrigger value="members">Member Aktif</TabsTrigger>
        </TabsList>
        <TabsContent value="applications">
          <ApplicationsTab />
        </TabsContent>
        <TabsContent value="members">
          <MembersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

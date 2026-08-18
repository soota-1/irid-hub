import { useState } from "react";
import { Check, X } from "lucide-react";
import { format } from "date-fns";
import { AdminDataTable, AdminAccessDenied, AdminStatusBadge } from "@/shared/components";
import { ApiClientError } from "@/shared/lib/apiClient";
import {
  useMembershipApplications,
  useApplicationMutations,
  useMembers,
  useUpdateMemberRole,
} from "../api/useMembersAdmin";

type Tab = "applications" | "members";

const roleOptions = ["member", "officer", "admin"];

export function MembersAdminPage() {
  const [tab, setTab] = useState<Tab>("applications");
  const applications = useMembershipApplications("pending");
  const { approve, reject } = useApplicationMutations();
  const members = useMembers();
  const updateRole = useUpdateMemberRole();

  const firstError = applications.error ?? members.error;
  if (firstError instanceof ApiClientError && firstError.status === 403) return <AdminAccessDenied />;

  return (
    <div>
      <h1 className="text-h2 mb-6">Member</h1>

      <div className="flex gap-1 border-b border-neutral-200 mb-6">
        <TabButton active={tab === "applications"} onClick={() => setTab("applications")}>
          Pendaftaran Pending
        </TabButton>
        <TabButton active={tab === "members"} onClick={() => setTab("members")}>
          Daftar Member
        </TabButton>
      </div>

      {tab === "applications" && (
        <AdminDataTable
          isLoading={applications.isPending}
          rows={applications.data?.data ?? []}
          rowKey={(a) => a.id!}
          emptyMessage="Tidak ada pendaftaran pending."
          columns={[
            { key: "name", header: "Nama", render: (a) => a.full_name },
            { key: "email", header: "Email", render: (a) => a.email },
            { key: "phone", header: "Telepon", render: (a) => a.phone },
            {
              key: "created_at",
              header: "Tanggal Daftar",
              render: (a) => (a.created_at ? format(new Date(a.created_at), "d MMM yyyy") : "-"),
            },
            {
              key: "actions",
              header: "",
              render: (a) => (
                <div className="flex gap-1 justify-end">
                  <button
                    onClick={() => approve.mutate(a.id!)}
                    disabled={approve.isPending}
                    aria-label="Setujui"
                    className="p-1.5 text-success hover:bg-success/10 rounded-md"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => reject.mutate(a.id!)}
                    disabled={reject.isPending}
                    aria-label="Tolak"
                    className="p-1.5 text-danger hover:bg-danger/10 rounded-md"
                  >
                    <X size={16} />
                  </button>
                </div>
              ),
              className: "text-right",
            },
          ]}
        />
      )}

      {tab === "members" && (
        <AdminDataTable
          isLoading={members.isPending}
          rows={members.data?.data ?? []}
          rowKey={(m) => m.id}
          columns={[
            { key: "user_id", header: "User ID", render: (m) => <span className="font-mono text-xs">{m.user_id}</span> },
            {
              key: "status",
              header: "Status",
              render: (m) => (
                <AdminStatusBadge tone={m.status === "active" ? "success" : m.status === "banned" ? "danger" : "neutral"}>
                  {m.status}
                </AdminStatusBadge>
              ),
            },
            {
              key: "role",
              header: "Role",
              render: (m) => (
                <select
                  defaultValue={m.role}
                  onChange={(e) => updateRole.mutate({ id: m.id, role: e.target.value })}
                  className="h-8 px-2 rounded border border-neutral-200 text-sm bg-surface"
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              ),
            },
            {
              key: "joined_at",
              header: "Bergabung",
              render: (m) => (m.joined_at ? format(new Date(m.joined_at), "d MMM yyyy") : "-"),
            },
          ]}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? "border-iri-violet text-iri-violet" : "border-transparent text-surface-muted hover:text-surface"
      }`}
    >
      {children}
    </button>
  );
}

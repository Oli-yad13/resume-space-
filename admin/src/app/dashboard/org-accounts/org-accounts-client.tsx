"use client";

// Super-admin management of partner ORG_ADMIN accounts: create credentials to
// hand to trusted organizations, disable/enable access, reset passwords.

import { useCallback, useEffect, useState } from "react";
import { Building2, KeyRound, Plus, Power } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import type { OrgAccount } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand focus:outline-none";

export function OrgAccountsClient() {
  const [accounts, setAccounts] = useState<OrgAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [resetTarget, setResetTarget] = useState<OrgAccount | null>(null);

  const load = useCallback(async () => {
    try {
      setAccounts(await api<OrgAccount[]>("/api/user/admin/org-accounts"));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load organization accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleDisabled = async (account: OrgAccount) => {
    const action = account.disabled ? "enable" : "disable";
    if (!confirm(`Are you sure you want to ${action} ${account.organization ?? account.name}?`))
      return;

    try {
      await api(`/api/user/admin/org-accounts/${account.id}`, {
        method: "PATCH",
        json: { disabled: !account.disabled },
      });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update the account.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Partner accounts" value={accounts.length} />
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Create account
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50/50">
            <tr>
              {["Organization", "Contact", "Posts", "Status", "Created", ""].map((h, i) => (
                <th
                  key={i}
                  className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-zinc-400">
                  Loading…
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <Building2 className="mx-auto h-10 w-10 text-zinc-200" />
                  <p className="mt-3 text-sm text-zinc-400">
                    No partner accounts yet — create one to let an organization post jobs and
                    resources.
                  </p>
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.id} className="hover:bg-zinc-50/50">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-zinc-900">
                      {account.organization ?? "—"}
                    </div>
                    <div className="text-xs text-zinc-400">@{account.username}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-zinc-700">{account.name}</div>
                    <div className="text-xs text-zinc-400">{account.email}</div>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    {account._count.jobsPosted} jobs · {account._count.resourcesPosted} resources
                  </td>
                  <td className="px-5 py-3.5">
                    {account.disabled ? (
                      <Badge variant="error">Disabled</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500">
                    {new Date(account.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Reset password"
                        onClick={() => setResetTarget(account)}
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title={account.disabled ? "Enable" : "Disable"}
                        className={account.disabled ? "text-emerald-700" : "text-red-600"}
                        onClick={() => void toggleDisabled(account)}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateAccountModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            void load();
          }}
        />
      )}

      {resetTarget && (
        <ResetPasswordModal account={resetTarget} onClose={() => setResetTarget(null)} />
      )}
    </div>
  );
}

function CreateAccountModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ name: "", organization: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      await api("/api/user/admin/org-accounts", { method: "POST", json: form });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create the account.");
      setBusy(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose}>
      <form onSubmit={submit}>
        <ModalHeader>
          <ModalTitle>Create organization account</ModalTitle>
          <ModalDescription>
            Hand these credentials to a trusted organization — their posts will require your
            approval before going live.
          </ModalDescription>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-zinc-700">Organization name *</label>
              <input
                type="text"
                required
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                className={inputClass}
                placeholder="e.g. Gebeya Inc"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700">Contact person *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                placeholder="e.g. Abel Tesfaye"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
                placeholder="talent@organization.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700">
                Password * (minimum 6 characters)
              </label>
              <input
                type="text"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputClass}
                placeholder="Initial password to share with the organization"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </ModalContent>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

function ResetPasswordModal({ account, onClose }: { account: OrgAccount; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      await api(`/api/user/admin/org-accounts/${account.id}`, {
        method: "PATCH",
        json: { password },
      });
      onClose();
      alert(`Password updated for ${account.email}. Share the new password with them securely.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset the password.");
      setBusy(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose}>
      <form onSubmit={submit}>
        <ModalHeader>
          <ModalTitle>Reset password</ModalTitle>
          <ModalDescription>
            {account.organization ?? account.name} ({account.email})
          </ModalDescription>
        </ModalHeader>
        <ModalContent>
          <label className="text-sm font-medium text-zinc-700">
            New password * (minimum 6 characters)
          </label>
          <input
            type="text"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoFocus
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </ModalContent>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Reset password"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

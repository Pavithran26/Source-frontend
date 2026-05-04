"use client";

import { startTransition, useEffect, useState, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";

import { AppShell } from "../../../../components/app-shell";
import { SectionTabs } from "../../../../components/section-tabs";
import { updateStore, getStores, type Store } from "../../../../lib/api";
import { clearStoredSession } from "../../../../lib/session";
import { useProtectedSession } from "../../../../lib/use-protected-session";

const tabs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/stores", label: "Store List" },
  { href: "/stores/add", label: "Add Store" }
];

export default function EditStorePage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params?.id as string;
  const { loading, session } = useProtectedSession();

  const [form, setForm] = useState({
    name: "",
    location: "",
    isActive: true,
    notes: ""
  });
  const [pageError, setPageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!session || !storeId) return;
    const loadData = async () => {
      try {
        const stores = await getStores(session.token);
        const storeData = stores.find(s => s.id === storeId);
        if (!storeData) throw new Error("Store not found");

        setForm({
          name: storeData.name || "",
          location: storeData.location || "",
          isActive: storeData.isActive,
          notes: storeData.notes || ""
        });
        setDataLoaded(true);
      } catch (error) {
        setPageError(error instanceof Error ? error.message : "Unable to load store");
      }
    };
    void loadData();
  }, [session, storeId]);

  const handleLogout = () => {
    clearStoredSession();
    startTransition(() => router.replace("/"));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session || !storeId) return;
    setSaving(true);
    setPageError("");

    try {
      await updateStore(session.token, storeId, {
        name: form.name,
        location: form.location,
        isActive: form.isActive,
        notes: form.notes
      });
      router.push("/stores");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Unable to update store");
      setSaving(false);
    }
  };

  if (loading || !session || !dataLoaded) {
    return <main className="loading-screen">Loading...</main>;
  }

  return (
    <AppShell
      active="stores"
      heading="Edit Store"
      description="Update storage location details."
      userName={session.user.name}
      userRole={session.user.role}
      onLogout={handleLogout}
    >
      <SectionTabs tabs={tabs} />

      <article className="panel-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Edit data</p>
            <h3>Store Details</h3>
          </div>
        </div>

        {pageError ? <p className="form-error">{pageError}</p> : null}

        <form className="data-form" onSubmit={handleSubmit}>
          <label>
            <span>Store Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((curr) => ({ ...curr, name: e.target.value }))}
              required
            />
          </label>

          <label>
            <span>Location</span>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((curr) => ({ ...curr, location: e.target.value }))}
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((curr) => ({ ...curr, isActive: e.target.checked }))}
            />
            <span>Active Store</span>
          </label>

          <label>
            <span>Notes</span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((curr) => ({ ...curr, notes: e.target.value }))}
            />
          </label>

          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Update store"}
          </button>
        </form>
      </article>
    </AppShell>
  );
}

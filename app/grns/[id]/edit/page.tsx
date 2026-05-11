"use client";

import { startTransition, useEffect, useState, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { SectionTabs } from "@/components/section-tabs";
import { updateGRN, getGRNs, getStores, getWorkLogs, getVehicles, type Store, type WorkLog, type Vehicle } from "@/lib/api";
import { clearStoredSession } from "@/lib/session";
import { useProtectedSession } from "@/lib/use-protected-session";

const tabs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/grns", label: "GRN List" },
  { href: "/grns/add", label: "Add GRN" }
];

export default function EditGRNPage() {
  const router = useRouter();
  const params = useParams();
  const grnId = params?.id as string;
  const { loading, session } = useProtectedSession();
  
  const [stores, setStores] = useState<Store[]>([]);
  const [worklogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [form, setForm] = useState({
    storeId: "",
    worklogId: "",
    receiptDate: "",
    coconutCount: "0",
    bagCount: "0",
    vehicleId: "",
    notes: ""
  });
  
  const [pageError, setPageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!session || !grnId) return;
    const loadReferences = async () => {
      try {
        const [grnList, storeItems, worklogItems, vehicleItems] = await Promise.all([
          getGRNs(session.token),
          getStores(session.token),
          getWorkLogs(session.token),
          getVehicles(session.token)
        ]);
        
        const grnData = grnList.find(g => g.id === grnId);
        if (!grnData) throw new Error("GRN not found");

        setStores(storeItems);
        setWorkLogs(worklogItems);
        setVehicles(vehicleItems);

        setForm({
          storeId: grnData.storeId,
          worklogId: grnData.worklogId || "",
          receiptDate: grnData.receiptDate || "",
          coconutCount: String(grnData.coconutCount || "0"),
          bagCount: String(grnData.bagCount || "0"),
          vehicleId: grnData.vehicleId || "",
          notes: grnData.notes || ""
        });
        setDataLoaded(true);
      } catch (error) {
        setPageError(error instanceof Error ? error.message : "Unable to load reference data");
      }
    };
    void loadReferences();
  }, [session, grnId]);

  const handleLogout = () => {
    clearStoredSession();
    startTransition(() => router.replace("/"));
  };

  const handleWorkLogSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wId = e.target.value;
    const wl = worklogs.find(w => w.id === wId);
    if (wl) {
      setForm(curr => ({
        ...curr,
        worklogId: wId,
        coconutCount: String(wl.coconutCount || 0),
        bagCount: String(wl.bagCount || 0),
        receiptDate: curr.receiptDate || wl.workDate,
        vehicleId: wl.vehicleId || curr.vehicleId
      }));
    } else {
      setForm(curr => ({ ...curr, worklogId: wId }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session || !grnId) return;
    setSaving(true);
    setPageError("");

    try {
      await updateGRN(session.token, grnId, {
        storeId: form.storeId,
        worklogId: form.worklogId || null,
        receiptDate: form.receiptDate,
        coconutCount: Number(form.coconutCount),
        bagCount: Number(form.bagCount),
        vehicleId: form.vehicleId || null,
        notes: form.notes
      });
      router.push("/grns");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Unable to update GRN");
      setSaving(false);
    }
  };

  if (loading || !session || !dataLoaded) {
    return <main className="loading-screen">Loading...</main>;
  }

  return (
    <AppShell
      active="grns"
      heading="Edit Goods Receipt Note"
      description="Update GRN details."
      userName={session.user.name}
      userRole={session.user.role}
      onLogout={handleLogout}
    >
      <SectionTabs tabs={tabs} />

      <article className="panel-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Inventory Intake</p>
            <h3>Edit GRN</h3>
          </div>
        </div>

        {pageError ? <p className="form-error">{pageError}</p> : null}

        <form className="data-form two-column-form" onSubmit={handleSubmit}>
          <label>
            <span>Receipt Date</span>
            <input
              type="date"
              value={form.receiptDate}
              onChange={(e) => setForm((curr) => ({ ...curr, receiptDate: e.target.value }))}
              required
            />
          </label>

          <label>
            <span>Destination Store</span>
            <select
              value={form.storeId}
              onChange={(e) => setForm((curr) => ({ ...curr, storeId: e.target.value }))}
              required
            >
              <option value="">Select store...</option>
              {stores.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
              ))}
            </select>
          </label>

          <label>
            <span>Link to Work Log / Load (Optional)</span>
            <select
              value={form.worklogId}
              onChange={handleWorkLogSelect}
            >
              <option value="">Manual Entry (No Work Log)</option>
              {worklogs.map(wl => (
                <option key={wl.id} value={wl.id}>
                  {wl.workDate} - {wl.landName} - {wl.coconutCount} coconuts
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Vehicle (Optional)</span>
            <select
              value={form.vehicleId}
              onChange={(e) => setForm((curr) => ({ ...curr, vehicleId: e.target.value }))}
            >
              <option value="">Select vehicle...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.registrationNumber}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Coconut Count</span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.coconutCount}
              onChange={(e) => setForm((curr) => ({ ...curr, coconutCount: e.target.value }))}
              required
            />
          </label>

          <label>
            <span>Bag Count</span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.bagCount}
              onChange={(e) => setForm((curr) => ({ ...curr, bagCount: e.target.value }))}
              required
            />
          </label>

          <label className="form-span-two">
            <span>Notes</span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((curr) => ({ ...curr, notes: e.target.value }))}
            />
          </label>

          <button className="primary-button form-span-two" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Update GRN"}
          </button>
        </form>
      </article>
    </AppShell>
  );
}

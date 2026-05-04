"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppShell } from "../../components/app-shell";
import { EmptyState } from "../../components/empty-state";
import { ListControls } from "../../components/list-controls";
import { SectionTabs } from "../../components/section-tabs";
import { deleteGRN, getGRNs, type GRN } from "../../lib/api";
import { clearStoredSession } from "../../lib/session";
import { useListFilters } from "../../lib/use-list-filters";
import { useProtectedSession } from "../../lib/use-protected-session";
import { ConfirmModal } from "../../components/confirm-modal";
import { DataTable } from "../../components/data-table";
import { FaEdit, FaTrash } from "react-icons/fa";

const grnTabs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/grns", label: "GRN List" },
  { href: "/grns/add", label: "Add GRN" }
];

export default function GRNsPage() {
  const router = useRouter();
  const { loading, session } = useProtectedSession();
  const { pageSize, startDate, endDate, setPageSize, setStartDate, setEndDate, appliedParams, handleApply, handleClear } = useListFilters();
  const [grns, setGrns] = useState<GRN[]>([]);
  const [pageError, setPageError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [grnToDelete, setGrnToDelete] = useState<GRN | null>(null);

  useEffect(() => {
    if (!session) return;

    const loadGRNs = async () => {
      try {
        const params: Record<string, string | number> = {};
        if (appliedParams.pageSize === "all") {
          params.page_size = 10000;
        } else {
          params.page_size = appliedParams.pageSize;
        }
        if (appliedParams.startDate) params.receipt_date__gte = appliedParams.startDate;
        if (appliedParams.endDate) params.receipt_date__lte = appliedParams.endDate;

        setGrns(await getGRNs(session.token, params));
      } catch (error) {
        setPageError(error instanceof Error ? error.message : "Unable to load GRNs");
      }
    };

    void loadGRNs();
  }, [session, appliedParams]);

  const handleLogout = () => {
    clearStoredSession();
    startTransition(() => router.replace("/"));
  };

  const confirmDelete = async () => {
    if (!session || !grnToDelete) return;

    setDeletingId(grnToDelete.id);
    setPageError("");

    try {
      await deleteGRN(session.token, grnToDelete.id);
      setGrns((current) => current.filter((item) => item.id !== grnToDelete.id));
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Unable to delete GRN");
    } finally {
      setDeletingId("");
      setGrnToDelete(null);
    }
  };

  if (loading || !session) {
    return <main className="loading-screen">Checking your session...</main>;
  }

  const totalCoconuts = grns.reduce((sum, g) => sum + g.coconutCount, 0);

  return (
    <AppShell
      active="grns"
      heading="Goods Receipt Notes"
      description="Track coconut loads coming into your stores and hubs."
      userName={session.user.name}
      userRole={session.user.role}
      action={
        <Link className="primary-button" href="/grns/add">
          Add GRN
        </Link>
      }
      onLogout={handleLogout}
    >
      <ConfirmModal
        isOpen={!!grnToDelete}
        title="Delete GRN"
        message="Are you sure you want to delete this GRN? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setGrnToDelete(null)}
      />
      <SectionTabs tabs={grnTabs} />

      <article className="panel-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Incoming Inventory</p>
            <h3>Receipt Logs</h3>
            <p className="panel-description">Monitor daily arrivals of coconuts into stores.</p>
          </div>
        </div>

        <div className="insight-strip">
          <div className="insight-card">
            <span>Total Receipts</span>
            <strong>{grns.length}</strong>
            <p>GRN entries matching filters</p>
          </div>
          <div className="insight-card highlight-card">
            <span>Total Coconuts Recv</span>
            <strong>{totalCoconuts.toLocaleString()}</strong>
            <p>Count from these GRNs</p>
          </div>
        </div>

        {pageError ? <p className="form-error">{pageError}</p> : null}

        <ListControls
          pageSize={pageSize}
          startDate={startDate}
          endDate={endDate}
          onPageSizeChange={setPageSize}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onFilterApply={handleApply}
          onFilterClear={handleClear}
        />

        <DataTable
          columns={[
            {
              header: "Receipt Date",
              accessor: "receiptDate"
            },
            {
              header: "Store/Hub",
              render: (grn) => <strong>{grn.storeName}</strong>
            },
            {
              header: "Inventory Received",
              render: (grn) => (
                <>
                  <strong>{grn.coconutCount.toLocaleString()} coconuts</strong>
                  <span style={{ fontSize: "0.85em" }}>{grn.bagCount.toLocaleString()} bags</span>
                </>
              )
            },
            {
              header: "Source Link",
              render: (grn) => grn.worklogId ? (
                <Link href={`/worklogs/${grn.worklogId}/edit`} style={{ color: "var(--brand-primary)" }}>
                  View Load
                </Link>
              ) : (
                <span style={{ color: "var(--color-neutral-500)" }}>Manual Entry</span>
              )
            },
            {
              header: "Actions",
              render: (grn) => (
                <div className="table-actions">
                  <Link
                    className="secondary-button table-button"
                    href={`/grns/${grn.id}/edit`}
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0.5rem" }}
                  >
                    <FaEdit size={16} />
                  </Link>
                  <button
                    className="danger-button table-button"
                    type="button"
                    disabled={deletingId === grn.id}
                    onClick={() => setGrnToDelete(grn)}
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0.5rem" }}
                  >
                    {deletingId === grn.id ? "..." : <FaTrash size={16} />}
                  </button>
                </div>
              )
            }
          ]}
          data={grns}
          keyExtractor={(item) => item.id}
          emptyState={
            <>
              <EmptyState
                title="No GRNs yet"
                description="Create a Goods Receipt Note to log incoming coconuts into your stores."
              />
              <Link className="secondary-button" href="/grns/add">
                Go to add GRN
              </Link>
            </>
          }
        />
      </article>
    </AppShell>
  );
}

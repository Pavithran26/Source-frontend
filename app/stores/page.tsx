"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppShell } from "../../components/app-shell";
import { EmptyState } from "../../components/empty-state";
import { ListControls } from "../../components/list-controls";
import { SectionTabs } from "../../components/section-tabs";
import { deleteStore, getStores, type Store } from "../../lib/api";
import { clearStoredSession } from "../../lib/session";
import { useListFilters } from "../../lib/use-list-filters";
import { useProtectedSession } from "../../lib/use-protected-session";
import { ConfirmModal } from "../../components/confirm-modal";
import { DataTable } from "../../components/data-table";
import { FaEdit, FaTrash } from "react-icons/fa";

const storeTabs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/stores", label: "Store List" },
  { href: "/stores/add", label: "Add Store" }
];

export default function StoresPage() {
  const router = useRouter();
  const { loading, session } = useProtectedSession();
  const { pageSize, startDate, endDate, setPageSize, setStartDate, setEndDate, appliedParams, handleApply, handleClear } = useListFilters();
  const [stores, setStores] = useState<Store[]>([]);
  const [pageError, setPageError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);

  useEffect(() => {
    if (!session) return;

    const loadStores = async () => {
      try {
        const params: Record<string, string | number> = {};
        if (appliedParams.pageSize === "all") {
          params.page_size = 10000;
        } else {
          params.page_size = appliedParams.pageSize;
        }
        setStores(await getStores(session.token, params));
      } catch (error) {
        setPageError(error instanceof Error ? error.message : "Unable to load stores");
      }
    };

    void loadStores();
  }, [session, appliedParams]);

  const handleLogout = () => {
    clearStoredSession();
    startTransition(() => router.replace("/"));
  };

  const confirmDelete = async () => {
    if (!session || !storeToDelete) return;

    setDeletingId(storeToDelete.id);
    setPageError("");

    try {
      await deleteStore(session.token, storeToDelete.id);
      setStores((current) => current.filter((item) => item.id !== storeToDelete.id));
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Unable to delete store");
    } finally {
      setDeletingId("");
      setStoreToDelete(null);
    }
  };

  if (loading || !session) {
    return <main className="loading-screen">Checking your session...</main>;
  }

  const totalCoconuts = stores.reduce((sum, s) => sum + s.currentCoconuts, 0);

  return (
    <AppShell
      active="stores"
      heading="Inventory Hubs"
      description="Manage the locations where harvested coconuts are stored before dispatch or sale."
      userName={session.user.name}
      userRole={session.user.role}
      action={
        <Link className="primary-button" href="/stores/add">
          Add store
        </Link>
      }
      onLogout={handleLogout}
    >
      <ConfirmModal
        isOpen={!!storeToDelete}
        title="Delete Store"
        message={`Are you sure you want to delete ${storeToDelete?.name}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setStoreToDelete(null)}
      />
      <SectionTabs tabs={storeTabs} />

      <article className="panel-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Inventory</p>
            <h3>Store Locations</h3>
            <p className="panel-description">Manage hubs and monitor their current capacity and holdings.</p>
          </div>
        </div>

        <div className="insight-strip">
          <div className="insight-card">
            <span>Active Stores</span>
            <strong>{stores.filter(s => s.isActive).length}</strong>
            <p>Total operational hubs</p>
          </div>
          <div className="insight-card highlight-card">
            <span>Total Inventory</span>
            <strong>{totalCoconuts.toLocaleString()}</strong>
            <p>Coconuts across all stores</p>
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
              header: "Store Name",
              render: (store) => (
                <>
                  <strong>{store.name}</strong>
                  <span style={{ fontSize: "0.85em" }}>{store.location || "No location set"}</span>
                </>
              )
            },
            {
              header: "Status",
              render: (store) => (
                <span className={store.isActive ? "status-badge active" : "status-badge inactive"}>
                  {store.isActive ? "Active" : "Inactive"}
                </span>
              )
            },
            {
              header: "Current Stock",
              render: (store) => (
                <>
                  <strong>{store.currentCoconuts.toLocaleString()} coconuts</strong>
                  <span style={{ fontSize: "0.85em" }}>{store.currentBags.toLocaleString()} bags</span>
                </>
              )
            },
            {
              header: "Actions",
              render: (store) => (
                <div className="table-actions">
                  <Link
                    className="secondary-button table-button"
                    href={`/stores/${store.id}/edit`}
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0.5rem" }}
                  >
                    <FaEdit size={16} />
                  </Link>
                  <button
                    className="danger-button table-button"
                    type="button"
                    disabled={deletingId === store.id}
                    onClick={() => setStoreToDelete(store)}
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0.5rem" }}
                  >
                    {deletingId === store.id ? "..." : <FaTrash size={16} />}
                  </button>
                </div>
              )
            }
          ]}
          data={stores}
          keyExtractor={(item) => item.id}
          emptyState={
            <>
              <EmptyState
                title="No stores registered yet"
                description="Add your first store or hub to start tracking inventory balances."
              />
              <Link className="secondary-button" href="/stores/add">
                Go to add store
              </Link>
            </>
          }
        />
      </article>
    </AppShell>
  );
}

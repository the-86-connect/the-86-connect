"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  Clock,
  Ship,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getCsrfToken } from "@/lib/api";
import { CAR_SHIPPING_STAGES, getStatusLabel } from "@/lib/submission-status";

interface CarShipment {
  id: string;
  carModel: string;
  carYear: string | null;
  vinNumber: string | null;
  originPort: string | null;
  destinationPort: string | null;
  containerNumber: string | null;
  vesselName: string | null;
  estimatedDeparture: string | null;
  estimatedArrival: string | null;
  actualDeparture: string | null;
  actualArrival: string | null;
  trackingUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  submission: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    referenceCode: string | null;
    createdAt: string;
    read: boolean;
  };
}

interface CarShipmentsTabProps {
  apiUrl: string;
}

export function CarShipmentsTab({ apiUrl }: CarShipmentsTabProps) {
  const [shipments, setShipments] = useState<CarShipment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<CarShipment | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadShipments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`${apiUrl}/api/admin/car-shipments?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load shipments");
      const data = await res.json();
      setShipments(data.shipments);
      setTotal(data.total);
    } catch (err) {
      console.error("Failed to load shipments:", err);
      toast.error("Failed to load shipments");
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, page, pageSize, search, statusFilter]);

  // Load on mount and when deps change
  useEffect(() => {
    // Data fetch; setState happens asynchronously after await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter]);

  const handleCreate = useCallback(
    async (formData: Record<string, string>) => {
      setIsCreating(true);
      try {
        const res = await fetch(`${apiUrl}/api/admin/car-shipments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken(),
          },
          credentials: "include",
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to create shipment");
        }
        toast.success("Shipment created successfully");
        setIsCreateOpen(false);
        loadShipments();
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setIsCreating(false);
      }
    },
    [apiUrl, loadShipments],
  );

  const handleStatusUpdate = useCallback(
    async (shipmentId: string, status: string) => {
      try {
        const res = await fetch(
          `${apiUrl}/api/admin/car-shipments/${shipmentId}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "x-csrf-token": getCsrfToken(),
            },
            credentials: "include",
            body: JSON.stringify({ status }),
          },
        );
        if (!res.ok) throw new Error("Failed to update status");
        toast.success("Status updated");
        loadShipments();
        if (selectedShipment && selectedShipment.id === shipmentId) {
          setSelectedShipment({
            ...selectedShipment,
            submission: { ...selectedShipment.submission, status },
          });
        }
      } catch (err) {
        console.error("Failed to update status:", err);
        toast.error("Failed to update status");
      }
    },
    [apiUrl, loadShipments, selectedShipment],
  );

  const handleDelete = useCallback(
    async (shipmentId: string) => {
      if (!confirm("Are you sure you want to delete this shipment?")) return;
      try {
        const res = await fetch(`${apiUrl}/api/admin/car-shipments/${shipmentId}`, {
          method: "DELETE",
          credentials: "include",
          headers: { "x-csrf-token": getCsrfToken() },
        });
        if (!res.ok) throw new Error("Failed to delete shipment");
        toast.success("Shipment deleted");
        setSelectedIds((prev) => prev.filter((id) => id !== shipmentId));
        loadShipments();
      } catch (err) {
        console.error("Failed to delete shipment:", err);
        toast.error("Failed to delete shipment");
      }
    },
    [apiUrl, loadShipments],
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} shipment(s)?`)) return;
    try {
      const res = await fetch(`${apiUrl}/api/admin/car-shipments/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({ action: "delete", ids: selectedIds }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success(`Deleted ${selectedIds.length} shipment(s)`);
      setSelectedIds([]);
      loadShipments();
    } catch (err) {
      console.error("Failed to delete shipments:", err);
      toast.error("Failed to delete shipments");
    }
  }, [apiUrl, selectedIds, loadShipments]);

  const handleCopyRef = useCallback((ref: string) => {
    navigator.clipboard.writeText(ref);
    toast.success("Reference copied");
  }, []);

  const stats = useMemo(() => {
    const inTransit = shipments.filter(
      (s) => s.submission.status === "in_transit",
    ).length;
    const atPort = shipments.filter(
      (s) => s.submission.status === "at_port",
    ).length;
    const delivered = shipments.filter(
      (s) => s.submission.status === "delivered",
    ).length;
    return { total, inTransit, atPort, delivered };
  }, [shipments, total]);

  const toggleSelectAll = () => {
    if (selectedIds.length === shipments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(shipments.map((s) => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const currentStageIndex = (status: string) =>
    Math.max(0, CAR_SHIPPING_STAGES.findIndex((s) => s.key === status));

  const statusBadgeClass = (status: string): string => {
    if (status === "delivered") return "bg-emerald-100 text-emerald-700";
    if (status === "in_transit") return "bg-blue-100 text-blue-700";
    if (status === "loading" || status === "at_port") return "bg-amber-100 text-amber-700";
    if (status === "booking_confirmed") return "bg-violet-100 text-violet-700";
    if (status === "customs_clearance") return "bg-sky-100 text-sky-700";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={stats.total} icon={Ship} color="text-blue-500" />
        <StatCard label="In Transit" value={stats.inTransit} icon={Ship} color="text-amber-500" />
        <StatCard label="At Port" value={stats.atPort} icon={Ship} color="text-purple-500" />
        <StatCard label="Delivered" value={stats.delivered} icon={CheckCircle2} color="text-green-500" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, car, reference..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Statuses</option>
            {CAR_SHIPPING_STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="icon"
            onClick={loadShipments}
            title="Refresh"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Shipment
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && shipments.length === 0 && (
          <div className="text-center py-16">
            <Ship className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No shipments found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click &quot;New Shipment&quot; to add your first vehicle shipment.
            </p>
          </div>
        )}

        {!isLoading && shipments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-10 px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === shipments.length && shipments.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">Customer</th>
                  <th className="px-3 py-3 text-left font-semibold">Vehicle</th>
                  <th className="px-3 py-3 text-left font-semibold">Reference</th>
                  <th className="px-3 py-3 text-left font-semibold">Status</th>
                  <th className="px-3 py-3 text-left font-semibold">Progress</th>
                  <th className="px-3 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shipments.map((shipment) => {
                  const stageIdx = currentStageIndex(shipment.submission.status);
                  const isExpanded = expandedId === shipment.id;
                  return (
                    <>
                      <tr
                        key={shipment.id}
                        className="hover:bg-muted/30 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : shipment.id)}
                      >
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(shipment.id)}
                            onChange={() => toggleSelect(shipment.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-medium">{shipment.submission.name}</p>
                          <p className="text-xs text-muted-foreground">{shipment.submission.email}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-medium">
                            {shipment.carYear ? `${shipment.carYear} ` : ""}
                            {shipment.carModel}
                          </p>
                          {shipment.vesselName && (
                            <p className="text-xs text-muted-foreground">Vessel: {shipment.vesselName}</p>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (shipment.submission.referenceCode) {
                                handleCopyRef(shipment.submission.referenceCode);
                              }
                            }}
                            className="flex items-center gap-1.5 font-mono text-xs font-bold text-primary hover:underline"
                          >
                            {shipment.submission.referenceCode}
                            <Copy className="h-3 w-3" />
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                              statusBadgeClass(shipment.submission.status),
                            )}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {getStatusLabel(shipment.submission.status)}
                          </span>
                        </td>
                        <td className="px-3 py-3 w-48">
                          <div className="flex items-center gap-1">
                            {CAR_SHIPPING_STAGES.map((_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "h-1.5 flex-1 rounded-full",
                                  i <= stageIdx ? "bg-primary" : "bg-muted",
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {stageIdx + 1} / {CAR_SHIPPING_STAGES.length}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => {
                                setSelectedShipment(shipment);
                                setIsDetailOpen(true);
                              }}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                              onClick={() => handleDelete(shipment.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => setExpandedId(isExpanded ? null : shipment.id)}
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-muted/20">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <DetailItem label="VIN" value={shipment.vinNumber || "—"} />
                              <DetailItem label="Container" value={shipment.containerNumber || "—"} />
                              <DetailItem label="Origin Port" value={shipment.originPort || "—"} />
                              <DetailItem label="Destination Port" value={shipment.destinationPort || "—"} />
                              <DetailItem label="ETD" value={shipment.estimatedDeparture ? new Date(shipment.estimatedDeparture).toLocaleDateString() : "—"} />
                              <DetailItem label="ETA" value={shipment.estimatedArrival ? new Date(shipment.estimatedArrival).toLocaleDateString() : "—"} />
                              <DetailItem label="Phone" value={shipment.submission.phone || "—"} />
                              <DetailItem label="Created" value={new Date(shipment.submission.createdAt).toLocaleDateString()} />
                            </div>
                            {shipment.notes && (
                              <div className="mt-3 pt-3 border-t border-border/50">
                                <p className="text-xs font-semibold text-muted-foreground mb-1">Notes</p>
                                <p className="text-sm">{shipment.notes}</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, total)} of {total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(total / pageSize)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Shipment Modal */}
      {isCreateOpen && (
        <CreateShipmentModal
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreate}
          isCreating={isCreating}
        />
      )}

      {/* Shipment Detail Modal */}
      {isDetailOpen && selectedShipment && (
        <ShipmentDetailModal
          shipment={selectedShipment}
          onClose={() => setIsDetailOpen(false)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="font-display font-black text-2xl mt-1">{value}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function CreateShipmentModal({
  onClose,
  onSubmit,
  isCreating,
}: {
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
  isCreating: boolean;
}) {
  const [formData, setFormData] = useState<Record<string, string>>({
    name: "",
    email: "",
    phone: "",
    carModel: "",
    carYear: "",
    vinNumber: "",
    originPort: "",
    destinationPort: "",
    containerNumber: "",
    vesselName: "",
    notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.carModel) {
      toast.error("Name, email, and car model are required");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-display text-xl">Create New Shipment</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Customer Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="John Doe"
                className="mt-1.5"
              />
            </div>
            <div className="col-span-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="john@example.com"
                className="mt-1.5"
              />
            </div>
            <div className="col-span-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1 234 567 8900"
                className="mt-1.5"
              />
            </div>
            <div className="col-span-2">
              <Label>Car Model *</Label>
              <Input
                value={formData.carModel}
                onChange={(e) => handleChange("carModel", e.target.value)}
                placeholder="e.g. Toyota Camry"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Year</Label>
              <Input
                value={formData.carYear}
                onChange={(e) => handleChange("carYear", e.target.value)}
                placeholder="2024"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>VIN</Label>
              <Input
                value={formData.vinNumber}
                onChange={(e) => handleChange("vinNumber", e.target.value)}
                placeholder="Vehicle ID"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Origin Port</Label>
              <Input
                value={formData.originPort}
                onChange={(e) => handleChange("originPort", e.target.value)}
                placeholder="Shanghai"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Destination Port</Label>
              <Input
                value={formData.destinationPort}
                onChange={(e) => handleChange("destinationPort", e.target.value)}
                placeholder="Los Angeles"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Container #</Label>
              <Input
                value={formData.containerNumber}
                onChange={(e) => handleChange("containerNumber", e.target.value)}
                placeholder="MSKU1234567"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Vessel Name</Label>
              <Input
                value={formData.vesselName}
                onChange={(e) => handleChange("vesselName", e.target.value)}
                placeholder="MSC Gulsun"
                className="mt-1.5"
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Any additional notes..."
                className="mt-1.5 w-full h-20 px-3 py-2 rounded-md border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Shipment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ShipmentDetailModal({
  shipment,
  onClose,
  onStatusUpdate,
}: {
  shipment: CarShipment;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string) => void;
}) {
  const [pendingStatus, setPendingStatus] = useState(shipment.submission.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusSave = async () => {
    if (!pendingStatus || pendingStatus === shipment.submission.status) return;
    setIsUpdating(true);
    await onStatusUpdate(shipment.id, pendingStatus);
    setIsUpdating(false);
  };

  const stageIdx = Math.max(
    0,
    CAR_SHIPPING_STAGES.findIndex((s) => s.key === shipment.submission.status),
  );

  const statusBadgeClass = (status: string): string => {
    if (status === "delivered") return "bg-emerald-100 text-emerald-700";
    if (status === "in_transit") return "bg-blue-100 text-blue-700";
    if (status === "loading" || status === "at_port") return "bg-amber-100 text-amber-700";
    if (status === "booking_confirmed") return "bg-violet-100 text-violet-700";
    if (status === "customs_clearance") return "bg-sky-100 text-sky-700";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <Ship className="h-5 w-5 text-primary" />
            <h3 className="font-display text-xl">Shipment Details</h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                statusBadgeClass(shipment.submission.status),
              )}
            >
              {getStatusLabel(shipment.submission.status)}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Status section */}
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Tracking Progress
            </p>

            {/* Progress bar */}
            <div className="flex items-center gap-1 mb-4">
              {CAR_SHIPPING_STAGES.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 flex-1 rounded-full",
                    i <= stageIdx ? "bg-primary" : "bg-muted",
                  )}
                />
              ))}
            </div>

            {/* Status timeline */}
            <div className="space-y-2">
              {CAR_SHIPPING_STAGES.map((stage, i) => (
                <div
                  key={stage.key}
                  className={cn(
                    "flex items-center gap-3 text-sm",
                    i < stageIdx && "text-muted-foreground",
                    i === stageIdx && "font-bold text-primary",
                    i > stageIdx && "text-muted-foreground/60",
                  )}
                >
                  {i < stageIdx ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : i === stageIdx ? (
                    <Clock className="h-4 w-4 text-primary flex-shrink-0 animate-pulse" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                  )}
                  <span>{stage.label}</span>
                </div>
              ))}
            </div>

            {/* Update status */}
            <div className="mt-4 pt-4 border-t border-border/60 flex gap-2">
              <select
                value={pendingStatus}
                onChange={(e) => setPendingStatus(e.target.value)}
                className="flex-1 h-9 px-2 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {CAR_SHIPPING_STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <Button size="sm" onClick={handleStatusSave} disabled={isUpdating}>
                {isUpdating && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                Save
              </Button>
            </div>
          </div>

          {/* Vehicle info */}
          <div>
            <h4 className="text-sm font-bold mb-3">Vehicle Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <DetailItem label="Model" value={shipment.carModel} />
              <DetailItem label="Year" value={shipment.carYear || "—"} />
              <DetailItem label="VIN" value={shipment.vinNumber || "—"} />
              <DetailItem label="Container" value={shipment.containerNumber || "—"} />
              <DetailItem label="Vessel" value={shipment.vesselName || "—"} />
              <div />
            </div>
          </div>

          {/* Route info */}
          <div>
            <h4 className="text-sm font-bold mb-3">Shipping Route</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <DetailItem label="Origin Port" value={shipment.originPort || "—"} />
              <DetailItem label="Destination Port" value={shipment.destinationPort || "—"} />
              <DetailItem
                label="ETD"
                value={shipment.estimatedDeparture ? new Date(shipment.estimatedDeparture).toLocaleDateString() : "—"}
              />
              <DetailItem
                label="ETA"
                value={shipment.estimatedArrival ? new Date(shipment.estimatedArrival).toLocaleDateString() : "—"}
              />
            </div>
          </div>

          {/* Customer info */}
          <div>
            <h4 className="text-sm font-bold mb-3">Customer Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <DetailItem label="Name" value={shipment.submission.name} />
              <DetailItem label="Email" value={shipment.submission.email} />
              <DetailItem label="Phone" value={shipment.submission.phone || "—"} />
              <DetailItem
                label="Created"
                value={new Date(shipment.submission.createdAt).toLocaleDateString()}
              />
            </div>
          </div>

          {/* Notes */}
          {shipment.notes && (
            <div>
              <h4 className="text-sm font-bold mb-2">Notes</h4>
              <p className="text-sm bg-muted/30 rounded-lg p-3">{shipment.notes}</p>
            </div>
          )}

          {/* Tracking link */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Tracking Link</p>
              <p className="text-xs text-primary font-mono truncate max-w-[280px]">
                /car-shipping/track?ref={shipment.submission.referenceCode}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = `${window.location.origin}/car-shipping/track?ref=${shipment.submission.referenceCode}&email=${encodeURIComponent(shipment.submission.email)}`;
                navigator.clipboard.writeText(url);
                toast.success("Tracking link copied");
              }}
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

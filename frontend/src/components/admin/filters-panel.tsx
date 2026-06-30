"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getStatusLabel } from "@/lib/submission-status";

type FilterType = "all" | "Study in China" | "Product Sourcing" | "General";
type ReadFilter = "all" | "read" | "unread";

interface FiltersPanelProps {
  filter: FilterType;
  setFilter: (value: FilterType) => void;
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  readFilter: ReadFilter;
  setReadFilter: (value: ReadFilter) => void;
  availableStatuses: string[];
}

const DATE_PRESETS = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

export function FiltersPanel({
  filter,
  setFilter,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  readFilter,
  setReadFilter,
  availableStatuses,
}: FiltersPanelProps) {
  const hasActiveFilters =
    filter !== "all" ||
    statusFilter !== "all" ||
    dateFilter !== "all" ||
    readFilter !== "all" ||
    search.length > 0;

  function clearAll() {
    setFilter("all");
    setStatusFilter("all");
    setDateFilter("all");
    setReadFilter("all");
    setSearch("");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Service tabs */}
        <div
          className="flex gap-1 p-1.5 rounded-2xl glass-pill shrink-0"
          role="tablist"
          aria-label="Filter submissions by service"
        >
          {(
            [
              "all",
              "Study in China",
              "Product Sourcing",
              "General",
            ] as FilterType[]
          ).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3.5 py-1.5 text-sm font-medium rounded-xl transition-all cursor-pointer",
                filter === f
                  ? f === "all"
                    ? "bg-gradient-to-r from-primary to-red-700 text-white shadow-md shadow-primary/25"
                    : f === "Study in China"
                      ? "bg-gradient-to-r from-red-500 to-red-700 text-white shadow-md shadow-red-500/25"
                      : f === "Product Sourcing"
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25"
                        : "bg-gradient-to-r from-slate-600 to-slate-800 text-white shadow-md shadow-slate-500/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/40",
              )}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, reference, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 glass-input rounded-xl border-0"
            aria-label="Search submissions"
          />
        </div>
      </div>

      {/* Secondary filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input rounded-lg border-0 px-3 py-1.5 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40"
            aria-label="Filter by status"
          >
            <option value="all">All</option>
            {availableStatuses.map((st) => (
              <option key={st} value={st}>
                {getStatusLabel(st)}
              </option>
            ))}
          </select>
        </div>

        {/* Read filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Read:
          </span>
          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value as ReadFilter)}
            className="glass-input rounded-lg border-0 px-3 py-1.5 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40"
            aria-label="Filter by read state"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Date:
          </span>
          <div className="flex gap-1 p-1 rounded-xl glass-pill">
            {DATE_PRESETS.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setDateFilter(d.key)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer",
                  dateFilter === d.key
                    ? "bg-gradient-to-r from-primary to-red-700 text-white shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/40",
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}

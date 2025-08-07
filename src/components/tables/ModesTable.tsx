import { Id } from "../../../convex/_generated/dataModel";
import { useModalStore } from "../../lib/stores/modalStore";
import { useAppStore, SortField } from "../../lib/stores/appStore";
import { useCurrentUser } from "../../lib/stores/userStore";
import { StatusBadge } from "../common/StatusBadge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "../ui/pagination";

interface Mode {
  _id: Id<"modes">;
  _creationTime: number;
  name: string;
  author: string;
  description: string;
  votes: number;
  downloads: number;
  updated_at: string;
  status: "pending" | "approved" | "rejected";
  topVersion: string;
}

interface PaginatedData {
  modes: Mode[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ModesTableProps {
  paginatedData: PaginatedData | undefined;
}

export function ModesTable({ paginatedData }: ModesTableProps) {
  const { currentUser } = useCurrentUser();

  // Use modal store
  const { openModeModal } = useModalStore();

  // Use app store for sorting and pagination
  const { sortBy, sortOrder, handleSort, goToPage } = useAppStore();

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) return "";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const renderPaginationItems = () => {
    if (!paginatedData) return null;

    const { page, totalPages } = paginatedData;
    const items: React.ReactNode[] = [];

    // Always show first page
    items.push(
      <PaginationItem key={0}>
        <PaginationLink isActive={page === 0} onClick={() => goToPage(0)}>
          1
        </PaginationLink>
      </PaginationItem>,
    );

    // Show ellipsis if there's a gap
    if (page > 2) {
      items.push(
        <PaginationItem key="ellipsis1">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    // Show current page and adjacent pages
    for (
      let i = Math.max(1, page - 1);
      i <= Math.min(totalPages - 2, page + 1);
      i++
    ) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink isActive={page === i} onClick={() => goToPage(i)}>
            {i + 1}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    // Show ellipsis if there's a gap
    if (page < totalPages - 3) {
      items.push(
        <PaginationItem key="ellipsis2">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages - 1}>
          <PaginationLink
            isActive={page === totalPages - 1}
            onClick={() => goToPage(totalPages - 1)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };

  if (!paginatedData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-primary">Loading modes...</p>
      </div>
    );
  }

  const { modes, totalCount, page, pageSize, totalPages } = paginatedData;
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalCount);

  return (
    <div className="max-w-[1280px] mx-auto p-4">
      {/* Results info */}
      <div className="mb-4 text-sm text-text-secondary">
        Showing {startIndex}-{endIndex} of {totalCount} modes
      </div>

      <div className="bg-background rounded-lg border border-muted overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-[120px]" />
            <col className="w-[150px]" />
            <col className="w-auto" />
            <col className="w-[75px]" />
            <col className="w-[110px]" />
            <col className="w-[110px]" />
            <col className="w-[90px]" />
            {(currentUser?.role === "moderator" ||
              currentUser?.role === "admin") && <col className="w-[40px]" />}
          </colgroup>
          <thead className="bg-background-light border-b border-muted">
            <tr>
              <th
                className="text-left p-4 text-xs font-medium uppercase tracking-wide text-text-primary cursor-pointer hover:text-white transition-colors select-none"
                onClick={() => handleSort("name")}
              >
                Name {getSortIcon("name")}
              </th>
              <th
                className="text-left p-4 text-xs font-medium uppercase tracking-wide text-text-primary cursor-pointer hover:text-white transition-colors select-none"
                onClick={() => handleSort("author")}
              >
                Author {getSortIcon("author")}
              </th>
              <th className="text-left p-4 text-xs font-medium uppercase tracking-wide text-text-primary">
                Description
              </th>
              <th
                className="text-left p-2 text-xs font-medium uppercase tracking-wide text-text-primary cursor-pointer hover:text-white transition-colors select-none"
                onClick={() => handleSort("votes")}
              >
                Votes {getSortIcon("votes")}
              </th>
              <th
                className="text-left p-2 text-xs font-medium uppercase tracking-wide text-text-primary cursor-pointer hover:text-white transition-colors select-none"
                onClick={() => handleSort("downloads")}
              >
                Downloads {getSortIcon("downloads")}
              </th>
              <th className="text-left p-2 text-xs font-medium uppercase tracking-wide text-text-primary">
                Top Version
              </th>
              <th
                className="text-left p-2 text-xs font-medium uppercase tracking-wide text-text-primary cursor-pointer hover:text-white transition-colors select-none"
                onClick={() => handleSort("updated_at")}
              >
                Updated {getSortIcon("updated_at")}
              </th>
              {/* Only show status column for moderators and admins */}
              {(currentUser?.role === "moderator" ||
                currentUser?.role === "admin") && (
                <th
                  className="text-left p-1 cursor-pointer hover:text-white transition-colors select-none"
                  onClick={() => handleSort("status")}
                >
                  {/* No text for status header */}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {modes.map((mode: Mode) => (
              <tr
                key={mode._id}
                className="border-b border-muted hover:bg-[#111] cursor-pointer transition-colors"
                onClick={() => openModeModal(mode._id)}
              >
                <td className="p-4 font-semibold text-white truncate">
                  {mode.name}
                </td>
                <td className="p-4 text-text-secondary truncate">
                  {mode.author}
                </td>
                <td className="p-4 text-text-secondary truncate">
                  {mode.description}
                </td>
                <td className="p-2 text-text-secondary">{mode.votes}</td>
                <td className="p-2 text-text-secondary">{mode.downloads}</td>
                <td className="p-2 text-text-secondary font-mono text-sm truncate">
                  {mode.topVersion}
                </td>
                <td className="p-2 text-text-secondary text-xs">
                  {new Date(mode.updated_at).toLocaleDateString(undefined, {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </td>
                {/* Status column - only show for moderators and admins */}
                {(currentUser?.role === "moderator" ||
                  currentUser?.role === "admin") && (
                  <td className="p-1 text-center">
                    <StatusBadge status={mode.status} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 0 && goToPage(page - 1)}
                  className={
                    page === 0
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {renderPaginationItems()}

              <PaginationItem>
                <PaginationNext
                  onClick={() => page < totalPages - 1 && goToPage(page + 1)}
                  className={
                    page === totalPages - 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

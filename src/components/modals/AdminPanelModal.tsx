import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { UserRole } from "../../lib/types";
import { BaseModal } from "../common";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { useModalStore } from "../../lib/stores/modalStore";
import { useCurrentUser } from "../../lib/stores/userStore";

interface AdminPanelModalProps {}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({}) => {
  const { showAdminPanel, closeAdminPanel } = useModalStore();
  const { currentUser } = useCurrentUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 50;

  const canAccess = useMemo(
    () => currentUser?.role === "admin",
    [currentUser?.role],
  );

  const users = useQuery(
    (api as any).users.getAllUsers,
    canAccess ? { search: searchTerm } : "skip",
  );
  const updateUserRole = useMutation((api as any).users.updateUserRole);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (!showAdminPanel) return null;

  // Pagination logic
  const totalUsers = users?.length || 0;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedUsers = users?.slice(startIndex, endIndex) || [];

  const handleRoleChange = async (userId: Id<"users">, newRole: UserRole) => {
    try {
      await updateUserRole({ userId, role: newRole });
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (!canAccess) {
    return null;
  }

  return (
    <BaseModal
      isOpen={showAdminPanel}
      onClose={closeAdminPanel}
      title="Admin Panel"
      maxWidth="6xl"
    >
      {/* Content with fixed height like other modals */}
      <div className="flex flex-col h-[calc(90vh-8rem)]">
        {/* Header with Search - Fixed */}
        <div className="p-6 border-b border-muted flex-shrink-0">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 h-8 px-3 pr-8 text-sm bg-background-light border border-muted rounded text-white placeholder-text-secondary focus:border-accent focus:outline-none"
            />
            <div className="text-sm text-text-secondary">
              {totalUsers} user{totalUsers !== 1 ? "s" : ""} total
            </div>
          </div>
        </div>

        {/* Table Container - Scrollable area */}
        <div className="flex-1 overflow-y-auto modal-scrollbar">
          <table className="w-full">
            <thead className="bg-background-light sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-white border-b border-muted">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white border-b border-muted">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white border-b border-muted">
                  Role
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user: any, index: number) => (
                <tr
                  key={user._id}
                  className={`${
                    index % 2 === 0 ? "bg-background" : "bg-background-light"
                  } hover:bg-muted transition-colors`}
                >
                  <td className="px-4 py-3 text-sm text-text-primary border-b border-muted">
                    {user.name || "No name"}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary border-b border-muted">
                    {user.email || "No email"}
                  </td>
                  <td className="px-4 py-3 border-b border-muted">
                    {/* Role Selection Tabs - Fitted to content */}
                    <div className="inline-flex bg-background-light border border-muted rounded-md overflow-hidden">
                      {(["user", "moderator", "admin"] as UserRole[]).map(
                        (role) => (
                          <button
                            key={role}
                            onClick={() => handleRoleChange(user._id, role)}
                            className={`px-3 py-1 text-xs font-medium transition-colors ${
                              (user.role || "user") === role
                                ? "bg-accent text-muted"
                                : "text-text-primary hover:bg-muted hover:text-white"
                            }`}
                          >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </button>
                        ),
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {paginatedUsers.length === 0 && (
            <div className="text-center py-8 text-text-secondary">
              No users found matching your search.
            </div>
          )}
        </div>

        {/* Pagination Footer - Only show if more than 1 page */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-muted flex-shrink-0">
            <Pagination className="justify-center">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    className={`cursor-pointer ${currentPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-muted hover:text-white"} text-text-primary border-muted`}
                  />
                </PaginationItem>

                {getVisiblePages().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === "..." ? (
                      <PaginationEllipsis className="text-text-secondary" />
                    ) : (
                      <PaginationLink
                        onClick={() => handlePageChange(page as number)}
                        isActive={currentPage === page}
                        className={`cursor-pointer ${
                          currentPage === page
                            ? "bg-accent text-muted"
                            : "text-text-primary hover:bg-muted hover:text-white"
                        } border-muted`}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    className={`cursor-pointer ${currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:bg-muted hover:text-white"} text-text-primary border-muted`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="text-center text-sm text-text-secondary mt-2">
              Page {currentPage} of {totalPages} • Showing{" "}
              {paginatedUsers.length} of {totalUsers} users
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
};

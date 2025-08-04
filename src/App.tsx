import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Header } from "./components/common/Header";
import { ModesTable } from "./components/tables/ModesTable";
import { ModeModal } from "./components/modals/ModeModal";
import { HelpModal } from "./components/modals/HelpModal";
import { SubmitModeModal } from "./components/modals/SubmitModeModal";
import { EditModeModal } from "./components/modals/EditModeModal";
import { ReviewRevisionsModal } from "./components/modals/ReviewRevisionsModal";
import { AdminPanelModal } from "./components/modals/AdminPanelModal";
import { useAppStore } from "./lib/stores/appStore";

export default function App() {
  // Get search and sort state from app store
  const { searchQuery, sortBy, sortOrder, currentPage, pageSize } =
    useAppStore();

  const paginatedData = useQuery(api.query.listModesPaginated, {
    search: searchQuery || undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    pageSize,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <Header />

      {/* Main Content - Table with proper top margin for fixed header */}
      <main className="pt-14">
        <ModesTable paginatedData={paginatedData} />
      </main>

      {/* Modals - All self-rendering */}
      <ModeModal />
      <HelpModal />
      <SubmitModeModal />
      <EditModeModal />
      <ReviewRevisionsModal />
      <AdminPanelModal />
    </div>
  );
}

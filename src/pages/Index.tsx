import { useState, useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import type { NavSection } from "@/types";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Participantes from "@/pages/Participantes";
import Proyectos from "@/pages/Proyectos";
import Comunicaciones from "@/pages/Comunicaciones";
import Bonos from "@/pages/Bonos";
import Login from "@/pages/Login";
import "@/styles/components.css";

const Index = () => {
  const isAuthenticated = useAppStore(state => state.isAuthenticated);
  const [activeSection, setActiveSection] = useState<NavSection>("participantes");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <Dashboard />;
      case "participantes": return <Participantes />;
      case "proyectos": return <Proyectos />;
      case "comunicaciones": return <Comunicaciones />;
      case "bonos": return <Bonos />;
    }
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-layout">
      {/* Mobile header */}
      <header className="mobile-header">
        <button className="mobile-header__btn" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
          <i className="fa-solid fa-bars" />
        </button>
        <div className="mobile-header__logo">
          <span>UX</span>Recruit
        </div>
        <div style={{ width: 40 }} />
      </header>

      <Sidebar
        active={activeSection}
        onNavigate={setActiveSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="main-content">
        {renderSection()}
      </main>
    </div>
  );
};

export default Index;

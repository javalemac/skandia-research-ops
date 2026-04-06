import type { NavSection } from "@/types";
import { useAppStore } from "@/store/appStore";

const navItems: { key: NavSection; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "fa-solid fa-chart-line" },
  { key: "participantes", label: "Participantes", icon: "fa-solid fa-users" },
  { key: "proyectos", label: "Proyectos", icon: "fa-regular fa-folder-open" },
  { key: "comunicaciones", label: "Comunicaciones", icon: "fa-regular fa-envelope" },
  { key: "bonos", label: "Bonos", icon: "fa-solid fa-gift" },
];

interface SidebarProps {
  active: NavSection;
  onNavigate: (s: NavSection) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ active, onNavigate, isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAppStore();

  const handleNav = (key: NavSection) => {
    onNavigate(key);
    onClose?.();
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "sidebar-overlay--open" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__logo">
          <span>UX</span>Recruit
        </div>
        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${active === item.key ? "nav-item--active" : ""}`}
              onClick={() => handleNav(item.key)}
            >
              <i className={item.icon} aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar__footer" style={{ flexDirection: "column", alignItems: "flex-start", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
            <div className="avatar avatar--md avatar--brand">{user ? user.nombre.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase() : "UX"}</div>
            <div>
              <div style={{ fontSize: "var(--fs-label)", fontWeight: "var(--fw-medium)" as any, color: "var(--text-primary)" }}>
                {user ? user.nombre : "Ana Ríos"}
              </div>
              <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>
                {user ? user.rol : "UX Designer"}
              </div>
            </div>
          </div>
          <button className="btn btn--secondary" style={{ width: "100%", justifyContent: "center" }} onClick={logout}>
            <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" /> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

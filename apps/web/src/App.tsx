import type { ReactNode } from "react";
import {
  Album,
  BarChart3,
  Home,
  ListOrdered,
  Repeat2,
  Search,
  Shield,
  UserRound
} from "lucide-react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { CompareTradePage } from "./pages/CompareTradePage";
import { ExploreAlbumsPage } from "./pages/ExploreAlbumsPage";
import { HomePage } from "./pages/HomePage";
import { LoadByOrderPage } from "./pages/LoadByOrderPage";
import { LoadByTeamPage } from "./pages/LoadByTeamPage";
import { MyAlbumPage } from "./pages/MyAlbumPage";
import { SummaryPage } from "./pages/SummaryPage";
import { UserSelectionPage } from "./pages/UserSelectionPage";
import { useUser } from "./state/user-store";

const navigationItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/usuarios", label: "Usuario", icon: UserRound },
  { to: "/mi-album", label: "Mi album", icon: Album },
  { to: "/cargar-orden", label: "Por orden", icon: ListOrdered },
  { to: "/cargar-equipo", label: "Por equipo", icon: Shield },
  { to: "/resumen", label: "Resumen", icon: BarChart3 },
  { to: "/explorar", label: "Explorar", icon: Search },
  { to: "/comparar", label: "Intercambiar", icon: Repeat2 }
] as const;

function RequireUser({ children }: { children: ReactNode }) {
  const { currentUser } = useUser();
  return currentUser ? <>{children}</> : <Navigate to="/usuarios" replace />;
}

export function App() {
  const { currentUser, setCurrentUser } = useUser();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Mundial 2026</p>
          <h1>Mundial Album Tracker</h1>
        </div>
        <div className="active-user">
          <span>{currentUser ? currentUser.name : "Sin usuario"}</span>
          {currentUser ? (
            <button className="ghost-button" type="button" onClick={() => setCurrentUser(null)}>
              Cambiar
            </button>
          ) : null}
        </div>
      </header>

      <nav className="nav-tabs" aria-label="Navegacion principal">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink key={item.to} to={item.to} title={item.label}>
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/usuarios" element={<UserSelectionPage />} />
          <Route
            path="/mi-album"
            element={
              <RequireUser>
                <MyAlbumPage />
              </RequireUser>
            }
          />
          <Route
            path="/cargar-orden"
            element={
              <RequireUser>
                <LoadByOrderPage />
              </RequireUser>
            }
          />
          <Route
            path="/cargar-equipo"
            element={
              <RequireUser>
                <LoadByTeamPage />
              </RequireUser>
            }
          />
          <Route
            path="/resumen"
            element={
              <RequireUser>
                <SummaryPage />
              </RequireUser>
            }
          />
          <Route
            path="/explorar"
            element={
              <RequireUser>
                <ExploreAlbumsPage />
              </RequireUser>
            }
          />
          <Route
            path="/comparar"
            element={
              <RequireUser>
                <CompareTradePage />
              </RequireUser>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

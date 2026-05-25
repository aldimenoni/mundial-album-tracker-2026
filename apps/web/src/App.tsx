import type { ReactNode } from "react";
import {
  Album,
  Home,
  LogOut,
  Repeat2,
  Search,
  UserRound
} from "lucide-react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { MyAlbumPage } from "./pages/MyAlbumPage";
import { StickerSearchPage } from "./pages/StickerSearchPage";
import { SummaryPage } from "./pages/SummaryPage";
import { UserSelectionPage } from "./pages/UserSelectionPage";
import { useUser } from "./state/user-store";

const navigationItems = [
  { to: "/", label: "Home", shortLabel: "Home", icon: Home, requiresUser: true },
  { to: "/usuarios", label: "Usuario", shortLabel: "Usuario", icon: UserRound, guestOnly: true },
  { to: "/buscar", label: "Buscar", shortLabel: "Buscar", icon: Search, public: true },
  { to: "/mi-album", label: "Mi album", shortLabel: "Album", icon: Album, requiresUser: true },
  { to: "/intercambio", label: "Intercambio", shortLabel: "Cambio", icon: Repeat2, requiresUser: true }
] as const;

function RequireUser({ children }: { children: ReactNode }) {
  const { currentUser } = useUser();
  return currentUser ? <>{children}</> : <Navigate to="/usuarios" replace />;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { currentUser } = useUser();
  return currentUser ? <Navigate to="/" replace /> : <>{children}</>;
}

function DefaultRoute() {
  const { currentUser } = useUser();
  return currentUser ? <SummaryPage /> : <Navigate to="/usuarios" replace />;
}

export function App() {
  const { currentUser, setCurrentUser } = useUser();
  const navigate = useNavigate();

  const visibleNavigationItems = navigationItems.filter((item) => {
    if ("public" in item && item.public) {
      return true;
    }

    if (currentUser) {
      return !("guestOnly" in item && item.guestOnly);
    }

    return "guestOnly" in item && item.guestOnly;
  });

  function handleSignOut(): void {
    setCurrentUser(null);
    navigate("/usuarios");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <img
            className="brand-emblem"
            src="/brand/world-cup-2026.svg"
            alt="Copa del Mundo FIFA"
          />
          <div className="brand-copy">
            <p className="eyebrow">FIFA World Cup 2026</p>
            <h1>Album Tracker</h1>
          </div>
        </div>
        <div className="active-user">
          {currentUser ? <span>@{currentUser.name}</span> : null}
          {currentUser ? (
            <button
              className="icon-button icon-button-ghost"
              type="button"
              aria-label="Salir"
              title="Salir"
              onClick={handleSignOut}
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </header>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<DefaultRoute />} />
          <Route
            path="/usuarios"
            element={
              <GuestOnly>
                <UserSelectionPage />
              </GuestOnly>
            }
          />
          <Route path="/buscar" element={<StickerSearchPage />} />
          <Route
            path="/mi-album"
            element={
              <RequireUser>
                <MyAlbumPage />
              </RequireUser>
            }
          />
          <Route
            path="/intercambio"
            element={
              <RequireUser>
                <HomePage />
              </RequireUser>
            }
          />
          <Route path="/resumen" element={<Navigate to="/" replace />} />
          <Route path="/comparar" element={<Navigate to="/intercambio" replace />} />
        </Routes>
      </main>

      <nav className="bottom-nav" aria-label="Navegacion principal">
        {visibleNavigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink key={item.to} to={item.to} title={item.label}>
              <Icon size={22} aria-hidden="true" />
              <span>{item.shortLabel}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

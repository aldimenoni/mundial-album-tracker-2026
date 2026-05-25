import { Suspense, lazy, useEffect } from "react";
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
import { RouteFallback } from "./components/ui/Skeleton";
import { prefetchQuery } from "./hooks/useQuery";
import { api } from "./api/client";
import { useUser } from "./state/user-store";

const SummaryPage = lazy(() =>
  import("./pages/SummaryPage").then((module) => ({ default: module.SummaryPage }))
);
const UserSelectionPage = lazy(() =>
  import("./pages/UserSelectionPage").then((module) => ({ default: module.UserSelectionPage }))
);
const StickerSearchPage = lazy(() =>
  import("./pages/StickerSearchPage").then((module) => ({ default: module.StickerSearchPage }))
);
const MyAlbumPage = lazy(() =>
  import("./pages/MyAlbumPage").then((module) => ({ default: module.MyAlbumPage }))
);
const HomePage = lazy(() => import("./pages/HomePage").then((module) => ({ default: module.HomePage })));

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

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

export function App() {
  const { currentUser, setCurrentUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    void prefetchQuery("stickers:catalog", () => api.listStickers(), 10 * 60_000);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    void prefetchQuery(`summary:${currentUser.id}`, () => api.getAlbumSummary(currentUser.id), 30_000);
    void prefetchQuery(`album:${currentUser.id}`, () => api.getAlbum(currentUser.id), 30_000);
  }, [currentUser]);

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
          <Route
            path="/"
            element={
              <LazyPage>
                <DefaultRoute />
              </LazyPage>
            }
          />
          <Route
            path="/usuarios"
            element={
              <LazyPage>
                <GuestOnly>
                  <UserSelectionPage />
                </GuestOnly>
              </LazyPage>
            }
          />
          <Route
            path="/buscar"
            element={
              <LazyPage>
                <StickerSearchPage />
              </LazyPage>
            }
          />
          <Route
            path="/mi-album"
            element={
              <LazyPage>
                <RequireUser>
                  <MyAlbumPage />
                </RequireUser>
              </LazyPage>
            }
          />
          <Route
            path="/intercambio"
            element={
              <LazyPage>
                <RequireUser>
                  <HomePage />
                </RequireUser>
              </LazyPage>
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

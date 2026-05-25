import { Suspense, lazy, useEffect } from "react";
import type { ReactNode } from "react";
import {
  Album,
  Home,
  Repeat2,
  Search,
  UserRound
} from "lucide-react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AppHeader } from "./components/layout/AppHeader";
import { FloatingBottomNav } from "./components/layout/FloatingBottomNav";
import { PageTransition } from "./components/layout/PageTransition";
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
    <div className="relative min-h-dvh bg-panini-navy">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-panini-navy"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 10%, rgba(246, 196, 83, 0.08), transparent 28%), radial-gradient(circle at 85% 20%, rgba(16, 185, 129, 0.1), transparent 32%), radial-gradient(circle at 50% 100%, rgba(18, 61, 154, 0.35), transparent 45%), linear-gradient(165deg, #081b4b 0%, #123d9a 42%, #0d5f4a 100%)"
        }}
      />
      <AppHeader {...(currentUser ? { onSignOut: handleSignOut } : {})} />

      <main className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-[calc(env(safe-area-inset-bottom,0px)+6.5rem)] pt-[calc(env(safe-area-inset-top,0px)+4.75rem)]">
        <PageTransition>
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
        </PageTransition>
      </main>

      <FloatingBottomNav items={[...visibleNavigationItems]} />
    </div>
  );
}

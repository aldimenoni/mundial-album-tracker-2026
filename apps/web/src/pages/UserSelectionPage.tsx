import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, UserPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { UserDto } from "@mundial-album/shared";
import { api } from "../api/client";
import { getErrorMessage } from "../api/error-message";
import { AppCard } from "../components/ui/AppCard";
import { AlertBanner, EmptyState, SectionHeader, UserAvatar } from "../components/ui/Badges";
import { GhostButton, GradientButton, IconButton } from "../components/ui/GradientButton";
import { UserListSkeleton } from "../components/ui/Skeleton";
import { useQuery } from "../hooks/useQuery";
import { cn } from "../lib/cn";
import { fadeUpItem, staggerContainer } from "../lib/motion-presets";
import { invalidateQuery } from "../lib/query-cache";
import { useUser } from "../state/user-store";

export function UserSelectionPage() {
  const { currentUser, setCurrentUser } = useUser();
  const navigate = useNavigate();
  const {
    data: users = [],
    error,
    isLoading,
    refetch
  } = useQuery("users", () => api.listUsers(), { staleTime: 30_000 });
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function closeCreateForm(): void {
    setShowCreateForm(false);
    setNickname("");
    setErrorMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await api.createUser({ name: nickname });
      setNickname("");
      setShowCreateForm(false);
      invalidateQuery("users");
      await refetch();
    } catch (submitError: unknown) {
      setErrorMessage(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid gap-4">
      <AppCard>
        <SectionHeader
          eyebrow="Acceso"
          title="Elegí tu coleccionista"
          subtitle="Cada usuario tiene su propio álbum y progreso."
          action={
            !showCreateForm ? (
              <IconButton
                type="button"
                aria-label="Crear usuario"
                title="Crear usuario"
                className="bg-gradient-to-br from-panini-gold to-amber-500 text-panini-navy"
                onClick={() => setShowCreateForm(true)}
              >
                <UserPlus size={20} aria-hidden="true" />
              </IconButton>
            ) : null
          }
        />
      </AppCard>

      {error ? <AlertBanner>{getErrorMessage(error)}</AlertBanner> : null}
      {errorMessage ? <AlertBanner>{errorMessage}</AlertBanner> : null}

      {showCreateForm ? (
        <AppCard>
          <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-white">Nuevo usuario</h3>
              <IconButton type="button" aria-label="Cerrar formulario" onClick={closeCreateForm}>
                <X size={18} aria-hidden="true" />
              </IconButton>
            </div>
            <label className="field">
              <span>Nickname</span>
              <input
                value={nickname}
                autoComplete="username"
                autoFocus
                placeholder="aldimenoni"
                onChange={(event) => setNickname(event.currentTarget.value)}
              />
            </label>
            <div className="grid gap-2">
              <GhostButton type="button" onClick={closeCreateForm}>
                Cancelar
              </GhostButton>
              <GradientButton type="submit" disabled={isSubmitting}>
                Crear usuario
              </GradientButton>
            </div>
          </form>
        </AppCard>
      ) : null}

      {isLoading && users.length === 0 ? <UserListSkeleton /> : null}

      {!isLoading && users.length === 0 ? (
        <EmptyState
          title="Todavía no hay usuarios"
          description="Creá el primero y empezá a pegar figuritas."
          icon={<UserPlus size={28} />}
        />
      ) : null}

      {!isLoading && users.length === 0 && !showCreateForm ? (
        <GradientButton type="button" variant="gold" onClick={() => setShowCreateForm(true)}>
          <UserPlus size={18} aria-hidden="true" />
          Crear primer usuario
        </GradientButton>
      ) : null}

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-3"
      >
        {users.map((user: UserDto) => {
          const isActive = currentUser?.id === user.id;

          return (
            <motion.div key={user.id} variants={fadeUpItem}>
              <AppCard
                className={cn(
                  "flex items-center justify-between gap-3 p-3",
                  isActive && "border-emerald-400/35 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar name={user.name} size="md" />
                  <div className="min-w-0">
                    <strong className="block truncate text-base font-black text-white">@{user.name}</strong>
                    <span className="text-xs font-bold uppercase tracking-wide text-white/55">
                      {isActive ? "Sesión activa" : "Listo para ingresar"}
                    </span>
                  </div>
                </div>

                <GradientButton
                  type="button"
                  variant={isActive ? "ghost" : "gold"}
                  className="!w-auto shrink-0 !px-4"
                  disabled={isActive}
                  onClick={() => {
                    setCurrentUser(user);
                    navigate("/");
                  }}
                >
                  {isActive ? "Activo" : (
                    <>
                      Ingresar
                      <ArrowRight size={16} />
                    </>
                  )}
                </GradientButton>
              </AppCard>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

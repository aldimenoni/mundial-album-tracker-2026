import { motion } from "framer-motion";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Skeleton({
  className,
  width,
  height,
  rounded = "md",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "pill";
}) {
  const roundedClass = {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    pill: "rounded-full"
  }[rounded];

  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse bg-white/10", roundedClass, className)}
      style={{ width, height }}
      {...props}
    />
  );
}

function PanelSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
      {children}
    </div>
  );
}

export function RouteFallback() {
  return (
    <div className="grid gap-4" aria-label="Cargando pagina" aria-busy="true">
      <Skeleton height={28} width="45%" rounded="pill" />
      <PanelSkeleton>
        <Skeleton height={180} rounded="lg" />
      </PanelSkeleton>
    </div>
  );
}

export function SummaryPageSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true">
      <PanelSkeleton>
        <div className="flex gap-3">
          <Skeleton height={80} width={80} rounded="pill" />
          <div className="grid flex-1 gap-2">
            <Skeleton height={18} width="40%" />
            <Skeleton height={28} width="70%" />
            <Skeleton height={12} />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} height={72} rounded="lg" />
          ))}
        </div>
      </PanelSkeleton>
      <PanelSkeleton>
        <Skeleton height={220} rounded="lg" />
      </PanelSkeleton>
      <PanelSkeleton>
        <Skeleton height={160} rounded="lg" />
      </PanelSkeleton>
    </div>
  );
}

export function AlbumPageSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true">
      <Skeleton height={120} rounded="lg" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} height={180} rounded="lg" />
        ))}
      </div>
    </div>
  );
}

export function ExchangePageSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true">
      {Array.from({ length: 2 }).map((_, index) => (
        <PanelSkeleton key={index}>
          <div className="flex gap-3">
            <Skeleton height={56} width={56} rounded="pill" />
            <div className="grid flex-1 gap-2">
              <Skeleton height={18} width="35%" />
              <Skeleton height={14} width="55%" />
            </div>
          </div>
          <Skeleton className="mt-3" height={120} rounded="lg" />
        </PanelSkeleton>
      ))}
    </div>
  );
}

export function SearchPageSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true">
      <Skeleton height={56} rounded="lg" />
      <Skeleton height={48} rounded="lg" />
    </div>
  );
}

export function UserListSkeleton() {
  return (
    <div className="grid gap-3" aria-busy="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} height={88} rounded="lg" />
      ))}
    </div>
  );
}

const USER_AVATAR_GRADIENT = "from-panini-royal to-panini-navy";

export function getUserAvatarGradient(_name: string): string {
  return USER_AVATAR_GRADIENT;
}

export function getUserInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export function getCollectionLevel(completionPercentage: number): {
  label: string;
  tone: "starter" | "collector" | "advanced" | "elite" | "legend";
} {
  if (completionPercentage >= 100) {
    return { label: "Leyenda del álbum", tone: "legend" };
  }

  if (completionPercentage >= 75) {
    return { label: "Colección avanzada", tone: "elite" };
  }

  if (completionPercentage >= 50) {
    return { label: "Coleccionista activo", tone: "advanced" };
  }

  if (completionPercentage >= 25) {
    return { label: "Armando el álbum", tone: "collector" };
  }

  return { label: "Principiante", tone: "starter" };
}

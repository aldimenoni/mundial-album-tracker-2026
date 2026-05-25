import type { Transition, Variants } from "framer-motion";

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32
};

export const springSoft: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 }
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04
    }
  }
};

export const fadeUpItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 }
};

export const albumSpreadSlideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? "100%" : "-100%",
    opacity: 0.35
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? "-100%" : "100%",
    opacity: 0.35
  })
};

export const albumSpreadSlideTransition: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 34,
  mass: 0.85
};

export const tapScale = {
  whileTap: { scale: 0.97 },
  whileHover: { scale: 1.02 }
};

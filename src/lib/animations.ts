/**
 * Framer Motion animation variants for cinematic UI
 * Central definition of all animations used throughout the app
 */

// Agent card focal point animations
export const agentCardVariants = {
  inactive: {
    opacity: 0.7,
    scale: 0.98,
    filter: "brightness(0.8)",
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
  active: {
    opacity: 1,
    scale: 1,
    filter: "brightness(1)",
    boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
};

// Avatar pulsing glow effect
export const avatarPulseVariants = {
  animate: {
    boxShadow: [
      "0 0 0px rgba(59, 130, 246, 0)",
      "0 0 20px rgba(59, 130, 246, 0.5)",
      "0 0 0px rgba(59, 130, 246, 0)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Typing indicator dots animation
export const typingIndicatorVariants = {
  animate: (i: number) => ({
    y: [0, -10, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      delay: i * 0.2,
      ease: "easeInOut",
    },
  }),
};

// Sentence fade-in with stagger
export const sentenceVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05, // 50ms stagger per sentence
      duration: 0.3,
      ease: "easeOut",
    },
  }),
};

// Container for staggering children
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

// Token appearance animation (fast)
export const tokenVariants = {
  initial: { opacity: 0, y: 2 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -2 },
  transition: { duration: 0.1 },
};

// Recovery indicator slide-in
export const recoveryIndicatorVariants = {
  hidden: {
    opacity: 0,
    x: -20,
    y: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    y: 20,
    transition: {
      duration: 0.3,
    },
  },
};

// Board container entrance
export const boardEntranceVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Individual card entrance
export const cardEntranceVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
};

// Agent start animation (agent becomes active)
export const agentActivationVariants = {
  start: {
    backgroundColor: ["rgba(51, 51, 51, 0.5)", "rgba(59, 130, 246, 0.15)"],
    borderColor: ["rgba(200, 200, 200, 0.1)", "rgba(59, 130, 246, 0.5)"],
    transition: {
      duration: 0.6,
    },
  },
};

// Error shake animation
export const shakeVariants = {
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

// Loading spinner
export const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Fade in on page load
export const pageEntranceVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

// Scale bounce effect
export const scaleBounceVariants = {
  tap: {
    scale: 0.95,
  },
};

// Glow pulse for active states
export const glowPulseVariants = {
  pulse: {
    boxShadow: [
      "0 0 0px rgba(59, 130, 246, 0.3)",
      "0 0 20px rgba(59, 130, 246, 0.6)",
      "0 0 0px rgba(59, 130, 246, 0.3)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

// Orange accent glow (for recovery/warning)
export const orangeGlowVariants = {
  glow: {
    boxShadow: [
      "0 0 0px rgba(251, 146, 60, 0)",
      "0 0 15px rgba(251, 146, 60, 0.5)",
      "0 0 0px rgba(251, 146, 60, 0)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

// Staggered children for agent grid
export const gridVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  },
};

// Accessibility: Reduced motion preferences
export const getAccessibleVariants = (
  prefersReducedMotion: boolean,
  normalVariants: any,
  fallbackVariants?: any
) => {
  if (prefersReducedMotion) {
    return fallbackVariants || {
      hidden: normalVariants.hidden,
      visible: {
        ...normalVariants.visible,
        transition: { duration: 0.1 },
      },
    };
  }
  return normalVariants;
};

import { keyframes } from '@mui/material/styles';

// Keyframe animations
export const animations = {
  // Fade animations
  fadeIn: keyframes`
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  `,
  
  fadeOut: keyframes`
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  `,
  
  fadeInUp: keyframes`
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  
  fadeInDown: keyframes`
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  
  fadeInLeft: keyframes`
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  `,
  
  fadeInRight: keyframes`
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  `,

  // Scale animations
  scaleIn: keyframes`
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  `,
  
  scaleOut: keyframes`
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.8);
    }
  `,

  // Slide animations
  slideInUp: keyframes`
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  `,
  
  slideInDown: keyframes`
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0);
    }
  `,
  
  slideInLeft: keyframes`
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  `,
  
  slideInRight: keyframes`
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  `,

  // Bounce animations
  bounce: keyframes`
    0%, 20%, 53%, 80%, 100% {
      animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
      transform: translateY(0);
    }
    40%, 43% {
      animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
      transform: translateY(-30px);
    }
    70% {
      animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
      transform: translateY(-15px);
    }
    90% {
      transform: translateY(-4px);
    }
  `,
  
  bounceIn: keyframes`
    from, 20%, 40%, 60%, 80%, to {
      animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    }
    0% {
      opacity: 0;
      transform: scale3d(0.3, 0.3, 0.3);
    }
    20% {
      transform: scale3d(1.1, 1.1, 1.1);
    }
    40% {
      transform: scale3d(0.9, 0.9, 0.9);
    }
    60% {
      opacity: 1;
      transform: scale3d(1.03, 1.03, 1.03);
    }
    80% {
      transform: scale3d(0.97, 0.97, 0.97);
    }
    to {
      opacity: 1;
      transform: scale3d(1, 1, 1);
    }
  `,

  // Pulse animations
  pulse: keyframes`
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  `,
  
  pulseOpacity: keyframes`
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  `,

  // Shake animation
  shake: keyframes`
    0%, 100% {
      transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-10px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(10px);
    }
  `,

  // Rotation animations
  rotate: keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  `,
  
  rotateIn: keyframes`
    from {
      opacity: 0;
      transform: rotate(-200deg);
    }
    to {
      opacity: 1;
      transform: rotate(0);
    }
  `,

  // Flip animations
  flipInX: keyframes`
    from {
      opacity: 0;
      transform: perspective(400px) rotateX(90deg);
    }
    40% {
      transform: perspective(400px) rotateX(-20deg);
    }
    60% {
      transform: perspective(400px) rotateX(10deg);
    }
    80% {
      transform: perspective(400px) rotateX(-5deg);
    }
    to {
      opacity: 1;
      transform: perspective(400px) rotateX(0deg);
    }
  `,
  
  flipInY: keyframes`
    from {
      opacity: 0;
      transform: perspective(400px) rotateY(90deg);
    }
    40% {
      transform: perspective(400px) rotateY(-20deg);
    }
    60% {
      transform: perspective(400px) rotateY(10deg);
    }
    80% {
      transform: perspective(400px) rotateY(-5deg);
    }
    to {
      opacity: 1;
      transform: perspective(400px) rotateY(0deg);
    }
  `,

  // Loading animations
  spin: keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  `,
  
  shimmer: keyframes`
    0% {
      background-position: -468px 0;
    }
    100% {
      background-position: 468px 0;
    }
  `,
  
  wave: keyframes`
    0%, 60%, 100% {
      transform: initial;
    }
    30% {
      transform: translateY(-15px);
    }
  `,

  // Progress animations
  progressIndeterminate: keyframes`
    0% {
      left: -35%;
      right: 100%;
    }
    60% {
      left: 100%;
      right: -90%;
    }
    100% {
      left: 100%;
      right: -90%;
    }
  `,

  // Glow effect
  glow: keyframes`
    0%, 100% {
      box-shadow: 0 0 5px rgba(33, 150, 243, 0.5);
    }
    50% {
      box-shadow: 0 0 20px rgba(33, 150, 243, 0.8);
    }
  `,
};

// Animation timing functions
export const easings = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

// Animation durations (in milliseconds)
export const durations = {
  shortest: 150,
  shorter: 200,
  short: 250,
  standard: 300,
  complex: 375,
  enteringScreen: 225,
  leavingScreen: 195,
  slow: 500,
  slower: 750,
  slowest: 1000,
};

// Animation utility functions
export function createAnimation(
  keyframe: string,
  duration: number = durations.standard,
  easing: string = easings.easeInOut,
  delay: number = 0,
  fillMode: string = 'both'
) {
  return {
    animation: `${keyframe} ${duration}ms ${easing} ${delay}ms ${fillMode}`,
  };
}

export function createTransition(
  properties: string | string[],
  duration: number = durations.standard,
  easing: string = easings.easeInOut,
  delay: number = 0
) {
  const props = Array.isArray(properties) ? properties.join(', ') : properties;
  return {
    transition: `${props} ${duration}ms ${easing} ${delay}ms`,
  };
}

// Stagger animation helper
export function createStaggeredAnimation(
  keyframe: string,
  itemCount: number,
  baseDelay: number = 100,
  duration: number = durations.standard,
  easing: string = easings.easeInOut
) {
  return Array.from({ length: itemCount }, (_, index) => ({
    animation: `${keyframe} ${duration}ms ${easing} ${index * baseDelay}ms both`,
  }));
}

// Hover animation presets
export const hoverAnimations = {
  lift: {
    transition: `transform ${durations.short}ms ${easings.easeOut}`,
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  },
  
  scale: {
    transition: `transform ${durations.short}ms ${easings.easeOut}`,
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  
  glow: {
    transition: `box-shadow ${durations.short}ms ${easings.easeOut}`,
    '&:hover': {
      boxShadow: '0 0 20px rgba(33, 150, 243, 0.3)',
    },
  },
  
  rotate: {
    transition: `transform ${durations.short}ms ${easings.easeOut}`,
    '&:hover': {
      transform: 'rotate(5deg)',
    },
  },
  
  slideUp: {
    transition: `transform ${durations.short}ms ${easings.easeOut}`,
    '&:hover': {
      transform: 'translateY(-4px)',
    },
  },
};

// Focus animation presets
export const focusAnimations = {
  outline: {
    '&:focus-visible': {
      outline: '2px solid #2196f3',
      outlineOffset: '2px',
      transition: `outline ${durations.shorter}ms ${easings.easeOut}`,
    },
  },
  
  glow: {
    '&:focus-visible': {
      boxShadow: '0 0 0 3px rgba(33, 150, 243, 0.3)',
      transition: `box-shadow ${durations.shorter}ms ${easings.easeOut}`,
    },
  },
  
  scale: {
    '&:focus-visible': {
      transform: 'scale(1.02)',
      transition: `transform ${durations.shorter}ms ${easings.easeOut}`,
    },
  },
};

// Loading animation presets
export const loadingAnimations = {
  pulse: {
    animation: `${animations.pulseOpacity} 2s ${easings.easeInOut} infinite`,
  },
  
  shimmer: {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: `${animations.shimmer} 2s ${easings.easeInOut} infinite`,
  },
  
  wave: {
    animation: `${animations.wave} 1.5s ${easings.easeInOut} infinite`,
  },
  
  spin: {
    animation: `${animations.spin} 1s linear infinite`,
  },
};

// Page transition animations
export const pageTransitions = {
  fadeIn: {
    animation: `${animations.fadeIn} ${durations.standard}ms ${easings.easeOut}`,
  },
  
  slideInUp: {
    animation: `${animations.slideInUp} ${durations.standard}ms ${easings.easeOut}`,
  },
  
  scaleIn: {
    animation: `${animations.scaleIn} ${durations.standard}ms ${easings.bounce}`,
  },
};

// Utility to disable animations based on user preference
export function withReducedMotion(
  animationStyles: any,
  prefersReducedMotion: boolean
) {
  if (prefersReducedMotion) {
    return {
      animation: 'none',
      transition: 'none',
    };
  }
  return animationStyles;
}
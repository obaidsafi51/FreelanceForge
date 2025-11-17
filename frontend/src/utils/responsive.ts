import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { Breakpoint } from '@mui/material/styles';

// Breakpoint values for consistent responsive design
export const breakpoints = {
  xs: 0,
  sm: 320,
  md: 768,
  lg: 1024,
  xl: 1440,
} as const;

// Hook for responsive breakpoint detection
export function useResponsive() {
  const theme = useTheme();
  
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));
  
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const isXlUp = useMediaQuery(theme.breakpoints.up('xl'));
  
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));
  const isLgDown = useMediaQuery(theme.breakpoints.down('lg'));
  const isXlDown = useMediaQuery(theme.breakpoints.down('xl'));

  // Device type detection
  const isMobile = isXs || isSm;
  const isTablet = isMd;
  const isDesktop = isLg || isXl;

  // Orientation detection
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isLandscape = useMediaQuery('(orientation: landscape)');

  // Touch device detection
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');

  // High DPI detection
  const isHighDPI = useMediaQuery('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)');

  // Reduced motion preference
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return {
    // Individual breakpoints
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    
    // Up breakpoints
    isSmUp,
    isMdUp,
    isLgUp,
    isXlUp,
    
    // Down breakpoints
    isSmDown,
    isMdDown,
    isLgDown,
    isXlDown,
    
    // Device types
    isMobile,
    isTablet,
    isDesktop,
    
    // Orientation
    isPortrait,
    isLandscape,
    
    // Device capabilities
    isTouchDevice,
    isHighDPI,
    prefersReducedMotion,
  };
}

// Responsive value helper
export function getResponsiveValue<T>(
  values: Partial<Record<Breakpoint, T>>,
  currentBreakpoint: Breakpoint
): T | undefined {
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  // Look for exact match first
  if (values[currentBreakpoint] !== undefined) {
    return values[currentBreakpoint];
  }
  
  // Look for closest smaller breakpoint
  for (let i = currentIndex - 1; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  // Look for closest larger breakpoint
  for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
}

// Responsive spacing helper
export function getResponsiveSpacing(
  mobile: number,
  tablet?: number,
  desktop?: number
) {
  return {
    xs: mobile,
    sm: mobile,
    md: tablet ?? mobile,
    lg: desktop ?? tablet ?? mobile,
    xl: desktop ?? tablet ?? mobile,
  };
}

// Responsive grid columns helper
export function getResponsiveColumns(
  mobile: number,
  tablet?: number,
  desktop?: number
) {
  return {
    xs: 12 / mobile,
    sm: 12 / mobile,
    md: tablet ? 12 / tablet : 12 / mobile,
    lg: desktop ? 12 / desktop : tablet ? 12 / tablet : 12 / mobile,
    xl: desktop ? 12 / desktop : tablet ? 12 / tablet : 12 / mobile,
  };
}

// Container max width helper
export function getContainerMaxWidth(breakpoint: Breakpoint): string {
  switch (breakpoint) {
    case 'xs':
      return '100%';
    case 'sm':
      return '320px';
    case 'md':
      return '768px';
    case 'lg':
      return '1024px';
    case 'xl':
      return '1440px';
    default:
      return '100%';
  }
}

// Typography scale helper for responsive text
export function getResponsiveTypography(
  baseSize: number,
  scaleFactors: Partial<Record<Breakpoint, number>> = {}
) {
  return {
    xs: `${baseSize * (scaleFactors.xs ?? 0.8)}rem`,
    sm: `${baseSize * (scaleFactors.sm ?? 0.9)}rem`,
    md: `${baseSize * (scaleFactors.md ?? 1)}rem`,
    lg: `${baseSize * (scaleFactors.lg ?? 1.1)}rem`,
    xl: `${baseSize * (scaleFactors.xl ?? 1.2)}rem`,
  };
}

// Responsive image sizing
export function getResponsiveImageSize(
  baseSizes: { width: number; height: number },
  scaleFactors: Partial<Record<Breakpoint, number>> = {}
) {
  return Object.entries(scaleFactors).reduce((acc, [bp, scale]) => {
    acc[bp as Breakpoint] = {
      width: baseSizes.width * scale,
      height: baseSizes.height * scale,
    };
    return acc;
  }, {} as Record<Breakpoint, { width: number; height: number }>);
}

// Responsive padding/margin helper
export function getResponsivePadding(
  values: {
    mobile?: number | string;
    tablet?: number | string;
    desktop?: number | string;
  }
) {
  const { mobile = 2, tablet, desktop } = values;
  
  return {
    xs: mobile,
    sm: mobile,
    md: tablet ?? mobile,
    lg: desktop ?? tablet ?? mobile,
    xl: desktop ?? tablet ?? mobile,
  };
}

// Animation duration based on reduced motion preference
export function getAnimationDuration(
  normalDuration: number,
  prefersReducedMotion: boolean
): number {
  return prefersReducedMotion ? 0 : normalDuration;
}

// Responsive card layout helper
export function getCardLayout(deviceType: 'mobile' | 'tablet' | 'desktop') {
  switch (deviceType) {
    case 'mobile':
      return {
        columns: 1,
        spacing: 2,
        padding: 2,
        cardMinHeight: 200,
      };
    case 'tablet':
      return {
        columns: 2,
        spacing: 3,
        padding: 3,
        cardMinHeight: 250,
      };
    case 'desktop':
      return {
        columns: 3,
        spacing: 4,
        padding: 4,
        cardMinHeight: 300,
      };
    default:
      return {
        columns: 1,
        spacing: 2,
        padding: 2,
        cardMinHeight: 200,
      };
  }
}

// Responsive navigation helper
export function getNavigationLayout(isMobile: boolean) {
  return {
    showLabels: !isMobile,
    iconSize: isMobile ? 'small' : 'medium',
    spacing: isMobile ? 1 : 2,
    orientation: isMobile ? 'horizontal' : 'horizontal',
    variant: isMobile ? 'compact' : 'full',
  };
}

// Touch target size helper (minimum 44px for accessibility)
export function getTouchTargetSize(isTouchDevice: boolean) {
  return {
    minHeight: isTouchDevice ? 44 : 32,
    minWidth: isTouchDevice ? 44 : 32,
    padding: isTouchDevice ? 12 : 8,
  };
}

// Responsive modal/dialog sizing
export function getModalSize(breakpoint: Breakpoint) {
  switch (breakpoint) {
    case 'xs':
    case 'sm':
      return {
        maxWidth: '95vw',
        maxHeight: '95vh',
        margin: 1,
      };
    case 'md':
      return {
        maxWidth: '80vw',
        maxHeight: '90vh',
        margin: 2,
      };
    case 'lg':
    case 'xl':
      return {
        maxWidth: '60vw',
        maxHeight: '80vh',
        margin: 4,
      };
    default:
      return {
        maxWidth: '95vw',
        maxHeight: '95vh',
        margin: 1,
      };
  }
}
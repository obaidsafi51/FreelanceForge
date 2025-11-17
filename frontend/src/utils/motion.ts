/**
 * Motion utilities for handling reduced motion preferences
 */

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get transition duration based on user preference
export const getTransitionDuration = (normalDuration: string): string => {
    return prefersReducedMotion() ? '0.01ms' : normalDuration;
};

// Get transition with reduced motion support
export const getTransition = (property: string, duration: string, easing = 'ease'): string => {
    const actualDuration = getTransitionDuration(duration);
    return `${property} ${actualDuration} ${easing}`;
};

// Common transition presets
export const transitions = {
    fast: '0.15s',
    normal: '0.25s',
    slow: '0.35s',
    complex: '0.4s',
};

// Get all transitions with reduced motion support
export const getAllTransitions = (duration: string = transitions.normal): string => {
    return getTransition('all', duration, 'cubic-bezier(0.4, 0, 0.2, 1)');
};
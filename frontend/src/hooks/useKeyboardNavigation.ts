import { useEffect, useCallback, useRef } from 'react';

interface KeyboardNavigationOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  onSpace?: () => void;
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    onEnter,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
    onSpace,
    enabled = true,
    preventDefault = true,
    stopPropagation = false,
  } = options;

  const elementRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const { key, shiftKey } = event;

      let handled = false;

      switch (key) {
        case 'Enter':
          if (onEnter) {
            onEnter();
            handled = true;
          }
          break;
        case 'Escape':
          if (onEscape) {
            onEscape();
            handled = true;
          }
          break;
        case 'ArrowUp':
          if (onArrowUp) {
            onArrowUp();
            handled = true;
          }
          break;
        case 'ArrowDown':
          if (onArrowDown) {
            onArrowDown();
            handled = true;
          }
          break;
        case 'ArrowLeft':
          if (onArrowLeft) {
            onArrowLeft();
            handled = true;
          }
          break;
        case 'ArrowRight':
          if (onArrowRight) {
            onArrowRight();
            handled = true;
          }
          break;
        case 'Tab':
          if (shiftKey && onShiftTab) {
            onShiftTab();
            handled = true;
          } else if (!shiftKey && onTab) {
            onTab();
            handled = true;
          }
          break;
        case ' ':
          if (onSpace) {
            onSpace();
            handled = true;
          }
          break;
      }

      if (handled) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
      }
    },
    [
      enabled,
      onEnter,
      onEscape,
      onArrowUp,
      onArrowDown,
      onArrowLeft,
      onArrowRight,
      onTab,
      onShiftTab,
      onSpace,
      preventDefault,
      stopPropagation,
    ]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  return elementRef;
}

// Hook for managing focus within a container
export function useFocusManagement() {
  const containerRef = useRef<HTMLElement>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])',
    ].join(', ');

    return Array.from(
      containerRef.current.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }, []);

  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
    }
  }, [getFocusableElements]);

  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
    }
  }, [getFocusableElements]);

  const focusNext = useCallback(() => {
    const elements = getFocusableElements();
    const currentIndex = elements.findIndex(el => el === document.activeElement);
    
    if (currentIndex === -1) {
      focusFirst();
    } else if (currentIndex < elements.length - 1) {
      elements[currentIndex + 1].focus();
    } else {
      elements[0].focus(); // Wrap to first
    }
  }, [getFocusableElements, focusFirst]);

  const focusPrevious = useCallback(() => {
    const elements = getFocusableElements();
    const currentIndex = elements.findIndex(el => el === document.activeElement);
    
    if (currentIndex === -1) {
      focusLast();
    } else if (currentIndex > 0) {
      elements[currentIndex - 1].focus();
    } else {
      elements[elements.length - 1].focus(); // Wrap to last
    }
  }, [getFocusableElements, focusLast]);

  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const firstElement = elements[0];
    const lastElement = elements[elements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [getFocusableElements]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    trapFocus,
    getFocusableElements,
  };
}

// Hook for managing roving tabindex (for lists, grids, etc.)
export function useRovingTabIndex<T extends HTMLElement>() {
  const itemsRef = useRef<T[]>([]);
  const currentIndexRef = useRef(0);

  const registerItem = useCallback((item: T | null, index: number) => {
    if (item) {
      itemsRef.current[index] = item;
      // Set initial tabindex
      item.tabIndex = index === 0 ? 0 : -1;
    }
  }, []);

  const setActiveIndex = useCallback((index: number) => {
    const items = itemsRef.current;
    if (index < 0 || index >= items.length) return;

    // Update tabindex for all items
    items.forEach((item, i) => {
      if (item) {
        item.tabIndex = i === index ? 0 : -1;
      }
    });

    currentIndexRef.current = index;
    
    // Focus the active item
    const activeItem = items[index];
    if (activeItem) {
      activeItem.focus();
    }
  }, []);

  const moveNext = useCallback(() => {
    const nextIndex = (currentIndexRef.current + 1) % itemsRef.current.length;
    setActiveIndex(nextIndex);
  }, [setActiveIndex]);

  const movePrevious = useCallback(() => {
    const prevIndex = currentIndexRef.current === 0 
      ? itemsRef.current.length - 1 
      : currentIndexRef.current - 1;
    setActiveIndex(prevIndex);
  }, [setActiveIndex]);

  const moveFirst = useCallback(() => {
    setActiveIndex(0);
  }, [setActiveIndex]);

  const moveLast = useCallback(() => {
    setActiveIndex(itemsRef.current.length - 1);
  }, [setActiveIndex]);

  return {
    registerItem,
    setActiveIndex,
    moveNext,
    movePrevious,
    moveFirst,
    moveLast,
    currentIndex: currentIndexRef.current,
  };
}

// Accessibility announcer for screen readers
export function useScreenReaderAnnouncer() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) {
      // Create announcer element if it doesn't exist
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    // Clear previous message and set new one
    announcerRef.current.textContent = '';
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = message;
      }
    }, 100);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (announcerRef.current && announcerRef.current.parentNode) {
        announcerRef.current.parentNode.removeChild(announcerRef.current);
      }
    };
  }, []);

  return { announce };
}
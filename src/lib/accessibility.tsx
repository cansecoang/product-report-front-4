/**
 * Accessibility Utilities
 * 
 * Hooks y componentes para mejorar la accesibilidad (WCAG AA)
 * - ARIA labels
 * - Keyboard navigation
 * - Focus management
 * - Screen reader support
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// ============================================================================
// FOCUS MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook para focus trap en modales
 * Mantiene el foco dentro del modal y previene que escape
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Guardar el elemento que tenía foco antes
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Función para obtener elementos focuseables
    const getFocusableElements = () => {
      if (!containerRef.current) return [];
      
      return Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
    };

    // Handler para Tab key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab en el primer elemento -> ir al último
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // Tab en el último elemento -> ir al primero
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    // Enfocar el primer elemento cuando se abre el modal
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Agregar event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup: restaurar foco anterior
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook para manejar navegación con teclado en listas
 */
export function useKeyboardNavigation(
  itemsCount: number,
  onSelect?: (index: number) => void
) {
  const currentIndexRef = useRef(0);
  const containerRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newIndex = currentIndexRef.current;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          newIndex = Math.min(itemsCount - 1, currentIndexRef.current + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          newIndex = Math.max(0, currentIndexRef.current - 1);
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = itemsCount - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect?.(currentIndexRef.current);
          return;
        default:
          return;
      }

      currentIndexRef.current = newIndex;
      
      // Enfocar el elemento correspondiente
      if (containerRef.current) {
        const items = containerRef.current.querySelectorAll('[role="option"]');
        (items[newIndex] as HTMLElement)?.focus();
      }
    },
    [itemsCount, onSelect]
  );

  return {
    containerRef,
    currentIndex: currentIndexRef.current,
    handleKeyDown,
  };
}

// ============================================================================
// ARIA LIVE REGIONS
// ============================================================================

/**
 * Hook para anunciar mensajes a screen readers
 */
export function useAriaLive() {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Crear región live si no existe
    if (!liveRegionRef.current) {
      const region = document.createElement('div');
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only'; // Screen reader only
      document.body.appendChild(region);
      liveRegionRef.current = region;
    }

    return () => {
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current);
        liveRegionRef.current = null;
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;
      
      // Limpiar después de 1 segundo
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  return announce;
}

// ============================================================================
// SKIP LINKS
// ============================================================================

/**
 * Componente para links de skip navigation
 */
export function SkipLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {children}
    </a>
  );
}

// ============================================================================
// ACCESSIBLE FORM HELPERS
// ============================================================================

/**
 * Props para hacer inputs accesibles
 */
export interface AccessibleInputProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

/**
 * Genera props de accesibilidad para inputs
 */
export function getAccessibleInputProps({
  id,
  label,
  error,
  hint,
  required,
}: AccessibleInputProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  
  const ariaDescribedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return {
    inputProps: {
      id,
      'aria-label': label,
      'aria-required': required || undefined,
      'aria-invalid': !!error || undefined,
      'aria-describedby': ariaDescribedBy,
    },
    labelProps: {
      htmlFor: id,
    },
    hintProps: hint
      ? {
          id: hintId,
          role: 'note' as const,
        }
      : undefined,
    errorProps: error
      ? {
          id: errorId,
          role: 'alert' as const,
          'aria-live': 'polite' as const,
        }
      : undefined,
  };
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

/**
 * Hook para atajos de teclado globales
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean; // Cmd en Mac
  } = {}
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const matchesModifiers =
        (!options.ctrl || e.ctrlKey) &&
        (!options.shift || e.shiftKey) &&
        (!options.alt || e.altKey) &&
        (!options.meta || e.metaKey);

      if (e.key.toLowerCase() === key.toLowerCase() && matchesModifiers) {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, options]);
}

/**
 * Componente para mostrar atajos de teclado
 */
export function KeyboardShortcut({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex gap-1" aria-label={`Atajo de teclado: ${keys.join(' + ')}`}>
      {keys.map((key, index) => (
        <kbd
          key={index}
          className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}

// ============================================================================
// SCREEN READER UTILITIES
// ============================================================================

/**
 * Componente de texto solo para screen readers
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

/**
 * Hook para detectar si el usuario usa screen reader
 */
export function useScreenReader() {
  const [isScreenReader, setIsScreenReader] = useState(false);

  useEffect(() => {
    // Detectar navegación por teclado como proxy de screen reader
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsScreenReader(true);
        document.removeEventListener('keydown', handleKeyDown);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return isScreenReader;
}

// ============================================================================
// FOCUS VISIBLE UTILITIES
// ============================================================================

/**
 * Hook para detectar navegación con teclado y mostrar focus rings
 */
export function useFocusVisible() {
  useEffect(() => {
    // Agregar clase cuando se usa teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
      }
    };

    // Remover clase cuando se usa mouse
    const handleMouseDown = () => {
      document.body.classList.remove('user-is-tabbing');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
}

// ============================================================================
// ACCESSIBLE MODAL/DIALOG
// ============================================================================

/**
 * Props para hacer modales accesibles
 */
export interface AccessibleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
}

/**
 * Genera props de accesibilidad para diálogos/modales
 */
export function getAccessibleDialogProps({
  isOpen,
  description,
}: Omit<AccessibleDialogProps, 'onClose' | 'title'>) {
  const titleId = 'dialog-title';
  const descriptionId = description ? 'dialog-description' : undefined;

  return {
    dialogProps: {
      role: 'dialog' as const,
      'aria-modal': true,
      'aria-labelledby': titleId,
      'aria-describedby': descriptionId,
      'aria-hidden': !isOpen,
    },
    titleProps: {
      id: titleId,
    },
    descriptionProps: description
      ? {
          id: descriptionId,
        }
      : undefined,
  };
}

// CSS Helper: Agregar a globals.css
export const accessibilityCSS = `
/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* Focus visible styles */
body:not(.user-is-tabbing) *:focus {
  outline: none;
}

body.user-is-tabbing *:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
`;
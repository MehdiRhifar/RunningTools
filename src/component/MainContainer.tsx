import { useRef, useState, ReactNode, useLayoutEffect } from 'react'

interface MainContainerProps {
  children: ReactNode;
  headerSelector?: string; // Sélecteur CSS pour le header
  maxWidth?: string; // Nouvelle prop optionnelle
}

export function MainContainer({ children, headerSelector = '.navbar-container', maxWidth='500px' }: MainContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dynamicPaddingTop, setDynamicPaddingTop] = useState<number>(0);

  const calculateDynamicCentering = (): void => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Récupérer la hauteur réelle du header
    const headerElement = document.querySelector(headerSelector) as HTMLElement;
    const header_size: number = headerElement ? headerElement.offsetHeight : 150; // Fallback à 150px

    const viewportHeight: number = window.innerHeight;
    const contentHeight: number = container.scrollHeight - parseInt(getComputedStyle(container).paddingTop);

    const freeSpace: number = viewportHeight - contentHeight - header_size;
    const topSpace: number = Math.max(0, Math.floor(freeSpace / 3));

    setDynamicPaddingTop(topSpace);
  };

  useLayoutEffect(() => {
    // Calculer immédiatement de manière synchrone
    calculateDynamicCentering();
    window.addEventListener('resize', calculateDynamicCentering);

    const resizeObserver = new ResizeObserver(calculateDynamicCentering);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const headerElement = document.querySelector(headerSelector);
    if (headerElement) {
      resizeObserver.observe(headerElement);
    }

    return (): void => {
      window.removeEventListener('resize', calculateDynamicCentering);
      resizeObserver.disconnect();
    };
  }, [headerSelector]);

  return (
    <div
      ref={containerRef}
      className="main-container"
      style={{
        paddingTop: `${dynamicPaddingTop}px`,
        maxWidth: maxWidth,
      }}
    >
      {children}
    </div>
  );
}

export default MainContainer;

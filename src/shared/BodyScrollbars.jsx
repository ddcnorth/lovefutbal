import { useLayoutEffect } from 'react';
import { OverlayScrollbars } from 'overlayscrollbars';
import 'overlayscrollbars/overlayscrollbars.css';
import './scrollbars.css';

/** Keep document scrolling, sticky headers and keyboard/touch navigation native. */
export default function BodyScrollbars() {
  useLayoutEffect(() => {
    const forcedColors = window.matchMedia('(forced-colors: active)');
    let instance;

    const initialize = () => {
      instance?.destroy();
      instance = undefined;
      // System high-contrast scrollbars remain under the user's control.
      if (forcedColors.matches) return;
      instance = OverlayScrollbars({
        target: document.body,
        // Keep native overlay scrollbars where available. Older browsers can also
        // retain native scrolling if a body instance would interfere with it.
        cancel: { nativeScrollbarsOverlaid: true, body: null },
      }, {
        scrollbars: {
          theme: 'os-theme-lovefutbal',
          autoHide: 'leave',
          autoHideDelay: 700,
          autoHideSuspend: true,
          clickScroll: 'instant',
        },
      });
    };

    initialize();
    forcedColors.addEventListener('change', initialize);
    return () => {
      forcedColors.removeEventListener('change', initialize);
      instance?.destroy();
    };
  }, []);

  return null;
}

const createExternalRefsHook = (context) => (selectors, timeout = 0) => {
  const refs = new Map();

  let observer: MutationObserver;

  return new Promise((resolve, reject) => {
    const updateRefs = () => {
      const addRef = (selector) => {
        if (!selector) {
          return;
        }
        const node = document.querySelector(selector);
        if (node) {
          refs.set(selector, node);
        }
      };

      selectors.map(addRef);

      if (selectors.length === refs.size) {
        observer.disconnect();
        resolve(refs);
      }
    };

    observer = new MutationObserver(updateRefs);
    observer.observe(context, { childList: true, subtree: true });

    updateRefs();

    if (timeout) {
      setTimeout(() => {
        console.warn(`Found ${refs.size} out in [${selectors}] after ${timeout}ms`);
        resolve(refs);
      }, timeout);
    }
  });
};

export const useExternalRefs = createExternalRefsHook(document.body);

const createExternalRefsHook = (context) => (selectors, timeout = 3000) => {
  const refs = new Map();

  let observer: MutationObserver;

  return new Promise((resolve, reject) => {
    const updateRefs = () => {
      const addRef = (selector) => {
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

    setTimeout(() => {
      const error = new Error(`Found ${refs.size} out in [${selectors}] after ${timeout}ms`);
      reject(error);
    }, timeout);
  });
};

export const useExternalRefs = createExternalRefsHook(document.body);

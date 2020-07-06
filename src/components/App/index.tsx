import introJs from 'intro.js';

import { TooltipPosition, TooltipContext } from 'src/types';

import { api } from 'src/variables';
import { get, post } from 'src/services/http';

import { useExternalRefs } from 'src/hooks/useExternalRefs';

type AppProps = {
  user: string;
};

class App {
  private Intro = introJs();

  private ctx: TooltipContext = {};

  constructor({ user }: AppProps) {
    this.context = { user };
    this.Intro.oncomplete(() => post(api.tooltip, this.context));
    globalThis.IntroJS = this.api;
  }

  get context(): TooltipContext {
    return this.ctx;
  }

  set context(ctx: TooltipContext) {
    Object.assign(this.ctx, ctx);
  }

  get api(): Record<string, () => unknown> {
    // proxy intro.js API to the global scope
    // https://introjs.com/docs/intro/api/#api
    return {
      goToStep: this.Intro.goToStep.bind(this.Intro),
      start: this.Intro.start.bind(this.Intro),
      __lib: this.Intro,
    };
  }

  async init(): Promise<void> {
    this.context = {
      host: window.location.origin,
      uri: window.location.pathname,
    };

    const data = await get(api.tooltip, this.context);

    const selectors = data.map(({ selector }) => selector);

    try {
      const refs = await useExternalRefs(selectors);

      const normalize = this.getNormalizer(refs);
      const steps = data.map(normalize);

      if (steps.length) {
        this.Intro.addSteps(steps).start();
      }
    } catch (err) {
      console.error(err);
    }
  }

  getNormalizer = (refs) => ({ selector, content, position = TooltipPosition.AUTO }) => ({
    element: refs.get(selector),
    intro: content,
    position,
  });

  spyOnPushState = (): void => {
    const init = this.init.bind(this);
    const oldPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      init();
      return oldPushState.apply(window.history, args);
    };
  };
}

export default App;

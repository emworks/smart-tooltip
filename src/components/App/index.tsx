import introJs from 'intro.js';

import {
  Tooltip,
  TooltipPosition,
  TooltipContext,
  TooltipTrigger,
  TooltipStep,
  DOMEventMap,
  CustomEventMap,
  TooltipEvent,
} from 'src/types';

import { api } from 'src/variables';
import { getEvent, getTooltip, postTooltip } from 'src/services/http';

import { useExternalRefs } from 'src/hooks/useExternalRefs';

import './index.scss';

type AppProps = {
  user: string;
};

class App {
  private Intro = introJs();

  private ctx: TooltipContext = {};

  private data: Array<Tooltip> = [];

  private steps: Array<TooltipStep> = [];

  private eventData: Array<TooltipEvent> = [];

  private events: Array<any> = [];

  constructor({ user }: AppProps) {
    this.context = { user };
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

    await this.initData();
    await this.bindEvents();
  }

  async initData(): Promise<void> {
    this.data = await getTooltip(api.tooltip, this.context);

    const selectors = this.data.map(({ selector }) => selector);

    try {
      const refs = await useExternalRefs(selectors);

      const normalize = this.getNormalizer(refs);
      this.steps = this.data.map(normalize);

      if (this.steps.length) {
        // a workaround to initialize intro.js without starting a demo
        document.body.classList.add('no-introjs-overlay');
        this.Intro.addSteps(this.steps).start().exit();
        setTimeout(() => {
          document.body.classList.remove('no-introjs-overlay');
          const firstTooltipIdx = this.data.findIndex(({ trigger }) => !trigger || trigger === TooltipTrigger.AUTO);
          if (!!~firstTooltipIdx) {
            this.start(firstTooltipIdx);
          }
        }, 500);
      }
    } catch (err) {
      console.error(err);
    }
  }

  start(step?: number): void {
    step === 0 ? this.Intro.start() : this.Intro.goToStep(step).start();
  }

  get customEvents(): Record<string, (CustomEvent) => void> {
    return {
      [CustomEventMap.TOOLTIP_SHOW]: ({ detail: { target } }) => {
        const step = this.data.findIndex((item) => item.id == target);
        this.start(step);
      },
      [CustomEventMap.TOOLTIP_HIDE]: () => {
        this.Intro.exit();
      },
    };
  }

  async bindEvents(): Promise<void> {
    const triggerEvent = this.triggerEvent.bind(this);

    if (this.eventData.length) {
      this.unbindEvents();
    }

    this.Intro.oncomplete(() => postTooltip(api.tooltip, this.context));

    this.Intro.onchange((target) => {
      let element = target;
      if (target.classList.contains('introjsFloatingElement')) {
        const currentItem = this.Intro._introItems.find((item) => item.element === target);
        if (currentItem.position === TooltipPosition.FLOATING) {
          const { selector, position } = this.data.find((item) => item.id === currentItem.id) || {};
          if (selector) {
            const node = document.querySelector(selector);
            if (node) {
              currentItem.element = element = node;
              currentItem.position = position;
            }
          }
        }
      }
      const currentStep = this.steps.find((step: TooltipStep) => step.element === target);
      if (currentStep) {
        currentStep.element = element;
        triggerEvent(CustomEventMap.TOOLTIP_VISIBLE, {
          detail: { currentStep },
        });
      }
    });

    this.eventData = await getEvent(api.event, this.context);

    this.eventData.forEach(this.bindEvent.bind(this));

    Object.keys(this.customEvents).forEach((eventType) => {
      this.registerEvent(document, eventType, this.customEvents[eventType]);
    });
  }

  bindEvent({ eventType, source, trigger, target }: TooltipEvent): void {
    if (Object.values(DOMEventMap).includes(eventType as DOMEventMap)) {
      const eventSource = document.querySelector(source);
      const triggerEvent = this.triggerEvent.bind(this);
      this.registerEvent(eventSource, eventType, () =>
        triggerEvent(trigger, {
          detail: { target },
        })
      );
    } else {
      this.registerEvent(document, eventType, ({ detail: { currentStep } }: CustomEvent) => {
        if (currentStep.id == source) {
          const eventTarget = document.querySelector(target);
          eventTarget && eventTarget[trigger]();
        }
      });
    }
  }

  registerEvent(target, type, listener): void {
    target.addEventListener(type, listener);
    this.events.push({ target, type, listener });
  }

  unbindEvents(): void {
    this.events.forEach(({ target, type, listener }) => target.removeEventListener(type, listener));
  }

  triggerEvent(type: string, data: any): void {
    document.dispatchEvent(new CustomEvent(type, data));
  }

  getNormalizer = (refs) => ({ id, selector, content, position = TooltipPosition.AUTO }): TooltipStep => ({
    id,
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

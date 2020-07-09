import introJs from 'intro.js';

import {
  Tooltip,
  TooltipPosition,
  TooltipContext,
  TooltipTrigger,
  TooltipStep,
  DOMEventMap,
  CustomActionMap,
  CustomEventMap,
  TooltipEvent,
} from 'src/types';

import { api } from 'src/variables';
import { getEvent, getTooltip, postTooltip } from 'src/services/http';

import { useExternalRefs } from 'src/hooks/useExternalRefs';

import { throttle } from 'src/utils';

import './index.scss';

type AppProps = {
  user: string;
};

class App {
  private Intro;

  private ctx: TooltipContext = {};

  private data: Array<Tooltip> = [];

  private steps: Array<TooltipStep> = [];

  private eventData: Array<TooltipEvent> = [];

  private events: Array<any> = [];

  constructor({ user }: AppProps) {
    this.context = { user };
    this.start = throttle(this.start.bind(this), 1000);
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
      init: this.init.bind(this),
      __lib: this.Intro,
    };
  }

  async init(data?: Array<Tooltip>, events?: Array<TooltipEvent>): Promise<void> {
    this.context = {
      host: window.location.origin,
      uri: window.location.pathname,
    };

    this.Intro = introJs();
    globalThis.IntroJS = this.api;

    await this.initData(data);
    await this.bindEvents(events);
  }

  async initData(data?: Array<Tooltip>): Promise<void> {
    this.data = data || (await getTooltip(api.tooltip, this.context));

    const selectors = this.data.map(({ selector }) => selector);

    try {
      const refs = await useExternalRefs(selectors);

      const normalize = this.getNormalizer(refs);
      this.steps = this.data.map(normalize);

      if (this.steps.length) {
        // a workaround to initialize intro.js without starting a demo
        document.body.classList.add('no-introjs-overlay');
        this.Intro.setOptions({
          steps: this.steps,
          showStepNumbers: false,
          overlayOpacity: 0.3,
        })
          .start()
          .exit();

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

  get customActions(): Record<string, (CustomEvent) => void> {
    return {
      [CustomActionMap.TOOLTIP_SHOW]: ({ detail: { target } }) => {
        const step = this.data.findIndex((item) => item.id == target);
        this.start(step);
      },
      [CustomActionMap.TOOLTIP_HIDE]: () => {
        this.Intro.exit();
      },
    };
  }

  async bindEvents(events?: Array<TooltipEvent>): Promise<void> {
    const triggerEvent = this.triggerEvent.bind(this);

    if (this.eventData.length) {
      this.unbindEvents();
    }

    this.Intro.oncomplete(() => postTooltip(api.tooltip, this.context));

    this.Intro.onbeforechange((target) => {
      let current;
      if (target.classList.contains('introjsFloatingElement')) {
        current = this.Intro._introItems.find((item) => item.element === target);
        if (current.position === TooltipPosition.FLOATING) {
          const { selector, position } = this.data.find((item) => item.id === current.id) || {};
          if (selector) {
            this.eventData.forEach((event) => {
              if (event.source == current.id) {
                const eventTarget = document.querySelector(event.target);
                eventTarget && eventTarget[event.trigger]();
              }
            });
            const node = document.querySelector(selector);
            if (node) {
              current.element = node;
              current.position = position;
            }
          }
        }
      } else {
        current = this.steps.find((step: TooltipStep) => step.element === target);
        if (current) {
          triggerEvent(CustomEventMap.TOOLTIP_VISIBLE, {
            detail: { current },
          });
        }
      }
    });

    this.Intro.onexit(this.unbindEvents.bind(this));

    this.eventData = events || (await getEvent(api.event, this.context));

    this.eventData.forEach(this.bindEvent.bind(this));

    Object.keys(this.customActions).forEach((eventType) => {
      this.registerEvent(document, eventType, this.customActions[eventType]);
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
      this.registerEvent(document, eventType, (data?: CustomEvent) => {
        if (data?.detail?.current.id == source) {
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

  triggerEvent(type: string, data?: any): void {
    setTimeout(() => document.dispatchEvent(new CustomEvent(type, data)), 0);
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

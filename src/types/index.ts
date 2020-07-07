export interface BaseTooltip {
  id: string;
  content: string;
  selector: string;
  sort: number;
}

export enum TooltipPosition {
  TOP = 'top',
  LEFT = 'left',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  BOTTOM_LEFT = 'bottom-left-aligned',
  BOTTOM_MIDDLE = 'bottom-middle-aligned',
  BOTTOM_RIGHT = 'bottom-right-aligned',
  AUTO = 'auto',
}

export interface TooltipContext {
  user?: string;
  host?: string;
  uri?: string;
}

export interface Tooltip extends BaseTooltip, TooltipContext {
  isVisible: boolean;
  position?: TooltipPosition;
}

export interface TooltipStep {
  id: string;
  element: HTMLElement;
  intro: string;
  position: TooltipPosition;
}

export enum DOMEventMap {
  CLICK = 'click',
}

export enum CustomEventMap {
  TOOLTIP_SHOW = 'tooltipshow',
  TOOLTIP_HIDE = 'tooltiphide',
  TOOLTIP_VISIBLE = 'tooltipvisible',
}

export interface TooltipEvent extends TooltipContext {
  id: string;
  eventType: DOMEventMap | CustomEventMap;
  source: string;
  trigger: DOMEventMap | CustomEventMap;
  target: string;
}

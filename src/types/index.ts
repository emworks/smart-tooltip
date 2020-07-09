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
  FLOATING = 'floating',
}

export interface TooltipContext {
  user?: string;
  host?: string;
  uri?: string;
}

export enum TooltipTrigger {
  AUTO = 'auto',
  MANUAL = 'manual',
}

export interface Tooltip extends BaseTooltip, TooltipContext {
  isVisible: boolean;
  position?: TooltipPosition;
  trigger?: TooltipTrigger;
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

export enum CustomActionMap {
  TOOLTIP_SHOW = 'tooltipshow',
  TOOLTIP_HIDE = 'tooltiphide',
}

export enum CustomEventMap {
  TOOLTIP_VISIBLE = 'tooltipvisible',
}

export interface TooltipEvent extends TooltipContext {
  id: string;
  eventType: DOMEventMap | CustomEventMap;
  source: string;
  trigger: DOMEventMap | CustomActionMap;
  target: string;
}

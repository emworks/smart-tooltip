export interface BaseTooltip {
  id: number;
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

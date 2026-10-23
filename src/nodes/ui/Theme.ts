/**
 * Theme & StyleBox system for ThreeDot UI
 */

export interface StyleBoxFlatOptions {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  cornerRadius?: number;
  contentMargins?: { left: number; top: number; right: number; bottom: number };
  shadowColor?: string;
  shadowBlur?: number;
}

export class StyleBoxFlat {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  cornerRadius: number;
  contentMargins: { left: number; top: number; right: number; bottom: number };
  shadowColor: string;
  shadowBlur: number;

  constructor(options?: StyleBoxFlatOptions) {
    this.backgroundColor = options?.backgroundColor ?? '#2a2b36';
    this.borderColor = options?.borderColor ?? '#3e4052';
    this.borderWidth = options?.borderWidth ?? 1;
    this.cornerRadius = options?.cornerRadius ?? 4;
    this.contentMargins = options?.contentMargins ?? { left: 8, top: 6, right: 8, bottom: 6 };
    this.shadowColor = options?.shadowColor ?? 'rgba(0, 0, 0, 0.2)';
    this.shadowBlur = options?.shadowBlur ?? 0;
  }

  applyTo(element: HTMLElement): void {
    element.style.backgroundColor = this.backgroundColor;
    element.style.borderColor = this.borderColor;
    element.style.borderWidth = `${this.borderWidth}px`;
    element.style.borderStyle = this.borderWidth > 0 ? 'solid' : 'none';
    element.style.borderRadius = `${this.cornerRadius}px`;
    element.style.padding = `${this.contentMargins.top}px ${this.contentMargins.right}px ${this.contentMargins.bottom}px ${this.contentMargins.left}px`;
    if (this.shadowBlur > 0) {
      element.style.boxShadow = `0 ${this.shadowBlur / 2}px ${this.shadowBlur}px ${this.shadowColor}`;
    } else {
      element.style.boxShadow = 'none';
    }
  }
}

export class StyleBoxEmpty {
  applyTo(element: HTMLElement): void {
    element.style.backgroundColor = 'transparent';
    element.style.borderColor = 'transparent';
    element.style.borderWidth = '0px';
    element.style.boxShadow = 'none';
  }
}

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  surface: string;
  surfaceVariant: string;
  background: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  border: string;
  borderFocus: string;
  success: string;
  warning: string;
  error: string;
}

export class Theme {
  colors: ThemeColors = {
    primary: '#4c6ef5',
    primaryHover: '#5c7cfa',
    primaryActive: '#3b5bdb',
    surface: '#252632',
    surfaceVariant: '#2f3142',
    background: '#1a1b26',
    text: '#eceff4',
    textSecondary: '#a0a6b8',
    textDisabled: '#5c637a',
    border: '#3b3e52',
    borderFocus: '#748ffc',
    success: '#51cf66',
    warning: '#fcc419',
    error: '#ff6b6b',
  };

  fontSize = 14;
  fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  panelStyle = new StyleBoxFlat({
    backgroundColor: '#252632',
    borderColor: '#3b3e52',
    borderWidth: 1,
    cornerRadius: 6,
    contentMargins: { left: 12, top: 12, right: 12, bottom: 12 },
  });

  buttonNormal = new StyleBoxFlat({
    backgroundColor: '#2f3142',
    borderColor: '#3b3e52',
    borderWidth: 1,
    cornerRadius: 4,
    contentMargins: { left: 12, top: 8, right: 12, bottom: 8 },
  });

  buttonHover = new StyleBoxFlat({
    backgroundColor: '#3b3e52',
    borderColor: '#4c6ef5',
    borderWidth: 1,
    cornerRadius: 4,
    contentMargins: { left: 12, top: 8, right: 12, bottom: 8 },
  });

  buttonPressed = new StyleBoxFlat({
    backgroundColor: '#20212c',
    borderColor: '#4c6ef5',
    borderWidth: 1,
    cornerRadius: 4,
    contentMargins: { left: 12, top: 8, right: 12, bottom: 8 },
  });
}

export const defaultTheme = new Theme();

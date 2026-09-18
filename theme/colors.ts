export interface ThemeColors {
  primaryStart: string;
  primaryEnd: string;

  text: string;
  textMuted: string;
  textFaint: string;

  // Text meant to sit directly on `background` (which is now the brand
  // purple), as opposed to `text`/`textMuted` which are tuned for the white
  // card surfaces (`surfaceElevated`) that still float on top of it.
  onBackground: string;
  onBackgroundMuted: string;

  // Translucent white shades for header/footer icons on `background`.
  onBackgroundIcon: string;
  onBackgroundIconMuted: string;

  background: string;
  inputBackground: string;
  surfaceMuted: string;
  surfaceElevated: string;

  border: string;

  cardGreen: string;
  cardGreenIcon: string;
  cardBlue: string;
  cardBlueIcon: string;
  cardOrange: string;
  cardOrangeIcon: string;
  cardRed: string;
  cardRedIcon: string;
  cardPurple: string;
  cardPurpleIcon: string;

  day: string;
  night: string;

  danger: string;
  success: string;

  logoNavy: string;
  logoRed: string;
  logoCyan: string;

  white: string;
  overlay: string;
  shadow: string;
  headerOverlay: string;
}

export const lightColors: ThemeColors = {
  primaryStart: '#2A6BF2',
  primaryEnd: '#12C7E0',

  text: '#232B3E',
  textMuted: '#8A93A6',
  textFaint: '#B7BECC',

  onBackground: '#FFFFFF',
  onBackgroundMuted: '#D6C9EF',

  onBackgroundIcon: 'rgba(255, 255, 255, 0.8)',
  onBackgroundIconMuted: 'rgba(255, 255, 255, 0.45)',

  background: '#5B2C8F',
  inputBackground: '#EDF1FA',
  surfaceMuted: '#F3F5FA',
  surfaceElevated: '#FFFFFF',

  border: '#E7EAF2',

  cardGreen: '#DCF6E3',
  cardGreenIcon: '#2FB86B',
  cardBlue: '#DCEAFC',
  cardBlueIcon: '#2A6BF2',
  cardOrange: '#FBE9CE',
  cardOrangeIcon: '#F0982E',
  cardRed: '#FBDFDF',
  cardRedIcon: '#EF4B4B',
  cardPurple: '#EDE3FB',
  cardPurpleIcon: '#7C5CFA',

  day: '#F0982E',
  night: '#232B3E',

  danger: '#EF4B4B',
  success: '#2FB86B',

  logoNavy: '#232B6B',
  logoRed: '#E63946',
  logoCyan: '#12C7E0',

  white: '#FFFFFF',
  overlay: 'rgba(20, 24, 40, 0.4)',
  shadow: '#1B2130',
  headerOverlay: 'rgba(255, 255, 255, 0.78)',
};

export const colors = lightColors;

export const gradients = {
  primary: [lightColors.primaryStart, lightColors.primaryEnd] as [string, string],
  // App-wide page backdrop, rendered once behind every screen.
  background: ['#5B2C8F', '#C724C7'] as [string, string],
  // Same coral-to-red gradient as the login page's card.
  accent: ['#F68D7E', '#DB4438'] as [string, string],
};

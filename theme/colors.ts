export const colors = {
  primaryStart: '#2A6BF2',
  primaryEnd: '#12C7E0',

  text: '#232B3E',
  textMuted: '#8A93A6',
  textFaint: '#B7BECC',

  background: '#FFFFFF',
  inputBackground: '#EDF1FA',
  surfaceMuted: '#F3F5FA',

  border: '#E7EAF2',

  cardGreen: '#DCF6E3',
  cardGreenIcon: '#2FB86B',
  cardBlue: '#DCEAFC',
  cardBlueIcon: '#2A6BF2',
  cardOrange: '#FBE9CE',
  cardOrangeIcon: '#F0982E',
  cardRed: '#FBDFDF',
  cardRedIcon: '#EF4B4B',

  day: '#F0982E',
  night: '#232B3E',

  danger: '#EF4B4B',
  success: '#2FB86B',

  logoNavy: '#232B6B',
  logoRed: '#E63946',
  logoCyan: '#12C7E0',

  white: '#FFFFFF',
} as const;

export const gradients = {
  primary: [colors.primaryStart, colors.primaryEnd] as const,
};

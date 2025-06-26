// themes.js - Theme configuration for Zynthra AI

// Light theme
export const lightTheme = {
  name: 'light',
  colors: {
    primary: '#6200EA', // Deep purple
    primaryVariant: '#3700B3',
    secondary: '#03DAC6', // Teal
    secondaryVariant: '#018786',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    error: '#B00020',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onBackground: '#000000',
    onSurface: '#000000',
    onError: '#FFFFFF',
    text: '#000000',
    textSecondary: '#757575',
    border: '#E0E0E0',
    cardBackground: '#F5F5F5',
    notification: '#FF3D00',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
    disabled: '#BDBDBD',
    divider: '#E0E0E0',
    // Zynthra brand gradient
    gradientStart: '#9C27B0', // Purple
    gradientEnd: '#2196F3', // Blue
  }
};

// Dark theme
export const darkTheme = {
  name: 'dark',
  colors: {
    primary: '#BB86FC', // Light purple
    primaryVariant: '#3700B3',
    secondary: '#03DAC6', // Teal
    secondaryVariant: '#03DAC6',
    background: '#121212',
    surface: '#121212',
    error: '#CF6679',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    onError: '#000000',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#2D2D2D',
    cardBackground: '#1E1E1E',
    notification: '#FF6E40',
    success: '#66BB6A',
    warning: '#FFD54F',
    info: '#42A5F5',
    disabled: '#757575',
    divider: '#2D2D2D',
    // Zynthra brand gradient
    gradientStart: '#9C27B0', // Purple
    gradientEnd: '#2196F3', // Blue
  }
};

// Get theme based on mode
export const getTheme = (mode) => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

const THEME_KEY = "expense-tracker-theme";

export const getTheme = () => {
  return localStorage.getItem(THEME_KEY) || "light";
};

export const setTheme = (theme) => {
  const isDark = theme === "dark";

  document.body.classList.toggle("dark-mode", isDark);
  document.body.classList.toggle("light-mode", !isDark);

  localStorage.setItem(THEME_KEY, theme);
};

export const toggleTheme = () => {
  const currentTheme = getTheme();
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  setTheme(newTheme);

  return newTheme;
};

export const initializeTheme = () => {
  const theme = getTheme();
  setTheme(theme);

  return theme;
};
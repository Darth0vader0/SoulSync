import { createContext, useState, useEffect, useContext } from "react";

// Create a Theme Context
const ThemeContext = createContext();

export const CustomThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Load theme from localStorage or default to system theme
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook for Theme
export const useTheme = () => useContext(ThemeContext);

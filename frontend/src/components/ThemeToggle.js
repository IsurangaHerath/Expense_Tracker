import { useEffect, useState } from "react";
import {
    getTheme,
    setTheme,
    initializeTheme,
} from "../utils/themeManager";
import "../styles/theme.css";

const ThemeToggle = () => {
    const [theme, setCurrentTheme] = useState(getTheme());

    useEffect(() => {
        const currentTheme = initializeTheme();
        setCurrentTheme(currentTheme);
    }, []);

    const handleToggle = () => {
        const newTheme = theme === "dark" ? "light" : "dark";

        setTheme(newTheme);
        setCurrentTheme(newTheme);
    };

    return (
        <button
            type="button"
            className="theme-toggle"
            onClick={handleToggle}
            title={
                theme === "dark"
                    ? "Switch to Light Mode"
                    : "Switch to Dark Mode"
            }
        >
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
    );
};

export default ThemeToggle;
"use client";

import { ThemeProvider, createTheme } from "@/node_modules/@mui/material/styles";
import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import CssBaseline from "@/node_modules/@mui/material/CssBaseline";

export default function MuiThemeProvider({ children }) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const muiTheme = useMemo(() => {
    const mode = mounted ? (resolvedTheme || theme) : "light";
    return createTheme({
      palette: {
        mode: mode === "dark" ? "dark" : "light",
        background: {
          default: mode === "dark" ? "#080808" : "#ffffff",
          paper: mode === "dark" ? "#080808" : "#ffffff",
        },
        slate: {
            400: '#94a3b8',
            800: '#1e293b',
        }
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            }
          }
        }
      }
    });
  }, [mounted, theme, resolvedTheme]);

  if (!mounted) return <div style={{ visibility: 'hidden' }}>{children}</div>;

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
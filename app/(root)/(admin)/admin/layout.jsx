
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Inter } from "next/font/google";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@/node_modules/@mui/material/styles";
import CssBaseline from "@/node_modules/@mui/material/CssBaseline";
import { AppSidebar } from "@/components/application/admin/Appsidebar";
import Topbar from "@/components/application/admin/Topbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

const COLORS = {
  light: {
    bg: "#ffffff",     
    paper: "#fafafa",  
    border: "#e4e4e7",
  },
  dark: {
    bg: "#09090b", 
    paper: "#121214",
    border: "#27272a",
  }
};

// import AdminWrapper from "@/components/application/admin/wrapperAdmin";


// export default function Layout({ children }) {
//   return <AdminWrapper>{children}</AdminWrapper>;
// }

function MuiThemeBridge({ children }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const theme = useMemo(() => {
    const isDark = resolvedTheme === "dark";
    return createTheme({
      palette: {
        mode: isDark ? "dark" : "light",
        primary: { main: "#f59e0b" }, // Amber 500
        background: {
          default: isDark ? COLORS.dark.bg : COLORS.light.bg,
          paper: isDark ? COLORS.dark.paper : COLORS.light.paper,
        },
        divider: isDark ? COLORS.dark.border : COLORS.light.border,
      },
      shape: { borderRadius: 12 },
      typography: { fontFamily: inter.style.fontFamily },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              border: `1px solid ${isDark ? COLORS.dark.border : COLORS.light.border}`,
            }
          }
        }
      }
    });
  }, [resolvedTheme]);

  if (!mounted) return <div className="invisible">{children}</div>;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}

export default function AdminLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60000, refetchOnWindowFocus: false } }
  }));

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200 transition-colors duration-300`}>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
              <MuiThemeBridge>
                <Toaster position="top-right" richColors theme={useTheme().resolvedTheme === 'dark' ? 'dark' : 'light'} />
                <SidebarProvider>
                  <div className="flex min-h-screen w-full bg-white dark:bg-zinc-950">
                    <AppSidebar />
                    <SidebarInset className="flex flex-col flex-1 min-w-0 bg-transparent">
                      <header className="sticky top-0 z-40 w-full bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/50">
                        <Topbar />
                      </header>
                      <main className="flex-1 p-4 md:p-6 lg:p-8">
                        <div className="mx-auto max-w-[1600px] animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out">
                          {children}
                        </div>
                      </main>
                    </SidebarInset>
                  </div>
                </SidebarProvider>
              </MuiThemeBridge>
            </NextThemesProvider>
          </Provider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
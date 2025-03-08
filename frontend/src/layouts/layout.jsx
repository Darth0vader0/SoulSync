import "./global.css"; // Ensure global styles are included
import { CustomThemeProvider } from "../components/main/ThemeProvider";
import { SidebarProvider } from "../components/ui/sidebar";

// ✅ Inter font via CDN (Google Fonts)
import "@fontsource/inter"; // Alternative: Use Google Fonts in index.html

const RootLayout = ({ children }) => {
  return (
    <CustomThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>{children}</SidebarProvider>
    </CustomThemeProvider>
  );
};

export default RootLayout;

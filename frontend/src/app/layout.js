import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/header";
import Footer from "../components/footer";
import AuthSessionProvider from "../components/SessionProvider";
import ClientShell from "../components/ClientShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Chingu Demographics App",
  description: "A Demographic visualization tool for Chingu Voyage Members",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {/* Everything that depends on auth stays inside the provider */}
        <AuthSessionProvider>
          <Header />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </AuthSessionProvider>

        {/* AI chat is outside auth, so it works for all visitors */}
        <ClientShell />
      </body>
    </html>
  );
}

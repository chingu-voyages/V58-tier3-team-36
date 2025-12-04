import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/header";
import Footer from "../components/footer";
import AuthSessionProvider from "../components/SessionProvider";

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
      <body
        className={inter.variable}
      >
        <AuthSessionProvider>
        <Header />
         <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
        <Footer />
        </AuthSessionProvider>
      </body>
    </html>
  );
}

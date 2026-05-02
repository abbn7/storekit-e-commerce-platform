import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
  noFooter?: boolean;
}

export default function Layout({ children, noFooter }: LayoutProps) {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdmin && <AnnouncementBar />}
      {!isAdmin && <Navbar />}
      <main className={`flex-1 ${!isAdmin ? "pt-[calc(40px+80px)]" : ""}`}>
        {children}
      </main>
      {!isAdmin && !noFooter && <Footer />}
    </div>
  );
}

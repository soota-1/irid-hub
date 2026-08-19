import { Outlet } from "react-router-dom";
import { useLenis } from "@/shared/hooks/useLenis";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function PublicLayout() {
  useLenis();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

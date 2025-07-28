"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Pages that should not have header/footer
  const excludeLayout: string[] = [
    // Auth pages now include header for easy navigation
    "/admin",
    "/vendor"
  ];
  
  // Check if current page should exclude layout
  const shouldExcludeLayout = excludeLayout.some(path => 
    pathname.startsWith(path)
  );
  
  if (shouldExcludeLayout) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <div className="w-full max-w-none mx-auto">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
} 
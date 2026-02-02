"use client";

import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun, Menu, X, Home, Leaf } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-lg border border-border/40 p-2 hover:bg-accent transition-all duration-300 hover:scale-110"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-foreground" />
      ) : (
        <Moon className="h-5 w-5 text-foreground" />
      )}
    </button>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-card/50 backdrop-blur-xl border-b border-border/40 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-primary group">
              <Leaf className="h-6 w-6 sm:h-7 sm:w-7 text-primary transition-transform group-hover:rotate-12" />
              <span className="hidden sm:inline">CarbonScope 360</span>
              <span className="sm:hidden">CS360</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              // onClick={(e) => {
              //   e.preventDefault();
              //   window.scrollTo({ top: 0, behavior: 'smooth' });
              // }}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register?tab=signup"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
            <ThemeToggle />
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetTitle className="text-left">Navigation Menu</SheetTitle>
                <nav className="flex flex-col gap-4 mt-8">
                  <Link
                    href="/"
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    Home
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register?tab=signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors text-center font-medium"
                  >
                    Get Started
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

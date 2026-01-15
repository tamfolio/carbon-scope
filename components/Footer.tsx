"use client";

import { useTheme } from "./ThemeProvider";
import { useState, useEffect } from "react";

export default function Footer() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer
      className="text-green-50 dark:text-foreground mt-auto"
      style={{
        background:
          mounted && theme === "dark"
            ? "hsl(222, 47%, 3%)"
            : "#14532d",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-4 text-white dark:text-foreground">CarbonScope 360</h3>
            <p className="text-green-100 dark:text-muted-foreground">
              Professional carbon accounting platform for enterprises and financial institutions.
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-semibold mb-4 text-white dark:text-foreground">Product</h4>
            <ul className="space-y-2 text-green-100 dark:text-muted-foreground">
              <li><a href="#features" className="hover:text-white dark:hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white dark:hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#api" className="hover:text-white dark:hover:text-foreground transition-colors">API</a></li>
              <li><a href="#integrations" className="hover:text-white dark:hover:text-foreground transition-colors">Integrations</a></li>
            </ul>
          </div>

          {/* Solutions Column */}
          <div>
            <h4 className="font-semibold mb-4 text-white dark:text-foreground">Solutions</h4>
            <ul className="space-y-2 text-green-100 dark:text-muted-foreground">
              <li><a href="#smes" className="hover:text-white dark:hover:text-foreground transition-colors">For SMEs</a></li>
              <li><a href="#banks" className="hover:text-white dark:hover:text-foreground transition-colors">For Banks</a></li>
              <li><a href="#consultants" className="hover:text-white dark:hover:text-foreground transition-colors">Consultants</a></li>
              <li><a href="#enterprise" className="hover:text-white dark:hover:text-foreground transition-colors">Enterprise</a></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold mb-4 text-white dark:text-foreground">Company</h4>
            <ul className="space-y-2 text-green-100 dark:text-muted-foreground">
              <li><a href="#about" className="hover:text-white dark:hover:text-foreground transition-colors">About</a></li>
              <li><a href="#blog" className="hover:text-white dark:hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#careers" className="hover:text-white dark:hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#contact" className="hover:text-white dark:hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section with Copyright and Legal Links */}
        <div className="border-t border-green-800 dark:border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-green-100 dark:text-muted-foreground text-sm">
            &copy; 2024 CarbonScope. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-green-100 dark:text-muted-foreground">
            <a href="#privacy" className="hover:text-white dark:hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white dark:hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#security" className="hover:text-white dark:hover:text-foreground transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}


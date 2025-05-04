
import React from 'react';
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn("bg-govuk-blue w-full py-6", className)}>
      <div className="govuk-width-container flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <h1 className="text-white text-xl font-bold">GOV.UK Code Generator</h1>
        </div>
        <nav>
          <ul className="flex flex-wrap gap-4 md:gap-6 text-white">
            <li>
              <a href="/" className="hover:underline focus:outline-none focus:bg-govuk-yellow focus:text-black px-1">
                Home
              </a>
            </li>
            <li>
              <a href="https://design-system.service.gov.uk/" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="hover:underline focus:outline-none focus:bg-govuk-yellow focus:text-black px-1">
                GOV.UK Design System
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

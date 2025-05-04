
import React from 'react';
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn("bg-govuk-light-grey border-t-2 border-govuk-blue py-8 mt-16", className)}>
      <div className="govuk-width-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="govuk-heading-m">GOV.UK Code Generator</h2>
            <p className="govuk-body">
              A tool for quickly generating HTML that follows the GOV.UK Design System.
            </p>
          </div>
          <div>
            <h2 className="govuk-heading-m">Resources</h2>
            <ul className="list-none">
              <li className="mb-2">
                <a 
                  href="https://design-system.service.gov.uk/" 
                  className="govuk-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GOV.UK Design System
                </a>
              </li>
              <li className="mb-2">
                <a 
                  href="https://www.gov.uk/service-manual" 
                  className="govuk-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Service Manual
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="govuk-heading-m">About</h2>
            <p className="govuk-body">
              This is an internal tool for design teams to quickly generate code samples.
            </p>
          </div>
        </div>
        <p className="govuk-body mt-8 text-center text-govuk-dark-grey">
          Built for internal use only
        </p>
      </div>
    </footer>
  );
};

export default Footer;

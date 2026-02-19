import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <a href="mailto:customer.service@shrinkandsend.com" className="hover:text-foreground transition-colors">
              customer.service@shrinkandsend.com
            </a>
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Shrink &amp; Send. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

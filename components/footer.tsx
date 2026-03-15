import { APP_NAME } from "@/lib/constants";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="wrapper py-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 text-sm">
          <Link href="/about-us" className="hover:underline">
            About Us
          </Link>
          <Link href="/contact-us" className="hover:underline">
            Contact Us
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          {currentYear} {APP_NAME}. All Rights Reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;

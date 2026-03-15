import { APP_NAME } from "@/lib/constants";
import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
};

const ContactUsPage = () => {
  const contactDetails = [
    {
      title: "Email Support",
      value: "support@naturilief.com",
      href: "mailto:support@naturilief.com",
      icon: Mail,
    },
    {
      title: "Call Us",
      value: "+94 70 000 0000",
      href: "tel:+94700000000",
      icon: Phone,
    },
    {
      title: "Business Hours",
      value: "Monday to Saturday, 9:00 AM to 6:00 PM",
      icon: Clock3,
    },
    {
      title: "Location",
      value: "Colombo, Sri Lanka",
      icon: MapPin,
    },
  ];

  return (
    <section className="py-10 md:py-14 space-y-8 md:space-y-10">
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-amber-50/80 via-background to-background p-6 md:p-10">
        <div className="absolute -left-16 -bottom-20 h-52 w-52 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="relative max-w-3xl space-y-4">
          <Badge variant="secondary" className="px-3 py-1">
            Contact {APP_NAME}
          </Badge>
          <h1 className="h1-bold">We are here to help.</h1>
          <p className="text-muted-foreground leading-7">
            Questions about products, orders, or delivery? Reach out and our
            team will respond as quickly as possible.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link href="mailto:support@naturilief.com">Email Support</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="tel:+94700000000">Call Us</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {contactDetails.map((item) => (
          <article key={item.title} className="rounded-2xl border p-5">
            <item.icon className="h-5 w-5 text-amber-700" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              {item.title}
            </p>
            {item.href ? (
              <Link href={item.href} className="mt-1 block font-semibold hover:underline">
                {item.value}
              </Link>
            ) : (
              <p className="mt-1 font-semibold">{item.value}</p>
            )}
          </article>
        ))}
      </div>

      <div className="rounded-2xl border p-6 md:p-8">
        <h2 className="h3-bold">Response Time</h2>
        <p className="mt-3 text-muted-foreground leading-7">
          We usually reply to email inquiries within one business day. For
          urgent order issues, phone support is the fastest option during
          business hours.
        </p>
      </div>
    </section>
  );
};

export default ContactUsPage;

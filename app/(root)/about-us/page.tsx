import { APP_NAME } from "@/lib/constants";
import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
};

const AboutUsPage = () => {
  const highlights = [
    {
      title: "Natural-First Curation",
      description:
        "Every product is selected with a focus on ingredient quality, safety, and practical wellness value.",
      icon: Leaf,
    },
    {
      title: "Trusted Quality",
      description:
        "We work to maintain clear product information and a shopping experience that feels reliable at every step.",
      icon: ShieldCheck,
    },
    {
      title: "Simple Experience",
      description:
        "From search to checkout, our store is designed to be fast, clean, and easy to use on any device.",
      icon: Sparkles,
    },
  ];

  return (
    <section className="py-10 md:py-14 space-y-8 md:space-y-10">
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-emerald-50/80 via-background to-background p-6 md:p-10">
        <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="relative max-w-3xl space-y-4">
          <Badge variant="secondary" className="px-3 py-1">
            About {APP_NAME}
          </Badge>
          <h1 className="h1-bold">Natural wellness, curated with care.</h1>
          <p className="text-muted-foreground leading-7">
            {APP_NAME} is built for people who want cleaner, thoughtful
            products without the noise. We focus on practical choices for
            everyday health and comfort.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link href="/search">Explore Products</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact-us">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article key={item.title} className="rounded-2xl border p-5">
            <item.icon className="h-5 w-5 text-emerald-700" />
            <h2 className="mt-3 text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border p-6 md:p-8">
        <h2 className="h3-bold">What We Stand For</h2>
        <p className="mt-3 text-muted-foreground leading-7">
          We believe healthier shopping should feel clear and confident. That is
          why we keep our product selection intentional, our service responsive,
          and our platform simple to navigate.
        </p>
      </div>
    </section>
  );
};

export default AboutUsPage;

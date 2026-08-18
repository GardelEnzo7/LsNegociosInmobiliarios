import { Hero } from "@/components/site/hero";
import { FeaturedProperties } from "@/components/site/featured-properties";
import { Services } from "@/components/site/services";
import { OwnerShowcase } from "@/components/site/owner-showcase";
import { CtaBand } from "@/components/site/cta-band";
import { ContactSection } from "@/components/site/contact-section";
import { getFeaturedProperties, getNeighborhoods, getPriceRangesByCurrency } from "@/lib/data/properties";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [neighborhoods, featured, priceRanges] = await Promise.all([
    getNeighborhoods(),
    getFeaturedProperties(),
    getPriceRangesByCurrency(),
  ]);

  return (
    <>
      <Hero neighborhoods={neighborhoods} priceRanges={priceRanges} />
      <FeaturedProperties properties={featured} />
      <Services />
      <OwnerShowcase />
      <CtaBand />
      <ContactSection />
    </>
  );
}
import type { Metadata } from "next";

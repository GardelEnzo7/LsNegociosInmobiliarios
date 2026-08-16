import { Hero } from "@/components/site/hero";
import { FeaturedProperties } from "@/components/site/featured-properties";
import { Services } from "@/components/site/services";
import { OwnerShowcase } from "@/components/site/owner-showcase";
import { CtaBand } from "@/components/site/cta-band";
import { Testimonials } from "@/components/site/testimonials";
import { ContactSection } from "@/components/site/contact-section";
import { getFeaturedProperties, getNeighborhoods } from "@/lib/data/properties";

export default async function HomePage() {
  const [neighborhoods, featured] = await Promise.all([
    getNeighborhoods(),
    getFeaturedProperties(),
  ]);

  return (
    <>
      <Hero neighborhoods={neighborhoods} />
      <FeaturedProperties properties={featured} />
      <Services />
      <OwnerShowcase />
      <CtaBand />
      <Testimonials />
      <ContactSection />
    </>
  );
}

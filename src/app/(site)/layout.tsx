import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { WhatsappButton } from "@/components/site/whatsapp-button";
import { ClarityAnalytics } from "@/components/site/clarity-analytics";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClarityAnalytics />
      <Nav />
      <main className="pt-20">{children}</main>
      <Footer />
      <WhatsappButton />
    </>
  );
}

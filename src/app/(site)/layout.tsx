import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { WhatsappButton } from "@/components/site/whatsapp-button";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="pt-20">{children}</main>
      <Footer />
      <WhatsappButton />
    </>
  );
}

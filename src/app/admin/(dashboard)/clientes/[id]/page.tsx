import { notFound } from "next/navigation";
import { ContactDetail } from "@/components/admin/contact-detail";
import { getContactById, getVisitsForContact, getActivityForEntity } from "@/lib/data/admin";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await getContactById(id);
  if (!contact) notFound();

  const [visits, activity] = await Promise.all([
    getVisitsForContact(id),
    getActivityForEntity("contact", id),
  ]);

  return <ContactDetail contact={contact} visits={visits} activity={activity} />;
}

import { notFound } from "next/navigation";
import { ContactDetail } from "@/components/admin/contact-detail";
import {
  getContactById,
  getInquiriesForContact,
  getVisitsForContact,
  getActivityForEntity,
} from "@/lib/data/admin";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await getContactById(id);
  if (!contact) notFound();

  const [inquiries, visits, activity] = await Promise.all([
    getInquiriesForContact(id),
    getVisitsForContact(id),
    getActivityForEntity("contact", id),
  ]);

  return <ContactDetail contact={contact} inquiries={inquiries} visits={visits} activity={activity} />;
}

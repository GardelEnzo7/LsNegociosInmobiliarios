import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getPublishedPropertySlugs } from "@/lib/data/properties";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await getPublishedPropertySlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/propiedades`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/servicios`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/nosotros`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contacto`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const propertyRoutes: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${SITE_URL}/propiedades/${property.slug}`,
    lastModified: new Date(property.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...propertyRoutes];
}

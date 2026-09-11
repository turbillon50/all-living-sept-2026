export const SERVICE_CATEGORIES = [
  { slug: "concierge", label: "Concierge", photo: "/demo/villa-interior-sm.webp" },
  { slug: "transport", label: "Transporte", photo: "/demo/city-sm.webp" },
  { slug: "yachts", label: "Yates", photo: "/demo/yacht-sm.webp" },
  { slug: "chefs", label: "Chefs", photo: "/demo/chef-sm.webp" },
  { slug: "housekeeping", label: "Housekeeping", photo: "/demo/villa-facade-sm.webp" },
  { slug: "maintenance", label: "Mantenimiento", photo: "/demo/villa-pool-sm.webp" },
  { slug: "childcare", label: "Niñeras", photo: "/demo/breakfast-sm.webp" },
  { slug: "wellness", label: "Wellness", photo: "/demo/wellness-sm.webp" },
  { slug: "massage", label: "Masajes", photo: "/demo/wellness-sm.webp" },
  { slug: "personal_trainer", label: "Personal trainer", photo: "/demo/sand-dunes-sm.webp" },
  { slug: "beach_clubs", label: "Beach clubs", photo: "/demo/tulum-sea-sm.webp" },
  { slug: "tours", label: "Tours", photo: "/demo/cenote-sm.webp" },
  { slug: "experiences", label: "Experiencias", photo: "/demo/sunset-sm.webp" },
  { slug: "golf", label: "Golf", photo: "/demo/mountain-sm.webp" },
  { slug: "car_rental", label: "Renta de autos", photo: "/demo/city-sm.webp" },
  { slug: "grocery", label: "Grocery", photo: "/demo/breakfast-sm.webp" },
  { slug: "photography", label: "Fotografía", photo: "/demo/palms-sm.webp" },
  { slug: "events", label: "Eventos", photo: "/demo/sunset-sm.webp" },
  { slug: "security", label: "Seguridad", photo: "/demo/villa-facade-sm.webp" },
  { slug: "other", label: "Otros", photo: "/demo/sand-dunes-sm.webp" },
] as const;

export type ServiceCategorySlug = (typeof SERVICE_CATEGORIES)[number]["slug"];

export function categoryBySlug(slug: string) {
  return SERVICE_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

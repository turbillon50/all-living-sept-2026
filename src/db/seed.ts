/**
 * SEED DEMO — datos coherentes para desarrollo y demostración.
 * Todo lo sembrado lleva is_demo=true y se identifica como demo en la app.
 * Nunca presenta pagos, reseñas ni rendimientos como reales.
 *
 *   pnpm db:seed
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL requerida");
const db = drizzle(neon(url), { schema, casing: "snake_case" });

const DEMO_CLERK_ID = "demo_luis_garcia";
const DEMO_EMAIL = "luis.garcia.demo@allliving.local";

async function main() {
  console.log("Seed DEMO → empieza");

  // --- Usuario DEMO: Luis García ---
  const [user] = await db
    .insert(schema.users)
    .values({ clerkId: DEMO_CLERK_ID, email: DEMO_EMAIL, name: "Luis García", locale: "es-MX", activeContext: "owner", isDemo: true })
    .onConflictDoUpdate({ target: schema.users.clerkId, set: { name: "Luis García" } })
    .returning();
  if (!user) throw new Error("usuario demo");
  await db
    .insert(schema.userProfiles)
    .values({
      userId: user.id,
      memberId: "AL-DEMO0001",
      languages: ["es", "en"],
      interests: ["playa", "gastronomia", "wellness", "familia"],
      onboardingCompletedAt: new Date(),
      phone: null,
    })
    .onConflictDoNothing();
  for (const role of ["owner", "guest", "provider"] as const) {
    await db.insert(schema.userRoles).values({ userId: user.id, role }).onConflictDoNothing();
  }

  // --- Proveedores DEMO (usuarios propietarios de cada proveedor) ---
  async function demoUser(clerkId: string, email: string, name: string) {
    const [u] = await db
      .insert(schema.users)
      .values({ clerkId, email, name, isDemo: true, activeContext: "provider" })
      .onConflictDoUpdate({ target: schema.users.clerkId, set: { name } })
      .returning();
    if (!u) throw new Error(name);
    await db.insert(schema.userProfiles).values({ userId: u.id, memberId: `AL-${clerkId.slice(-8).toUpperCase()}` }).onConflictDoNothing();
    await db.insert(schema.userRoles).values({ userId: u.id, role: "provider" }).onConflictDoNothing();
    return u;
  }

  // --- Propiedad: Casa Mar · Tulum ---
  const [casaMar] = await db
    .insert(schema.properties)
    .values({
      slug: "casa-mar-tulum",
      name: "Casa Mar",
      destination: "Tulum",
      city: "Tulum",
      country: "MX",
      lat: "20.2114",
      lng: "-87.4654",
      description:
        "Villa de tres recámaras entre la selva y el mar, a cuatro minutos de la playa. Alberca privada, terraza de lectura y cocina abierta para chef.",
      amenities: ["Alberca privada", "Terraza", "Cocina para chef", "Aire acondicionado", "Wi-Fi", "Estacionamiento", "Servicio de limpieza"],
      rules: ["Sin fiestas", "Mascotas con aviso previo", "Check-in desde 15:00", "Check-out hasta 11:00"],
      bedrooms: 3,
      bathrooms: 3,
      maxGuests: 6,
      isDemo: true,
    })
    .onConflictDoUpdate({ target: schema.properties.slug, set: { name: "Casa Mar" } })
    .returning();
  if (!casaMar) throw new Error("casa mar");

  const existingMedia = await db.query.propertyMedia.findMany({ where: eq(schema.propertyMedia.propertyId, casaMar.id) });
  if (existingMedia.length === 0) {
    const photos: Array<[string, string, boolean]> = [
      ["/demo/villa-pool.webp", "Alberca privada de Casa Mar al atardecer", true],
      ["/demo/villa-facade.webp", "Fachada de Casa Mar entre el jardín", false],
      ["/demo/villa-interior.webp", "Sala de Casa Mar con vista a la selva", false],
      ["/demo/tulum-sea.webp", "Mar Caribe frente a Tulum", false],
      ["/demo/breakfast.webp", "Desayuno en la terraza", false],
      ["/demo/palms.webp", "Palmeras del jardín", false],
    ];
    await db.insert(schema.propertyMedia).values(
      photos.map(([url, alt, isCover], i) => ({ propertyId: casaMar.id, url, alt, isCover, sortOrder: i, width: 1600, height: 1067 })),
    );
  }

  // Segunda propiedad para Explore (sin fracción del usuario demo)
  await db
    .insert(schema.properties)
    .values({
      slug: "casa-niebla-valle",
      name: "Casa Niebla",
      destination: "Valle de Bravo",
      city: "Valle de Bravo",
      description: "Casa de montaña con chimenea y vista al lago. Silencio, niebla y café de la región.",
      amenities: ["Chimenea", "Vista al lago", "Terraza", "Wi-Fi"],
      bedrooms: 4,
      bathrooms: 3,
      maxGuests: 8,
      isDemo: true,
    })
    .onConflictDoNothing();
  const casaNiebla = await db.query.properties.findFirst({ where: eq(schema.properties.slug, "casa-niebla-valle") });
  if (casaNiebla) {
    const m = await db.query.propertyMedia.findMany({ where: eq(schema.propertyMedia.propertyId, casaNiebla.id) });
    if (m.length === 0) {
      await db.insert(schema.propertyMedia).values([
        { propertyId: casaNiebla.id, url: "/demo/mountain.webp", alt: "Montañas con niebla al amanecer", isCover: true, sortOrder: 0, width: 1600, height: 1067 },
      ]);
    }
  }

  // --- Fracción F07 y titularidad ---
  const [f07] = await db
    .insert(schema.fractions)
    .values({ propertyId: casaMar.id, code: "F07", totalWeeks: 3, isDemo: true })
    .onConflictDoUpdate({ target: [schema.fractions.propertyId, schema.fractions.code], set: { totalWeeks: 3 } })
    .returning();
  if (!f07) throw new Error("f07");
  const own = await db.query.fractionOwnerships.findFirst({ where: eq(schema.fractionOwnerships.fractionId, f07.id) });
  if (!own) {
    await db.insert(schema.fractionOwnerships).values({ fractionId: f07.id, ownerUserId: user.id, source: "seed_demo" });
  }

  // --- Tres semanas: alta / puente / baja ---
  const weeks = [
    { year: 2026, weekNumber: 52, startDate: "2026-12-20", endDate: "2026-12-27", season: "alta" as const, status: "reserved_owner" as const },
    { year: 2027, weekNumber: 10, startDate: "2027-03-08", endDate: "2027-03-15", season: "puente" as const, status: "released_for_rent" as const },
    { year: 2027, weekNumber: 36, startDate: "2027-09-06", endDate: "2027-09-13", season: "baja" as const, status: "available" as const },
  ];
  const weekRows: Array<typeof schema.fractionWeeks.$inferSelect> = [];
  for (const w of weeks) {
    const [row] = await db
      .insert(schema.fractionWeeks)
      .values({ fractionId: f07.id, ...w })
      .onConflictDoUpdate({ target: [schema.fractionWeeks.fractionId, schema.fractionWeeks.startDate], set: { season: w.season } })
      .returning();
    if (row) weekRows.push(row);
  }
  const [alta, puente] = weekRows;
  if (!alta || !puente) throw new Error("semanas");

  // Semana alta: estancia próxima (20–27 dic) con anfitrión
  let stay = await db.query.stays.findFirst({ where: eq(schema.stays.fractionWeekId, alta.id) });
  if (!stay) {
    const [s] = await db
      .insert(schema.stays)
      .values({
        fractionWeekId: alta.id,
        propertyId: casaMar.id,
        hostUserId: user.id,
        startDate: alta.startDate,
        endDate: alta.endDate,
        status: "upcoming",
        guestsCount: 4,
        arrivalTime: "16:30",
        arrivalMode: "vuelo",
        preparation: { grocery: true, chef: true, crib: false },
      })
      .returning();
    stay = s;
    if (stay) {
      await db.insert(schema.stayGuests).values([
        { stayId: stay.id, userId: user.id, name: "Luis García", role: "host", status: "accepted" },
        { stayId: stay.id, name: "María García", email: "maria.demo@allliving.local", role: "guest", status: "accepted", invitedBy: user.id, permissions: { can_view_access: true, can_book_services: true } },
        { stayId: stay.id, name: "Sofía García", role: "guest", status: "invited", invitedBy: user.id, permissions: { can_view_access: true, can_book_services: false } },
      ]);
    }
  }

  // Semana puente: liberada para renta (inventario, estimación marcada)
  const inv = await db.query.rentalInventory.findFirst({ where: eq(schema.rentalInventory.fractionWeekId, puente.id) });
  if (!inv) {
    await db.insert(schema.rentalInventory).values({
      fractionWeekId: puente.id,
      ownerUserId: user.id,
      nightlyRateEstimate: "9800",
      currency: "MXN",
      commissionPct: "20",
      minNights: 7,
      cancellationPolicy: "Flexible hasta 14 días antes",
      status: "released",
      isDemo: true,
    });
  }

  // --- Proveedores: yate, chef, transporte, wellness (aprobados, DEMO, sin reseñas) ---
  const providersSeed = [
    {
      clerk: "demo_prov_azul", email: "azul.demo@allliving.local", owner: "Azul Yachts", slug: "azul-yachts", kind: "company" as const,
      cat: "yachts" as const, logo: "/demo/yacht-sm.webp", gallery: ["/demo/yacht.webp", "/demo/tulum-sea.webp"],
      desc: "Yates de 45 a 70 pies con capitán y tripulación. Salidas desde Puerto Aventuras y Tulum.",
      services: [
        { name: "Día de yate · 6 horas", priceFrom: "38000", unit: "salida", durationMin: 360, maxPeople: 10, cover: "/demo/yacht.webp", options: [{ key: "chef", label: "Chef a bordo", price: 6500 }, { key: "snorkel", label: "Equipo de snorkel", price: 0 }] },
        { name: "Atardecer en catamarán", priceFrom: "22000", unit: "salida", durationMin: 180, maxPeople: 12, cover: "/demo/sunset.webp", options: [] },
      ],
    },
    {
      clerk: "demo_prov_ana", email: "ana.demo@allliving.local", owner: "Chef Ana Ruiz", slug: "chef-ana-ruiz", kind: "person" as const,
      cat: "chefs" as const, logo: "/demo/chef-sm.webp", gallery: ["/demo/chef.webp", "/demo/breakfast.webp"],
      desc: "Cocina de la península con producto del día. Cenas privadas, desayunos y menús para toda la estancia.",
      services: [
        { name: "Cena privada · 4 tiempos", priceFrom: "2400", unit: "persona", durationMin: 180, maxPeople: 12, cover: "/demo/chef.webp", options: [{ key: "maridaje", label: "Maridaje", price: 900 }] },
        { name: "Desayuno de bienvenida", priceFrom: "650", unit: "persona", durationMin: 90, maxPeople: 8, cover: "/demo/breakfast.webp", options: [] },
      ],
    },
    {
      clerk: "demo_prov_caribe", email: "caribe.demo@allliving.local", owner: "Caribe Transfers", slug: "caribe-transfers", kind: "company" as const,
      cat: "transport" as const, logo: "/demo/city-sm.webp", gallery: ["/demo/city.webp"],
      desc: "Traslados privados aeropuerto Cancún y Tulum, choferes bilingües, sillas para niños sin costo.",
      services: [
        { name: "Aeropuerto Cancún → Tulum", priceFrom: "3200", unit: "trayecto", durationMin: 110, maxPeople: 6, cover: "/demo/city.webp", options: [{ key: "silla", label: "Silla infantil", price: 0 }] },
        { name: "Chofer por día", priceFrom: "6500", unit: "día", durationMin: 480, maxPeople: 6, cover: "/demo/city.webp", options: [] },
      ],
    },
    {
      clerk: "demo_prov_sana", email: "sana.demo@allliving.local", owner: "Sana Wellness", slug: "sana-wellness", kind: "company" as const,
      cat: "wellness" as const, logo: "/demo/wellness-sm.webp", gallery: ["/demo/wellness.webp", "/demo/cenote.webp"],
      desc: "Masajes, temazcal y yoga en tu villa. Terapeutas certificadas.",
      services: [
        { name: "Masaje en villa · 60 min", priceFrom: "1900", unit: "persona", durationMin: 60, maxPeople: 4, cover: "/demo/wellness.webp", options: [{ key: "90", label: "Extender a 90 min", price: 800 }] },
        { name: "Yoga al amanecer", priceFrom: "1400", unit: "sesión", durationMin: 60, maxPeople: 6, cover: "/demo/cenote.webp", options: [] },
      ],
    },
  ];

  const providerIds: Record<string, { providerId: string; serviceIds: string[] }> = {};
  for (const p of providersSeed) {
    const pu = await demoUser(p.clerk, p.email, p.owner);
    const [prov] = await db
      .insert(schema.providers)
      .values({
        userId: pu.id,
        kind: p.kind,
        businessName: p.owner,
        slug: p.slug,
        primaryCategory: p.cat,
        description: p.desc,
        logoUrl: p.logo,
        gallery: p.gallery,
        status: "approved",
        verifiedAt: new Date(),
        contactEmail: p.email,
        isDemo: true,
      })
      .onConflictDoUpdate({ target: schema.providers.slug, set: { description: p.desc, gallery: p.gallery } })
      .returning();
    if (!prov) continue;
    await db.insert(schema.providerServiceAreas).values({ providerId: prov.id, destination: "Tulum" }).onConflictDoNothing();
    const existing = await db.query.providerServices.findMany({ where: eq(schema.providerServices.providerId, prov.id) });
    const serviceIds = existing.map((s) => s.id);
    if (existing.length === 0) {
      const inserted = await db
        .insert(schema.providerServices)
        .values(
          p.services.map((s) => ({
            providerId: prov.id,
            category: p.cat,
            name: s.name,
            priceFrom: s.priceFrom,
            currency: "MXN",
            unit: s.unit,
            durationMin: s.durationMin,
            maxPeople: s.maxPeople,
            options: s.options,
            coverUrl: s.cover,
            cancellationPolicy: "Cancelación sin costo hasta 48 h antes.",
          })),
        )
        .returning({ id: schema.providerServices.id });
      serviceIds.push(...inserted.map((r) => r.id));
    }
    providerIds[p.slug] = { providerId: prov.id, serviceIds };
  }

  // El usuario demo también es proveedor (para probar el cambio de modo): transporte privado.
  const [luisProv] = await db
    .insert(schema.providers)
    .values({
      userId: user.id,
      kind: "person",
      businessName: "Luis · Transporte privado",
      slug: "luis-transporte",
      primaryCategory: "transport",
      description: "Traslados privados en la Riviera Maya. Perfil DEMO del usuario de prueba.",
      logoUrl: "/demo/city-sm.webp",
      status: "approved",
      verifiedAt: new Date(),
      isDemo: true,
    })
    .onConflictDoUpdate({ target: schema.providers.slug, set: { status: "approved" } })
    .returning();

  // --- Bookings ligados a la estancia (timeline) ---
  if (stay && providerIds["chef-ana-ruiz"] && providerIds["caribe-transfers"]) {
    const has = await db.query.serviceBookings.findFirst({ where: eq(schema.serviceBookings.stayId, stay.id) });
    if (!has) {
      const chef = providerIds["chef-ana-ruiz"];
      const tr = providerIds["caribe-transfers"];
      const chefService = chef.serviceIds[0];
      const trService = tr.serviceIds[0];
      if (chefService && trService) {
        const rows = await db
          .insert(schema.serviceBookings)
          .values([
            { serviceId: trService, providerId: tr.providerId, requesterUserId: user.id, stayId: stay.id, propertyId: casaMar.id, scheduledAt: new Date("2026-12-20T18:00:00-06:00"), people: 4, subtotal: "3200", fees: "0", total: "3200", status: "confirmed", isDemo: true },
            { serviceId: chefService, providerId: chef.providerId, requesterUserId: user.id, stayId: stay.id, propertyId: casaMar.id, scheduledAt: new Date("2026-12-21T20:00:00-06:00"), people: 4, subtotal: "9600", fees: "0", total: "9600", status: "pending_provider", isDemo: true },
          ])
          .returning({ id: schema.serviceBookings.id, status: schema.serviceBookings.status });
        for (const r of rows) {
          await db.insert(schema.bookingStatusHistory).values({ bookingId: r.id, fromStatus: null, toStatus: "requested", actorUserId: user.id });
          if (r.status !== "requested") await db.insert(schema.bookingStatusHistory).values({ bookingId: r.id, fromStatus: "requested", toStatus: r.status, actorUserId: null, note: "seed" });
        }
      }
    }
    // Jobs para el modo proveedor del usuario demo
    if (luisProv) {
      const svc = await db.query.providerServices.findFirst({ where: eq(schema.providerServices.providerId, luisProv.id) });
      let svcId = svc?.id;
      if (!svcId) {
        const [s] = await db
          .insert(schema.providerServices)
          .values({ providerId: luisProv.id, category: "transport", name: "Traslado privado", priceFrom: "2800", unit: "trayecto", durationMin: 90, maxPeople: 4, coverUrl: "/demo/city.webp" })
          .returning({ id: schema.providerServices.id });
        svcId = s?.id;
      }
      const jobs = await db.query.serviceBookings.findMany({ where: eq(schema.serviceBookings.providerId, luisProv.id) });
      if (jobs.length === 0 && svcId) {
        const guestUser = await demoUser("demo_guest_carla", "carla.demo@allliving.local", "Carla Méndez");
        const today = new Date();
        const at = (h: number, dPlus = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + dPlus, h, 0);
        await db.insert(schema.serviceBookings).values([
          { serviceId: svcId, providerId: luisProv.id, requesterUserId: guestUser.id, propertyId: casaMar.id, scheduledAt: at(10), people: 2, subtotal: "2800", fees: "0", total: "2800", status: "requested", isDemo: true, notes: "Recoger en Aldea Zamá" },
          { serviceId: svcId, providerId: luisProv.id, requesterUserId: guestUser.id, propertyId: casaMar.id, scheduledAt: at(14, 0), people: 3, subtotal: "2800", fees: "0", total: "2800", status: "confirmed", isDemo: true, notes: "Aeropuerto Cancún, vuelo AM 512" },
          { serviceId: svcId, providerId: luisProv.id, requesterUserId: guestUser.id, propertyId: casaMar.id, scheduledAt: at(18, 1), people: 2, subtotal: "2800", fees: "0", total: "2800", status: "confirmed", isDemo: true },
        ]);
      }
    }
  }

  // --- Ingresos: estimado (semana liberada) y nada pagado ---
  const inc = await db.query.incomeEntries.findMany({ where: eq(schema.incomeEntries.ownerUserId, user.id) });
  if (inc.length === 0) {
    await db.insert(schema.incomeEntries).values({
      ownerUserId: user.id,
      propertyId: casaMar.id,
      fractionId: f07.id,
      source: "rental",
      description: "Semana puente 8–15 mar · estimación de renta",
      amount: "54880",
      currency: "MXN",
      periodStart: "2027-03-08",
      periodEnd: "2027-03-15",
      status: "estimated",
      isDemo: true,
    });
  }

  // --- Notificaciones ---
  const notes = await db.query.notifications.findMany({ where: eq(schema.notifications.userId, user.id) });
  if (notes.length === 0) {
    await db.insert(schema.notifications).values([
      { userId: user.id, type: "service", title: "Tu traslado fue confirmado", body: "Caribe Transfers te recoge el 20 de diciembre a las 18:00.", deepLink: stay ? `/stays/${stay.id}` : "/stays" },
      { userId: user.id, type: "stay", title: "María aceptó tu invitación", body: "Ya forma parte de tu estancia en Casa Mar.", deepLink: stay ? `/stays/${stay.id}/guests` : "/stays" },
      { userId: user.id, type: "booking", title: "Tu semana puente está liberada", body: "8–15 de marzo. Cuando haya un canal conectado, la publicaremos.", deepLink: "/weeks" },
    ]);
  }

  console.log("Seed DEMO → listo", { user: user.email, property: casaMar.name, fraction: f07.code, weeks: weekRows.length });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

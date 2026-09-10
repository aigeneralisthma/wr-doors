/**
 * Seed the database with baseline content.
 *
 *   pnpm db:seed
 *
 * Ports the old Supabase seed files:
 *   - supabase/seed/0001_seed.sql          (8 products, 6 projects, 10 settings)
 *   - supabase/seed/0002_seed_technicians.sql (3 technicians)
 *
 * Idempotent — every insert uses ON CONFLICT DO NOTHING, so re-running is
 * safe and never clobbers admin edits.
 *
 * Uses the DIRECT (unpooled) connection.
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../lib/db/schema";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error("❌ Set DATABASE_URL_UNPOOLED (or DATABASE_URL) in .env.local");
  process.exit(1);
}

const client = postgres(url, { max: 1 });
const db = drizzle(client, { schema });

const IMG = (p: string) => [`/assets/products/${p}`];

/** Product spec rows — ported from supabase/migrations/0002_add_product_specs.sql */
const SPECS: Record<string, schema.ProductSpec[]> = {
  "modern-wpc-interior": [
    { label_en: "Material", label_ar: "المادة", value_en: "WPC Composite", value_ar: "مركب WPC" },
    { label_en: "Door Type", label_ar: "نوع الباب", value_en: "Interior", value_ar: "داخلي" },
    { label_en: "Standard Size", label_ar: "المقاس القياسي", value_en: "900 × 2100 mm", value_ar: "900 × 2100 ملم" },
    { label_en: "Thickness", label_ar: "السماكة", value_en: "35 mm", value_ar: "35 ملم" },
    { label_en: "Core", label_ar: "النواة", value_en: "Hollow acoustic core", value_ar: "نواة مجوفة عازلة للصوت" },
    { label_en: "Finish Options", label_ar: "خيارات التشطيب", value_en: "20+ colours / veneer", value_ar: "أكثر من 20 لون وقشرة" },
    { label_en: "Delivery", label_ar: "موعد التسليم", value_en: "7–14 working days", value_ar: "7–14 يوم عمل" },
  ],
  "waterproof-bathroom-wpc": [
    { label_en: "Material", label_ar: "المادة", value_en: "Waterproof-grade WPC", value_ar: "WPC مقاوم للماء" },
    { label_en: "Door Type", label_ar: "نوع الباب", value_en: "Bathroom / wet zone", value_ar: "حمام / منطقة رطبة" },
    { label_en: "Standard Size", label_ar: "المقاس القياسي", value_en: "700–900 × 2100 mm", value_ar: "700–900 × 2100 ملم" },
    { label_en: "Thickness", label_ar: "السماكة", value_en: "35 mm", value_ar: "35 ملم" },
    { label_en: "Core", label_ar: "النواة", value_en: "Solid sealed core", value_ar: "نواة صلبة محكمة" },
    { label_en: "Waterproof Rating", label_ar: "تقييم المقاومة للماء", value_en: "IP54 equivalent", value_ar: "مكافئ IP54" },
    { label_en: "Delivery", label_ar: "موعد التسليم", value_en: "7–14 working days", value_ar: "7–14 يوم عمل" },
  ],
  "custom-engineered-wpc": [
    { label_en: "Material", label_ar: "المادة", value_en: "Custom-grade WPC", value_ar: "WPC مخصص الدرجة" },
    { label_en: "Door Type", label_ar: "نوع الباب", value_en: "Interior (custom)", value_ar: "داخلي (مخصص)" },
    { label_en: "Dimensions", label_ar: "الأبعاد", value_en: "Fully custom", value_ar: "مخصص بالكامل" },
    { label_en: "Thickness", label_ar: "السماكة", value_en: "35–45 mm", value_ar: "35–45 ملم" },
    { label_en: "Core", label_ar: "النواة", value_en: "Hollow or solid", value_ar: "مجوفة أو صلبة" },
    { label_en: "Finish Options", label_ar: "خيارات التشطيب", value_en: "Custom RAL colours", value_ar: "ألوان RAL مخصصة" },
    { label_en: "Delivery", label_ar: "موعد التسليم", value_en: "14–21 working days", value_ar: "14–21 يوم عمل" },
  ],
  "grand-exterior-pivot": [
    { label_en: "Frame Material", label_ar: "مادة الإطار", value_en: "6000-series extruded aluminium", value_ar: "ألمنيوم مُبثوق سلسلة 6000" },
    { label_en: "Door Type", label_ar: "نوع الباب", value_en: "Exterior pivot", value_ar: "محوري خارجي" },
    { label_en: "Standard Size", label_ar: "المقاس القياسي", value_en: "1000–1200 × 2400 mm", value_ar: "1000–1200 × 2400 ملم" },
    { label_en: "Max Height", label_ar: "الارتفاع الأقصى", value_en: "3000 mm (custom)", value_ar: "3000 ملم (مخصص)" },
    { label_en: "Frame Profile", label_ar: "قسم الإطار", value_en: "100 mm double-wall extrusion", value_ar: "بثق مزدوج الجدار 100 ملم" },
    { label_en: "Finish", label_ar: "التشطيب", value_en: "Powder coat — custom RAL", value_ar: "طلاء بودرة — RAL مخصص" },
    { label_en: "Delivery", label_ar: "موعد التسليم", value_en: "21–28 working days", value_ar: "21–28 يوم عمل" },
  ],
  "minimalist-aluminium-entry": [
    { label_en: "Frame Material", label_ar: "مادة الإطار", value_en: "6000-series aluminium", value_ar: "ألمنيوم سلسلة 6000" },
    { label_en: "Door Type", label_ar: "نوع الباب", value_en: "Exterior entry", value_ar: "مدخل خارجي" },
    { label_en: "Standard Size", label_ar: "المقاس القياسي", value_en: "900–1100 × 2200 mm", value_ar: "900–1100 × 2200 ملم" },
    { label_en: "Frame Profile", label_ar: "قسم الإطار", value_en: "80 mm slim profile", value_ar: "قسم رفيع 80 ملم" },
    { label_en: "Hardware", label_ar: "الإكسسوارات", value_en: "Mortise lock + lever handle", value_ar: "قفل ممتاز + مقبض ذراع" },
    { label_en: "Finish", label_ar: "التشطيب", value_en: "Powder coat (standard range)", value_ar: "طلاء بودرة (نطاق قياسي)" },
    { label_en: "Delivery", label_ar: "موعد التسليم", value_en: "14–21 working days", value_ar: "14–21 يوم عمل" },
  ],
  "glass-aluminium-sliding": [
    { label_en: "Frame Material", label_ar: "مادة الإطار", value_en: "Extruded aluminium", value_ar: "ألمنيوم مُبثوق" },
    { label_en: "Glass", label_ar: "الزجاج", value_en: "8–12 mm tempered / insulated", value_ar: "زجاج مقسّى / عازل 8–12 ملم" },
    { label_en: "Track", label_ar: "المسار", value_en: "Floor-flush soft-close", value_ar: "مدمج مع الأرضية مع إغلاق ناعم" },
    { label_en: "Noise Reduction", label_ar: "خفض الضوضاء", value_en: "30–35 dB", value_ar: "30–35 ديسيبل" },
    { label_en: "Max Width", label_ar: "العرض الأقصى", value_en: "4000 mm (2 panels)", value_ar: "4000 ملم (لوحتان)" },
    { label_en: "Finish", label_ar: "التشطيب", value_en: "Anodised / powder coat", value_ar: "مؤكسَد / طلاء بودرة" },
    { label_en: "Delivery", label_ar: "موعد التسليم", value_en: "10–14 working days", value_ar: "10–14 يوم عمل" },
  ],
  "minimalist-pocket-sliding": [
    { label_en: "Frame Material", label_ar: "مادة الإطار", value_en: "Aluminium + WPC/glass panel", value_ar: "ألمنيوم + لوح WPC/زجاج" },
    { label_en: "Door Type", label_ar: "نوع الباب", value_en: "Interior pocket (recessed)", value_ar: "جيب داخلي مدمج" },
    { label_en: "Track", label_ar: "المسار", value_en: "Concealed top-hung", value_ar: "علوي مخفي" },
    { label_en: "Soft-Close", label_ar: "الإغلاق الناعم", value_en: "Standard", value_ar: "قياسي" },
    { label_en: "Floor Flush", label_ar: "مدمج مع الأرضية", value_en: "Yes — no threshold", value_ar: "نعم — بدون عتبة" },
    { label_en: "Wall Cavity", label_ar: "تجويف الجدار", value_en: "Min. 120 mm required", value_ar: "120 ملم كحد أدنى" },
    { label_en: "Delivery", label_ar: "موعد التسليم", value_en: "14–21 working days", value_ar: "14–21 يوم عمل" },
  ],
  "modern-fluted-cladding": [
    { label_en: "Material", label_ar: "المادة", value_en: "WPC / MDF composite", value_ar: "WPC / مركب MDF" },
    { label_en: "Type", label_ar: "النوع", value_en: "Feature wall panel", value_ar: "لوح جدار مميز" },
    { label_en: "Panel Width", label_ar: "عرض اللوح", value_en: "120–200 mm", value_ar: "120–200 ملم" },
    { label_en: "Panel Height", label_ar: "ارتفاع اللوح", value_en: "Custom (floor to ceiling)", value_ar: "مخصص (من الأرض للسقف)" },
    { label_en: "Finish Options", label_ar: "خيارات التشطيب", value_en: "Walnut, Oak, Custom paint", value_ar: "جوز، بلوط، طلاء مخصص" },
    { label_en: "Installation", label_ar: "التركيب", value_en: "Clip-on or direct-fix", value_ar: "تثبيت بمشبك أو مباشر" },
    { label_en: "Delivery", label_ar: "موعد التسليم", value_en: "7–14 working days", value_ar: "7–14 يوم عمل" },
  ],
};

async function main() {
  console.log("\n🌱 Seeding WR Doors database\n");

  // ── PRODUCTS ──────────────────────────────────────────────────────────────
  const products: (typeof schema.products.$inferInsert)[] = [
    {
      slug: "modern-wpc-interior",
      category: "wpc-doors",
      category_en: "WPC Doors",
      category_ar: "أبواب WPC",
      name_en: "Modern WPC Interior Door",
      name_ar: "باب WPC داخلي حديث",
      description_en:
        "Slim, contemporary interior door in light oak veneer. Engineered Wood Plastic Composite resists humidity, sound, and wear — ideal for villas and apartments alike.",
      description_ar:
        "باب داخلي رفيع وحديث بقشرة بلوط فاتح. خشب بلاستيك مركب مهندس يقاوم الرطوبة والصوت والاهتراء — مثالي للفلل والشقق على حد سواء.",
      images: IMG("wpc-doors/modern-wpc-interior-door-1024.webp"),
      is_featured: true,
    },
    {
      slug: "waterproof-bathroom-wpc",
      category: "wpc-doors",
      category_en: "WPC Doors",
      category_ar: "أبواب WPC",
      name_en: "Waterproof Bathroom WPC Door",
      name_ar: "باب حمام WPC مقاوم للماء",
      description_en:
        "Designed for wet zones: full waterproof core, sealed edges, and a finish that resists warping over a decade of daily use.",
      description_ar:
        "مصمم للمناطق الرطبة: نواة مقاومة للماء بالكامل، حواف محكمة الإغلاق، وتشطيب يقاوم الالتواء لعشر سنوات من الاستخدام اليومي.",
      images: IMG("wpc-doors/waterproofbathroom-wpc-door-1024.webp"),
      is_featured: false,
    },
    {
      slug: "custom-engineered-wpc",
      category: "wpc-doors",
      category_en: "WPC Doors",
      category_ar: "أبواب WPC",
      name_en: "Custom Engineered WPC Door",
      name_ar: "باب WPC هندسي مخصص",
      description_en:
        "Built to your dimensions and panel design. Choose finish, hardware, and glazing — manufactured in our UAE factory in days, not weeks.",
      description_ar:
        "مصنوع وفق أبعادك وتصميمك للألواح. اختر التشطيب والإكسسوارات والزجاج — يُصنع في مصنعنا في الإمارات خلال أيام، لا أسابيع.",
      images: IMG("wpc-doors/custom-engineered-wpc-door-1024.webp"),
      is_featured: false,
    },
    {
      slug: "grand-exterior-pivot",
      category: "pivot-aluminium-doors",
      category_en: "Pivot Aluminium Doors",
      category_ar: "أبواب ألمنيوم محورية",
      name_en: "Grand Exterior Aluminium Pivot Door",
      name_ar: "باب محوري ألمنيوم خارجي فخم",
      description_en:
        "A statement entryway: oversized aluminium pivot with a single sculptural pull handle. Engineered for villa scale and humid UAE conditions.",
      description_ar:
        "مدخل يلفت الأنظار: باب محوري ألمنيوم بحجم كبير مع مقبض سحب نحتي واحد. مصمم لحجم الفلل والظروف الرطبة في الإمارات.",
      images: IMG(
        "pivot-aluminium-doors/grand-exterior-aluminium-pivot-door-1024.webp",
      ),
      is_featured: true,
    },
    {
      slug: "minimalist-aluminium-entry",
      category: "pivot-aluminium-doors",
      category_en: "Pivot Aluminium Doors",
      category_ar: "أبواب ألمنيوم محورية",
      name_en: "Minimalist Aluminium Entry Door",
      name_ar: "باب مدخل ألمنيوم بسيط",
      description_en:
        "A restrained pivot design — flush profiles, hidden hinges, and a powder-coat palette tuned to UAE light and dust.",
      description_ar:
        "تصميم محوري متحفظ — ملامح مسطحة، مفصلات مخفية، ولوحة طلاء بودرة مضبوطة للضوء والغبار الإماراتي.",
      images: IMG(
        "pivot-aluminium-doors/concept-5-minimalist-aluminium-entry-door-1024.webp",
      ),
      is_featured: false,
    },
    {
      slug: "glass-aluminium-sliding",
      category: "sliding-systems",
      category_en: "Sliding Systems",
      category_ar: "أنظمة منزلقة",
      name_en: "Glass & Aluminium Sliding System",
      name_ar: "نظام منزلق زجاج وألمنيوم",
      description_en:
        "Floor-to-ceiling glass panels in a slim aluminium frame. Defines spaces without closing them off — perfect for open-plan apartments.",
      description_ar:
        "ألواح زجاجية من الأرض إلى السقف في إطار ألمنيوم رفيع. يحدد المساحات دون عزلها — مثالي للشقق المفتوحة.",
      images: IMG(
        "sliding-systems/concept-6-glass-and-aluminium-sliding-system-1024.webp",
      ),
      is_featured: true,
    },
    {
      slug: "minimalist-pocket-sliding",
      category: "sliding-systems",
      category_en: "Sliding Systems",
      category_ar: "أنظمة منزلقة",
      name_en: "Minimalist Pocket Sliding Door",
      name_ar: "باب منزلق جيب بسيط",
      description_en:
        "A door that disappears when not in use. Pocket-style with soft-close and a low-profile track flush with the floor.",
      description_ar:
        "باب يختفي عند عدم الاستخدام. نمط جيب مع إغلاق ناعم ومسار منخفض الارتفاع مدمج مع الأرضية.",
      images: IMG(
        "sliding-systems/concept-7-minimalist-pocket-sliding-door-1024.webp",
      ),
      is_featured: false,
    },
    {
      slug: "modern-fluted-cladding",
      category: "wall-cladding",
      category_en: "Wall Cladding",
      category_ar: "كسوة الجدران",
      name_en: "Modern Fluted Wall Cladding",
      name_ar: "كسوة جدران محززة حديثة",
      description_en:
        "Vertical fluted panels in walnut or oak. Adds rhythm and warmth to feature walls without overwhelming the room.",
      description_ar:
        "ألواح محززة عمودية بخشب الجوز أو البلوط. تضيف إيقاعًا ودفئًا للجدران المميزة دون إثقال الغرفة.",
      images: IMG("wall-cladding/concept-8-modern-fluted-wall-cladding-1024.webp"),
      is_featured: true,
    },
  ];

  const productsWithSpecs = products.map((p) => ({
    ...p,
    specs: SPECS[p.slug] ?? [],
  }));
  await db.insert(schema.products).values(productsWithSpecs).onConflictDoNothing();
  console.log(`  ✓ products: ${productsWithSpecs.length}`);

  // ── PROJECTS ──────────────────────────────────────────────────────────────
  const projects: (typeof schema.projects.$inferInsert)[] = [
    {
      slug: "dubai-hills-villa",
      category: "residential",
      title_en: "Villa Renovation — Dubai Hills",
      title_ar: "تجديد فيلا — تلال دبي",
      location_en: "Dubai Hills · Residential",
      location_ar: "تلال دبي · سكني",
      description_en:
        "Custom pivot aluminium entry with concealed hinges and bronze finish.",
      description_ar: "مدخل ألمنيوم محوري مخصص بمفصلات مخفية وتشطيب برونزي.",
      images: IMG(
        "pivot-aluminium-doors/grand-exterior-aluminium-pivot-door-1024.webp",
      ),
      display_order: 1,
    },
    {
      slug: "jbr-penthouse",
      category: "luxury",
      title_en: "Penthouse Living Room — JBR",
      title_ar: "غرفة معيشة بنتهاوس — جي بي آر",
      location_en: "Jumeirah Beach Residence · Luxury",
      location_ar: "جميرا بيتش ريزيدنس · فاخر",
      description_en:
        "Floor-to-ceiling glass sliding system with thermal break aluminium frame.",
      description_ar:
        "نظام منزلق زجاجي من الأرض إلى السقف بإطار ألمنيوم معزول حرارياً.",
      images: IMG(
        "sliding-systems/concept-6-glass-and-aluminium-sliding-system-1024.webp",
      ),
      display_order: 2,
    },
    {
      slug: "business-bay-lobby",
      category: "commercial",
      title_en: "Lobby Feature Wall — Business Bay",
      title_ar: "جدار مميز في الردهة — الخليج التجاري",
      location_en: "Business Bay · Commercial",
      location_ar: "الخليج التجاري · تجاري",
      description_en:
        "Modern fluted wall cladding panels in walnut finish, 11-metre run.",
      description_ar: "ألواح كسوة جدران حديثة مخدّدة بتشطيب الجوز، طول 11 متراً.",
      images: IMG("wall-cladding/concept-8-modern-fluted-wall-cladding-1024.webp"),
      display_order: 3,
    },
    {
      slug: "palm-jumeirah-villa",
      category: "luxury",
      title_en: "Beachfront Villa — Palm Jumeirah",
      title_ar: "فيلا على الشاطئ — نخلة جميرا",
      location_en: "Palm Jumeirah · Luxury",
      location_ar: "نخلة جميرا · فاخر",
      description_en:
        "Triple-guard WPC interior doors throughout — six bedrooms, four bathrooms.",
      description_ar:
        "أبواب داخلية WPC بحماية ثلاثية في جميع الأرجاء — ست غرف نوم وأربع حمامات.",
      images: IMG("wpc-doors/custom-engineered-wpc-door-1024.webp"),
      display_order: 4,
    },
    {
      slug: "al-barsha-boutique",
      category: "commercial",
      title_en: "Boutique Office Fit-out — Al Barsha",
      title_ar: "تجهيز مكتب بوتيك — البرشاء",
      location_en: "Al Barsha · Commercial",
      location_ar: "البرشاء · تجاري",
      description_en:
        "Glass sliding partitions plus matching WPC private-office doors.",
      description_ar: "قواطع زجاجية منزلقة مع أبواب WPC مطابقة للمكاتب الخاصة.",
      images: IMG(
        "sliding-systems/concept-7-minimalist-pocket-sliding-door-1024.webp",
      ),
      display_order: 5,
    },
    {
      slug: "arabian-ranches-home",
      category: "residential",
      title_en: "Family Home — Arabian Ranches",
      title_ar: "منزل عائلي — المرابع العربية",
      location_en: "Arabian Ranches · Residential",
      location_ar: "المرابع العربية · سكني",
      description_en:
        "Waterproof WPC bathroom doors plus matching bedroom set in oak finish.",
      description_ar:
        "أبواب WPC مقاومة للماء للحمامات مع مجموعة غرف نوم مطابقة بتشطيب البلوط.",
      images: IMG("wpc-doors/modern-wpc-interior-door-1024.webp"),
      display_order: 6,
    },
  ];

  await db.insert(schema.projects).values(projects).onConflictDoNothing();
  console.log(`  ✓ projects: ${projects.length}`);

  // ── SITE SETTINGS ─────────────────────────────────────────────────────────
  const settings: (typeof schema.siteSettings.$inferInsert)[] = [
    {
      key: "home.hero.tagline",
      value_en: "Premium Doors. Crafted in UAE.",
      value_ar: "أبواب فاخرة. صناعة إماراتية.",
      description: "Homepage hero headline",
    },
    {
      key: "home.hero.subtitle",
      value_en:
        "1,000+ designs. Triple guard against water, sound, and termites. Built in our local factory and backed by a 10-year warranty.",
      value_ar:
        "أكثر من 1,000 تصميم. حماية ثلاثية ضد الماء والصوت والنمل الأبيض. صُنعت في مصنعنا المحلي ومدعومة بضمان 10 سنوات.",
      description: "Homepage hero subtitle",
    },
    {
      key: "contact.phone",
      value_en: "+971 55 403 9966",
      value_ar: "+971 55 403 9966",
      description: "Primary contact phone (UAE)",
    },
    {
      key: "contact.email",
      value_en: "aigeneralist.hma@gmail.com",
      value_ar: "aigeneralist.hma@gmail.com",
      description: "Primary contact email",
    },
    {
      key: "contact.whatsapp",
      value_en: "https://wa.me/971554039966",
      value_ar: "https://wa.me/971554039966",
      description: "WhatsApp click-to-chat URL",
    },
    {
      key: "contact.address",
      value_en: "Dubai, United Arab Emirates",
      value_ar: "دبي، الإمارات العربية المتحدة",
      description: "Office address (TBD — update when confirmed)",
    },
    {
      key: "hours.weekdays",
      value_en: "Sunday – Thursday: 9:00 AM – 6:00 PM",
      value_ar: "الأحد – الخميس: 9:00 صباحاً – 6:00 مساءً",
      description: "Weekday business hours",
    },
    {
      key: "hours.weekend",
      value_en: "Friday & Saturday: Closed",
      value_ar: "الجمعة والسبت: مغلق",
      description: "Weekend business hours",
    },
    {
      key: "legal.company_name_en",
      value_en: "Wahat Al Ruman Doors Trading LLC",
      value_ar: "Wahat Al Ruman Doors Trading LLC",
      description: "Legal entity name (English) — for footer + about page",
    },
    {
      key: "legal.company_name_ar",
      value_en: "واحة الرمان لتجارة الأبواب ذ.م.م",
      value_ar: "واحة الرمان لتجارة الأبواب ذ.م.م",
      description: "Legal entity name (Arabic) — for footer + about page",
    },
  ];

  await db.insert(schema.siteSettings).values(settings).onConflictDoNothing();
  console.log(`  ✓ site_settings: ${settings.length}`);

  // ── TECHNICIANS ───────────────────────────────────────────────────────────
  const technicians: (typeof schema.technicians.$inferInsert)[] = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Karim Hassan",
      phone: "+971501112233",
      email: "karim@wrdoors.local",
      skills: ["wpc-doors", "pivot-aluminium-doors", "sliding-systems"],
      hourly_rate_aed: 180,
      status: "active",
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Mohammed Al-Suwaidi",
      phone: "+971502223344",
      email: "mohammed@wrdoors.local",
      skills: ["wpc-doors", "wall-cladding"],
      hourly_rate_aed: 160,
      status: "active",
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      name: "Yusuf Rahman",
      phone: "+971503334455",
      email: "yusuf@wrdoors.local",
      skills: ["pivot-aluminium-doors", "sliding-systems", "wall-cladding"],
      hourly_rate_aed: 200,
      status: "active",
    },
  ];

  await db.insert(schema.technicians).values(technicians).onConflictDoNothing();
  console.log(`  ✓ technicians: ${technicians.length}`);

  console.log("\n✅ Seed complete.\n");
  await client.end();
}

main().catch(async (err) => {
  console.error("\n❌ Seed failed:", err);
  await client.end();
  process.exit(1);
});

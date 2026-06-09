-- =============================================================================
-- WR Doors × DODA — Seed Data (Prompt 7)
-- =============================================================================
-- Run AFTER applying 0001_initial_schema.sql.
--
-- Seeds:
--   - 8 products (mirrors lib/products.ts)
--   - 6 projects (mirrors lib/projects.ts + messages/{en,ar}.json items)
--   - default site_settings rows (hero, contact, hours)
--
-- Image URLs point at /public/assets/products/* in the Next.js project. These
-- work for local dev. Once Storage buckets are populated (Prompt 9), admins can
-- swap these for Supabase Storage public URLs via the dashboard.
--
-- Apply: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- All inserts use ON CONFLICT DO NOTHING so re-running is safe (idempotent).
-- =============================================================================

-- =============================================================================
-- PRODUCTS (8 items)
-- =============================================================================
INSERT INTO products (slug, category, category_en, category_ar, name_en, name_ar, description_en, description_ar, images, is_featured) VALUES

-- ── WPC Doors ────────────────────────────────────────────────────────────
('modern-wpc-interior', 'wpc-doors', 'WPC Doors', 'أبواب WPC',
 'Modern WPC Interior Door',
 'باب WPC داخلي حديث',
 'Slim, contemporary interior door in light oak veneer. Engineered Wood Plastic Composite resists humidity, sound, and wear — ideal for villas and apartments alike.',
 'باب داخلي رفيع وحديث بقشرة بلوط فاتح. خشب بلاستيك مركب مهندس يقاوم الرطوبة والصوت والاهتراء — مثالي للفلل والشقق على حد سواء.',
 ARRAY['/assets/products/wpc-doors/modern-wpc-interior-door-1024.webp'],
 TRUE),

('waterproof-bathroom-wpc', 'wpc-doors', 'WPC Doors', 'أبواب WPC',
 'Waterproof Bathroom WPC Door',
 'باب حمام WPC مقاوم للماء',
 'Designed for wet zones: full waterproof core, sealed edges, and a finish that resists warping over a decade of daily use.',
 'مصمم للمناطق الرطبة: نواة مقاومة للماء بالكامل، حواف محكمة الإغلاق، وتشطيب يقاوم الالتواء لعشر سنوات من الاستخدام اليومي.',
 ARRAY['/assets/products/wpc-doors/waterproofbathroom-wpc-door-1024.webp'],
 FALSE),

('custom-engineered-wpc', 'wpc-doors', 'WPC Doors', 'أبواب WPC',
 'Custom Engineered WPC Door',
 'باب WPC هندسي مخصص',
 'Built to your dimensions and panel design. Choose finish, hardware, and glazing — manufactured in our UAE factory in days, not weeks.',
 'مصنوع وفق أبعادك وتصميمك للألواح. اختر التشطيب والإكسسوارات والزجاج — يُصنع في مصنعنا في الإمارات خلال أيام، لا أسابيع.',
 ARRAY['/assets/products/wpc-doors/custom-engineered-wpc-door-1024.webp'],
 FALSE),

-- ── Pivot Aluminium Doors ───────────────────────────────────────────────
('grand-exterior-pivot', 'pivot-aluminium-doors', 'Pivot Aluminium Doors', 'أبواب ألمنيوم محورية',
 'Grand Exterior Aluminium Pivot Door',
 'باب محوري ألمنيوم خارجي فخم',
 'A statement entryway: oversized aluminium pivot with a single sculptural pull handle. Engineered for villa scale and humid UAE conditions.',
 'مدخل يلفت الأنظار: باب محوري ألمنيوم بحجم كبير مع مقبض سحب نحتي واحد. مصمم لحجم الفلل والظروف الرطبة في الإمارات.',
 ARRAY['/assets/products/pivot-aluminium-doors/grand-exterior-aluminium-pivot-door-1024.webp'],
 TRUE),

('minimalist-aluminium-entry', 'pivot-aluminium-doors', 'Pivot Aluminium Doors', 'أبواب ألمنيوم محورية',
 'Minimalist Aluminium Entry Door',
 'باب مدخل ألمنيوم بسيط',
 'A restrained pivot design — flush profiles, hidden hinges, and a powder-coat palette tuned to UAE light and dust.',
 'تصميم محوري متحفظ — ملامح مسطحة، مفصلات مخفية، ولوحة طلاء بودرة مضبوطة للضوء والغبار الإماراتي.',
 ARRAY['/assets/products/pivot-aluminium-doors/concept-5-minimalist-aluminium-entry-door-1024.webp'],
 FALSE),

-- ── Sliding Systems ─────────────────────────────────────────────────────
('glass-aluminium-sliding', 'sliding-systems', 'Sliding Systems', 'أنظمة منزلقة',
 'Glass & Aluminium Sliding System',
 'نظام منزلق زجاج وألمنيوم',
 'Floor-to-ceiling glass panels in a slim aluminium frame. Defines spaces without closing them off — perfect for open-plan apartments.',
 'ألواح زجاجية من الأرض إلى السقف في إطار ألمنيوم رفيع. يحدد المساحات دون عزلها — مثالي للشقق المفتوحة.',
 ARRAY['/assets/products/sliding-systems/concept-6-glass-and-aluminium-sliding-system-1024.webp'],
 TRUE),

('minimalist-pocket-sliding', 'sliding-systems', 'Sliding Systems', 'أنظمة منزلقة',
 'Minimalist Pocket Sliding Door',
 'باب منزلق جيب بسيط',
 'A door that disappears when not in use. Pocket-style with soft-close and a low-profile track flush with the floor.',
 'باب يختفي عند عدم الاستخدام. نمط جيب مع إغلاق ناعم ومسار منخفض الارتفاع مدمج مع الأرضية.',
 ARRAY['/assets/products/sliding-systems/concept-7-minimalist-pocket-sliding-door-1024.webp'],
 FALSE),

-- ── Wall Cladding ──────────────────────────────────────────────────────
('modern-fluted-cladding', 'wall-cladding', 'Wall Cladding', 'كسوة الجدران',
 'Modern Fluted Wall Cladding',
 'كسوة جدران محززة حديثة',
 'Vertical fluted panels in walnut or oak. Adds rhythm and warmth to feature walls without overwhelming the room.',
 'ألواح محززة عمودية بخشب الجوز أو البلوط. تضيف إيقاعًا ودفئًا للجدران المميزة دون إثقال الغرفة.',
 ARRAY['/assets/products/wall-cladding/concept-8-modern-fluted-wall-cladding-1024.webp'],
 TRUE)

ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- PROJECTS (6 items — mirrors lib/projects.ts and messages files)
-- =============================================================================
INSERT INTO projects (slug, category, title_en, title_ar, location_en, location_ar, description_en, description_ar, images, display_order) VALUES

('dubai-hills-villa', 'residential',
 'Villa Renovation — Dubai Hills',
 'تجديد فيلا — تلال دبي',
 'Dubai Hills · Residential',
 'تلال دبي · سكني',
 'Custom pivot aluminium entry with concealed hinges and bronze finish.',
 'مدخل ألمنيوم محوري مخصص بمفصلات مخفية وتشطيب برونزي.',
 ARRAY['/assets/products/pivot-aluminium-doors/grand-exterior-aluminium-pivot-door-1024.webp'],
 1),

('jbr-penthouse', 'luxury',
 'Penthouse Living Room — JBR',
 'غرفة معيشة بنتهاوس — جي بي آر',
 'Jumeirah Beach Residence · Luxury',
 'جميرا بيتش ريزيدنس · فاخر',
 'Floor-to-ceiling glass sliding system with thermal break aluminium frame.',
 'نظام منزلق زجاجي من الأرض إلى السقف بإطار ألمنيوم معزول حرارياً.',
 ARRAY['/assets/products/sliding-systems/concept-6-glass-and-aluminium-sliding-system-1024.webp'],
 2),

('business-bay-lobby', 'commercial',
 'Lobby Feature Wall — Business Bay',
 'جدار مميز في الردهة — الخليج التجاري',
 'Business Bay · Commercial',
 'الخليج التجاري · تجاري',
 'Modern fluted wall cladding panels in walnut finish, 11-metre run.',
 'ألواح كسوة جدران حديثة مخدّدة بتشطيب الجوز، طول 11 متراً.',
 ARRAY['/assets/products/wall-cladding/concept-8-modern-fluted-wall-cladding-1024.webp'],
 3),

('palm-jumeirah-villa', 'luxury',
 'Beachfront Villa — Palm Jumeirah',
 'فيلا على الشاطئ — نخلة جميرا',
 'Palm Jumeirah · Luxury',
 'نخلة جميرا · فاخر',
 'Triple-guard WPC interior doors throughout — six bedrooms, four bathrooms.',
 'أبواب داخلية WPC بحماية ثلاثية في جميع الأرجاء — ست غرف نوم وأربع حمامات.',
 ARRAY['/assets/products/wpc-doors/custom-engineered-wpc-door-1024.webp'],
 4),

('al-barsha-boutique', 'commercial',
 'Boutique Office Fit-out — Al Barsha',
 'تجهيز مكتب بوتيك — البرشاء',
 'Al Barsha · Commercial',
 'البرشاء · تجاري',
 'Glass sliding partitions plus matching WPC private-office doors.',
 'قواطع زجاجية منزلقة مع أبواب WPC مطابقة للمكاتب الخاصة.',
 ARRAY['/assets/products/sliding-systems/concept-7-minimalist-pocket-sliding-door-1024.webp'],
 5),

('arabian-ranches-home', 'residential',
 'Family Home — Arabian Ranches',
 'منزل عائلي — المرابع العربية',
 'Arabian Ranches · Residential',
 'المرابع العربية · سكني',
 'Waterproof WPC bathroom doors plus matching bedroom set in oak finish.',
 'أبواب WPC مقاومة للماء للحمامات مع مجموعة غرف نوم مطابقة بتشطيب البلوط.',
 ARRAY['/assets/products/wpc-doors/modern-wpc-interior-door-1024.webp'],
 6)

ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- SITE_SETTINGS (mini CMS — admin can edit via /admin/site-settings in Prompt 9)
-- =============================================================================
INSERT INTO site_settings (key, value_en, value_ar, type, description) VALUES

-- Homepage hero
('home.hero.tagline',
 'Premium Doors. Crafted in UAE.',
 'أبواب فاخرة. صناعة إماراتية.',
 'text',
 'Homepage hero headline'),

('home.hero.subtitle',
 '1,000+ designs. Triple guard against water, sound, and termites. Built in our local factory and backed by a 10-year warranty.',
 'أكثر من 1,000 تصميم. حماية ثلاثية ضد الماء والصوت والنمل الأبيض. صُنعت في مصنعنا المحلي ومدعومة بضمان 10 سنوات.',
 'text',
 'Homepage hero subtitle'),

-- Contact info
('contact.phone', '+971 55 403 9966', '+971 55 403 9966', 'text', 'Primary contact phone (UAE)'),
('contact.email', 'aigeneralist.hma@gmail.com', 'aigeneralist.hma@gmail.com', 'text', 'Primary contact email'),
('contact.whatsapp', 'https://wa.me/971554039966', 'https://wa.me/971554039966', 'text', 'WhatsApp click-to-chat URL'),
('contact.address',
 'Dubai, United Arab Emirates',
 'دبي، الإمارات العربية المتحدة',
 'text',
 'Office address (TBD — update when confirmed)'),

-- Business hours
('hours.weekdays',
 'Sunday – Thursday: 9:00 AM – 6:00 PM',
 'الأحد – الخميس: 9:00 صباحاً – 6:00 مساءً',
 'text',
 'Weekday business hours'),
('hours.weekend',
 'Friday & Saturday: Closed',
 'الجمعة والسبت: مغلق',
 'text',
 'Weekend business hours'),

-- Legal disclosure
('legal.company_name_en',
 'Wahat Al Ruman Doors Trading LLC',
 'Wahat Al Ruman Doors Trading LLC',
 'text',
 'Legal entity name (English) — for footer + about page'),
('legal.company_name_ar',
 'واحة الرمان لتجارة الأبواب ذ.م.م',
 'واحة الرمان لتجارة الأبواب ذ.م.م',
 'text',
 'Legal entity name (Arabic) — for footer + about page')

ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- DONE.
--
-- Verify in Supabase Dashboard → Table Editor:
--   - products: 8 rows
--   - projects: 6 rows
--   - site_settings: 10 rows
--
-- Next: create your admin user via Authentication → Users → Add user.
-- Then create the 5 Storage buckets (see SUPABASE_SETUP.md).
-- =============================================================================

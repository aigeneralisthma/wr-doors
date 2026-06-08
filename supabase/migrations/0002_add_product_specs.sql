-- =============================================================================
-- WR Doors × DODA — Add specs JSONB column to products (Prompt 9b)
-- =============================================================================
-- Adds a JSONB column to `products` so admin can edit the spec rows (the
-- ~7 attribute pairs shown on each product detail page) via the admin
-- dashboard instead of editing `lib/product-specs.ts` + redeploying.
--
-- Schema: products.specs JSONB NOT NULL DEFAULT '[]'::jsonb
-- Each spec is { label_en, label_ar, value_en, value_ar }.
--
-- After applying this migration, `lib/product-specs.ts` is deleted and the
-- product detail page reads from `product.specs` instead.
--
-- Apply: Supabase Dashboard → SQL Editor → paste → Run.
-- Idempotent: ADD COLUMN IF NOT EXISTS + UPDATE matches only known slugs.
-- =============================================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS specs JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Backfill the 8 seeded products with the specs that previously lived in
-- lib/product-specs.ts. Re-runnable: UPDATE is safe to re-execute and the
-- WHERE clause scopes to known slugs only — admin-edited specs on these
-- exact slugs WOULD be overwritten if re-run, so don't re-run after admin
-- has touched them.

UPDATE products SET specs = '[
  {"label_en":"Material","label_ar":"المادة","value_en":"WPC Composite","value_ar":"مركب WPC"},
  {"label_en":"Door Type","label_ar":"نوع الباب","value_en":"Interior","value_ar":"داخلي"},
  {"label_en":"Standard Size","label_ar":"المقاس القياسي","value_en":"900 × 2100 mm","value_ar":"900 × 2100 ملم"},
  {"label_en":"Thickness","label_ar":"السماكة","value_en":"35 mm","value_ar":"35 ملم"},
  {"label_en":"Core","label_ar":"النواة","value_en":"Hollow acoustic core","value_ar":"نواة مجوفة عازلة للصوت"},
  {"label_en":"Finish Options","label_ar":"خيارات التشطيب","value_en":"20+ colours / veneer","value_ar":"أكثر من 20 لون وقشرة"},
  {"label_en":"Delivery","label_ar":"موعد التسليم","value_en":"7–14 working days","value_ar":"7–14 يوم عمل"}
]'::jsonb WHERE slug = 'modern-wpc-interior';

UPDATE products SET specs = '[
  {"label_en":"Material","label_ar":"المادة","value_en":"Waterproof-grade WPC","value_ar":"WPC مقاوم للماء"},
  {"label_en":"Door Type","label_ar":"نوع الباب","value_en":"Bathroom / wet zone","value_ar":"حمام / منطقة رطبة"},
  {"label_en":"Standard Size","label_ar":"المقاس القياسي","value_en":"700–900 × 2100 mm","value_ar":"700–900 × 2100 ملم"},
  {"label_en":"Thickness","label_ar":"السماكة","value_en":"35 mm","value_ar":"35 ملم"},
  {"label_en":"Core","label_ar":"النواة","value_en":"Solid sealed core","value_ar":"نواة صلبة محكمة"},
  {"label_en":"Waterproof Rating","label_ar":"تقييم المقاومة للماء","value_en":"IP54 equivalent","value_ar":"مكافئ IP54"},
  {"label_en":"Delivery","label_ar":"موعد التسليم","value_en":"7–14 working days","value_ar":"7–14 يوم عمل"}
]'::jsonb WHERE slug = 'waterproof-bathroom-wpc';

UPDATE products SET specs = '[
  {"label_en":"Material","label_ar":"المادة","value_en":"Custom-grade WPC","value_ar":"WPC مخصص الدرجة"},
  {"label_en":"Door Type","label_ar":"نوع الباب","value_en":"Interior (custom)","value_ar":"داخلي (مخصص)"},
  {"label_en":"Dimensions","label_ar":"الأبعاد","value_en":"Fully custom","value_ar":"مخصص بالكامل"},
  {"label_en":"Thickness","label_ar":"السماكة","value_en":"35–45 mm","value_ar":"35–45 ملم"},
  {"label_en":"Core","label_ar":"النواة","value_en":"Hollow or solid","value_ar":"مجوفة أو صلبة"},
  {"label_en":"Finish Options","label_ar":"خيارات التشطيب","value_en":"Custom RAL colours","value_ar":"ألوان RAL مخصصة"},
  {"label_en":"Delivery","label_ar":"موعد التسليم","value_en":"14–21 working days","value_ar":"14–21 يوم عمل"}
]'::jsonb WHERE slug = 'custom-engineered-wpc';

UPDATE products SET specs = '[
  {"label_en":"Frame Material","label_ar":"مادة الإطار","value_en":"6000-series extruded aluminium","value_ar":"ألمنيوم مُبثوق سلسلة 6000"},
  {"label_en":"Door Type","label_ar":"نوع الباب","value_en":"Exterior pivot","value_ar":"محوري خارجي"},
  {"label_en":"Standard Size","label_ar":"المقاس القياسي","value_en":"1000–1200 × 2400 mm","value_ar":"1000–1200 × 2400 ملم"},
  {"label_en":"Max Height","label_ar":"الارتفاع الأقصى","value_en":"3000 mm (custom)","value_ar":"3000 ملم (مخصص)"},
  {"label_en":"Frame Profile","label_ar":"قسم الإطار","value_en":"100 mm double-wall extrusion","value_ar":"بثق مزدوج الجدار 100 ملم"},
  {"label_en":"Finish","label_ar":"التشطيب","value_en":"Powder coat — custom RAL","value_ar":"طلاء بودرة — RAL مخصص"},
  {"label_en":"Delivery","label_ar":"موعد التسليم","value_en":"21–28 working days","value_ar":"21–28 يوم عمل"}
]'::jsonb WHERE slug = 'grand-exterior-pivot';

UPDATE products SET specs = '[
  {"label_en":"Frame Material","label_ar":"مادة الإطار","value_en":"6000-series aluminium","value_ar":"ألمنيوم سلسلة 6000"},
  {"label_en":"Door Type","label_ar":"نوع الباب","value_en":"Exterior entry","value_ar":"مدخل خارجي"},
  {"label_en":"Standard Size","label_ar":"المقاس القياسي","value_en":"900–1100 × 2200 mm","value_ar":"900–1100 × 2200 ملم"},
  {"label_en":"Frame Profile","label_ar":"قسم الإطار","value_en":"80 mm slim profile","value_ar":"قسم رفيع 80 ملم"},
  {"label_en":"Hardware","label_ar":"الإكسسوارات","value_en":"Mortise lock + lever handle","value_ar":"قفل ممتاز + مقبض ذراع"},
  {"label_en":"Finish","label_ar":"التشطيب","value_en":"Powder coat (standard range)","value_ar":"طلاء بودرة (نطاق قياسي)"},
  {"label_en":"Delivery","label_ar":"موعد التسليم","value_en":"14–21 working days","value_ar":"14–21 يوم عمل"}
]'::jsonb WHERE slug = 'minimalist-aluminium-entry';

UPDATE products SET specs = '[
  {"label_en":"Frame Material","label_ar":"مادة الإطار","value_en":"Extruded aluminium","value_ar":"ألمنيوم مُبثوق"},
  {"label_en":"Glass","label_ar":"الزجاج","value_en":"8–12 mm tempered / insulated","value_ar":"زجاج مقسّى / عازل 8–12 ملم"},
  {"label_en":"Track","label_ar":"المسار","value_en":"Floor-flush soft-close","value_ar":"مدمج مع الأرضية مع إغلاق ناعم"},
  {"label_en":"Noise Reduction","label_ar":"خفض الضوضاء","value_en":"30–35 dB","value_ar":"30–35 ديسيبل"},
  {"label_en":"Max Width","label_ar":"العرض الأقصى","value_en":"4000 mm (2 panels)","value_ar":"4000 ملم (لوحتان)"},
  {"label_en":"Finish","label_ar":"التشطيب","value_en":"Anodised / powder coat","value_ar":"مؤكسَد / طلاء بودرة"},
  {"label_en":"Delivery","label_ar":"موعد التسليم","value_en":"10–14 working days","value_ar":"10–14 يوم عمل"}
]'::jsonb WHERE slug = 'glass-aluminium-sliding';

UPDATE products SET specs = '[
  {"label_en":"Frame Material","label_ar":"مادة الإطار","value_en":"Aluminium + WPC/glass panel","value_ar":"ألمنيوم + لوح WPC/زجاج"},
  {"label_en":"Door Type","label_ar":"نوع الباب","value_en":"Interior pocket (recessed)","value_ar":"جيب داخلي مدمج"},
  {"label_en":"Track","label_ar":"المسار","value_en":"Concealed top-hung","value_ar":"علوي مخفي"},
  {"label_en":"Soft-Close","label_ar":"الإغلاق الناعم","value_en":"Standard","value_ar":"قياسي"},
  {"label_en":"Floor Flush","label_ar":"مدمج مع الأرضية","value_en":"Yes — no threshold","value_ar":"نعم — بدون عتبة"},
  {"label_en":"Wall Cavity","label_ar":"تجويف الجدار","value_en":"Min. 120 mm required","value_ar":"120 ملم كحد أدنى"},
  {"label_en":"Delivery","label_ar":"موعد التسليم","value_en":"14–21 working days","value_ar":"14–21 يوم عمل"}
]'::jsonb WHERE slug = 'minimalist-pocket-sliding';

UPDATE products SET specs = '[
  {"label_en":"Material","label_ar":"المادة","value_en":"WPC / MDF composite","value_ar":"WPC / مركب MDF"},
  {"label_en":"Type","label_ar":"النوع","value_en":"Feature wall panel","value_ar":"لوح جدار مميز"},
  {"label_en":"Panel Width","label_ar":"عرض اللوح","value_en":"120–200 mm","value_ar":"120–200 ملم"},
  {"label_en":"Panel Height","label_ar":"ارتفاع اللوح","value_en":"Custom (floor to ceiling)","value_ar":"مخصص (من الأرض للسقف)"},
  {"label_en":"Finish Options","label_ar":"خيارات التشطيب","value_en":"Walnut, Oak, Custom paint","value_ar":"جوز، بلوط، طلاء مخصص"},
  {"label_en":"Installation","label_ar":"التركيب","value_en":"Clip-on or direct-fix","value_ar":"تثبيت بمشبك أو مباشر"},
  {"label_en":"Delivery","label_ar":"موعد التسليم","value_en":"7–14 working days","value_ar":"7–14 يوم عمل"}
]'::jsonb WHERE slug = 'modern-fluted-cladding';

-- =============================================================================
-- DONE. Verify in Supabase Dashboard → Table Editor → products → specs column.
-- Each row's specs should be a JSON array of ~7 objects.
-- =============================================================================

-- ============================================================
-- schema.sql - Schema cho Cloudflare D1
-- Lưu ý: D1 dựa trên SQLite, dữ liệu dạng JSON lưu ở cột TEXT.
-- Template (thiết kế gốc) nên được seed 1 lần, ít thay đổi.
-- Instance (đồ người chơi sở hữu) thay đổi liên tục theo gameplay.
-- ============================================================

-- ===================== HERO =====================

CREATE TABLE IF NOT EXISTS hero_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  element TEXT NOT NULL,          -- metal/wood/water/fire/earth/light/dark
  role TEXT NOT NULL,             -- physical_dps/magic_dps/tank_support
  rarity INTEGER NOT NULL,           -- 1=pham, 2=hoang, 3=huyen, 4=dia, 5=thien, 6=tien
  base_stats_json TEXT NOT NULL,        -- BaseStats dạng JSON
  stat_growth_json TEXT NOT NULL,       -- Partial<BaseStats> dạng JSON
  max_level INTEGER NOT NULL DEFAULT 80,
  passive_skill_json TEXT NOT NULL,     -- Skill dạng JSON
  active_skill_json TEXT NOT NULL,      -- Skill dạng JSON
  star_bonuses_json TEXT NOT NULL,      -- StarBonus[] dạng JSON
  lore TEXT,
  avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS hero_instances (
  instance_id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES hero_templates(id),
  owner_id TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  star INTEGER NOT NULL DEFAULT 1,
  current_exp INTEGER NOT NULL DEFAULT 0,
  equipped_gear_json TEXT NOT NULL DEFAULT '{}',  -- { slot: gearInstanceId }
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hero_instances_owner ON hero_instances(owner_id);

-- ===================== GEAR =====================

CREATE TABLE IF NOT EXISTS gear_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slot TEXT NOT NULL,             -- main_weapon/sub_weapon/helmet/armor/gloves/boots/bracelet/necklace/earring/ring
  rarity INTEGER NOT NULL,           -- 1=pham, 2=hoang, 3=huyen, 4=dia, 5=thien, 6=tien
  base_stats_json TEXT NOT NULL,
  main_affix_json TEXT NOT NULL,
  possible_sub_affixes_json TEXT NOT NULL,
  sub_affix_count INTEGER NOT NULL DEFAULT 3,
  set_id TEXT,
  max_enhance_level INTEGER NOT NULL DEFAULT 15,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS gear_sets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bonuses_json TEXT NOT NULL       -- GearSet.bonuses[] dạng JSON
);

CREATE TABLE IF NOT EXISTS gear_instances (
  instance_id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES gear_templates(id),
  owner_id TEXT NOT NULL,
  enhance_level INTEGER NOT NULL DEFAULT 0,
  rolled_sub_affixes_json TEXT NOT NULL,
  equipped_by_hero_instance_id TEXT REFERENCES hero_instances(instance_id),
  locked_for_salvage INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_gear_instances_owner ON gear_instances(owner_id);
CREATE INDEX IF NOT EXISTS idx_gear_instances_equipped ON gear_instances(equipped_by_hero_instance_id);

-- ===================== MATERIALS & RECIPES =====================

CREATE TABLE IF NOT EXISTS material_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,         -- ore/essence/enhance_stone/rune/star_shard/exp_book/currency
  rarity INTEGER NOT NULL,           -- 1=pham, 2=hoang, 3=huyen, 4=dia, 5=thien, 6=tien
  element TEXT,
  description TEXT NOT NULL,
  icon TEXT,
  max_stack INTEGER
);

CREATE TABLE IF NOT EXISTS player_materials (
  owner_id TEXT NOT NULL,
  material_id TEXT NOT NULL REFERENCES material_templates(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (owner_id, material_id)
);

CREATE TABLE IF NOT EXISTS crafting_recipes (
  id TEXT PRIMARY KEY,
  result_type TEXT NOT NULL,          -- gear/material
  result_template_id TEXT NOT NULL,
  result_quantity INTEGER NOT NULL DEFAULT 1,
  ingredients_json TEXT NOT NULL,     -- MaterialQuantity[] dạng JSON
  gold_cost INTEGER,
  required_crafting_level INTEGER,
  craft_time_seconds INTEGER
);

CREATE TABLE IF NOT EXISTS enhancement_recipes (
  id TEXT PRIMARY KEY,
  slot_group_json TEXT,               -- GearSlot[] dạng JSON, NULL = mọi slot
  from_level INTEGER NOT NULL,
  to_level INTEGER NOT NULL,
  materials_json TEXT NOT NULL,
  gold_cost INTEGER,
  success_rate_percent INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS star_up_recipes (
  id TEXT PRIMARY KEY,
  from_star INTEGER NOT NULL,
  to_star INTEGER NOT NULL,
  requires_matching_element_shard INTEGER NOT NULL DEFAULT 0,
  materials_json TEXT NOT NULL,
  gold_cost INTEGER
);

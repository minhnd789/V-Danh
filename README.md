# Thư Viện Dữ Liệu Game Tu Tiên (tu-tien-lib)

Thư viện TypeScript định nghĩa toàn bộ dữ liệu cho 3 hệ thống: **Hero**, **Gear**, **Crafting & Enhancement Materials**. Thiết kế để dùng trực tiếp trong dự án Phaser.js, và có kèm schema SQL cho Cloudflare D1.

## Cấu trúc thư mục

```
types/
  common.ts     Element (7 hệ), HeroRole (3 vai trò), Rarity, BaseStats
  effects.ts       EffectType, TriggerCondition, EffectDefinition, EffectTrigger, ActiveStatusEffect
  hero.ts           Skill (có effects[]), StarBonus, HeroTemplate, HeroInstance
  gear.ts             GearSlot (10 slot), GearAffix, GearTemplate, GearInstance, GearSet
  materials.ts          MaterialCategory, CraftingRecipe, EnhancementRecipe, StarUpRecipe
utils/
  stats.ts          computeFinalHeroStats() - tổng hợp base + gear + set bonus
                       computeSkillDamage() / getElementDamageMultiplier() - sát thương + khắc chế
  effects.ts          rollTriggeredEffects() / applyStatusEffect() / tickStatusEffects() / isStunned()
data/
  heroes.sample.ts   3 hero mẫu (Hỏa/Vật lý, Thủy/Phép, Ánh Sáng/Tank-Hỗ trợ), có effect cấu trúc
  heroes.roster.ts   Roster chính 98 tướng: 7 hệ x 14 tướng, có kỹ năng sinh theo hệ/vai trò/phẩm chất
  gear.sample.ts       Gear mẫu + 1 set bonus
  materials.sample.ts  Vật liệu + công thức chế tạo/cường hóa/nâng sao mẫu
schema.sql              Schema cho Cloudflare D1 (SQLite)
index.ts                 Export toàn bộ
```

## Tóm tắt hệ thống

### 0. Hiệu ứng (Effects) - dùng chung cho Hero
- `EffectType`: DOT (bỏng/độc), HOT, hồi máu tức thời, choáng, làm chậm, khiên, buff/debuff chỉ số, giảm sát thương, khiêu khích.
- `EffectTrigger` gắn trực tiếp vào `Skill.effects[]`: gồm effect gốc + điều kiện kích hoạt (`TriggerCondition`) + tỉ lệ % xảy ra.
- `SkillUpgrade` không còn dùng text tự do (`addedEffect`) để mô tả hiệu ứng mới — thay vào đó dùng `addedEffectTrigger` (thêm effect mới có cấu trúc) hoặc `modifiedEffectId` + các trường `*Override` (chỉnh sửa effect đã có: tỉ lệ, giá trị, thời gian, ngưỡng HP).
- Hàm `getEffectiveSkillEffects(skill, star)` trong `types/hero.ts` tính ra danh sách effect THỰC TẾ đang có hiệu lực tại 1 mốc sao (đã áp mọi override) — đây là hàm nên gọi trong combat engine, không dùng trực tiếp `skill.effects`.
- `utils/effects.ts` xử lý phần runtime: roll tỉ lệ kích hoạt theo trigger, áp dụng vào danh sách `ActiveStatusEffect` của mục tiêu (có stack/refresh), và tick DOT/HOT mỗi lượt.

### 1. Hero
- 7 hệ nguyên tố: Kim, Mộc, Thủy, Hỏa, Thổ, Ánh Sáng, Bóng Tối (`Element`), có sẵn bảng khắc chế `ELEMENT_COUNTER`.
- 3 vai trò mỗi hệ: `PHYSICAL_DPS`, `MAGIC_DPS`, `TANK_SUPPORT`.
- Phẩm chất (`Rarity`) dùng chung cho Hero/Gear/Material: Phàm Phẩm → Hoàng Phẩm → Huyền Phẩm → Địa Phẩm → Thiên Phẩm → Tiên Phẩm.
- Tất cả hero khi mở khóa lần đầu nên bắt đầu ở 1 sao; phẩm chất là tiềm năng/độ hiếm, không phải số sao ban đầu.
- Roster mục tiêu hiện tại: mỗi hệ có 1 Tiên Phẩm, 2 Thiên Phẩm, 2 Địa Phẩm, 3 Huyền Phẩm, 3 Hoàng Phẩm, 3 Phàm Phẩm; tổng cộng 98 tướng trong `data/heroes.roster.ts`.
- Thiết kế kỹ năng theo phẩm chất: Phàm/Hoàng dùng archetype đơn giản theo vai trò; Huyền có thêm một biến thể phụ; Địa có combo/vị trí; Thiên có cơ chế đội hình; Tiên có cơ chế chiến trường riêng theo từng hệ.
- Mỗi hero có đúng 1 kỹ năng nội tại (`passiveSkill`) và 1 kỹ năng chủ động (`activeSkill`).
- Sao từ 1 đến 5 (`starBonuses`), mỗi mốc sao có thể mở % chỉ số (`statBonusPercent`/`statBonusFlat`) và/hoặc liên kết với `SkillUpgrade` khai báo trong chính `Skill.upgrades` (khớp qua `unlockAtStar`).
- Hàm `getHeroBaseStatsAtLevelAndStar()` tính chỉ số base theo cấp + sao.

### 2. Gear
- 10 slot: `MAIN_WEAPON`, `SUB_WEAPON`, `HELMET`, `ARMOR`, `GLOVES`, `BOOTS`, `BRACELET`, `NECKLACE`, `EARRING`, `RING` (4 loại accessory tách riêng theo yêu cầu).
- Mỗi gear có 1 dòng chính (`mainAffix`, scale theo cấp cường hóa) và nhiều dòng phụ (`rolledSubAffixes`).
- Hỗ trợ set bonus (`GearSet`) theo số món mặc đủ.
- Hàm `computeFinalHeroStats()` trong `utils/stats.ts` gộp toàn bộ: base hero + tất cả gear + set bonus → ra chỉ số cuối cùng dùng cho combat.

### 3. Crafting & Enhancement Materials
- `MaterialCategory`: khoáng thạch (chế tạo gear), tinh chất (nâng kỹ năng), đá cường hóa, phù văn, mảnh sao (nâng sao hero), sách kinh nghiệm, tiền tệ.
- 3 loại công thức riêng biệt: `CraftingRecipe` (ra gear/vật liệu mới), `EnhancementRecipe` (lên cấp gear +1 → +15), `StarUpRecipe` (nâng sao hero 1 → 5, có thể yêu cầu mảnh sao đúng hệ).

## Cách dùng nhanh

```typescript
import {
  computeFinalHeroStats,
  HERO_HOA_LONG,
  GEAR_HOA_LONG_KIEM,
  SET_HOA_LONG,
} from "tu-tien-lib";

const heroInstance = {
  instanceId: "inst_1",
  templateId: "hero_hoa_long",
  ownerId: "player_1",
  level: 20,
  star: 3,
  currentExp: 0,
  equippedGear: { main_weapon: "gear_inst_1" },
  createdAt: Date.now(),
};

const gearInstance = {
  instanceId: "gear_inst_1",
  templateId: "gear_hoa_long_kiem",
  ownerId: "player_1",
  enhanceLevel: 5,
  rolledSubAffixes: [{ stat: "critRate", value: 4, isPercent: false }],
};

const finalStats = computeFinalHeroStats({
  heroTemplate: HERO_HOA_LONG,
  heroInstance,
  gearTemplatesById: { gear_hoa_long_kiem: GEAR_HOA_LONG_KIEM },
  gearInstancesById: { gear_inst_1: gearInstance },
  gearSetsById: { set_hoa_long: SET_HOA_LONG },
});
```

## Cơ chế đã chốt

- **Khắc chế ngũ hành**: hệ số cố định — khắc địch x1.5, bị khắc x0.75, trung tính x1. Dùng hàm `getElementDamageMultiplier(attackerElement, defenderElement)` hoặc truyền trực tiếp 2 hệ vào `computeSkillDamage()`, hàm sẽ tự tính hệ số.
- **Kích hoạt kỹ năng chủ động**: tự động theo cooldown (`Skill.cooldownSeconds`). Combat loop chỉ cần giảm dần cooldown mỗi tick và tự bung chiêu khi về 0, không cần cơ chế năng lượng/nộ khí.

## Lưu ý khi lưu xuống D1

`passive_skill_json` và `active_skill_json` trong `hero_templates` đã bao gồm luôn `effects[]` (EffectTrigger có cấu trúc) vì chúng nằm trong `Skill` — không cần thêm bảng riêng cho effect. Nếu sau này muốn cho phép tạo effect dùng chung giữa nhiều skill (tái sử dụng thay vì lặp lại định nghĩa), có thể tách `EffectDefinition` ra bảng `effect_definitions` riêng và chỉ lưu `effectDefinitionId` trong skill JSON.

## Gợi ý mở rộng tiếp theo

- Thêm bảng `hero_awakening` nếu muốn có hệ thống "phá vỡ giới hạn" sau 5 sao (max* → awaken).
- Thêm `RuneTemplate` riêng nếu muốn tách phù văn khảm vào gear thành slot phụ (như Genshin/AFK Arena).
- Với idle game, nên thêm `IdleProductionRecipe` (vật liệu tự sinh ra theo thời gian offline) — hiện schema chỉ có crafting chủ động.
- Nếu dùng Durable Objects cho combat real-time, `computeFinalHeroStats()` nên được cache lại mỗi khi hero/gear thay đổi, tránh tính lại mỗi lượt đánh.

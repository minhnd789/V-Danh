// ============================================================
// hero.ts - Định nghĩa Hero: kỹ năng, hệ thống sao, template/instance
// ============================================================

import { BaseStats, Element, HeroRole, Rarity } from "./common";
import { EffectTrigger } from "./effects";
import { GearSlot } from "./gear";

/** Loại kỹ năng: nội tại (passive, tự kích hoạt) hoặc chủ động (active, có cooldown). */
export enum SkillType {
  PASSIVE = "passive",   // Kỹ năng nội tại
  ACTIVE = "active",     // Kỹ năng chủ động
}

/** Cách chọn mục tiêu trên bàn 3x3. */
export enum TargetingType {
  FRONTMOST_ENEMY = "frontmost_enemy",
  BACKLINE_ENEMY = "backline_enemy",
  LOWEST_HP_ENEMY = "lowest_hp_enemy",
  HIGHEST_ATK_ENEMY = "highest_atk_enemy",
  SAME_ROW = "same_row",
  SAME_COLUMN = "same_column",
  RANDOM_ENEMY = "random_enemy",
  ALL_ENEMIES = "all_enemies",
  SELF = "self",
  LOWEST_HP_ALLY = "lowest_hp_ally",
  ALL_ALLIES = "all_allies",
  ADJACENT_ALLIES = "adjacent_allies",
}

/** Vùng ảnh hưởng của kỹ năng sau khi đã chọn mục tiêu chính. */
export enum AreaPattern {
  SINGLE = "single",
  ROW = "row",
  COLUMN = "column",
  CROSS = "cross",
  AROUND_TARGET = "around_target",
  ALL = "all",
}

/**
 * Một mốc nâng cấp kỹ năng được mở khi nhân vật đạt số sao tương ứng.
 * Ví dụ: đạt 3 sao -> tăng tỉ lệ gây bỏng; đạt 5 sao -> thêm hiệu ứng choáng.
 */
export interface SkillUpgrade {
  unlockAtStar: number;              // 1-5, sao cần đạt để mở upgrade này
  description: string;               // Mô tả tiếng Việt hiển thị UI
  valueIncreasePercent?: number;     // % tăng thêm sát thương gốc của kỹ năng (atk/matk scaling)
  addedEffectTrigger?: EffectTrigger; // Hiệu ứng CẤU TRÚC mới được thêm vào ở mốc sao này
  modifiedEffectId?: string;          // id của EffectDefinition đã có (trong effects[]), muốn chỉnh
  effectChancePercentOverride?: number; // Ghi đè tỉ lệ kích hoạt của effect đã có
  effectValueOverride?: number;         // Ghi đè giá trị (value) của effect đã có
  effectDurationTurnsOverride?: number; // Ghi đè số lượt kéo dài của effect đã có
  effectHpThresholdPercentOverride?: number; // Ghi đè ngưỡng % HP kích hoạt (chỉ dùng với ON_HP_BELOW_THRESHOLD)
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  cooldownSeconds?: number;      // Chỉ áp dụng cho ACTIVE
  energyCost?: number;           // Nếu dùng hệ thống năng lượng/nộ khí
  scalingStat: keyof BaseStats;  // Chỉ số dùng để scale sát thương chính (atk/matk...)
  scalingPercent: number;        // % của scalingStat, ví dụ 150 = 150% ATK
  damageElement?: Element;       // Hệ sát thương gây ra (mặc định theo hệ của hero nếu bỏ trống)
  targeting?: TargetingType;      // Cách chọn mục tiêu trên bàn 3x3
  areaPattern?: AreaPattern;      // Vùng ảnh hưởng quanh mục tiêu
  mechanicTags?: string[];        // Nhãn cơ chế để combat engine xử lý riêng nếu cần
  formationNote?: string;         // Mô tả ngắn tương tác vị trí/đội hình cho UI và thiết kế
  effects: EffectTrigger[];      // Hiệu ứng phụ có cấu trúc (bỏng, làm chậm, khiên, hồi máu...)
  upgrades: SkillUpgrade[];      // Danh sách mốc nâng cấp theo sao (0 tới nhiều mốc)
}

/**
 * Một mốc sao (1 đến 5). Mỗi mốc có thể mở thêm % chỉ số hoặc kích hoạt SkillUpgrade
 * tương ứng đã khai báo trong Skill.upgrades (liên kết qua unlockAtStar).
 */
export interface StarBonus {
  star: number;                       // 1-5
  statBonusPercent?: Partial<BaseStats>; // Bonus dạng % cộng thêm vào base stats
  statBonusFlat?: Partial<BaseStats>;    // Bonus dạng cộng thẳng
  unlockDescription: string;          // Mô tả ngắn hiển thị trong UI khi lên sao
}

/** Template = định nghĩa "thiết kế gốc" của một nhân vật, dùng chung cho mọi người chơi. */
export interface HeroTemplate {
  id: string;
  name: string;
  title?: string;               // Danh hiệu, ví dụ "Kiếm Tôn", "Hỏa Long Chi Chủ"
  element: Element;
  role: HeroRole;
  rarity: Rarity;
  baseStats: BaseStats;          // Chỉ số ở cấp 1, sao 1
  statGrowthPerLevel: Partial<BaseStats>; // Chỉ số cộng thêm mỗi cấp độ
  maxLevel: number;              // Cấp tối đa (có thể tăng theo breakthrough/tu vi)
  passiveSkill: Skill;
  activeSkill: Skill;
  starBonuses: StarBonus[];      // Độ dài tối đa 5 (ứng với sao 1 -> 5)
  maxStar: 5;
  lore?: string;                 // Tiểu sử/cốt truyện nhân vật
  avatarUrl?: string;
}

/** Instance = nhân vật cụ thể mà một người chơi đang sở hữu. */
export interface HeroInstance {
  instanceId: string;
  templateId: string;
  ownerId: string;               // ID người chơi sở hữu
  level: number;
  star: number;                  // 1-5, không vượt quá HeroTemplate.maxStar
  currentExp: number;
  equippedGear: Partial<Record<GearSlot, string>>; // slot -> GearInstance.instanceId
  createdAt: number;              // timestamp lúc thu thập được
}

/**
 * Tính tổng chỉ số hiện tại của một HeroInstance dựa trên template, cấp độ và sao
 * (chưa cộng gear - phần gear tính riêng trong utils/stats.ts).
 */
export function getHeroBaseStatsAtLevelAndStar(
  template: HeroTemplate,
  level: number,
  star: number
): BaseStats {
  const levelsAboveOne = Math.max(0, level - 1);
  let stats: BaseStats = {
    hp: template.baseStats.hp + (template.statGrowthPerLevel.hp ?? 0) * levelsAboveOne,
    atk: template.baseStats.atk + (template.statGrowthPerLevel.atk ?? 0) * levelsAboveOne,
    matk: template.baseStats.matk + (template.statGrowthPerLevel.matk ?? 0) * levelsAboveOne,
    def: template.baseStats.def + (template.statGrowthPerLevel.def ?? 0) * levelsAboveOne,
    mdef: template.baseStats.mdef + (template.statGrowthPerLevel.mdef ?? 0) * levelsAboveOne,
    spd: template.baseStats.spd + (template.statGrowthPerLevel.spd ?? 0) * levelsAboveOne,
    critRate: template.baseStats.critRate + (template.statGrowthPerLevel.critRate ?? 0) * levelsAboveOne,
    critDmg: template.baseStats.critDmg + (template.statGrowthPerLevel.critDmg ?? 0) * levelsAboveOne,
  };

  for (const bonus of template.starBonuses) {
    if (bonus.star > star) continue;
    if (bonus.statBonusFlat) {
      for (const key of Object.keys(bonus.statBonusFlat) as (keyof BaseStats)[]) {
        stats[key] += bonus.statBonusFlat[key] ?? 0;
      }
    }
    if (bonus.statBonusPercent) {
      for (const key of Object.keys(bonus.statBonusPercent) as (keyof BaseStats)[]) {
        stats[key] *= 1 + (bonus.statBonusPercent[key] ?? 0) / 100;
      }
    }
  }

  return stats;
}

/** Trả về danh sách SkillUpgrade đã được mở khoá dựa trên số sao hiện tại. */
export function getUnlockedSkillUpgrades(skill: Skill, star: number): SkillUpgrade[] {
  return skill.upgrades.filter((u) => u.unlockAtStar <= star);
}

/**
 * Tổng hợp danh sách EffectTrigger THỰC TẾ đang có hiệu lực của một kỹ năng tại số sao hiện tại:
 * - Bắt đầu từ skill.effects (effect gốc).
 * - Áp override (chance/value/duration) từ các SkillUpgrade đã mở khoá, khớp theo modifiedEffectId.
 * - Thêm các addedEffectTrigger mới được mở khoá theo sao.
 * Dùng hàm này trong combat engine, KHÔNG dùng skill.effects trực tiếp khi hero đã lên sao.
 */
export function getEffectiveSkillEffects(skill: Skill, star: number): EffectTrigger[] {
  const unlockedUpgrades = getUnlockedSkillUpgrades(skill, star);

  // Deep clone đơn giản để không làm bẩn dữ liệu gốc trong template
  const effects: EffectTrigger[] = skill.effects.map((e) => ({
    ...e,
    effect: { ...e.effect },
  }));

  for (const upgrade of unlockedUpgrades) {
    if (upgrade.modifiedEffectId) {
      const target = effects.find((e) => e.effect.id === upgrade.modifiedEffectId);
      if (target) {
        if (upgrade.effectChancePercentOverride !== undefined) {
          target.chancePercent = upgrade.effectChancePercentOverride;
        }
        if (upgrade.effectValueOverride !== undefined) {
          target.effect.value = upgrade.effectValueOverride;
        }
        if (upgrade.effectDurationTurnsOverride !== undefined) {
          target.effect.durationTurns = upgrade.effectDurationTurnsOverride;
        }
        if (upgrade.effectHpThresholdPercentOverride !== undefined) {
          target.hpThresholdPercent = upgrade.effectHpThresholdPercentOverride;
        }
      }
    }
    if (upgrade.addedEffectTrigger) {
      effects.push({ ...upgrade.addedEffectTrigger, effect: { ...upgrade.addedEffectTrigger.effect } });
    }
  }

  return effects;
}

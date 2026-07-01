// ============================================================
// heroes.sample.ts - Dữ liệu mẫu minh họa (3 hero khác hệ/vai trò)
// ============================================================

import { Element, HeroRole, Rarity } from "../types/common";
import { EffectType, TriggerCondition } from "../types/effects";
import { HeroTemplate, SkillType } from "../types/hero";

/** Hero 1: Hỏa hệ - DPS vật lý */
export const HERO_HOA_LONG: HeroTemplate = {
  id: "hero_hoa_long",
  name: "Chu Diễm",
  title: "Hỏa Long Kiếm Khách",
  element: Element.FIRE,
  role: HeroRole.PHYSICAL_DPS,
  rarity: Rarity.DIA,
  baseStats: { hp: 1200, atk: 180, matk: 20, def: 80, mdef: 60, spd: 105, critRate: 8, critDmg: 50 },
  statGrowthPerLevel: { hp: 42, atk: 6.5, def: 2.8, mdef: 2.0, matk: 0.5, critRate: 0, critDmg: 0 },
  maxLevel: 80,
  passiveSkill: {
    id: "hoa_long_passive",
    name: "Huyết Hỏa Thân",
    description: "Mỗi khi ra chiêu chí mạng, hồi 3% HP tối đa.",
    type: SkillType.PASSIVE,
    scalingStat: "atk",
    scalingPercent: 0,
    effects: [
      {
        effect: {
          id: "hoa_long_passive_heal",
          type: EffectType.INSTANT_HEAL,
          durationTurns: 0,
          value: 3, // % HP tối đa
          valueIsPercent: true,
          stackable: false,
        },
        trigger: TriggerCondition.ON_CRIT_HIT,
        chancePercent: 100,
      },
    ],
    upgrades: [
      {
        unlockAtStar: 3,
        description: "Tăng hồi máu chí mạng lên 5% HP tối đa.",
        modifiedEffectId: "hoa_long_passive_heal",
        effectValueOverride: 5,
      },
      {
        unlockAtStar: 5,
        description: "Thêm hiệu ứng: giảm 10% sát thương nhận vào trong 2 lượt sau khi hồi máu.",
        addedEffectTrigger: {
          effect: {
            id: "hoa_long_passive_dmg_reduction",
            type: EffectType.DAMAGE_REDUCTION,
            durationTurns: 2,
            value: 10, // % giảm sát thương nhận vào
            valueIsPercent: true,
            stackable: false,
          },
          trigger: TriggerCondition.ON_CRIT_HIT,
          chancePercent: 100,
        },
      },
    ],
  },
  activeSkill: {
    id: "hoa_long_active",
    name: "Liệt Hỏa Trảm",
    description: "Vung kiếm gây sát thương Hỏa lên kẻ địch, có 30% gây bỏng 2 lượt.",
    type: SkillType.ACTIVE,
    cooldownSeconds: 8,
    scalingStat: "atk",
    scalingPercent: 220,
    damageElement: Element.FIRE,
    effects: [
      {
        effect: {
          id: "hoa_long_active_burn",
          type: EffectType.DAMAGE_OVER_TIME,
          durationTurns: 2,
          value: 15, // % ATK người gây bỏng, tính thành sát thương mỗi lượt
          valueIsPercent: true,
          stackable: true,
          maxStacks: 3,
        },
        trigger: TriggerCondition.ON_SKILL_CAST,
        chancePercent: 30,
      },
    ],
    upgrades: [
      {
        unlockAtStar: 2,
        description: "Tăng tỉ lệ gây bỏng lên 50%.",
        modifiedEffectId: "hoa_long_active_burn",
        effectChancePercentOverride: 50,
      },
      {
        unlockAtStar: 4,
        description: "Sát thương +30%, bỏng chắc chắn xảy ra.",
        valueIncreasePercent: 30,
        modifiedEffectId: "hoa_long_active_burn",
        effectChancePercentOverride: 100,
      },
    ],
  },
  starBonuses: [
    { star: 1, unlockDescription: "Cơ bản." },
    { star: 2, statBonusPercent: { atk: 5 }, unlockDescription: "Tăng 5% ATK." },
    { star: 3, statBonusPercent: { atk: 8, critRate: 3 }, unlockDescription: "Tăng 8% ATK, 3% tỉ lệ chí mạng. Mở nâng cấp kỹ năng nội tại." },
    { star: 4, statBonusPercent: { atk: 8 }, unlockDescription: "Tăng thêm 8% ATK. Mở nâng cấp kỹ năng chủ động." },
    { star: 5, statBonusPercent: { atk: 12, hp: 10 }, unlockDescription: "Tăng mạnh ATK và HP. Mở nâng cấp kỹ năng nội tại tối đa." },
  ],
  maxStar: 5,
  lore: "Truyền nhân cuối cùng của Hỏa Long Kiếm Tông, mang trong mình huyết mạch rồng lửa.",
};

/** Hero 2: Thủy hệ - DPS phép */
export const HERO_THUY_NGUYET: HeroTemplate = {
  id: "hero_thuy_nguyet",
  name: "Lý Nguyệt Nhi",
  title: "Băng Nguyệt Thánh Nữ",
  element: Element.WATER,
  role: HeroRole.MAGIC_DPS,
  rarity: Rarity.THIEN,
  baseStats: { hp: 1000, atk: 30, matk: 200, def: 55, mdef: 90, spd: 100, critRate: 10, critDmg: 60 },
  statGrowthPerLevel: { hp: 35, matk: 7.2, def: 1.8, mdef: 2.5, atk: 0.3, critRate: 0, critDmg: 0 },
  maxLevel: 80,
  passiveSkill: {
    id: "thuy_nguyet_passive",
    name: "Nguyệt Ảnh Lưu Ly",
    description: "Khi HP dưới 50%, tăng 15% sát thương phép trong 3 lượt.",
    type: SkillType.PASSIVE,
    scalingStat: "matk",
    scalingPercent: 0,
    effects: [
      {
        effect: {
          id: "thuy_nguyet_passive_buff_matk",
          type: EffectType.BUFF_STAT,
          durationTurns: 3,
          value: 15, // % matk
          valueIsPercent: true,
          affectedStat: "matk",
          stackable: false,
        },
        trigger: TriggerCondition.ON_HP_BELOW_THRESHOLD,
        chancePercent: 100,
        hpThresholdPercent: 50,
      },
    ],
    upgrades: [
      {
        unlockAtStar: 3,
        description: "Ngưỡng kích hoạt tăng lên 65% HP.",
        modifiedEffectId: "thuy_nguyet_passive_buff_matk",
        effectHpThresholdPercentOverride: 65,
      },
      {
        unlockAtStar: 5,
        description: "Thêm hiệu ứng khiên chắn 10% HP tối đa khi kích hoạt.",
        addedEffectTrigger: {
          effect: {
            id: "thuy_nguyet_passive_shield",
            type: EffectType.SHIELD,
            durationTurns: 3,
            value: 10, // % HP tối đa
            valueIsPercent: true,
            stackable: false,
          },
          trigger: TriggerCondition.ON_HP_BELOW_THRESHOLD,
          chancePercent: 100,
          hpThresholdPercent: 50,
        },
      },
    ],
  },
  activeSkill: {
    id: "thuy_nguyet_active",
    name: "Băng Nguyệt Trận",
    description: "Triệu hồi trận băng gây sát thương diện rộng, làm chậm 20% tốc độ địch.",
    type: SkillType.ACTIVE,
    cooldownSeconds: 10,
    scalingStat: "matk",
    scalingPercent: 260,
    damageElement: Element.WATER,
    effects: [
      {
        effect: {
          id: "thuy_nguyet_active_slow",
          type: EffectType.SLOW,
          durationTurns: 2,
          value: 20, // % giảm spd
          valueIsPercent: true,
          stackable: false,
        },
        trigger: TriggerCondition.ON_SKILL_CAST,
        chancePercent: 100,
      },
    ],
    upgrades: [
      {
        unlockAtStar: 2,
        description: "Tăng phạm vi ảnh hưởng (áp dụng slow lên nhiều mục tiêu hơn, xử lý ở combat engine).",
      },
      {
        unlockAtStar: 4,
        description: "Tăng hiệu ứng làm chậm lên 35% và kéo dài thêm 1 lượt.",
        modifiedEffectId: "thuy_nguyet_active_slow",
        effectValueOverride: 35,
        effectDurationTurnsOverride: 3,
      },
    ],
  },
  starBonuses: [
    { star: 1, unlockDescription: "Cơ bản." },
    { star: 2, statBonusPercent: { matk: 5 }, unlockDescription: "Tăng 5% sát thương phép." },
    { star: 3, statBonusPercent: { matk: 8, mdef: 5 }, unlockDescription: "Tăng sát thương phép & giáp phép. Mở nâng cấp kỹ năng nội tại." },
    { star: 4, statBonusPercent: { matk: 8 }, unlockDescription: "Tăng thêm sát thương phép. Mở nâng cấp kỹ năng chủ động." },
    { star: 5, statBonusPercent: { matk: 15, critDmg: 10 }, unlockDescription: "Bứt phá sát thương phép và chí mạng." },
  ],
  maxStar: 5,
  lore: "Đệ tử của Băng Nguyệt Cung, tu luyện chân khí thủy hệ tới cảnh giới Ngưng Băng Thành Nguyệt.",
};

/** Hero 3: Ánh Sáng hệ - Tank/Hỗ trợ */
export const HERO_QUANG_MINH: HeroTemplate = {
  id: "hero_quang_minh",
  name: "Bạch Dịch Phong",
  title: "Quang Minh Hộ Pháp",
  element: Element.LIGHT,
  role: HeroRole.TANK_SUPPORT,
  rarity: Rarity.HUYEN,
  baseStats: { hp: 2200, atk: 60, matk: 60, def: 160, mdef: 140, spd: 90, critRate: 5, critDmg: 30 },
  statGrowthPerLevel: { hp: 70, def: 5.5, mdef: 4.8, atk: 1.0, matk: 1.0, critRate: 0, critDmg: 0 },
  maxLevel: 80,
  passiveSkill: {
    id: "quang_minh_passive",
    name: "Thánh Quang Trường Tồn",
    description: "Đầu trận tự động tạo khiên chắn bằng 20% HP tối đa cho cả team.",
    type: SkillType.PASSIVE,
    scalingStat: "hp",
    scalingPercent: 20,
    effects: [
      {
        effect: {
          id: "quang_minh_passive_shield",
          type: EffectType.SHIELD,
          durationTurns: 5, // Khiên tồn tại tối đa 5 lượt hoặc tới khi bị phá hết
          value: 20, // % HP tối đa
          valueIsPercent: true,
          stackable: false,
        },
        trigger: TriggerCondition.ON_BATTLE_START,
        chancePercent: 100,
      },
    ],
    upgrades: [
      {
        unlockAtStar: 3,
        description: "Khiên tăng lên 28% HP tối đa.",
        modifiedEffectId: "quang_minh_passive_shield",
        effectValueOverride: 28,
      },
      {
        unlockAtStar: 5,
        description: "Khiên hồi phục thêm 50% giá trị ban đầu ở lượt thứ 3 (xử lý riêng trong combat engine dựa trên effect id này).",
      },
    ],
  },
  activeSkill: {
    id: "quang_minh_active",
    name: "Thánh Quang Trấn Hộ",
    description: "Hút toàn bộ đòn tấn công của địch trong 1 lượt và hồi máu cho bản thân.",
    type: SkillType.ACTIVE,
    cooldownSeconds: 12,
    scalingStat: "hp",
    scalingPercent: 15,
    damageElement: Element.LIGHT,
    effects: [
      {
        effect: {
          id: "quang_minh_active_taunt",
          type: EffectType.TAUNT,
          durationTurns: 1,
          value: 0,
          valueIsPercent: false,
          stackable: false,
        },
        trigger: TriggerCondition.ON_SKILL_CAST,
        chancePercent: 100,
      },
      {
        effect: {
          id: "quang_minh_active_heal",
          type: EffectType.INSTANT_HEAL,
          durationTurns: 0,
          value: 15, // % HP tối đa
          valueIsPercent: true,
          stackable: false,
        },
        trigger: TriggerCondition.ON_SKILL_CAST,
        chancePercent: 100,
      },
    ],
    upgrades: [
      {
        unlockAtStar: 2,
        description: "Tăng lượng máu hồi phục lên 20% HP tối đa.",
        modifiedEffectId: "quang_minh_active_heal",
        effectValueOverride: 20,
      },
      {
        unlockAtStar: 4,
        description: "Giảm 20% sát thương nhận vào trong lúc hiệu ứng hút đòn.",
        addedEffectTrigger: {
          effect: {
            id: "quang_minh_active_dmg_reduction",
            type: EffectType.DAMAGE_REDUCTION,
            durationTurns: 1,
            value: 20,
            valueIsPercent: true,
            stackable: false,
          },
          trigger: TriggerCondition.ON_SKILL_CAST,
          chancePercent: 100,
        },
      },
    ],
  },
  starBonuses: [
    { star: 1, unlockDescription: "Cơ bản." },
    { star: 2, statBonusPercent: { hp: 6 }, unlockDescription: "Tăng 6% HP tối đa." },
    { star: 3, statBonusPercent: { hp: 8, def: 6 }, unlockDescription: "Tăng HP và giáp vật lý. Mở nâng cấp kỹ năng nội tại." },
    { star: 4, statBonusPercent: { def: 8, mdef: 8 }, unlockDescription: "Tăng cả 2 loại giáp. Mở nâng cấp kỹ năng chủ động." },
    { star: 5, statBonusPercent: { hp: 15 }, unlockDescription: "Bứt phá HP tối đa, trở thành lá chắn vững chắc cho team." },
  ],
  maxStar: 5,
  lore: "Hộ Pháp trấn giữ Quang Minh Điện, thân mang chân khí ánh sáng bất diệt.",
};

export const SAMPLE_HEROES: HeroTemplate[] = [HERO_HOA_LONG, HERO_THUY_NGUYET, HERO_QUANG_MINH];

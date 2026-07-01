// ============================================================
// stats.ts - Tổng hợp chỉ số cuối cùng: Hero + Gear + Set Bonus
// ============================================================

import { addStats, BaseStats, Element, ELEMENT_COUNTER, scaleStats } from "../types/common";
import {
  getHeroBaseStatsAtLevelAndStar,
  HeroInstance,
  HeroTemplate,
} from "../types/hero";
import {
  GearInstance,
  GearSet,
  GearTemplate,
  getMainAffixValueAtEnhanceLevel,
} from "../types/gear";

export interface StatContext {
  heroTemplate: HeroTemplate;
  heroInstance: HeroInstance;
  gearTemplatesById: Record<string, GearTemplate>;
  gearInstancesById: Record<string, GearInstance>;
  gearSetsById?: Record<string, GearSet>;
}

/**
 * Tính chỉ số cuối cùng của một hero: base (theo cấp+sao) + tất cả gear đang mặc
 * + bonus set (nếu đủ số món). Đây là hàm chính để gọi trước mỗi trận đấu.
 */
export function computeFinalHeroStats(ctx: StatContext): BaseStats {
  let stats = getHeroBaseStatsAtLevelAndStar(
    ctx.heroTemplate,
    ctx.heroInstance.level,
    ctx.heroInstance.star
  );

  // Cộng chỉ số từ từng món gear đang trang bị
  const equippedSetCounts: Record<string, number> = {};

  for (const gearInstanceId of Object.values(ctx.heroInstance.equippedGear)) {
    if (!gearInstanceId) continue;
    const gearInstance = ctx.gearInstancesById[gearInstanceId];
    if (!gearInstance) continue;
    const gearTemplate = ctx.gearTemplatesById[gearInstance.templateId];
    if (!gearTemplate) continue;

    // Base stats cố định của gear
    stats = addStats(stats, gearTemplate.baseStats);

    // Dòng chính (main affix) scale theo cấp cường hóa
    const mainAffixValue = getMainAffixValueAtEnhanceLevel(
      gearTemplate,
      gearInstance.enhanceLevel
    );
    stats = addStats(stats, { [gearTemplate.mainAffix.stat]: mainAffixValue });

    // Các dòng phụ đã roll
    for (const sub of gearInstance.rolledSubAffixes) {
      if (sub.isPercent) {
        stats = scaleStats(stats, { [sub.stat]: sub.value });
      } else {
        stats = addStats(stats, { [sub.stat]: sub.value });
      }
    }

    // Đếm số món theo set để tính bonus set sau
    if (gearTemplate.setId) {
      equippedSetCounts[gearTemplate.setId] = (equippedSetCounts[gearTemplate.setId] ?? 0) + 1;
    }
  }

  // Áp dụng bonus set nếu đủ số món yêu cầu
  if (ctx.gearSetsById) {
    for (const [setId, count] of Object.entries(equippedSetCounts)) {
      const gearSet = ctx.gearSetsById[setId];
      if (!gearSet) continue;
      for (const bonus of gearSet.bonuses) {
        if (count >= bonus.piecesRequired) {
          if (bonus.statBonusFlat) stats = addStats(stats, bonus.statBonusFlat);
          if (bonus.statBonusPercent) stats = scaleStats(stats, bonus.statBonusPercent);
        }
      }
    }
  }

  return stats;
}

/** Hệ số cố định cho khắc chế ngũ hành: khắc địch = tăng dmg, bị khắc = giảm dmg, còn lại = trung tính. */
export const ELEMENT_MULTIPLIER = {
  ADVANTAGE: 1.5,   // Hệ tấn công khắc hệ mục tiêu (ví dụ Hỏa đánh Kim)
  DISADVANTAGE: 0.75, // Hệ tấn công bị hệ mục tiêu khắc
  NEUTRAL: 1,          // Không khắc chế nhau
} as const;

/**
 * Xác định hệ số khắc chế giữa hệ tấn công và hệ mục tiêu, dựa trên ELEMENT_COUNTER.
 * Ví dụ: attackerElement = FIRE, defenderElement = METAL -> FIRE khắc METAL -> ADVANTAGE (1.5).
 */
export function getElementDamageMultiplier(
  attackerElement: Element,
  defenderElement: Element
): number {
  if (ELEMENT_COUNTER[attackerElement] === defenderElement) {
    return ELEMENT_MULTIPLIER.ADVANTAGE;
  }
  if (ELEMENT_COUNTER[defenderElement] === attackerElement) {
    return ELEMENT_MULTIPLIER.DISADVANTAGE;
  }
  return ELEMENT_MULTIPLIER.NEUTRAL;
}

/**
 * Tính sát thương gây ra bởi một kỹ năng, tự động áp dụng hệ số khắc chế ngũ hành
 * nếu cung cấp đủ hệ của người tấn công và mục tiêu.
 */
export function computeSkillDamage(
  attackerStats: BaseStats,
  scalingStat: keyof BaseStats,
  scalingPercent: number,
  attackerElement?: Element,
  defenderElement?: Element
): number {
  const base = attackerStats[scalingStat] * (scalingPercent / 100);
  const elementMultiplier =
    attackerElement && defenderElement
      ? getElementDamageMultiplier(attackerElement, defenderElement)
      : ELEMENT_MULTIPLIER.NEUTRAL;
  return base * elementMultiplier;
}

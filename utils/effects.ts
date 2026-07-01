// ============================================================
// effects.ts (utils) - Xử lý hiệu ứng trong combat: roll, áp dụng, tick theo lượt
// ============================================================

import {
  ActiveStatusEffect,
  EffectDefinition,
  EffectTrigger,
  EffectType,
  TriggerCondition,
} from "../types/effects";

/**
 * Roll tỉ lệ kích hoạt cho từng EffectTrigger khớp với trigger hiện tại.
 * Trả về danh sách EffectDefinition đã kích hoạt thành công (có thể rỗng).
 * casterHpPercent chỉ cần truyền khi trigger = ON_HP_BELOW_THRESHOLD.
 */
export function rollTriggeredEffects(
  effectTriggers: EffectTrigger[],
  currentTrigger: TriggerCondition,
  casterHpPercent?: number,
  rng: () => number = Math.random
): EffectDefinition[] {
  const triggered: EffectDefinition[] = [];

  for (const et of effectTriggers) {
    if (et.trigger !== currentTrigger) continue;

    if (et.trigger === TriggerCondition.ON_HP_BELOW_THRESHOLD) {
      if (casterHpPercent === undefined || et.hpThresholdPercent === undefined) continue;
      if (casterHpPercent > et.hpThresholdPercent) continue;
    }

    if (rng() * 100 <= et.chancePercent) {
      triggered.push(et.effect);
    }
  }

  return triggered;
}

/**
 * Áp dụng một EffectDefinition đã kích hoạt vào danh sách ActiveStatusEffect hiện tại của mục tiêu.
 * - Nếu effect không stackable và đã tồn tại -> chỉ refresh lại thời gian (remainingTurns).
 * - Nếu stackable -> tăng currentStacks (không vượt maxStacks).
 * - Nếu effect tức thời (durationTurns = 0, ví dụ INSTANT_HEAL) -> không thêm vào danh sách active,
 *   engine combat nên xử lý hiệu ứng này ngay tại thời điểm kích hoạt rồi bỏ qua.
 */
export function applyStatusEffect(
  activeEffects: ActiveStatusEffect[],
  effect: EffectDefinition,
  sourceHeroInstanceId: string,
  targetHeroInstanceId: string,
  newInstanceId: string
): ActiveStatusEffect[] {
  if (effect.durationTurns === 0) {
    // Hiệu ứng tức thời: không lưu vào active list, xử lý ngay ở nơi gọi hàm này.
    return activeEffects;
  }

  const existing = activeEffects.find(
    (a) => a.effectDefinitionId === effect.id && a.targetHeroInstanceId === targetHeroInstanceId
  );

  if (existing) {
    if (effect.stackable) {
      existing.currentStacks = Math.min(existing.currentStacks + 1, effect.maxStacks ?? Infinity);
    }
    existing.remainingTurns = effect.durationTurns; // refresh thời gian
    return activeEffects;
  }

  return [
    ...activeEffects,
    {
      instanceId: newInstanceId,
      effectDefinitionId: effect.id,
      sourceHeroInstanceId,
      targetHeroInstanceId,
      remainingTurns: effect.durationTurns,
      currentStacks: 1,
    },
  ];
}

export interface TickEvent {
  targetHeroInstanceId: string;
  effectType: EffectType;
  hpChangePercentOfMaxHp: number; // Âm = mất máu (DOT), dương = hồi máu (HOT)
}

/**
 * Xử lý 1 lượt trôi qua: giảm remainingTurns của mọi active effect, loại bỏ effect đã hết hạn,
 * và trả về danh sách sự kiện DOT/HOT cần áp dụng lên HP mục tiêu trong lượt này.
 */
export function tickStatusEffects(
  activeEffects: ActiveStatusEffect[],
  effectDefinitionsById: Record<string, EffectDefinition>
): { updatedEffects: ActiveStatusEffect[]; events: TickEvent[] } {
  const events: TickEvent[] = [];
  const updatedEffects: ActiveStatusEffect[] = [];

  for (const active of activeEffects) {
    const def = effectDefinitionsById[active.effectDefinitionId];
    if (!def) continue;

    if (def.type === EffectType.DAMAGE_OVER_TIME) {
      events.push({
        targetHeroInstanceId: active.targetHeroInstanceId,
        effectType: def.type,
        hpChangePercentOfMaxHp: -Math.abs(def.value) * active.currentStacks,
      });
    } else if (def.type === EffectType.HEAL_OVER_TIME) {
      events.push({
        targetHeroInstanceId: active.targetHeroInstanceId,
        effectType: def.type,
        hpChangePercentOfMaxHp: Math.abs(def.value) * active.currentStacks,
      });
    }

    const remaining = active.remainingTurns - 1;
    if (remaining > 0) {
      updatedEffects.push({ ...active, remainingTurns: remaining });
    }
    // remaining <= 0 -> hiệu ứng hết hạn, không đưa vào updatedEffects
  }

  return { updatedEffects, events };
}

/** Kiểm tra nhanh: mục tiêu có đang bị STUN không (dùng để bỏ lượt hành động). */
export function isStunned(
  activeEffects: ActiveStatusEffect[],
  targetHeroInstanceId: string,
  effectDefinitionsById: Record<string, EffectDefinition>
): boolean {
  return activeEffects.some(
    (a) =>
      a.targetHeroInstanceId === targetHeroInstanceId &&
      effectDefinitionsById[a.effectDefinitionId]?.type === EffectType.STUN
  );
}

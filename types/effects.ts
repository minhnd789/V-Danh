// ============================================================
// effects.ts - Hệ thống hiệu ứng buff/debuff/DOT/HOT có cấu trúc
// Thay thế cho các mô tả dạng text (addedEffect) trước đây.
// ============================================================

import { BaseStats } from "./common";

/** Các loại hiệu ứng được hỗ trợ. Mở rộng thêm khi cần loại mới. */
export enum EffectType {
  DAMAGE_OVER_TIME = "damage_over_time",     // Bỏng, trúng độc... gây sát thương mỗi lượt
  HEAL_OVER_TIME = "heal_over_time",           // Hồi máu mỗi lượt trong nhiều lượt
  INSTANT_HEAL = "instant_heal",                 // Hồi máu ngay lập tức, không kéo dài
  STUN = "stun",                                    // Choáng, mất lượt hành động
  SLOW = "slow",                                      // Giảm tốc độ hành động (spd)
  SHIELD = "shield",                                    // Khiên chắn sát thương
  BUFF_STAT = "buff_stat",                                // Tăng 1 chỉ số cụ thể trong N lượt
  DEBUFF_STAT = "debuff_stat",                              // Giảm 1 chỉ số cụ thể trong N lượt
  DAMAGE_REDUCTION = "damage_reduction",                      // Giảm % sát thương nhận vào
  TAUNT = "taunt",                                               // Buộc địch nhắm vào mình
}

/** Điều kiện để một hiệu ứng được kích hoạt. */
export enum TriggerCondition {
  ON_SKILL_CAST = "on_skill_cast",                 // Mỗi lần dùng kỹ năng chủ động
  ON_BASIC_ATTACK = "on_basic_attack",               // Mỗi lần đánh thường
  ON_CRIT_HIT = "on_crit_hit",                         // Khi ra đòn chí mạng
  ON_BATTLE_START = "on_battle_start",                   // Đầu trận (thường dùng cho passive)
  ON_HP_BELOW_THRESHOLD = "on_hp_below_threshold",         // Khi HP bản thân xuống dưới % nào đó
  ALWAYS_ACTIVE = "always_active",                           // Hiệu ứng thường trực, không cần trigger
}

/**
 * Định nghĩa gốc của một hiệu ứng gắn trên kỹ năng/nội tại (phần "thiết kế").
 * Khi kích hoạt thành công trong combat sẽ sinh ra một ActiveStatusEffect (runtime).
 */
export interface EffectDefinition {
  id: string;
  type: EffectType;
  durationTurns: number;           // 0 = tức thời (instant heal, shield 1 lần), >0 = kéo dài N lượt
  value: number;                    // % HP tối đa/lượt (DOT/HOT), % giảm spd, % chỉ số buff, v.v.
  valueIsPercent: boolean;
  affectedStat?: keyof BaseStats;   // Chỉ dùng cho BUFF_STAT / DEBUFF_STAT
  stackable: boolean;
  maxStacks?: number;
}

/** Liên kết một EffectDefinition với điều kiện kích hoạt + tỉ lệ xảy ra, gắn trực tiếp vào Skill. */
export interface EffectTrigger {
  effect: EffectDefinition;
  trigger: TriggerCondition;
  chancePercent: number;             // 100 = luôn kích hoạt khi điều kiện đúng
  hpThresholdPercent?: number;       // Chỉ dùng khi trigger = ON_HP_BELOW_THRESHOLD
}

/**
 * Trạng thái hiệu ứng đang tồn tại trong MỘT trận đấu cụ thể (runtime).
 * Không lưu DB lâu dài — chỉ tồn tại trong bộ nhớ trong lúc combat đang diễn ra.
 */
export interface ActiveStatusEffect {
  instanceId: string;
  effectDefinitionId: string;
  sourceHeroInstanceId: string;
  targetHeroInstanceId: string;
  remainingTurns: number;
  currentStacks: number;
}

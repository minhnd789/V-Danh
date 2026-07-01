// ============================================================
// gear.ts - Định nghĩa trang bị: slot, affix, set bonus, cường hóa
// ============================================================

import { BaseStats, Rarity } from "./common";

/** 10 slot trang bị theo yêu cầu (Accessory được tách thành 4 loại cụ thể). */
export enum GearSlot {
  MAIN_WEAPON = "main_weapon",   // Vũ khí chính
  SUB_WEAPON = "sub_weapon",     // Vũ khí phụ
  HELMET = "helmet",             // Mũ
  ARMOR = "armor",               // Áo giáp
  GLOVES = "gloves",             // Găng tay
  BOOTS = "boots",                // Giày
  BRACELET = "bracelet",          // Vòng tay
  NECKLACE = "necklace",          // Vòng cổ
  EARRING = "earring",            // Khuyên tai
  RING = "ring",                   // Nhẫn
}

/** Nhóm slot để tiện hiển thị UI theo danh mục. */
export const GEAR_SLOT_GROUPS = {
  weapon: [GearSlot.MAIN_WEAPON, GearSlot.SUB_WEAPON],
  armor: [GearSlot.HELMET, GearSlot.ARMOR, GearSlot.GLOVES, GearSlot.BOOTS],
  accessory: [GearSlot.BRACELET, GearSlot.NECKLACE, GearSlot.EARRING, GearSlot.RING],
} as const;

/** Một dòng chỉ số phụ (substat) trên trang bị, có thể là % hoặc số tuyệt đối. */
export interface GearAffix {
  stat: keyof BaseStats;
  value: number;
  isPercent: boolean;
}

/** Template = thiết kế gốc của một loại trang bị. */
export interface GearTemplate {
  id: string;
  name: string;
  slot: GearSlot;
  rarity: Rarity;
  baseStats: Partial<BaseStats>;     // Chỉ số cố định khi chưa cường hóa
  mainAffix: GearAffix;               // Dòng chính, tăng theo cấp cường hóa
  possibleSubAffixes: GearAffix[];    // Pool các dòng phụ có thể roll ra khi chế tạo/rơi
  subAffixCount: number;              // Số dòng phụ thực tế sẽ roll (thường 2-4)
  setId?: string;                     // Liên kết tới GearSet nếu có
  maxEnhanceLevel: number;            // Ví dụ 15 (tương đương +15)
  icon?: string;
}

/** Instance = trang bị cụ thể mà người chơi sở hữu, đã roll substats + cường hóa. */
export interface GearInstance {
  instanceId: string;
  templateId: string;
  ownerId: string;
  enhanceLevel: number;               // Cấp cường hóa hiện tại (0 -> maxEnhanceLevel)
  rolledSubAffixes: GearAffix[];      // Giá trị substats thực tế đã roll khi có được
  equippedByHeroInstanceId?: string;  // Nếu đang được trang bị cho hero nào
  lockedForSalvage?: boolean;         // Khóa để tránh phân giải nhầm
}

/** Set trang bị: bonus khi mặc đủ N món cùng set. */
export interface GearSet {
  id: string;
  name: string;
  bonuses: {
    piecesRequired: number;           // Ví dụ 2 hoặc 4
    statBonusPercent?: Partial<BaseStats>;
    statBonusFlat?: Partial<BaseStats>;
    description: string;
  }[];
}

/**
 * Tính chỉ số dòng chính (mainAffix) tại một cấp cường hóa cụ thể.
 * Công thức mẫu: tăng tuyến tính theo % mỗi cấp, có thể thay bằng bảng lookup nếu cần phi tuyến.
 */
export function getMainAffixValueAtEnhanceLevel(
  template: GearTemplate,
  enhanceLevel: number,
  percentGrowthPerLevel: number = 8
): number {
  const growthMultiplier = 1 + (enhanceLevel * percentGrowthPerLevel) / 100;
  return template.mainAffix.value * growthMultiplier;
}

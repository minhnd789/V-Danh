// ============================================================
// gear.sample.ts - Dữ liệu mẫu minh họa trang bị + set bonus
// ============================================================

import { Rarity } from "../types/common";
import { GearSet, GearSlot, GearTemplate } from "../types/gear";

export const GEAR_HOA_LONG_KIEM: GearTemplate = {
  id: "gear_hoa_long_kiem",
  name: "Hỏa Long Kiếm",
  slot: GearSlot.MAIN_WEAPON,
  rarity: Rarity.DIA,
  baseStats: { atk: 120 },
  mainAffix: { stat: "atk", value: 120, isPercent: false },
  possibleSubAffixes: [
    { stat: "critRate", value: 4, isPercent: false },
    { stat: "critDmg", value: 8, isPercent: false },
    { stat: "atk", value: 6, isPercent: true },
    { stat: "spd", value: 5, isPercent: false },
  ],
  subAffixCount: 3,
  setId: "set_hoa_long",
  maxEnhanceLevel: 15,
};

export const GEAR_HOA_LONG_GIAP: GearTemplate = {
  id: "gear_hoa_long_giap",
  name: "Hỏa Long Giáp",
  slot: GearSlot.ARMOR,
  rarity: Rarity.DIA,
  baseStats: { hp: 400, def: 60 },
  mainAffix: { stat: "hp", value: 400, isPercent: false },
  possibleSubAffixes: [
    { stat: "def", value: 20, isPercent: false },
    { stat: "mdef", value: 15, isPercent: false },
    { stat: "hp", value: 6, isPercent: true },
  ],
  subAffixCount: 3,
  setId: "set_hoa_long",
  maxEnhanceLevel: 15,
};

export const GEAR_LINH_NGOC_NHAN: GearTemplate = {
  id: "gear_linh_ngoc_nhan",
  name: "Linh Ngọc Nhẫn",
  slot: GearSlot.RING,
  rarity: Rarity.HUYEN,
  baseStats: { matk: 40, critRate: 3 },
  mainAffix: { stat: "matk", value: 40, isPercent: false },
  possibleSubAffixes: [
    { stat: "critDmg", value: 6, isPercent: false },
    { stat: "matk", value: 5, isPercent: true },
    { stat: "spd", value: 4, isPercent: false },
  ],
  subAffixCount: 2,
  maxEnhanceLevel: 15,
};

export const SET_HOA_LONG: GearSet = {
  id: "set_hoa_long",
  name: "Bộ Hỏa Long",
  bonuses: [
    { piecesRequired: 2, statBonusPercent: { atk: 8 }, description: "Mặc 2 món: +8% ATK." },
    { piecesRequired: 4, statBonusPercent: { atk: 15, critDmg: 20 }, description: "Mặc đủ 4 món: +15% ATK, +20% sát thương chí mạng." },
  ],
};

export const SAMPLE_GEAR: GearTemplate[] = [
  GEAR_HOA_LONG_KIEM,
  GEAR_HOA_LONG_GIAP,
  GEAR_LINH_NGOC_NHAN,
];

export const SAMPLE_GEAR_SETS: GearSet[] = [SET_HOA_LONG];

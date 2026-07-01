// ============================================================
// materials.sample.ts - Dữ liệu mẫu vật liệu + công thức
// ============================================================

import { Element, Rarity } from "../types/common";
import {
  CraftingRecipe,
  EnhancementRecipe,
  MaterialCategory,
  MaterialTemplate,
  StarUpRecipe,
} from "../types/materials";

export const MAT_HOA_TINH_THACH: MaterialTemplate = {
  id: "mat_hoa_tinh_thach",
  name: "Hỏa Tinh Thạch",
  category: MaterialCategory.ORE,
  rarity: Rarity.HOANG,
  element: Element.FIRE,
  description: "Khoáng thạch mang hỏa khí nồng đậm, dùng chế tạo vũ khí hệ Hỏa.",
};

export const MAT_CUONG_HOA_THACH: MaterialTemplate = {
  id: "mat_cuong_hoa_thach",
  name: "Cường Hóa Thạch",
  category: MaterialCategory.ENHANCE_STONE,
  rarity: Rarity.PHAM,
  description: "Đá dùng để cường hóa trang bị, không phân biệt hệ.",
};

export const MAT_HOA_TINH_CHAT: MaterialTemplate = {
  id: "mat_hoa_tinh_chat",
  name: "Hỏa Tinh Chất",
  category: MaterialCategory.ESSENCE,
  rarity: Rarity.HUYEN,
  element: Element.FIRE,
  description: "Tinh chất nguyên tố Hỏa, dùng nâng cấp kỹ năng hero hệ Hỏa.",
};

export const MAT_HOA_SAO_THACH: MaterialTemplate = {
  id: "mat_hoa_sao_thach",
  name: "Hỏa Diệu Tinh Thạch",
  category: MaterialCategory.STAR_SHARD,
  rarity: Rarity.DIA,
  element: Element.FIRE,
  description: "Mảnh sao mang hỏa khí, dùng để nâng sao cho hero hệ Hỏa.",
};

export const MAT_KINH_NGHIEM_THU: MaterialTemplate = {
  id: "mat_kinh_nghiem_thu",
  name: "Tu Tiên Bí Lục",
  category: MaterialCategory.EXP_BOOK,
  rarity: Rarity.PHAM,
  description: "Sách bí lục chứa kinh nghiệm tu luyện, dùng lên cấp hero.",
};

export const MAT_LINH_THACH: MaterialTemplate = {
  id: "mat_linh_thach",
  name: "Linh Thạch",
  category: MaterialCategory.CURRENCY,
  rarity: Rarity.PHAM,
  description: "Tiền tệ chính dùng trong chế tạo, cường hóa và nâng sao.",
};

export const SAMPLE_MATERIALS: MaterialTemplate[] = [
  MAT_HOA_TINH_THACH,
  MAT_CUONG_HOA_THACH,
  MAT_HOA_TINH_CHAT,
  MAT_HOA_SAO_THACH,
  MAT_KINH_NGHIEM_THU,
  MAT_LINH_THACH,
];

/** Công thức chế tạo Hỏa Long Kiếm từ khoáng thạch + linh thạch. */
export const RECIPE_CRAFT_HOA_LONG_KIEM: CraftingRecipe = {
  id: "recipe_craft_hoa_long_kiem",
  resultType: "gear",
  resultTemplateId: "gear_hoa_long_kiem",
  resultQuantity: 1,
  ingredients: [
    { materialId: "mat_hoa_tinh_thach", quantity: 20 },
    { materialId: "mat_linh_thach", quantity: 500 },
  ],
  requiredCraftingLevel: 5,
  craftTimeSeconds: 3600,
};

/** Công thức cường hóa gear từ +0 lên +1 (mẫu, có thể lặp lại theo hàm sinh recipe). */
export const RECIPE_ENHANCE_LEVEL_1: EnhancementRecipe = {
  fromLevel: 0,
  toLevel: 1,
  materials: [{ materialId: "mat_cuong_hoa_thach", quantity: 3 }],
  goldCost: 100,
  successRatePercent: 100,
};

/** Công thức nâng sao hero hệ Hỏa từ 1 sao lên 2 sao. */
export const RECIPE_STAR_UP_1_TO_2: StarUpRecipe = {
  fromStar: 1,
  toStar: 2,
  requiresMatchingElementShard: true,
  materials: [
    { materialId: "mat_hoa_sao_thach", quantity: 5 },
    { materialId: "mat_linh_thach", quantity: 1000 },
  ],
};

export const SAMPLE_CRAFTING_RECIPES: CraftingRecipe[] = [RECIPE_CRAFT_HOA_LONG_KIEM];
export const SAMPLE_ENHANCEMENT_RECIPES: EnhancementRecipe[] = [RECIPE_ENHANCE_LEVEL_1];
export const SAMPLE_STAR_UP_RECIPES: StarUpRecipe[] = [RECIPE_STAR_UP_1_TO_2];

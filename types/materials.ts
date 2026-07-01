// ============================================================
// materials.ts - Vật liệu chế tạo & cường hóa + các công thức liên quan
// ============================================================

import { Element, Rarity } from "./common";
import { GearSlot } from "./gear";

/** Phân loại vật liệu theo mục đích sử dụng. */
export enum MaterialCategory {
  ORE = "ore",                       // Khoáng thạch - nguyên liệu chế tạo gear
  ESSENCE = "essence",                 // Tinh chất nguyên tố - nâng cấp/tiến hóa kỹ năng
  ENHANCE_STONE = "enhance_stone",     // Đá cường hóa gear (+1 -> +15)
  RUNE = "rune",                        // Phù văn/ngọc khảm gắn thêm vào gear
  STAR_SHARD = "star_shard",           // Mảnh sao - dùng để nâng sao hero
  EXP_BOOK = "exp_book",                 // Sách kinh nghiệm - lên cấp hero
  CURRENCY = "currency",                 // Tiền tệ đặc biệt (linh thạch, đồng tu tiên...)
}

export interface MaterialTemplate {
  id: string;
  name: string;
  category: MaterialCategory;
  rarity: Rarity;
  element?: Element;          // Chỉ áp dụng cho vật liệu gắn hệ (essence, star_shard...)
  description: string;
  icon?: string;
  maxStack?: number;           // undefined = không giới hạn số lượng tích trữ
}

/** Số lượng cụ thể của một loại vật liệu, dùng trong công thức và kho đồ người chơi. */
export interface MaterialQuantity {
  materialId: string;
  quantity: number;
}

/** Công thức chế tạo ra Gear hoặc Material mới từ nguyên liệu. */
export interface CraftingRecipe {
  id: string;
  resultType: "gear" | "material";
  resultTemplateId: string;
  resultQuantity: number;
  ingredients: MaterialQuantity[];
  goldCost?: number;
  requiredCraftingLevel?: number;   // Cấp độ lò luyện/công trình yêu cầu
  craftTimeSeconds?: number;         // Idle game: thời gian chờ trong hàng chế tạo
}

/** Công thức cường hóa gear từ 1 cấp lên cấp kế tiếp. */
export interface EnhancementRecipe {
  slotGroup?: GearSlot[];             // Nếu để trống -> áp dụng cho mọi slot
  fromLevel: number;
  toLevel: number;
  materials: MaterialQuantity[];
  goldCost?: number;
  successRatePercent?: number;        // 100 = luôn thành công; <100 = có thể thất bại/rớt cấp
}

/** Công thức nâng sao cho hero, thường cần mảnh sao cùng hệ + vật liệu phụ. */
export interface StarUpRecipe {
  fromStar: number;
  toStar: number;
  requiresMatchingElementShard: boolean; // true = phải dùng star_shard đúng hệ nguyên tố hero
  materials: MaterialQuantity[];
  goldCost?: number;
}

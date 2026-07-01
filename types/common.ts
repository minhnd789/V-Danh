// ============================================================
// common.ts - Các kiểu dữ liệu nền tảng dùng chung toàn bộ game
// ============================================================

/**
 * Ngũ hành + Ánh Sáng + Bóng Tối = 7 hệ nguyên tố.
 * Dùng cho cả Hero và một số Material/Gear đặc thù theo hệ.
 */
export enum Element {
  METAL = "metal",  // Kim
  WOOD = "wood",    // Mộc
  WATER = "water",  // Thủy
  FIRE = "fire",    // Hỏa
  EARTH = "earth",  // Thổ
  LIGHT = "light",  // Ánh Sáng
  DARK = "dark",    // Bóng Tối
}

/** Bảng khắc chế ngũ hành cơ bản (dùng để tính hệ số sát thương tương khắc). */
export const ELEMENT_COUNTER: Record<Element, Element | null> = {
  [Element.METAL]: Element.WOOD,   // Kim khắc Mộc
  [Element.WOOD]: Element.EARTH,   // Mộc khắc Thổ
  [Element.EARTH]: Element.WATER,  // Thổ khắc Thủy
  [Element.WATER]: Element.FIRE,   // Thủy khắc Hỏa
  [Element.FIRE]: Element.METAL,   // Hỏa khắc Kim
  [Element.LIGHT]: Element.DARK,   // Ánh Sáng khắc Bóng Tối
  [Element.DARK]: Element.LIGHT,   // Bóng Tối khắc Ánh Sáng
};

/** 3 nhóm vai trò theo yêu cầu: DPS vật lý, DPS phép, Tank/Hỗ trợ. */
export enum HeroRole {
  PHYSICAL_DPS = "physical_dps",
  MAGIC_DPS = "magic_dps",
  TANK_SUPPORT = "tank_support",
}

/** Phẩm chất dùng chung cho Hero, Gear và Material. */
export enum Rarity {
  PHAM = 1,   // Phàm Phẩm
  HOANG = 2,  // Hoàng Phẩm
  HUYEN = 3,  // Huyền Phẩm
  DIA = 4,    // Địa Phẩm
  THIEN = 5,  // Thiên Phẩm
  TIEN = 6,   // Tiên Phẩm
}

/** Nhãn hiển thị tiếng Việt cho phẩm chất. */
export const RARITY_LABELS: Record<Rarity, string> = {
  [Rarity.PHAM]: "Phàm Phẩm",
  [Rarity.HOANG]: "Hoàng Phẩm",
  [Rarity.HUYEN]: "Huyền Phẩm",
  [Rarity.DIA]: "Địa Phẩm",
  [Rarity.THIEN]: "Thiên Phẩm",
  [Rarity.TIEN]: "Tiên Phẩm",
};

/** Bộ chỉ số cơ bản cho một nhân vật (có thể mở rộng thêm nếu cần). */
export interface BaseStats {
  hp: number;
  atk: number;       // Sát thương vật lý
  matk: number;       // Sát thương phép
  def: number;        // Giáp vật lý
  mdef: number;        // Giáp phép
  spd: number;         // Tốc độ hành động (ảnh hưởng thứ tự ra chiêu trong idle combat)
  critRate: number;    // Tỉ lệ chí mạng (%)
  critDmg: number;      // Sát thương chí mạng cộng thêm (%)
}

/** Hàm tiện ích: cộng 2 bộ BaseStats (dùng khi gộp base + gear + buff). */
export function addStats(a: BaseStats, b: Partial<BaseStats>): BaseStats {
  return {
    hp: a.hp + (b.hp ?? 0),
    atk: a.atk + (b.atk ?? 0),
    matk: a.matk + (b.matk ?? 0),
    def: a.def + (b.def ?? 0),
    mdef: a.mdef + (b.mdef ?? 0),
    spd: a.spd + (b.spd ?? 0),
    critRate: a.critRate + (b.critRate ?? 0),
    critDmg: a.critDmg + (b.critDmg ?? 0),
  };
}

/** Nhân bộ stats với một hệ số phần trăm (dùng cho bonus dạng %). */
export function scaleStats(a: BaseStats, percentBonus: Partial<BaseStats>): BaseStats {
  return {
    hp: a.hp * (1 + (percentBonus.hp ?? 0) / 100),
    atk: a.atk * (1 + (percentBonus.atk ?? 0) / 100),
    matk: a.matk * (1 + (percentBonus.matk ?? 0) / 100),
    def: a.def * (1 + (percentBonus.def ?? 0) / 100),
    mdef: a.mdef * (1 + (percentBonus.mdef ?? 0) / 100),
    spd: a.spd * (1 + (percentBonus.spd ?? 0) / 100),
    critRate: a.critRate + (percentBonus.critRate ?? 0),
    critDmg: a.critDmg + (percentBonus.critDmg ?? 0),
  };
}

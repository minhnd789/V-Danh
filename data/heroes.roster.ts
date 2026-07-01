// ============================================================
// heroes.roster.ts - Roster mục tiêu 98 tướng cho game cày chay
// Mỗi hệ có: 1 Tiên, 2 Thiên, 2 Địa, 3 Huyền, 3 Hoàng, 3 Phàm.
// Tất cả hero khi mở khóa lần đầu nên tạo HeroInstance ở 1 sao.
// ============================================================

import { BaseStats, Element, HeroRole, Rarity } from "../types/common";
import { EffectType, TriggerCondition } from "../types/effects";
import { AreaPattern, HeroTemplate, Skill, SkillType, StarBonus, TargetingType } from "../types/hero";

export const RARITY_TARGETS_PER_ELEMENT: Record<Rarity, number> = {
  [Rarity.TIEN]: 1,
  [Rarity.THIEN]: 2,
  [Rarity.DIA]: 2,
  [Rarity.HUYEN]: 3,
  [Rarity.HOANG]: 3,
  [Rarity.PHAM]: 3,
};

type ElementInfo = {
  id: string;
  label: string;
  element: Element;
  dotName: string;
  activeVerb: string;
  school: string;
};

type RosterEntry = {
  name: string;
  title: string;
  rarity: Rarity;
  role: HeroRole;
};

const ELEMENT_INFOS: ElementInfo[] = [
  { id: "kim", label: "Kim", element: Element.METAL, dotName: "kim thương", activeVerb: "Kim Quang", school: "Kim Cang Các" },
  { id: "moc", label: "Mộc", element: Element.WOOD, dotName: "độc mộc", activeVerb: "Thanh Mộc", school: "Thanh Mộc Cốc" },
  { id: "thuy", label: "Thủy", element: Element.WATER, dotName: "băng hàn", activeVerb: "Huyền Thủy", school: "Băng Nguyệt Cung" },
  { id: "hoa", label: "Hỏa", element: Element.FIRE, dotName: "bỏng", activeVerb: "Liệt Hỏa", school: "Hỏa Long Kiếm Tông" },
  { id: "tho", label: "Thổ", element: Element.EARTH, dotName: "sa độc", activeVerb: "Hậu Thổ", school: "Huyền Nham Sơn" },
  { id: "quang", label: "Quang", element: Element.LIGHT, dotName: "thánh ấn", activeVerb: "Thánh Quang", school: "Quang Minh Điện" },
  { id: "am", label: "Ám", element: Element.DARK, dotName: "ám thực", activeVerb: "U Minh", school: "U Ảnh Môn" },
];

const RARITY_STAT_MULTIPLIER: Record<Rarity, number> = {
  [Rarity.PHAM]: 1,
  [Rarity.HOANG]: 1.08,
  [Rarity.HUYEN]: 1.18,
  [Rarity.DIA]: 1.32,
  [Rarity.THIEN]: 1.5,
  [Rarity.TIEN]: 1.75,
};

const RARITY_SKILL_BONUS: Record<Rarity, number> = {
  [Rarity.PHAM]: 0,
  [Rarity.HOANG]: 8,
  [Rarity.HUYEN]: 18,
  [Rarity.DIA]: 32,
  [Rarity.THIEN]: 48,
  [Rarity.TIEN]: 70,
};

const ROLE_BASE_STATS: Record<HeroRole, BaseStats> = {
  [HeroRole.PHYSICAL_DPS]: { hp: 1150, atk: 165, matk: 35, def: 75, mdef: 60, spd: 104, critRate: 8, critDmg: 50 },
  [HeroRole.MAGIC_DPS]: { hp: 1020, atk: 35, matk: 175, def: 58, mdef: 82, spd: 101, critRate: 9, critDmg: 55 },
  [HeroRole.TANK_SUPPORT]: { hp: 1850, atk: 65, matk: 70, def: 135, mdef: 125, spd: 88, critRate: 5, critDmg: 35 },
};

const ROLE_GROWTH_STATS: Record<HeroRole, Partial<BaseStats>> = {
  [HeroRole.PHYSICAL_DPS]: { hp: 39, atk: 6.1, matk: 0.6, def: 2.4, mdef: 1.9 },
  [HeroRole.MAGIC_DPS]: { hp: 34, atk: 0.5, matk: 6.7, def: 1.8, mdef: 2.5 },
  [HeroRole.TANK_SUPPORT]: { hp: 64, atk: 1.4, matk: 1.4, def: 4.8, mdef: 4.4 },
};

const ROLE_LABELS: Record<HeroRole, string> = {
  [HeroRole.PHYSICAL_DPS]: "DPS vật lý",
  [HeroRole.MAGIC_DPS]: "DPS phép",
  [HeroRole.TANK_SUPPORT]: "Tank/Hỗ trợ",
};

const ELEMENT_SIGNATURES: Record<Element, { mark: string; combo: string; terrain: string; immortal: string }> = {
  [Element.METAL]: { mark: "Phá Giáp", combo: "liên kích vào mục tiêu đã bị giảm DEF", terrain: "hàng trước", immortal: "Vạn Kiếm Quy Tông" },
  [Element.WOOD]: { mark: "Sinh Chủng", combo: "hồi phục đồng minh khi mục tiêu chịu DOT", terrain: "ô kề bên", immortal: "Vạn Mộc Trường Sinh" },
  [Element.WATER]: { mark: "Hàn Ấn", combo: "đóng băng nhịp hành động của mục tiêu bị làm chậm", terrain: "cùng hàng", immortal: "Bắc Hải Huyền Vũ" },
  [Element.FIRE]: { mark: "Viêm Ấn", combo: "bùng nổ thêm sát thương trên mục tiêu đang bị DOT", terrain: "hàng sau", immortal: "Niết Bàn Chân Hỏa" },
  [Element.EARTH]: { mark: "Trọng Áp", combo: "chặn sát thương cho đồng minh cùng cột", terrain: "cùng cột", immortal: "Hậu Thổ Bất Diệt" },
  [Element.LIGHT]: { mark: "Thánh Ấn", combo: "thanh tẩy và tạo khiên cho đồng minh thấp máu", terrain: "toàn đội", immortal: "Nhật Luân Phán Quyết" },
  [Element.DARK]: { mark: "U Ấn", combo: "truy sát hàng sau và hút chỉ số mục tiêu", terrain: "hàng sau địch", immortal: "Vĩnh Dạ Tịch Diệt" },
};

const ROSTER_BY_ELEMENT: Record<string, RosterEntry[]> = {
  kim: [
    { name: "Tần Thiết Sinh", title: "Tán Tu Thiết Kiếm", rarity: Rarity.PHAM, role: HeroRole.PHYSICAL_DPS },
    { name: "La Kim Nhi", title: "Kim Linh Thuật Sĩ", rarity: Rarity.PHAM, role: HeroRole.MAGIC_DPS },
    { name: "Mạc Trọng Sơn", title: "Thiết Bì Hộ Vệ", rarity: Rarity.PHAM, role: HeroRole.TANK_SUPPORT },
    { name: "Đường Huyền Đao", title: "Hoàng Kim Đao Khách", rarity: Rarity.HOANG, role: HeroRole.PHYSICAL_DPS },
    { name: "Tô Ngân Hà", title: "Ngân Châm Pháp Tu", rarity: Rarity.HOANG, role: HeroRole.MAGIC_DPS },
    { name: "Viên Cương", title: "Kim Giáp Trấn Thủ", rarity: Rarity.HOANG, role: HeroRole.TANK_SUPPORT },
    { name: "Lục Vô Phong", title: "Huyền Kim Kiếm Sĩ", rarity: Rarity.HUYEN, role: HeroRole.PHYSICAL_DPS },
    { name: "Bạch Linh Châu", title: "Vạn Kiếm Pháp Nữ", rarity: Rarity.HUYEN, role: HeroRole.MAGIC_DPS },
    { name: "Hàn Trấn Bắc", title: "Kim Cang Hộ Pháp", rarity: Rarity.HUYEN, role: HeroRole.TANK_SUPPORT },
    { name: "Cơ Vô Nhận", title: "Địa Sát Kim Đao", rarity: Rarity.DIA, role: HeroRole.PHYSICAL_DPS },
    { name: "Nghiêm Tử Khôi", title: "Địa Mạch Kim Thân", rarity: Rarity.DIA, role: HeroRole.TANK_SUPPORT },
    { name: "Thẩm Thiên Kình", title: "Thiên Kiếm Tôn", rarity: Rarity.THIEN, role: HeroRole.PHYSICAL_DPS },
    { name: "Liễu Ngân Sương", title: "Thiên Cơ Luyện Kim Sư", rarity: Rarity.THIEN, role: HeroRole.MAGIC_DPS },
    { name: "Độc Cô Vạn Kiếm", title: "Tiên Kiếm Kim Hoàng", rarity: Rarity.TIEN, role: HeroRole.PHYSICAL_DPS },
  ],
  moc: [
    { name: "A Mộc", title: "Dược Đồng Sơn Cốc", rarity: Rarity.PHAM, role: HeroRole.PHYSICAL_DPS },
    { name: "Diệp Tiểu Lam", title: "Linh Thảo Pháp Tu", rarity: Rarity.PHAM, role: HeroRole.MAGIC_DPS },
    { name: "Cổ Thanh Bì", title: "Mộc Thuẫn Hộ Vệ", rarity: Rarity.PHAM, role: HeroRole.TANK_SUPPORT },
    { name: "Từ Thanh Trúc", title: "Hoàng Trúc Kiếm Khách", rarity: Rarity.HOANG, role: HeroRole.PHYSICAL_DPS },
    { name: "Hoa Nhược Y", title: "Bách Hoa Linh Sư", rarity: Rarity.HOANG, role: HeroRole.MAGIC_DPS },
    { name: "Lâm Dược Sinh", title: "Sinh Mệnh Y Tu", rarity: Rarity.HOANG, role: HeroRole.TANK_SUPPORT },
    { name: "Mạnh Tử Đằng", title: "Huyền Đằng Thích Khách", rarity: Rarity.HUYEN, role: HeroRole.PHYSICAL_DPS },
    { name: "Tống Ngọc Chi", title: "Độc Hoa Pháp Nữ", rarity: Rarity.HUYEN, role: HeroRole.MAGIC_DPS },
    { name: "Quan Mộc Thành", title: "Cổ Thụ Trấn Linh", rarity: Rarity.HUYEN, role: HeroRole.TANK_SUPPORT },
    { name: "Diệp Trường Sinh", title: "Địa Mạch Dược Vương", rarity: Rarity.DIA, role: HeroRole.MAGIC_DPS },
    { name: "Lâm Bất Khô", title: "Địa Căn Thủ Hộ", rarity: Rarity.DIA, role: HeroRole.TANK_SUPPORT },
    { name: "Mộc Thiên La", title: "Thiên La Đằng Chủ", rarity: Rarity.THIEN, role: HeroRole.MAGIC_DPS },
    { name: "Hoa Tịnh Nghi", title: "Thiên Hương Thánh Y", rarity: Rarity.THIEN, role: HeroRole.TANK_SUPPORT },
    { name: "Thanh Đế Linh Quân", title: "Tiên Chủ Vạn Mộc", rarity: Rarity.TIEN, role: HeroRole.TANK_SUPPORT },
  ],
  thuy: [
    { name: "Ngư Tiểu Bạch", title: "Hàn Tuyền Kiếm Tu", rarity: Rarity.PHAM, role: HeroRole.PHYSICAL_DPS },
    { name: "Lam Tịch", title: "Thủy Vụ Pháp Tu", rarity: Rarity.PHAM, role: HeroRole.MAGIC_DPS },
    { name: "Hà Trường Giang", title: "Lưu Thủy Hộ Vệ", rarity: Rarity.PHAM, role: HeroRole.TANK_SUPPORT },
    { name: "Băng Kiều", title: "Hoàng Băng Song Nhận", rarity: Rarity.HOANG, role: HeroRole.PHYSICAL_DPS },
    { name: "Lạc Vũ Nhi", title: "Vũ Linh Pháp Nữ", rarity: Rarity.HOANG, role: HeroRole.MAGIC_DPS },
    { name: "Thẩm Hàn Châu", title: "Hàn Châu Y Tu", rarity: Rarity.HOANG, role: HeroRole.TANK_SUPPORT },
    { name: "Bạch Lãng", title: "Huyền Triều Đao Khách", rarity: Rarity.HUYEN, role: HeroRole.PHYSICAL_DPS },
    { name: "Lý Nguyệt Nhi", title: "Băng Nguyệt Thánh Nữ", rarity: Rarity.HUYEN, role: HeroRole.MAGIC_DPS },
    { name: "Tạ Hàn Sơn", title: "Huyền Băng Trấn Thủ", rarity: Rarity.HUYEN, role: HeroRole.TANK_SUPPORT },
    { name: "Cố Thủy Dao", title: "Địa Tuyền Linh Cơ", rarity: Rarity.DIA, role: HeroRole.MAGIC_DPS },
    { name: "Hạ Băng Hà", title: "Địa Băng Hộ Pháp", rarity: Rarity.DIA, role: HeroRole.TANK_SUPPORT },
    { name: "Lăng Thiên Tuyết", title: "Thiên Sương Kiếm Tiên", rarity: Rarity.THIEN, role: HeroRole.PHYSICAL_DPS },
    { name: "Tô Hải Nguyệt", title: "Thiên Hải Pháp Chủ", rarity: Rarity.THIEN, role: HeroRole.MAGIC_DPS },
    { name: "Huyền Vũ Chân Quân", title: "Tiên Chủ Bắc Hải", rarity: Rarity.TIEN, role: HeroRole.TANK_SUPPORT },
  ],
  hoa: [
    { name: "Tiểu Diễm", title: "Hỏa Đồng Luyện Khí", rarity: Rarity.PHAM, role: HeroRole.PHYSICAL_DPS },
    { name: "Chúc Hồng Y", title: "Hỏa Phù Pháp Tu", rarity: Rarity.PHAM, role: HeroRole.MAGIC_DPS },
    { name: "Nghiêm Hỏa Trụ", title: "Xích Giáp Hộ Vệ", rarity: Rarity.PHAM, role: HeroRole.TANK_SUPPORT },
    { name: "Chu Diễm", title: "Hỏa Long Kiếm Khách", rarity: Rarity.HOANG, role: HeroRole.PHYSICAL_DPS },
    { name: "Tần Hồng Liên", title: "Hồng Liên Pháp Nữ", rarity: Rarity.HOANG, role: HeroRole.MAGIC_DPS },
    { name: "La Xích Thành", title: "Dung Nham Trấn Thủ", rarity: Rarity.HOANG, role: HeroRole.TANK_SUPPORT },
    { name: "Viêm Không", title: "Huyền Hỏa Quyền Sư", rarity: Rarity.HUYEN, role: HeroRole.PHYSICAL_DPS },
    { name: "Mộ Dung Yên", title: "Phần Thiên Pháp Sư", rarity: Rarity.HUYEN, role: HeroRole.MAGIC_DPS },
    { name: "Phó Hỏa Lân", title: "Hỏa Lân Hộ Pháp", rarity: Rarity.HUYEN, role: HeroRole.TANK_SUPPORT },
    { name: "Xích Vân", title: "Địa Sát Viêm Đao", rarity: Rarity.DIA, role: HeroRole.PHYSICAL_DPS },
    { name: "Chúc Dung Lạc", title: "Địa Hỏa Thần Nữ", rarity: Rarity.DIA, role: HeroRole.MAGIC_DPS },
    { name: "Viêm Thiên Quân", title: "Thiên Hỏa Chi Chủ", rarity: Rarity.THIEN, role: HeroRole.MAGIC_DPS },
    { name: "Hỏa Vô Cực", title: "Thiên Viêm Chiến Thể", rarity: Rarity.THIEN, role: HeroRole.PHYSICAL_DPS },
    { name: "Phượng Hoàng Chân Linh", title: "Tiên Diễm Bất Diệt", rarity: Rarity.TIEN, role: HeroRole.MAGIC_DPS },
  ],
  tho: [
    { name: "Sa Bình", title: "Thổ Côn Tán Tu", rarity: Rarity.PHAM, role: HeroRole.PHYSICAL_DPS },
    { name: "Nham Linh", title: "Sa Phù Pháp Tu", rarity: Rarity.PHAM, role: HeroRole.MAGIC_DPS },
    { name: "Thạch Đại Ngưu", title: "Nham Thuẫn Hộ Vệ", rarity: Rarity.PHAM, role: HeroRole.TANK_SUPPORT },
    { name: "Cao Sa Mạc", title: "Hoàng Sa Đao Khách", rarity: Rarity.HOANG, role: HeroRole.PHYSICAL_DPS },
    { name: "Tống Thổ Chi", title: "Địa Phù Thuật Sĩ", rarity: Rarity.HOANG, role: HeroRole.MAGIC_DPS },
    { name: "Lý Trọng Nham", title: "Nham Giáp Trấn Thủ", rarity: Rarity.HOANG, role: HeroRole.TANK_SUPPORT },
    { name: "Thạch Vô Song", title: "Huyền Nham Chiến Tu", rarity: Rarity.HUYEN, role: HeroRole.PHYSICAL_DPS },
    { name: "Sa Ngọc Dao", title: "Huyền Sa Pháp Nữ", rarity: Rarity.HUYEN, role: HeroRole.MAGIC_DPS },
    { name: "Hầu Sơn Quân", title: "Cự Nham Hộ Pháp", rarity: Rarity.HUYEN, role: HeroRole.TANK_SUPPORT },
    { name: "Nham Phá Thiên", title: "Địa Liệt Chiến Vương", rarity: Rarity.DIA, role: HeroRole.PHYSICAL_DPS },
    { name: "Cố Sơn Hà", title: "Địa Mạch Trấn Chủ", rarity: Rarity.DIA, role: HeroRole.TANK_SUPPORT },
    { name: "Hoàng Thổ Linh", title: "Thiên Sa Pháp Chủ", rarity: Rarity.THIEN, role: HeroRole.MAGIC_DPS },
    { name: "Cự Linh Sơn Chủ", title: "Thiên Nham Chiến Thần", rarity: Rarity.THIEN, role: HeroRole.TANK_SUPPORT },
    { name: "Hậu Thổ Tiên Tôn", title: "Tiên Chủ Đại Địa", rarity: Rarity.TIEN, role: HeroRole.TANK_SUPPORT },
  ],
  quang: [
    { name: "Minh Tâm", title: "Quang Kiếm Đệ Tử", rarity: Rarity.PHAM, role: HeroRole.PHYSICAL_DPS },
    { name: "Tô Linh Quang", title: "Linh Đăng Pháp Tu", rarity: Rarity.PHAM, role: HeroRole.MAGIC_DPS },
    { name: "Bạch Dịch Phong", title: "Quang Minh Hộ Vệ", rarity: Rarity.PHAM, role: HeroRole.TANK_SUPPORT },
    { name: "Lạc Nhật Minh", title: "Hoàng Quang Kiếm Sĩ", rarity: Rarity.HOANG, role: HeroRole.PHYSICAL_DPS },
    { name: "An Diệu Âm", title: "Tịnh Quang Pháp Nữ", rarity: Rarity.HOANG, role: HeroRole.MAGIC_DPS },
    { name: "Từ Thiện Không", title: "Hộ Tâm Y Tu", rarity: Rarity.HOANG, role: HeroRole.TANK_SUPPORT },
    { name: "Bạch Vân Kha", title: "Huyền Quang Thích Khách", rarity: Rarity.HUYEN, role: HeroRole.PHYSICAL_DPS },
    { name: "Diệp Minh Châu", title: "Tinh Quang Pháp Chủ", rarity: Rarity.HUYEN, role: HeroRole.MAGIC_DPS },
    { name: "Giác Viễn", title: "Kim Thân Hộ Pháp", rarity: Rarity.HUYEN, role: HeroRole.TANK_SUPPORT },
    { name: "Tịnh Vô Ưu", title: "Địa Liên Thánh Y", rarity: Rarity.DIA, role: HeroRole.TANK_SUPPORT },
    { name: "Lê Quang Hạo", title: "Địa Quang Kiếm Tôn", rarity: Rarity.DIA, role: HeroRole.PHYSICAL_DPS },
    { name: "Thiên Âm Tử", title: "Thiên Âm Tịnh Chủ", rarity: Rarity.THIEN, role: HeroRole.MAGIC_DPS },
    { name: "Bạch Thiên Hộ", title: "Thiên Quang Hộ Pháp", rarity: Rarity.THIEN, role: HeroRole.TANK_SUPPORT },
    { name: "Thái Dương Tiên Quân", title: "Tiên Chủ Nhật Luân", rarity: Rarity.TIEN, role: HeroRole.MAGIC_DPS },
  ],
  am: [
    { name: "Ảnh Tử", title: "U Ảnh Đao Tu", rarity: Rarity.PHAM, role: HeroRole.PHYSICAL_DPS },
    { name: "Mặc Linh", title: "Ám Phù Pháp Tu", rarity: Rarity.PHAM, role: HeroRole.MAGIC_DPS },
    { name: "Hắc Thạch", title: "U Giáp Hộ Vệ", rarity: Rarity.PHAM, role: HeroRole.TANK_SUPPORT },
    { name: "Dạ Hành", title: "Hoàng Ảnh Thích Khách", rarity: Rarity.HOANG, role: HeroRole.PHYSICAL_DPS },
    { name: "Tô Mặc Vũ", title: "Ám Vũ Pháp Nữ", rarity: Rarity.HOANG, role: HeroRole.MAGIC_DPS },
    { name: "La Hắc Thành", title: "Hắc Thuẫn Trấn Thủ", rarity: Rarity.HOANG, role: HeroRole.TANK_SUPPORT },
    { name: "Vô Ảnh", title: "Huyền Ảnh Sát Thủ", rarity: Rarity.HUYEN, role: HeroRole.PHYSICAL_DPS },
    { name: "Mộ U Lan", title: "U Lan Chú Sư", rarity: Rarity.HUYEN, role: HeroRole.MAGIC_DPS },
    { name: "Quỷ Diện La", title: "Huyền Ám Hộ Pháp", rarity: Rarity.HUYEN, role: HeroRole.TANK_SUPPORT },
    { name: "Dạ Vô Thường", title: "Địa Sát Ảnh Đao", rarity: Rarity.DIA, role: HeroRole.PHYSICAL_DPS },
    { name: "Mặc Cửu U", title: "Địa Uyên Chú Chủ", rarity: Rarity.DIA, role: HeroRole.MAGIC_DPS },
    { name: "U Thiên Hành", title: "Thiên Ảnh Ma Quân", rarity: Rarity.THIEN, role: HeroRole.PHYSICAL_DPS },
    { name: "Tịch Diệt Nữ Quân", title: "Thiên Ma Chú Chủ", rarity: Rarity.THIEN, role: HeroRole.MAGIC_DPS },
    { name: "U Minh Tiên Chủ", title: "Tiên Chủ Vĩnh Dạ", rarity: Rarity.TIEN, role: HeroRole.MAGIC_DPS },
  ],
};

function slugifyVietnamese(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function scaleBaseStats(role: HeroRole, rarity: Rarity): BaseStats {
  const base = ROLE_BASE_STATS[role];
  const multiplier = RARITY_STAT_MULTIPLIER[rarity];
  return {
    hp: Math.round(base.hp * multiplier),
    atk: Math.round(base.atk * multiplier),
    matk: Math.round(base.matk * multiplier),
    def: Math.round(base.def * multiplier),
    mdef: Math.round(base.mdef * multiplier),
    spd: Math.round(base.spd + (rarity - 1) * 2),
    critRate: base.critRate + Math.floor((rarity - 1) * 1.5),
    critDmg: base.critDmg + (rarity - 1) * 5,
  };
}

function scaleGrowthStats(role: HeroRole, rarity: Rarity): Partial<BaseStats> {
  const base = ROLE_GROWTH_STATS[role];
  const multiplier = 1 + (rarity - 1) * 0.12;
  return {
    hp: Math.round((base.hp ?? 0) * multiplier * 10) / 10,
    atk: Math.round((base.atk ?? 0) * multiplier * 10) / 10,
    matk: Math.round((base.matk ?? 0) * multiplier * 10) / 10,
    def: Math.round((base.def ?? 0) * multiplier * 10) / 10,
    mdef: Math.round((base.mdef ?? 0) * multiplier * 10) / 10,
  };
}

function getPrimaryScalingStat(role: HeroRole): keyof BaseStats {
  if (role === HeroRole.PHYSICAL_DPS) return "atk";
  if (role === HeroRole.MAGIC_DPS) return "matk";
  return "hp";
}

function getRoleTargeting(role: HeroRole): TargetingType {
  if (role === HeroRole.PHYSICAL_DPS) return TargetingType.FRONTMOST_ENEMY;
  if (role === HeroRole.MAGIC_DPS) return TargetingType.SAME_ROW;
  return TargetingType.SELF;
}

function getRoleAreaPattern(role: HeroRole): AreaPattern {
  if (role === HeroRole.PHYSICAL_DPS) return AreaPattern.SINGLE;
  if (role === HeroRole.MAGIC_DPS) return AreaPattern.ROW;
  return AreaPattern.CROSS;
}

function makeSignaturePassive(id: string, entry: RosterEntry, info: ElementInfo): Skill {
  const signature = ELEMENT_SIGNATURES[info.element];
  const scalingStat = getPrimaryScalingStat(entry.role);
  const effectId = `${id}_passive_signature`;
  const value = entry.rarity === Rarity.TIEN ? 24 : entry.rarity === Rarity.THIEN ? 18 : 14;
  const affectedStat = entry.role === HeroRole.MAGIC_DPS ? "matk" : entry.role === HeroRole.PHYSICAL_DPS ? "atk" : "def";
  const trigger = entry.rarity === Rarity.TIEN
    ? TriggerCondition.ON_BATTLE_START
    : entry.rarity === Rarity.THIEN
      ? TriggerCondition.ALWAYS_ACTIVE
      : TriggerCondition.ON_SKILL_CAST;

  return {
    id: `${id}_passive`,
    name: entry.rarity === Rarity.TIEN ? signature.immortal : `${entry.title} Quyết`,
    description: getSignaturePassiveDescription(entry, info, signature),
    type: SkillType.PASSIVE,
    scalingStat,
    scalingPercent: 0,
    targeting: entry.rarity === Rarity.TIEN ? TargetingType.ALL_ALLIES : TargetingType.SELF,
    areaPattern: entry.rarity === Rarity.TIEN ? AreaPattern.ALL : AreaPattern.SINGLE,
    mechanicTags: getSignaturePassiveTags(entry),
    formationNote: getSignatureFormationNote(entry, signature),
    effects: [{
      effect: {
        id: effectId,
        type: entry.role === HeroRole.TANK_SUPPORT ? EffectType.DAMAGE_REDUCTION : EffectType.BUFF_STAT,
        durationTurns: entry.rarity === Rarity.TIEN ? 4 : 3,
        value,
        valueIsPercent: true,
        affectedStat: entry.role === HeroRole.TANK_SUPPORT ? undefined : affectedStat,
        stackable: false,
      },
      trigger,
      chancePercent: 100,
    }],
    upgrades: [
      { unlockAtStar: 3, description: "Tăng hiệu quả cơ chế đặc trưng.", modifiedEffectId: effectId, effectValueOverride: value + 8 },
      { unlockAtStar: 5, description: "Cơ chế đặc trưng kéo dài thêm 1 lượt.", modifiedEffectId: effectId, effectDurationTurnsOverride: entry.rarity === Rarity.TIEN ? 5 : 4 },
    ],
  };
}

function makeSignatureActive(id: string, entry: RosterEntry, info: ElementInfo): Skill {
  const signature = ELEMENT_SIGNATURES[info.element];
  const scalingStat = getPrimaryScalingStat(entry.role);
  const controlEffectId = `${id}_active_signature`;
  const secondaryEffectId = `${id}_active_secondary`;
  const isImmortal = entry.rarity === Rarity.TIEN;
  const isHeaven = entry.rarity === Rarity.THIEN;
  const isEarth = entry.rarity === Rarity.DIA;
  const scalingPercent = getSignatureScaling(entry);

  return {
    id: `${id}_active`,
    name: getSignatureActiveName(entry, info, signature),
    description: getSignatureActiveDescription(entry, info, signature),
    type: SkillType.ACTIVE,
    cooldownSeconds: isImmortal ? 12 : isHeaven ? 11 : 10,
    scalingStat,
    scalingPercent,
    damageElement: info.element,
    targeting: getSignatureTargeting(entry, info),
    areaPattern: getSignatureArea(entry),
    mechanicTags: getSignatureActiveTags(entry, info),
    formationNote: getSignatureFormationNote(entry, signature),
    effects: [
      {
        effect: {
          id: controlEffectId,
          type: getSignaturePrimaryEffectType(entry),
          durationTurns: isImmortal ? 3 : 2,
          value: getSignaturePrimaryEffectValue(entry),
          valueIsPercent: true,
          affectedStat: getSignatureAffectedStat(entry),
          stackable: isEarth,
          maxStacks: isEarth ? 2 : undefined,
        },
        trigger: TriggerCondition.ON_SKILL_CAST,
        chancePercent: isImmortal ? 100 : isHeaven ? 90 : 75,
      },
      {
        effect: {
          id: secondaryEffectId,
          type: entry.role === HeroRole.TANK_SUPPORT ? EffectType.SHIELD : EffectType.DAMAGE_OVER_TIME,
          durationTurns: 2,
          value: isImmortal ? 18 : isHeaven ? 14 : 10,
          valueIsPercent: true,
          stackable: entry.role !== HeroRole.TANK_SUPPORT,
          maxStacks: entry.role !== HeroRole.TANK_SUPPORT ? 3 : undefined,
        },
        trigger: TriggerCondition.ON_SKILL_CAST,
        chancePercent: isImmortal ? 100 : 70,
      },
    ],
    upgrades: [
      { unlockAtStar: 2, description: "Tăng độ ổn định của kỹ năng đặc trưng.", modifiedEffectId: controlEffectId, effectChancePercentOverride: isImmortal ? 100 : 100 },
      { unlockAtStar: 4, description: "Mở rộng combo/vị trí của kỹ năng.", valueIncreasePercent: isImmortal ? 35 : 25, modifiedEffectId: secondaryEffectId, effectValueOverride: isImmortal ? 24 : isHeaven ? 20 : 15 },
    ],
  };
}

function getSignaturePassiveDescription(entry: RosterEntry, info: ElementInfo, signature: { mark: string; combo: string; terrain: string; immortal: string }): string {
  if (entry.rarity === Rarity.TIEN) {
    return `Cơ chế riêng của ${entry.name}: đầu trận ban ${signature.mark} lên chiến trường, tăng sức mạnh toàn đội và mở combo ${signature.combo}.`;
  }
  if (entry.rarity === Rarity.THIEN) {
    return `Thiên Phẩm: khi đứng đúng ${signature.terrain}, kích hoạt thế trận giúp đồng minh cùng hàng/cột nhận lợi thế ${info.label}.`;
  }
  return `Địa Phẩm: mỗi lần dùng kỹ năng sẽ tạo ${signature.mark}, giúp kích hoạt combo ${signature.combo}.`;
}

function getSignatureActiveDescription(entry: RosterEntry, info: ElementInfo, signature: { mark: string; combo: string; terrain: string; immortal: string }): string {
  if (entry.rarity === Rarity.TIEN) {
    return `${entry.name} thi triển ${signature.immortal}, tác động diện rộng trên bàn 3x3 và kích hoạt cơ chế riêng: ${signature.combo}.`;
  }
  if (entry.rarity === Rarity.THIEN) {
    return `Kỹ năng Thiên Phẩm đánh theo thế trận ${signature.terrain}, gây sát thương ${info.label} và hỗ trợ đội hình cùng hàng/cột.`;
  }
  return `Kỹ năng Địa Phẩm đánh vào vị trí chiến thuật, đặt ${signature.mark} để mở combo: ${signature.combo}.`;
}

function getSignatureActiveName(entry: RosterEntry, info: ElementInfo, signature: { immortal: string }): string {
  if (entry.rarity === Rarity.TIEN) return signature.immortal;
  if (entry.rarity === Rarity.THIEN) return `${info.activeVerb} Thiên Trận`;
  return `${info.activeVerb} Địa Quyết`;
}

function getSignatureScaling(entry: RosterEntry): number {
  const roleBase = entry.role === HeroRole.TANK_SUPPORT ? 18 : entry.role === HeroRole.MAGIC_DPS ? 245 : 230;
  if (entry.rarity === Rarity.TIEN) return roleBase + 70;
  if (entry.rarity === Rarity.THIEN) return roleBase + 45;
  return roleBase + 25;
}

function getSignatureTargeting(entry: RosterEntry, info: ElementInfo): TargetingType {
  if (entry.rarity === Rarity.TIEN) {
    if (info.element === Element.LIGHT || entry.role === HeroRole.TANK_SUPPORT) return TargetingType.ALL_ALLIES;
    if (info.element === Element.DARK) return TargetingType.BACKLINE_ENEMY;
    return TargetingType.ALL_ENEMIES;
  }
  if (entry.rarity === Rarity.THIEN) {
    if (entry.role === HeroRole.TANK_SUPPORT) return TargetingType.ADJACENT_ALLIES;
    if (entry.role === HeroRole.MAGIC_DPS) return TargetingType.SAME_ROW;
    return TargetingType.BACKLINE_ENEMY;
  }
  if (entry.role === HeroRole.TANK_SUPPORT) return TargetingType.SAME_COLUMN;
  return getRoleTargeting(entry.role);
}

function getSignatureArea(entry: RosterEntry): AreaPattern {
  if (entry.rarity === Rarity.TIEN) return AreaPattern.ALL;
  if (entry.rarity === Rarity.THIEN) return entry.role === HeroRole.TANK_SUPPORT ? AreaPattern.CROSS : AreaPattern.ROW;
  return entry.role === HeroRole.TANK_SUPPORT ? AreaPattern.COLUMN : AreaPattern.SINGLE;
}

function getSignaturePrimaryEffectType(entry: RosterEntry): EffectType {
  if (entry.role === HeroRole.TANK_SUPPORT) return EffectType.DAMAGE_REDUCTION;
  if (entry.rarity === Rarity.TIEN && entry.role === HeroRole.MAGIC_DPS) return EffectType.STUN;
  if (entry.rarity === Rarity.THIEN) return EffectType.DEBUFF_STAT;
  return EffectType.SLOW;
}

function getSignatureAffectedStat(entry: RosterEntry): keyof BaseStats | undefined {
  if (entry.rarity === Rarity.THIEN && entry.role !== HeroRole.TANK_SUPPORT) return entry.role === HeroRole.MAGIC_DPS ? "mdef" : "def";
  return undefined;
}

function getSignaturePrimaryEffectValue(entry: RosterEntry): number {
  if (entry.rarity === Rarity.TIEN) return entry.role === HeroRole.TANK_SUPPORT ? 30 : 20;
  if (entry.rarity === Rarity.THIEN) return entry.role === HeroRole.TANK_SUPPORT ? 24 : 18;
  return entry.role === HeroRole.TANK_SUPPORT ? 18 : 16;
}

function getSignaturePassiveTags(entry: RosterEntry): string[] {
  if (entry.rarity === Rarity.TIEN) return ["immortal_unique", "battlefield_rule", "teamwide"];
  if (entry.rarity === Rarity.THIEN) return ["formation_engine", "row_column_synergy"];
  return ["earth_combo", "position_combo"];
}

function getSignatureActiveTags(entry: RosterEntry, info: ElementInfo): string[] {
  const tags = getSignaturePassiveTags(entry);
  tags.push(`${info.id}_signature`);
  if (entry.role === HeroRole.TANK_SUPPORT) tags.push("protective_core");
  if (entry.role === HeroRole.MAGIC_DPS) tags.push("control_core");
  if (entry.role === HeroRole.PHYSICAL_DPS) tags.push("execution_core");
  return tags;
}

function getSignatureFormationNote(entry: RosterEntry, signature: { terrain: string }): string {
  if (entry.rarity === Rarity.TIEN) return "Tiên Phẩm có luật chiến trường riêng, không phụ thuộc vị trí nhưng hưởng lợi mạnh khi đội hình bảo vệ được trung tâm.";
  if (entry.rarity === Rarity.THIEN) return `Thiên Phẩm mạnh nhất khi xếp quanh ${signature.terrain} để kích hoạt thế trận đội hình.`;
  return `Địa Phẩm ưu tiên đánh/giữ ${signature.terrain} để mở combo vị trí.`;
}

function makeHuyenMinorActiveUpgrade(id: string, entry: RosterEntry): Skill["upgrades"][number] {
  if (entry.role === HeroRole.TANK_SUPPORT) {
    return {
      unlockAtStar: 4,
      description: "Điểm Huyền Phẩm: khi trấn hộ, tạo thêm khiên nhỏ cho bản thân.",
      addedEffectTrigger: {
        effect: { id: `${id}_active_huyen_shield`, type: EffectType.SHIELD, durationTurns: 2, value: 8, valueIsPercent: true, stackable: false },
        trigger: TriggerCondition.ON_SKILL_CAST,
        chancePercent: 100,
      },
    };
  }

  return {
    unlockAtStar: 4,
    description: "Điểm Huyền Phẩm: kỹ năng có thêm hiệu ứng phụ theo vai trò.",
    addedEffectTrigger: {
      effect: {
        id: `${id}_active_huyen_extra`,
        type: entry.role === HeroRole.MAGIC_DPS ? EffectType.DAMAGE_OVER_TIME : EffectType.DEBUFF_STAT,
        durationTurns: 2,
        value: entry.role === HeroRole.MAGIC_DPS ? 7 : 10,
        valueIsPercent: true,
        affectedStat: entry.role === HeroRole.PHYSICAL_DPS ? "def" : undefined,
        stackable: entry.role === HeroRole.MAGIC_DPS,
        maxStacks: entry.role === HeroRole.MAGIC_DPS ? 2 : undefined,
      },
      trigger: TriggerCondition.ON_SKILL_CAST,
      chancePercent: 70,
    },
  };
}

function makePassiveSkill(id: string, entry: RosterEntry, info: ElementInfo): Skill {
  if (entry.rarity >= Rarity.DIA) {
    return makeSignaturePassive(id, entry, info);
  }

  if (entry.role === HeroRole.PHYSICAL_DPS) {
    const effectId = `${id}_passive_crit_atk`;
    return {
      id: `${id}_passive`,
      name: `${info.activeVerb} Chiến Ý`,
      description: "Khi chí mạng, tăng ATK trong 2 lượt.",
      type: SkillType.PASSIVE,
      scalingStat: "atk",
      scalingPercent: 0,
      targeting: TargetingType.SELF,
      areaPattern: AreaPattern.SINGLE,
      mechanicTags: entry.rarity === Rarity.HUYEN ? ["huyen_minor_variant", "crit_self_buff"] : ["basic_role_skill", "crit_self_buff"],
      effects: [{
        effect: { id: effectId, type: EffectType.BUFF_STAT, durationTurns: 2, value: 8 + rarityBonus(entry.rarity, 2), valueIsPercent: true, affectedStat: "atk", stackable: false },
        trigger: TriggerCondition.ON_CRIT_HIT,
        chancePercent: 100,
      }],
      upgrades: [
        { unlockAtStar: 3, description: "Tăng hiệu quả nội tại.", modifiedEffectId: effectId, effectValueOverride: 14 + rarityBonus(entry.rarity, 2) },
        { unlockAtStar: 5, description: "Nội tại kéo dài thêm 1 lượt.", modifiedEffectId: effectId, effectDurationTurnsOverride: 3 },
      ],
    };
  }

  if (entry.role === HeroRole.MAGIC_DPS) {
    const effectId = `${id}_passive_low_hp_matk`;
    return {
      id: `${id}_passive`,
      name: `${info.activeVerb} Tâm Pháp`,
      description: "Khi HP xuống thấp, tăng MATK trong 3 lượt.",
      type: SkillType.PASSIVE,
      scalingStat: "matk",
      scalingPercent: 0,
      targeting: TargetingType.SELF,
      areaPattern: AreaPattern.SINGLE,
      mechanicTags: entry.rarity === Rarity.HUYEN ? ["huyen_minor_variant", "low_hp_matk"] : ["basic_role_skill", "low_hp_matk"],
      effects: [{
        effect: { id: effectId, type: EffectType.BUFF_STAT, durationTurns: 3, value: 12 + rarityBonus(entry.rarity, 2), valueIsPercent: true, affectedStat: "matk", stackable: false },
        trigger: TriggerCondition.ON_HP_BELOW_THRESHOLD,
        chancePercent: 100,
        hpThresholdPercent: 50,
      }],
      upgrades: [
        { unlockAtStar: 3, description: "Kích hoạt sớm hơn khi HP còn 65%.", modifiedEffectId: effectId, effectHpThresholdPercentOverride: 65 },
        { unlockAtStar: 5, description: "Tăng mạnh MATK khi kích hoạt.", modifiedEffectId: effectId, effectValueOverride: 22 + rarityBonus(entry.rarity, 2) },
      ],
    };
  }

  const effectId = `${id}_passive_start_shield`;
  return {
    id: `${id}_passive`,
    name: `${info.activeVerb} Hộ Thân`,
    description: "Đầu trận tạo khiên cho bản thân trong 3 lượt.",
    type: SkillType.PASSIVE,
    scalingStat: "hp",
    scalingPercent: 0,
    targeting: TargetingType.SELF,
    areaPattern: AreaPattern.SINGLE,
    mechanicTags: entry.rarity === Rarity.HUYEN ? ["huyen_minor_variant", "start_shield"] : ["basic_role_skill", "start_shield"],
    effects: [{
      effect: { id: effectId, type: EffectType.SHIELD, durationTurns: 3, value: 8 + rarityBonus(entry.rarity, 2), valueIsPercent: true, stackable: false },
      trigger: TriggerCondition.ON_BATTLE_START,
      chancePercent: 100,
    }],
    upgrades: [
      { unlockAtStar: 3, description: "Khiên đầu trận mạnh hơn.", modifiedEffectId: effectId, effectValueOverride: 14 + rarityBonus(entry.rarity, 2) },
      { unlockAtStar: 5, description: "Khiên đầu trận kéo dài thêm 1 lượt.", modifiedEffectId: effectId, effectDurationTurnsOverride: 4 },
    ],
  };
}

function makeActiveSkill(id: string, entry: RosterEntry, info: ElementInfo): Skill {
  if (entry.rarity >= Rarity.DIA) {
    return makeSignatureActive(id, entry, info);
  }

  const skillBonus = RARITY_SKILL_BONUS[entry.rarity];

  if (entry.role === HeroRole.PHYSICAL_DPS) {
    const effectId = `${id}_active_dot`;
    return {
      id: `${id}_active`,
      name: `${info.activeVerb} Trảm`,
      description: `Gây sát thương ${info.label} bằng ATK, có tỉ lệ gây ${info.dotName} trong 2 lượt.`,
      type: SkillType.ACTIVE,
      cooldownSeconds: 8,
      scalingStat: "atk",
      scalingPercent: 185 + skillBonus,
      damageElement: info.element,
      targeting: getRoleTargeting(entry.role),
      areaPattern: getRoleAreaPattern(entry.role),
      mechanicTags: entry.rarity === Rarity.HUYEN ? ["huyen_minor_variant", "single_target_dot"] : ["basic_role_skill", "single_target_dot"],
      effects: [{
        effect: { id: effectId, type: EffectType.DAMAGE_OVER_TIME, durationTurns: 2, value: 8 + rarityBonus(entry.rarity, 2), valueIsPercent: true, stackable: true, maxStacks: 3 },
        trigger: TriggerCondition.ON_SKILL_CAST,
        chancePercent: 35 + rarityBonus(entry.rarity, 5),
      }],
      upgrades: [
        { unlockAtStar: 2, description: "Tăng tỉ lệ gây hiệu ứng theo hệ.", modifiedEffectId: effectId, effectChancePercentOverride: 60 + rarityBonus(entry.rarity, 4) },
        entry.rarity === Rarity.HUYEN
          ? makeHuyenMinorActiveUpgrade(id, entry)
          : { unlockAtStar: 4, description: "Tăng sát thương kỹ năng và kéo dài hiệu ứng.", valueIncreasePercent: 25, modifiedEffectId: effectId, effectDurationTurnsOverride: 3 },
      ],
    };
  }

  if (entry.role === HeroRole.MAGIC_DPS) {
    const effectId = `${id}_active_slow`;
    return {
      id: `${id}_active`,
      name: `${info.activeVerb} Pháp Trận`,
      description: `Triệu hồi pháp trận ${info.label}, gây sát thương bằng MATK và làm chậm mục tiêu.`,
      type: SkillType.ACTIVE,
      cooldownSeconds: 10,
      scalingStat: "matk",
      scalingPercent: 205 + skillBonus,
      damageElement: info.element,
      targeting: getRoleTargeting(entry.role),
      areaPattern: getRoleAreaPattern(entry.role),
      mechanicTags: entry.rarity === Rarity.HUYEN ? ["huyen_minor_variant", "row_control"] : ["basic_role_skill", "row_control"],
      effects: [{
        effect: { id: effectId, type: EffectType.SLOW, durationTurns: 2, value: 12 + rarityBonus(entry.rarity, 3), valueIsPercent: true, stackable: false },
        trigger: TriggerCondition.ON_SKILL_CAST,
        chancePercent: 100,
      }],
      upgrades: [
        { unlockAtStar: 2, description: "Làm chậm mạnh hơn.", modifiedEffectId: effectId, effectValueOverride: 22 + rarityBonus(entry.rarity, 3) },
        entry.rarity === Rarity.HUYEN
          ? makeHuyenMinorActiveUpgrade(id, entry)
          : { unlockAtStar: 4, description: "Tăng sát thương kỹ năng và kéo dài làm chậm.", valueIncreasePercent: 25, modifiedEffectId: effectId, effectDurationTurnsOverride: 3 },
      ],
    };
  }

  const tauntId = `${id}_active_taunt`;
  const reductionId = `${id}_active_reduction`;
  return {
    id: `${id}_active`,
    name: `${info.activeVerb} Trấn Hộ`,
    description: `Dùng chân khí ${info.label} khiêu khích địch và giảm sát thương nhận vào.`,
    type: SkillType.ACTIVE,
    cooldownSeconds: 11,
    scalingStat: "hp",
    scalingPercent: 12 + Math.floor(skillBonus / 8),
    damageElement: info.element,
    targeting: getRoleTargeting(entry.role),
    areaPattern: getRoleAreaPattern(entry.role),
    mechanicTags: entry.rarity === Rarity.HUYEN ? ["huyen_minor_variant", "taunt_guard"] : ["basic_role_skill", "taunt_guard"],
    effects: [
      {
        effect: { id: tauntId, type: EffectType.TAUNT, durationTurns: 1, value: 0, valueIsPercent: false, stackable: false },
        trigger: TriggerCondition.ON_SKILL_CAST,
        chancePercent: 100,
      },
      {
        effect: { id: reductionId, type: EffectType.DAMAGE_REDUCTION, durationTurns: 2, value: 10 + rarityBonus(entry.rarity, 3), valueIsPercent: true, stackable: false },
        trigger: TriggerCondition.ON_SKILL_CAST,
        chancePercent: 100,
      },
    ],
    upgrades: [
      { unlockAtStar: 2, description: "Tăng giảm sát thương khi trấn hộ.", modifiedEffectId: reductionId, effectValueOverride: 18 + rarityBonus(entry.rarity, 3) },
      entry.rarity === Rarity.HUYEN
        ? makeHuyenMinorActiveUpgrade(id, entry)
        : { unlockAtStar: 4, description: "Trấn hộ hồi thêm HP tức thời.", addedEffectTrigger: {
          effect: { id: `${id}_active_heal`, type: EffectType.INSTANT_HEAL, durationTurns: 0, value: 8 + rarityBonus(entry.rarity, 2), valueIsPercent: true, stackable: false },
          trigger: TriggerCondition.ON_SKILL_CAST,
          chancePercent: 100,
        } },
    ],
  };
}

function rarityBonus(rarity: Rarity, step: number): number {
  return (rarity - 1) * step;
}

function makeStarBonuses(role: HeroRole): StarBonus[] {
  if (role === HeroRole.PHYSICAL_DPS) {
    return [
      { star: 1, unlockDescription: "Mở khóa tướng ở 1 sao." },
      { star: 2, statBonusPercent: { atk: 5 }, unlockDescription: "Tăng ATK." },
      { star: 3, statBonusPercent: { atk: 8, critRate: 3 }, unlockDescription: "Mở nâng cấp nội tại." },
      { star: 4, statBonusPercent: { atk: 10 }, unlockDescription: "Mở nâng cấp kỹ năng chủ động." },
      { star: 5, statBonusPercent: { atk: 14, critDmg: 12 }, unlockDescription: "Bứt phá sát thương vật lý." },
    ];
  }

  if (role === HeroRole.MAGIC_DPS) {
    return [
      { star: 1, unlockDescription: "Mở khóa tướng ở 1 sao." },
      { star: 2, statBonusPercent: { matk: 5 }, unlockDescription: "Tăng MATK." },
      { star: 3, statBonusPercent: { matk: 8, mdef: 4 }, unlockDescription: "Mở nâng cấp nội tại." },
      { star: 4, statBonusPercent: { matk: 10 }, unlockDescription: "Mở nâng cấp kỹ năng chủ động." },
      { star: 5, statBonusPercent: { matk: 14, critDmg: 12 }, unlockDescription: "Bứt phá sát thương phép." },
    ];
  }

  return [
    { star: 1, unlockDescription: "Mở khóa tướng ở 1 sao." },
    { star: 2, statBonusPercent: { hp: 6 }, unlockDescription: "Tăng HP." },
    { star: 3, statBonusPercent: { hp: 8, def: 5 }, unlockDescription: "Mở nâng cấp nội tại." },
    { star: 4, statBonusPercent: { def: 8, mdef: 8 }, unlockDescription: "Mở nâng cấp kỹ năng chủ động." },
    { star: 5, statBonusPercent: { hp: 15, def: 8, mdef: 8 }, unlockDescription: "Bứt phá chống chịu." },
  ];
}

function makeHeroTemplate(info: ElementInfo, entry: RosterEntry): HeroTemplate {
  const id = `hero_${info.id}_${slugifyVietnamese(entry.name)}`;
  return {
    id,
    name: entry.name,
    title: entry.title,
    element: info.element,
    role: entry.role,
    rarity: entry.rarity,
    baseStats: scaleBaseStats(entry.role, entry.rarity),
    statGrowthPerLevel: scaleGrowthStats(entry.role, entry.rarity),
    maxLevel: 80,
    passiveSkill: makePassiveSkill(id, entry, info),
    activeSkill: makeActiveSkill(id, entry, info),
    starBonuses: makeStarBonuses(entry.role),
    maxStar: 5,
    lore: `${entry.name} là ${entry.title} của ${info.school}, thuộc hệ ${info.label}, đảm nhiệm vai trò ${ROLE_LABELS[entry.role]}.`,
  };
}

export const ALL_HEROES: HeroTemplate[] = ELEMENT_INFOS.flatMap((info) =>
  ROSTER_BY_ELEMENT[info.id].map((entry) => makeHeroTemplate(info, entry))
);

export const HEROES_BY_ID: Record<string, HeroTemplate> = Object.fromEntries(
  ALL_HEROES.map((hero) => [hero.id, hero])
);

export const HEROES_BY_ELEMENT: Record<Element, HeroTemplate[]> = {
  [Element.METAL]: ALL_HEROES.filter((hero) => hero.element === Element.METAL),
  [Element.WOOD]: ALL_HEROES.filter((hero) => hero.element === Element.WOOD),
  [Element.WATER]: ALL_HEROES.filter((hero) => hero.element === Element.WATER),
  [Element.FIRE]: ALL_HEROES.filter((hero) => hero.element === Element.FIRE),
  [Element.EARTH]: ALL_HEROES.filter((hero) => hero.element === Element.EARTH),
  [Element.LIGHT]: ALL_HEROES.filter((hero) => hero.element === Element.LIGHT),
  [Element.DARK]: ALL_HEROES.filter((hero) => hero.element === Element.DARK),
};

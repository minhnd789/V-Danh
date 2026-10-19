// ============================================================
// config.js - Chỉnh nội dung ở ĐÂY (tên, lời nhắn, ngày tháng)
// Mọi chỗ có {her} sẽ thay bằng herName, {his} thay bằng hisName.
// ============================================================
window.GIFT_CONFIG = {
  // Tên người nhận. Ví dụ: "Linh" → "Gửi Linh", "Linh à,"
  herName: "em yêu",
  // Chữ ký cuối thư
  hisName: "Anh",
  dateText: "20 · 10 · 2026",

  // Bật/tắt nhạc nền (nhạc được tổng hợp bằng Web Audio, không cần file mp3)
  music: true,

  intro: {
    kicker: "Ngày Phụ nữ Việt Nam",
    title: "Gửi {her}",
    subtitle: "Một món quà nhỏ, một tình yêu thật lớn",
    hint: "Chạm vào hộp quà để mở nhé"
  },

  fireworks: {
    title: "Chúc mừng 20-10",
    subtitle: "Pháo hoa này anh bắn riêng cho em",
    hint: "Chạm vào bất kỳ đâu để bắn thêm pháo hoa ✨",
    next: "Tiếp tục ♥"
  },

  flowers: {
    title: "Hoa & gấu cho em",
    lines: [
      "Anh không chọn nổi bó hoa đẹp nhất ngoài tiệm,",
      "nên anh trồng cho em một vườn hoa không bao giờ tàn.",
      "Và một chú gấu, thay anh ôm em mỗi ngày."
    ],
    next: "Đọc thư anh viết ♥"
  },

  letter: {
    title: "Thư anh viết cho em",
    openButton: "Mở thư 💌",
    greeting: "{her} à,",
    paragraphs: [
      "Anh xin lỗi vì không thể chuẩn bị cho em món quà tuyệt vời nhất trong ngày hôm nay. Anh biết mình quá ẩu, và nhiều lúc chẳng thể tự mình quyết định được điều gì. Anh đứng giữa tiệm hoa, rồi tiệm gấu, rồi lại chẳng biết chọn gì mới xứng đáng với em.",
      "Nhưng có một điều anh chưa bao giờ phải phân vân, dù chỉ một giây: anh yêu em.",
      "Nên anh dành cho em một món quà anh tự tay làm – một website nhỏ chứa thật nhiều tình cảm. Từng bông hoa, từng chú gấu, từng chùm pháo hoa ở đây đều là anh đang nói với em rằng: cảm ơn em đã ở bên anh, đã kiên nhẫn với một người vụng về như anh.",
      "Chúc em ngày 20-10 thật nhiều niềm vui và thật nhiều nụ cười. Anh hứa sẽ cố gắng chín chắn hơn, quyết đoán hơn, để xứng đáng với em hơn mỗi ngày."
    ],
    closing: "Anh yêu em. Rất nhiều.",
    signature: "— {his}",
    skip: "Hiện toàn bộ thư",
    next: "Xem những bức vẽ ♥"
  },

  drawings: {
    title: "Những bức vẽ anh dành cho em",
    captions: [
      "Bông hồng đầu tiên anh tặng em",
      "Gấu bông thay anh ôm em những ngày anh vụng về",
      "Hai trái tim, một nhịp đập",
      "Mình cùng nhau đi hết những ngày sau"
    ],
    replay: "Vẽ lại",
    next: "Tiếp tục ♥"
  },

  reasons: {
    title: "Những điều anh yêu ở em",
    hint: "Chạm vào từng trái tim nhé",
    items: [
      "Nụ cười của em – thứ làm anh quên hết mệt mỏi",
      "Cách em kiên nhẫn với một người vụng về như anh",
      "Những tin nhắn “ăn cơm chưa” mỗi ngày",
      "Cách em giận một chút rồi lại tự dỗ anh",
      "Em luôn tin anh, kể cả khi anh chưa tin chính mình",
      "Giọng em khi gọi tên anh",
      "Em là lý do anh muốn trở thành người tốt hơn",
      "Và đơn giản vì em là em"
    ],
    progress: "{n}/{total} trái tim",
    done: "Và còn nhiều điều nữa, anh sẽ nói với em mỗi ngày ❤",
    next: "Điều cuối cùng ♥"
  },

  finale: {
    title: "Anh yêu em",
    subtitle: "Chúc em ngày 20-10 thật hạnh phúc, cười thật nhiều và luôn được yêu thương.",
    tag: "Happy Women's Day · 20/10",
    replay: "Xem lại từ đầu",
    boom: "Bắn pháo hoa 🎆"
  }
};

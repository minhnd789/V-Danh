# Quà 20-10 · Website animation dành cho em ❤

Một trang web tĩnh (HTML/CSS/JS thuần, **không cần cài đặt hay build**) với 7 màn chuyển tiếp:

| # | Màn | Hiệu ứng |
|---|-----|----------|
| 0 | Mở quà | Hộp quà nhún nhảy, chạm để mở → tim & confetti bung ra, nhạc nền bắt đầu |
| 1 | Pháo hoa | Pháo hoa canvas nổ thành **hình trái tim**, nổ thành chữ `20 · 10`, `I ♥ U`, `Anh yêu em`; chạm bất kỳ đâu để bắn thêm |
| 2 | Hoa & gấu | Bó hoa SVG tự nở từng bông (hồng, tulip, cúc, hoa baby), gấu bông vẫy tay, chớp mắt, ôm trái tim đập |
| 3 | Bức thư | Phong bì mở nắp, thư trượt ra, lời nhắn gõ từng chữ (có nút hiện toàn bộ) |
| 4 | Những bức vẽ | 4 bức vẽ nét tự vẽ bằng "bút" phát sáng: hoa hồng, gấu, hai trái tim, hai đứa mình |
| 5 | Những điều anh yêu ở em | Chạm vào từng trái tim bay để hiện một lý do |
| 6 | Lời cuối | Hàng trăm hạt sáng hội tụ thành trái tim lớn, mưa tim, chữ **Anh yêu em** hiện từng chữ cái |

Nền luôn có sao lấp lánh, sao băng, cánh hoa rơi và tim bay. Nhạc nền nhẹ được tổng hợp trực tiếp bằng Web Audio (không cần file mp3), bật/tắt bằng nút ♪ góc trên phải hoặc phím `M`. Điều hướng bằng nút, chấm tròn, hoặc phím mũi tên.

## Cách xem

**Cách 1 – mở trực tiếp:** mở file `index.html` bằng trình duyệt (Chrome/Safari/Edge), kể cả trên điện thoại.

**Cách 2 – đưa lên GitHub Pages (để gửi link cho người ấy):**
1. Vào repo trên GitHub → **Settings → Pages**.
2. Mục *Build and deployment* chọn **Deploy from a branch**, branch `main`, thư mục `/ (root)` → Save.
3. Sau ~1 phút, trang sẽ có tại: `https://<tên-user>.github.io/<tên-repo>/qua-20-10/`

## Tùy chỉnh nội dung

Tất cả chữ nghĩa nằm trong **`config.js`** – chỉ cần sửa file này:

```js
herName: "em yêu",   // đổi thành tên người ấy, ví dụ "Linh" → "Gửi Linh", "Linh à,"
hisName: "Anh",      // chữ ký cuối thư
dateText: "20 · 10 · 2026",
music: true,         // false nếu không muốn nhạc nền
```

- `letter.paragraphs`: các đoạn trong bức thư (mỗi đoạn một dòng trong mảng).
- `reasons.items`: danh sách "những điều anh yêu ở em" (mỗi mục là một trái tim).
- `drawings.captions`: chú thích dưới 4 bức vẽ.
- Mọi chỗ có `{her}` / `{his}` sẽ tự thay bằng tên đã khai báo.

## Cấu trúc

```
qua-20-10/
  index.html   Khung 7 màn, SVG gấu bông, 4 bức vẽ nét
  style.css    Giao diện, animation CSS (hộp quà, phong bì, hoa nở, gấu cử động...)
  script.js    Pháo hoa & hạt canvas, sinh bó hoa SVG, gõ chữ, vẽ nét, nhạc Web Audio
  config.js    Toàn bộ nội dung chữ (sửa ở đây)
```

Hoạt động tốt trên điện thoại (bố cục đáp ứng, có vùng an toàn cho tai thỏ) và máy tính.

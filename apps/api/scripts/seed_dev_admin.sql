-- Dev-only manual seed: memberikan akses admin ke satu akun Clerk tanpa
-- perlu webhook user.created (yang tidak bisa sampai ke localhost tanpa
-- tunnel). Aman dijalankan berkali-kali (idempotent). BUKAN bagian dari
-- migrations/ yang dikelola golang-migrate -- ini utilitas dev sekali-pakai.
--
-- GANTI dua nilai di bawah sebelum menjalankan:
--   :clerk_user_id -> "user_xxxxxxxxxxxxx" dari Clerk Dashboard > Users
--   :email         -> email akun itu
--
-- Jalankan lewat psql:
--   psql "$DATABASE_URL" \
--     -v clerk_user_id="'user_xxxxxxxxxxxxx'" \
--     -v email="'kamu@example.com'" \
--     -f scripts/seed_dev_admin.sql
-- atau copy-paste ke Neon SQL editor setelah substitusi manual dua nilai itu.

-- 1) Pastikan ada satu baris communities (MVP single-tenant -- GetCurrent
--    cuma ambil baris pertama). Skip kalau sudah ada baris apapun.
INSERT INTO communities (slug, name, tagline)
SELECT 'iridescent', 'Iridescent', 'Move. Connect. Create.'
WHERE NOT EXISTS (SELECT 1 FROM communities);

-- 2) Upsert baris users untuk akun Clerk kamu (biasanya dibuat webhook,
--    di sini dibuat manual).
INSERT INTO users (clerk_user_id, email)
VALUES (:clerk_user_id, :email)
ON CONFLICT (clerk_user_id) DO UPDATE SET email = EXCLUDED.email;

-- 3) Kasih role admin, status active, ke community yang ada.
INSERT INTO memberships (community_id, user_id, role, status)
SELECT c.id, u.id, 'admin', 'active'
FROM communities c, users u
WHERE u.clerk_user_id = :clerk_user_id
ORDER BY c.created_at ASC
LIMIT 1
ON CONFLICT (community_id, user_id) DO UPDATE SET role = 'admin', status = 'active';

-- Verifikasi:
SELECT u.email, m.role, m.status, c.name AS community
FROM memberships m
JOIN users u ON u.id = m.user_id
JOIN communities c ON c.id = m.community_id
WHERE u.clerk_user_id = :clerk_user_id;

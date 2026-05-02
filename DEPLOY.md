# StoreKit — دليل النشر الكامل

## كلمة سر الداشبورد الافتراضية
```
storekit2024
```
رابط الداشبورد: `/admin`

---

## 🐳 النشر بـ Docker (الأسهل لأي خادم أو VPS)

هذه الطريقة مستقلة 100% عن Replit وتعمل على أي جهاز أو خادم.

### المتطلبات:
- [Docker](https://docs.docker.com/get-docker/) مثبت
- [Docker Compose](https://docs.docker.com/compose/install/) مثبت

### الخطوات:

```bash
# 1. استنزل ملفات المشروع
git clone <your-repo-url> storekit
cd storekit

# 2. شغّل سكريبت الإعداد التلقائي
bash setup.sh

# 3. خلاص — المتجر شغّال على http://localhost
```

**أو يدوياً:**

```bash
cp .env.example .env
# عدّل .env وضع POSTGRES_PASSWORD و SESSION_SECRET
docker compose up -d --build
```

### الوصول:
| الرابط | الوصف |
|--------|-------|
| `http://localhost` | المتجر |
| `http://localhost/admin` | الداشبورد |
| `http://localhost/api/healthz` | حالة الـ API |

### إيقاف / تشغيل:
```bash
docker compose down         # إيقاف
docker compose up -d        # تشغيل مرة أخرى
docker compose logs -f app  # مشاهدة اللوجز
```

---

## ☁️ النشر على Replit (الأسرع)

Replit هو الخيار الأسهل لأن قاعدة البيانات والبيئة كلها موجودة بالفعل.

1. افتح المشروع على [replit.com](https://replit.com)
2. اضغط **Deploy** في الشريط العلوي
3. اختر **Autoscale** أو **Reserved VM**
4. اضغط **Deploy** ✅

---

## 🚀 النشر على Railway (VPS سحابي — مجاني جزئياً)

1. افتح [railway.app](https://railway.app)
2. **New Project → Deploy from GitHub**
3. أضف **PostgreSQL** service
4. في إعدادات المشروع أضف متغيرات البيئة من `.env.example`
5. **Build Command:** `pnpm install && pnpm --filter @workspace/api-server run build && pnpm --filter @workspace/storekit build`
6. **Start Command:** `node --enable-source-maps artifacts/api-server/dist/index.mjs`

---

## 🌐 النشر على Render

1. افتح [render.com](https://render.com) → **New Web Service**
2. اربط GitHub repo
3. **Build Command:** `npm install -g pnpm && pnpm install && pnpm --filter @workspace/api-server run build && pnpm --filter @workspace/storekit build`
4. **Start Command:** `FRONTEND_DIST=artifacts/storekit/dist/public node --enable-source-maps artifacts/api-server/dist/index.mjs`
5. أضف **PostgreSQL** database من Render
6. أضف متغيرات البيئة

---

## 📱 النشر على Vercel (Frontend فقط)

> **ملاحظة:** Vercel مناسب للـ frontend فقط. الـ API يحتاج نشر منفصل على Railway أو Render.

1. افتح [vercel.com](https://vercel.com)
2. **Add New Project → GitHub**
3. **Framework:** Other
4. **Build Command:** `pnpm install && pnpm --filter @workspace/storekit build`
5. **Output Directory:** `artifacts/storekit/dist/public`

---

## متغيرات البيئة المطلوبة

| المتغير | الوصف | مطلوب |
|---------|-------|--------|
| `DATABASE_URL` | رابط PostgreSQL | ✅ |
| `SESSION_SECRET` | مفتاح عشوائي طويل | ✅ |
| `ADMIN_PASSWORD` | كلمة سر الداشبورد | ✅ |
| `POSTGRES_PASSWORD` | كلمة سر PostgreSQL (Docker فقط) | ✅ Docker |
| `CLERK_PUBLISHABLE_KEY` | من [dashboard.clerk.com](https://dashboard.clerk.com) | اختياري |
| `CLERK_SECRET_KEY` | من [dashboard.clerk.com](https://dashboard.clerk.com) | اختياري |
| `STRIPE_SECRET_KEY` | من [dashboard.stripe.com](https://dashboard.stripe.com) | اختياري |
| `VITE_STRIPE_PUBLISHABLE_KEY` | من [dashboard.stripe.com](https://dashboard.stripe.com) | اختياري |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | إعدادات الإيميل | اختياري |
| `UPLOAD_DIR` | مجلد حفظ صور المنتجات | اختياري |
| `FRONTEND_DIST` | مسار الـ frontend المبني | Docker/Production |

---

## تشغيل الـ Migrations

```bash
# على Docker:
docker compose exec app node -e "require('./dist/index.mjs')"

# محلياً:
pnpm --filter @workspace/db run push

# على Neon/Supabase: شغّل الـ SQL من lib/db/migrations/
```

---

## ملاحظات مهمة للإنتاج

- ✅ غيّر `ADMIN_PASSWORD` إلى كلمة سر قوية
- ✅ استخدم Clerk **Production** keys (ليس Development)
- ✅ تأكد من SSL على قاعدة البيانات (`?sslmode=require`)
- ✅ احفظ مجلد `uploads/` خارج الـ container (volume) لعدم فقدان الصور
- ✅ استخدم `SESSION_SECRET` عشوائي وطويل (64+ حرف)

---

*آخر تحديث: مايو 2026*

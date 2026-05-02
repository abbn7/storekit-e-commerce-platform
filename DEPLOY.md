# StoreKit — دليل النشر الكامل

## كلمة سر الداشبورد
```
storekit2024
```
رابط الداشبورد: `/admin`

---

## النشر على Replit (الأسهل — موصى به)

Replit هو الخيار الأسهل لأن قاعدة البيانات (PostgreSQL) والبيئة كلها موجودة بالفعل.

### خطوات النشر من أي جهاز (موبايل أو كمبيوتر):

1. افتح المشروع على [replit.com](https://replit.com)
2. اضغط على زر **Deploy** في الشريط العلوي
3. اختر **Autoscale** أو **Reserved VM**
4. اضغط **Deploy** — وخلاص ✅

**متغيرات البيئة المطلوبة للإنتاج:**
| المتغير | الوصف |
|---------|-------|
| `SESSION_SECRET` | مفتاح عشوائي طويل (موجود بالفعل) |
| `DATABASE_URL` | رابط PostgreSQL (موجود بالفعل في Replit) |
| `VITE_CLERK_PUBLISHABLE_KEY` | من dashboard.clerk.com |
| `CLERK_SECRET_KEY` | من dashboard.clerk.com |
| `STRIPE_SECRET_KEY` | من dashboard.stripe.com |
| `VITE_STRIPE_PUBLISHABLE_KEY` | من dashboard.stripe.com |
| `ADMIN_PASSWORD` | كلمة سر الداشبورد (حالياً: storekit2024) |

---

## النشر على Vercel من الآيفون 📱

### المتطلبات الأولية:
- حساب على [GitHub](https://github.com) (مجاني)
- حساب على [Vercel](https://vercel.com) (مجاني)
- حساب على [Neon](https://neon.tech) لقاعدة البيانات (مجاني)

---

### الخطوة 1 — رفع المشروع على GitHub

#### من الآيفون:
1. افتح [github.com](https://github.com) في Safari
2. سجّل دخولك
3. اضغط **+** ثم **New repository**
4. اسم المشروع: `storekit`
5. اختر **Private** (سري)
6. اضغط **Create repository**
7. ارجع للـ Replit → اضغط على **Git** في الشريط الجانبي
8. اربط بالـ repository الجديد وادفع الكود

---

### الخطوة 2 — إنشاء قاعدة بيانات PostgreSQL على Neon

1. افتح [neon.tech](https://neon.tech) من Safari
2. اضغط **Sign Up** بحساب Google
3. اضغط **Create Project**
4. اسم المشروع: `storekit-db`
5. اختر Region قريبة منك
6. اضغط **Create Project**
7. انسخ **Connection String** — يبدو هكذا:
   ```
   postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```
8. احتفظ بهذا الرابط — ستحتاجه في الخطوة 4

---

### الخطوة 3 — إعداد Clerk للإنتاج

1. افتح [dashboard.clerk.com](https://dashboard.clerk.com)
2. افتح مشروعك (أو أنشئ جديداً)
3. من القائمة الجانبية: **API Keys**
4. انسخ:
   - **Publishable Key** يبدأ بـ `pk_live_...`
   - **Secret Key** يبدأ بـ `sk_live_...`
5. من **Domains**: أضف نطاق Vercel بعد النشر (مثل `storekit.vercel.app`)

---

### الخطوة 4 — النشر على Vercel

1. افتح [vercel.com](https://vercel.com) من Safari
2. اضغط **Sign Up** → **Continue with GitHub**
3. اضغط **Add New Project**
4. اختر repository الـ `storekit`
5. في إعدادات المشروع:
   - **Framework Preset**: Other
   - **Root Directory**: `.` (اتركه كما هو)
   - **Build Command**: `pnpm install && pnpm --filter @workspace/storekit build`
   - **Output Directory**: `artifacts/storekit/dist/public`
   - **Install Command**: `pnpm install`

6. اضغط **Environment Variables** وأضف:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | رابط Neon من الخطوة 2 |
| `SESSION_SECRET` | أي نص عشوائي طويل (30+ حرف) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Publishable Key من Clerk |
| `CLERK_SECRET_KEY` | Secret Key من Clerk |
| `ADMIN_PASSWORD` | `storekit2024` أو كلمة سرك |
| `NODE_ENV` | `production` |
| `BASE_PATH` | `/` |

7. اضغط **Deploy** 🚀

---

### الخطوة 5 — تشغيل migrations على Neon

بعد النشر، تحتاج إنشاء الجداول في قاعدة البيانات:

1. افتح [neon.tech](https://neon.tech) → مشروعك
2. اضغط **SQL Editor**
3. الصق هذا الأمر لتشغيل الـ migrations:

```sql
-- هذا سيُنفَّذ تلقائياً عند أول تشغيل للتطبيق
-- أو يمكنك تشغيل migrations يدوياً عبر:
-- pnpm --filter @workspace/db run db:migrate
```

> الأفضل: شغّل من Replit terminal:
> ```bash
> DATABASE_URL="your-neon-url" pnpm --filter @workspace/db run db:migrate
> ```

---

### الخطوة 6 — تأكيد النشر

1. بعد انتهاء Vercel من البناء، ستحصل على رابط مثل:
   ```
   https://storekit-xxx.vercel.app
   ```
2. افتح الرابط من Safari
3. الداشبورد: `https://your-app.vercel.app/admin`
4. كلمة السر: `storekit2024`

---

## إعادة النشر عند التحديث

في كل مرة تعدّل الكود وترفعه على GitHub، سيقوم Vercel بإعادة البناء تلقائياً خلال دقيقتين.

---

## Code Review — ملاحظات مهمة

### ✅ ما تم إصلاحه:
- **vite.config.ts**: لم يعد يتطلب `PORT` عند البناء (كانت تسبب فشل البناء)
- **404 page**: تصميم فاخر بدلاً من الصفحة البدائية
- **Dark mode**: تبديل كامل مع حفظ في localStorage
- **Arabic support**: ترجمة كاملة مع RTL
- **Build chunks**: تقسيم vendor/clerk/i18n لأداء أفضل

### ⚠️ ملاحظات للإنتاج:
- غيّر `ADMIN_PASSWORD` إلى كلمة سر قوية
- استخدم Clerk Production keys (ليس Development)
- تأكد من SSL على قاعدة البيانات (`?sslmode=require`)
- أضف `STRIPE_SECRET_KEY` للدفع الحقيقي

---

*آخر تحديث: مايو 2025*

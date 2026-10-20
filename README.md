# Hassan Nasser — Personal Portfolio

A complete **Angular 20 + Node.js / Express 5** project, using the supplied
project screenshots, community photographs, profile image, and CV.
Dark mode is the default. Light mode is available from the header, and the
visitor's choice is saved on their device.

## تشغيل المشروع

ثبّت Node.js **22.12 أو أحدث من نسخ LTS**، وافتح Terminal داخل فولدر المشروع:

```bash
npm ci
npm run dev
```

افتح **http://localhost:4200**. Angular يعيد تحميل تعديلات الكود تلقائيًا،
والـNode API يعمل على بورت 3000 عن طريق proxy.

لتشغيل النسخة النهائية كاملة من Node:

```bash
npm run build
npm start
```

افتح **http://localhost:3000**. أو شغّل `START-WINDOWS.bat` بعد تثبيت Node.js.
لا تفتح `src/index.html` مباشرة؛ Angular يحتاج الأوامر أعلاه.
نسخة build جاهزة موجودة في `dist/portfolio/browser`، لكن أعد البناء بعد أي تعديل.

## ما تم إضافته

- واجهة داكنة افتراضيًا، ووضع فاتح مع حفظ الاختيار وتقليل وميض تحميل الصفحة.
- صورتك الشخصية وصور ICPC وGDG وIEEE وECPC الفعلية.
- واجهات Machinify وProgUp، والثلاث صور الخاصة بـDr. Ashraf Clinic.
- عرض صور الواجهات كاملة بـobject-fit:contain، مع معرض وتكبير وتنقل بالأسهم للعيادة.
- مشروع Job Portal QA مع رسم توضيحي مُعرّف بوضوح؛ لم يتم تقديمه كلقطة حقيقية للموقع.
- Download CV في المقدمة والتواصل؛ Express يرسل ملف PDF كمرفق للتحميل.
- بيانات التواصل وروابط GitHub وLinkedIn من الـCV المرفق.
- تواريخ الخبرات محدثة من نسخة الـCV الحالية.
- انتقالات دخول، reveal مع التمرير، تحريك الصور، تبويبات الأدوار، فلاتر المشاريع،
  نافذة تفاصيل، خبرات accordion، مؤشر تقدم الصفحة، وملاحة موبايل.
- دعم لوحة المفاتيح وEscape وprefers-reduced-motion.

## الصور والملفات

الصور المرفقة منسوخة كما هي؛ لم يتم تعديل الملامح أو إعادة توليد الصور.

| File in public/images/ | Usage |
| --- | --- |
| profile.png | Your profile photograph |
| machinify.png | Machinify UI |
| progup.png | ProgUp UI |
| clinic-home.png | Clinic home screen |
| clinic-onboarding.png | Clinic onboarding screen |
| clinic-signup.png | Clinic registration screen |
| ecpc.jpeg | ECPC volunteering |
| gdg.jpeg | GDG / GDSC workshop |
| ieee.jpg | IEEE activity |
| icpc.png | ICPC community |
| job-portal.svg | QA workflow illustration |

الـCV في `public/Hassan_Nasser_CV.pdf`، وهو نفس الملف المرفق بدون تغيير.
لتحديثه، استبدله بنفس الاسم ثم أعد البناء.

## تعديل المحتوى

**public/data/portfolio.json** يحتوي على:
المشاريع، الصور ومعارضها، الخبرات، التطوع، الإيميل، GitHub، LinkedIn، ومسار الـCV.

- `image`: صورة كارت المشروع، باسم الملف والامتداد.
- `gallery`: صور معرض المشروع، بنفس ترتيب عرضها.
- `visual`: استخدم `ui` لواجهات حقيقية أو `illustration` لرسم توضيحي.
- `link`: أضف رابط GitHub أو العرض الحي ليظهر زر زيارة المشروع.
- `cv`: مسار ملف الـPDF العام.

نصوص المقدمة والأقسام في `src/app/app.component.html`.
نصوص Build / Test / Teach ومنطق التفاعل في `src/app/app.component.ts`.
ألوان الثيمين وتنسيق الموبايل والحركات في `src/styles.css`.

أثناء التطوير: اعمل refresh بعد تعديل ملف JSON.
قبل الرفع: شغّل build جديد ليتم نسخ الصور والمحتوى والـCV إلى النسخة النهائية.

## Structure

```
src/app/app.component.ts       Angular state, themes, filters, gallery, scroll
src/app/app.component.html     Page sections and image rendering
src/styles.css                Dark/light design, responsive layout, motion
public/data/portfolio.json    Editable content and verified contact links
public/images/                Supplied images and labeled QA illustration
public/Hassan_Nasser_CV.pdf   Original CV download
server/app.mjs                API, CV attachment route, Angular hosting
server/index.mjs              Node entry point (PORT defaults to 3000)
server/server.test.mjs        Production routes and asset/download checks
```

## Verification

```bash
npm run check
npm run build
npm run test:server
```

Checks cover Angular production compilation, strict TypeScript, API routes,
compiled HTML and JavaScript delivery, all project/gallery/community image URLs,
static JSON fallback, and exact PDF download bytes with attachment headers.
Visual browser QA was unavailable in the creation environment. Review the
final composition on your own desktop and phone before public release.

## Hosting

Node hosting: `npm ci`, `npm run build`, then `npm start`.
Set `PORT` if your hosting provider requires it.

Static hosting: serve `dist/portfolio/browser` with SPA fallback. Angular falls
back to `/data/portfolio.json` when `/api/portfolio` is unavailable. Download links
use the browser's download attribute; Node additionally sends attachment headers.
The contact form sends messages through the Node server and Resend. Set
`RESEND_API_KEY` in the server environment before deploying. You can also set
`RESEND_FROM_EMAIL` to a verified Resend sender (the default is Resend's
onboarding sender). The recipient is the email address in
`public/data/portfolio.json`. Static-only hosting cannot send contact messages;
deploy the Node server or connect the form endpoint to an equivalent backend.
If the form says that the email service is not configured, add these variables
to the environment of the deployed Node service and restart it; adding them to
the Angular/static hosting environment is not enough.

The previous hosted HTML site is separate. This ZIP contains the updated Angular
and Node project; editing local files does not update that older hosted site.
The archive excludes node_modules, build caches, credentials, and Git history.

## QA workspace theme update

The same page structure now uses a defect-report visual theme: graphite surfaces,
amber annotations, case identifiers, and a QA-first introduction. The Inspect
button shows section and project labels as visual annotations. The About section
includes a clearly labeled sample typo report; Apply fix changes the sample label
and marks that demonstration resolved. It does not represent a real project defect
or an automated test execution. The Job Portal cover is an illustrative generated
cover, not an actual screenshot or test result. Dark/light modes, galleries, photos,
CV download, and email contact remain available.

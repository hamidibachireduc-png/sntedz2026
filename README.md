<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/16993f8d-4b97-4a1b-b037-128b96881bc5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## الرسائل الخاصة

يعتمد صندوق الرسائل الخاصة على Firebase Authentication وCloud Firestore، ولا يستخدم التخزين المحلي للرسائل.

1. فعّل مزود تسجيل الدخول بـ Google وCloud Firestore في مشروع Firebase `sntedz2022`، وأضف نطاق الموقع إلى النطاقات المصرح بها.
2. انشر قواعد `firestore.rules` من Firebase Console، أو شغّل `firebase deploy --only firestore:rules --project sntedz2022`.
3. اجعل كل أمين معتمدًا يسجل الدخول مرة واحدة بحساب Google؛ من Firebase Authentication انسخ UID لذلك الحساب، ثم أنشئ مستندًا في مجموعة `messageAccounts` بمعرّف المستند نفسه.
4. حقول مستند الأمين الوطني: `name` و`email` و`role: "NATIONAL_SG"`. أضف لكل أمين ولائي الحقول نفسها مع `role: "WILAYA_SG"` و`wilayaCode` و`wilayaName`. يجب أن يطابق البريد المسجل بريد حساب Google، ولا تمنح دورًا قبل التحقق من هوية صاحبه.

قراءة الرسائل محصورة بقواعد Firestore على UID المرسل والمستلم. جلسة الرسائل تبقى في ذاكرة الصفحة فقط وتنتهي عند إغلاق الصندوق. لا يوجد تشفير طرفي، ويمكن لمسؤولي Firebase المخوّلين إدارة بيانات المشروع. لا تُرسل بيانات حساسة قبل إعداد المشروع والتحقق من هوية جميع الحسابات؛ تسجيل الدخول المحلي الموجود في واجهة الموقع وحده لا يثبت الهوية ولا يمنح صلاحية الرسائل.

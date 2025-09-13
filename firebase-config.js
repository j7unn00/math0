// إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCTKVFE5c3SPar9Jd3szwml1dqyFa35aVQ",
  authDomain: "math-9dc24.firebaseapp.com",
  databaseURL: "https://math-9dc24-default-rtdb.firebaseio.com",
  projectId: "math-9dc24",
  storageBucket: "math-9dc24.firebasestorage.app",
  messagingSenderId: "952351794711",
  appId: "1:952351794711:web:09bb279117fa7b04315e52",
  measurementId: "G-NB7D3C2T9W",
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// الحصول على مراجع Firebase
const auth = firebase.auth();
const database = firebase.database();

// متغيرات النظام
let isFirebaseReady = false;
let syncInProgress = false;

// تهيئة النظام عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  initializeFirebase();
});

// تهيئة Firebase والتحقق من الاتصال
async function initializeFirebase() {
  try {
    // تسجيل الدخول كمجهول للوصول للبيانات
    await auth.signInAnonymously();
    isFirebaseReady = true;
    console.log("✅ تم الاتصال بـ Firebase بنجاح");

    // تحميل البيانات من Firebase
    await loadAllDataFromFirebase();

    // بدء المزامنة التلقائية
    startAutoSync();

    showFirebaseNotification("تم الاتصال بقاعدة البيانات بنجاح!", "success");
  } catch (error) {
    console.error("❌ خطأ في الاتصال بـ Firebase:", error);
    isFirebaseReady = false;
    showFirebaseNotification(
      "خطأ في الاتصال بقاعدة البيانات. سيتم استخدام التخزين المحلي.",
      "warning"
    );
  }
}

// ===========================================
// وظائف تحويل localStorage إلى Firebase
// ===========================================

// حفظ البيانات إلى Firebase
async function saveToFirebase(path, data) {
  if (!isFirebaseReady || syncInProgress) {
    console.log("🔄 Firebase غير جاهز أو مزامنة قيد التقدم");
    return false;
  }

  try {
    syncInProgress = true;
    await database.ref(path).set(data);
    console.log(`✅ تم حفظ ${path} إلى Firebase`);
    return true;
  } catch (error) {
    console.error(`❌ خطأ في حفظ ${path}:`, error);
    return false;
  } finally {
    syncInProgress = false;
  }
}

// قراءة البيانات من Firebase
async function loadFromFirebase(path) {
  if (!isFirebaseReady) {
    console.log("🔄 Firebase غير جاهز");
    return null;
  }

  try {
    const snapshot = await database.ref(path).once("value");
    return snapshot.val();
  } catch (error) {
    console.error(`❌ خطأ في قراءة ${path}:`, error);
    return null;
  }
}

// تحميل جميع البيانات من Firebase
async function loadAllDataFromFirebase() {
  console.log("📥 جاري تحميل البيانات من Firebase...");

  try {
    // تحميل البيانات بالتوازي
    const [
      firebaseExams,
      firebaseStudents,
      firebaseWorksheets,
      firebaseWeeklyPlans,
      firebasePhotoAchievements,
      firebaseAchievementFiles,
      firebaseReminders,
      firebaseStudentErrors,
      firebaseExamHistory,
      firebaseStudentTracking,
      firebaseStudentUploadCounts,
    ] = await Promise.all([
      loadFromFirebase("exams"),
      loadFromFirebase("students"),
      loadFromFirebase("worksheets"),
      loadFromFirebase("weeklyPlans"),
      loadFromFirebase("photoAchievements"),
      loadFromFirebase("achievementFiles"),
      loadFromFirebase("reminders"),
      loadFromFirebase("studentErrors"),
      loadFromFirebase("examHistory"),
      loadFromFirebase("studentTracking"),
      loadFromFirebase("studentUploadCounts"),
    ]);

    // تحديث المتغيرات العامة
    if (firebaseExams) {
      window.exams = firebaseExams;
      console.log("📝 تم تحميل الاختبارات من Firebase");
    }

    if (firebaseStudents) {
      window.students = firebaseStudents;
      console.log("🌟 تم تحميل الطلاب المتميزين من Firebase");
    }

    if (firebaseWorksheets) {
      window.worksheets = firebaseWorksheets;
      console.log("📄 تم تحميل أوراق العمل من Firebase");
    }

    if (firebaseWeeklyPlans) {
      window.weeklyPlans = firebaseWeeklyPlans;
      console.log("📅 تم تحميل الخطط الأسبوعية من Firebase");
    }

    if (firebasePhotoAchievements) {
      window.photoAchievements = firebasePhotoAchievements;
      console.log("📸 تم تحميل الإنجازات المصورة من Firebase");
    }

    if (firebaseAchievementFiles) {
      window.achievementFiles = firebaseAchievementFiles;
      console.log("📁 تم تحميل ملفات الإنجاز من Firebase");
    }

    if (firebaseReminders) {
      window.reminders = firebaseReminders;
      console.log("🔔 تم تحميل التذكيرات من Firebase");
    }

    if (firebaseStudentErrors) {
      window.studentErrors = firebaseStudentErrors;
      console.log("📊 تم تحميل أخطاء الطلاب من Firebase");
    }

    if (firebaseExamHistory) {
      window.examHistory = firebaseExamHistory;
      console.log("📈 تم تحميل تاريخ الاختبارات من Firebase");
    }

    if (firebaseStudentTracking) {
      window.studentTracking = firebaseStudentTracking;
      console.log("📋 تم تحميل متابعة الطلاب من Firebase");
    }

    if (firebaseStudentUploadCounts) {
      window.studentUploadCounts = firebaseStudentUploadCounts;
      console.log("📊 تم تحميل عدادات الرفع من Firebase");
    }

    console.log("✅ تم تحميل جميع البيانات من Firebase بنجاح");

    // إعادة تحميل واجهات المستخدم
    refreshAllUI();
  } catch (error) {
    console.error("❌ خطأ في تحميل البيانات من Firebase:", error);
    showFirebaseNotification(
      "خطأ في تحميل البيانات. سيتم استخدام التخزين المحلي.",
      "error"
    );
  }
}

// مزامنة جميع البيانات إلى Firebase
async function syncAllDataToFirebase() {
  if (!isFirebaseReady || syncInProgress) return;

  console.log("📤 جاري مزامنة البيانات إلى Firebase...");
  syncInProgress = true;

  try {
    // مزامنة البيانات بالتوازي
    await Promise.all([
      saveToFirebase("exams", window.exams || []),
      saveToFirebase("students", window.students || {}),
      saveToFirebase("worksheets", window.worksheets || []),
      saveToFirebase("weeklyPlans", window.weeklyPlans || []),
      saveToFirebase("photoAchievements", window.photoAchievements || []),
      saveToFirebase("achievementFiles", window.achievementFiles || []),
      saveToFirebase("reminders", window.reminders || []),
      saveToFirebase("studentErrors", window.studentErrors || {}),
      saveToFirebase("examHistory", window.examHistory || []),
      saveToFirebase("studentTracking", window.studentTracking || {}),
      saveToFirebase("studentUploadCounts", window.studentUploadCounts || {}),
    ]);

    console.log("✅ تم مزامنة جميع البيانات إلى Firebase");
    showFirebaseNotification("تم حفظ جميع البيانات في السحابة!", "success");
  } catch (error) {
    console.error("❌ خطأ في المزامنة:", error);
    showFirebaseNotification("خطأ في حفظ البيانات في السحابة", "error");
  } finally {
    syncInProgress = false;
  }
}

// ===========================================
// تحديث وظائف التخزين الموجودة
// ===========================================

// تحديث وظيفة حفظ الاختبارات
const originalSaveExams = function () {
  // حفظ في localStorage (للتوافق مع النظام الحالي)
  localStorage.setItem("exams", JSON.stringify(window.exams));

  // حفظ في Firebase
  if (isFirebaseReady) {
    saveToFirebase("exams", window.exams);
  }
};

// تحديث وظيفة حفظ الطلاب المتميزين
const originalSaveStudents = function () {
  localStorage.setItem("students", JSON.stringify(window.students));
  if (isFirebaseReady) {
    saveToFirebase("students", window.students);
  }
};

// تحديث وظيفة حفظ أوراق العمل
const originalSaveWorksheets = function () {
  localStorage.setItem("worksheets", JSON.stringify(window.worksheets));
  if (isFirebaseReady) {
    saveToFirebase("worksheets", window.worksheets);
  }
};

// تحديث وظيفة حفظ الخطط الأسبوعية
const originalSaveWeeklyPlans = function () {
  localStorage.setItem("weeklyPlans", JSON.stringify(window.weeklyPlans));
  if (isFirebaseReady) {
    saveToFirebase("weeklyPlans", window.weeklyPlans);
  }
};

// تحديث وظيفة حفظ الإنجازات المصورة
const originalSavePhotoAchievements = function () {
  localStorage.setItem(
    "photoAchievements",
    JSON.stringify(window.photoAchievements)
  );
  if (isFirebaseReady) {
    saveToFirebase("photoAchievements", window.photoAchievements);
  }
};

// تحديث وظيفة حفظ ملفات الإنجاز
const originalSaveAchievementFiles = function () {
  localStorage.setItem(
    "achievementFiles",
    JSON.stringify(window.achievementFiles)
  );
  if (isFirebaseReady) {
    saveToFirebase("achievementFiles", window.achievementFiles);
  }
};

// تحديث وظيفة حفظ التذكيرات
const originalSaveReminders = function () {
  localStorage.setItem("reminders", JSON.stringify(window.reminders));
  if (isFirebaseReady) {
    saveToFirebase("reminders", window.reminders);
  }
};

// تحديث وظيفة حفظ أخطاء الطلاب
const originalSaveStudentErrors = function () {
  localStorage.setItem("studentErrors", JSON.stringify(window.studentErrors));
  if (isFirebaseReady) {
    saveToFirebase("studentErrors", window.studentErrors);
  }
};

// تحديث وظيفة حفظ تاريخ الاختبارات
const originalSaveExamHistory = function () {
  localStorage.setItem("examHistory", JSON.stringify(window.examHistory));
  if (isFirebaseReady) {
    saveToFirebase("examHistory", window.examHistory);
  }
};

// تحديث وظيفة حفظ متابعة الطلاب
const originalSaveStudentTracking = function () {
  localStorage.setItem(
    "studentTracking",
    JSON.stringify(window.studentTracking)
  );
  if (isFirebaseReady) {
    saveToFirebase("studentTracking", window.studentTracking);
  }
};

// تحديث وظيفة حفظ عدادات الرفع
const originalSaveStudentUploadCounts = function () {
  localStorage.setItem(
    "studentUploadCounts",
    JSON.stringify(window.studentUploadCounts)
  );
  if (isFirebaseReady) {
    saveToFirebase("studentUploadCounts", window.studentUploadCounts);
  }
};

// ===========================================
// وظائف مساعدة للمزامنة
// ===========================================

// بدء المزامنة التلقائية كل 30 ثانية
function startAutoSync() {
  setInterval(() => {
    if (isFirebaseReady && !syncInProgress) {
      syncAllDataToFirebase();
    }
  }, 30000); // كل 30 ثانية
}

// مزامنة فورية عند تغيير البيانات
function syncDataImmediately(dataType, data) {
  if (isFirebaseReady && !syncInProgress) {
    saveToFirebase(dataType, data);
  }
}

// ===========================================
// وظائف تحديث localStorage الموجودة
// ===========================================

// تحديث جميع وظائف localStorage لتستخدم Firebase أيضاً
function updateLocalStorageFunctions() {
  // تحديث وظيفة حفظ الاختبارات
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key, value) {
    // استخدم الوظيفة الأصلية
    originalSetItem.call(this, key, value);

    // مزامنة مع Firebase حسب نوع البيانات
    if (isFirebaseReady) {
      switch (key) {
        case "exams":
          syncDataImmediately("exams", JSON.parse(value));
          break;
        case "students":
          syncDataImmediately("students", JSON.parse(value));
          break;
        case "worksheets":
          syncDataImmediately("worksheets", JSON.parse(value));
          break;
        case "weeklyPlans":
          syncDataImmediately("weeklyPlans", JSON.parse(value));
          break;
        case "photoAchievements":
          syncDataImmediately("photoAchievements", JSON.parse(value));
          break;
        case "achievementFiles":
          syncDataImmediately("achievementFiles", JSON.parse(value));
          break;
        case "reminders":
          syncDataImmediately("reminders", JSON.parse(value));
          break;
        case "studentErrors":
          syncDataImmediately("studentErrors", JSON.parse(value));
          break;
        case "examHistory":
          syncDataImmediately("examHistory", JSON.parse(value));
          break;
        case "studentTracking":
          syncDataImmediately("studentTracking", JSON.parse(value));
          break;
        case "studentUploadCounts":
          syncDataImmediately("studentUploadCounts", JSON.parse(value));
          break;
      }
    }
  };
}

// ===========================================
// وظائف الطوارئ والنسخ الاحتياطي
// ===========================================

// نسخ احتياطي شامل
async function createBackup() {
  if (!isFirebaseReady) {
    showFirebaseNotification("قاعدة البيانات غير متصلة", "error");
    return;
  }

  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      exams: window.exams || [],
      students: window.students || {},
      worksheets: window.worksheets || [],
      weeklyPlans: window.weeklyPlans || [],
      photoAchievements: window.photoAchievements || [],
      achievementFiles: window.achievementFiles || [],
      reminders: window.reminders || [],
      studentErrors: window.studentErrors || {},
      examHistory: window.examHistory || [],
      studentTracking: window.studentTracking || {},
      studentUploadCounts: window.studentUploadCounts || {},
    };

    const backupRef = `backups/${Date.now()}`;
    await saveToFirebase(backupRef, backupData);

    showFirebaseNotification("تم إنشاء نسخة احتياطية بنجاح!", "success");
    console.log("💾 تم إنشاء نسخة احتياطية في:", backupRef);
  } catch (error) {
    console.error("❌ خطأ في إنشاء النسخة الاحتياطية:", error);
    showFirebaseNotification("خطأ في إنشاء النسخة الاحتياطية", "error");
  }
}

// استرجاع من النسخة الاحتياطية
async function restoreFromBackup() {
  if (!isFirebaseReady) {
    showFirebaseNotification("قاعدة البيانات غير متصلة", "error");
    return;
  }

  if (
    !confirm(
      "هل أنت متأكد من استرجاع آخر نسخة احتياطية؟ سيتم استبدال البيانات الحالية."
    )
  ) {
    return;
  }

  try {
    // البحث عن آخر نسخة احتياطية
    const backupsSnapshot = await database
      .ref("backups")
      .orderByKey()
      .limitToLast(1)
      .once("value");
    const backups = backupsSnapshot.val();

    if (!backups) {
      showFirebaseNotification("لا توجد نسخ احتياطية", "warning");
      return;
    }

    const latestBackup = Object.values(backups)[0];

    // استرجاع البيانات
    window.exams = latestBackup.exams || [];
    window.students = latestBackup.students || {};
    window.worksheets = latestBackup.worksheets || [];
    window.weeklyPlans = latestBackup.weeklyPlans || [];
    window.photoAchievements = latestBackup.photoAchievements || [];
    window.achievementFiles = latestBackup.achievementFiles || [];
    window.reminders = latestBackup.reminders || [];
    window.studentErrors = latestBackup.studentErrors || {};
    window.examHistory = latestBackup.examHistory || [];
    window.studentTracking = latestBackup.studentTracking || {};
    window.studentUploadCounts = latestBackup.studentUploadCounts || {};

    // تحديث localStorage
    updateAllLocalStorage();

    // إعادة تحميل الواجهات
    refreshAllUI();

    showFirebaseNotification("تم استرجاع النسخة الاحتياطية بنجاح!", "success");
    console.log("📥 تم استرجاع النسخة الاحتياطية من:", latestBackup.timestamp);
  } catch (error) {
    console.error("❌ خطأ في استرجاع النسخة الاحتياطية:", error);
    showFirebaseNotification("خطأ في استرجاع النسخة الاحتياطية", "error");
  }
}

// تحديث جميع بيانات localStorage
function updateAllLocalStorage() {
  localStorage.setItem("exams", JSON.stringify(window.exams));
  localStorage.setItem("students", JSON.stringify(window.students));
  localStorage.setItem("worksheets", JSON.stringify(window.worksheets));
  localStorage.setItem("weeklyPlans", JSON.stringify(window.weeklyPlans));
  localStorage.setItem(
    "photoAchievements",
    JSON.stringify(window.photoAchievements)
  );
  localStorage.setItem(
    "achievementFiles",
    JSON.stringify(window.achievementFiles)
  );
  localStorage.setItem("reminders", JSON.stringify(window.reminders));
  localStorage.setItem("studentErrors", JSON.stringify(window.studentErrors));
  localStorage.setItem("examHistory", JSON.stringify(window.examHistory));
  localStorage.setItem(
    "studentTracking",
    JSON.stringify(window.studentTracking)
  );
  localStorage.setItem(
    "studentUploadCounts",
    JSON.stringify(window.studentUploadCounts)
  );
}

// إعادة تحميل جميع واجهات المستخدم
function refreshAllUI() {
  // تحميل الواجهات المختلفة إذا كانت الوظائف متوفرة
  if (typeof loadExams === "function") loadExams();
  if (typeof loadStudents === "function") loadStudents();
  if (typeof loadWorksheets === "function") loadWorksheets();
  if (typeof loadWeeklyPlans === "function") loadWeeklyPlans();
  if (typeof loadPhotoAchievements === "function") loadPhotoAchievements();
  if (typeof loadAchievementFiles === "function") loadAchievementFiles();
  if (typeof loadReminders === "function") loadReminders();
  if (typeof loadLatestReminders === "function") loadLatestReminders();
  if (typeof loadExamHistory === "function") loadExamHistory();
  if (typeof loadSavedErrors === "function") loadSavedErrors();
  if (typeof updateUploadLimitDisplay === "function")
    updateUploadLimitDisplay();
}

// ===========================================
// واجهة إدارة Firebase للمعلم
// ===========================================

// إظهار لوحة إدارة Firebase
function showFirebasePanel() {
  if (!window.isAdmin) {
    showFirebaseNotification("هذه الميزة متاحة للمعلم فقط", "error");
    return;
  }

  const modal = document.createElement("div");
  modal.id = "firebaseManagementModal";
  modal.className =
    "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4";

  modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-t-3xl">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-3xl font-bold mb-2">🔥 إدارة قاعدة البيانات</h3>
              <p class="text-blue-100">إدارة البيانات وحفظها في السحابة</p>
            </div>
            <button onclick="closeFirebasePanel()" class="text-white hover:text-gray-200 text-3xl">×</button>
          </div>
        </div>
        
        <div class="p-8">
          <!-- حالة الاتصال -->
          <div class="mb-8">
            <h4 class="text-xl font-bold text-gray-800 mb-4">📡 حالة الاتصال</h4>
            <div class="bg-${
              isFirebaseReady ? "green" : "red"
            }-50 border border-${
    isFirebaseReady ? "green" : "red"
  }-200 rounded-xl p-6">
              <div class="flex items-center">
                <div class="bg-${
                  isFirebaseReady ? "green" : "red"
                }-500 rounded-full w-3 h-3 mr-3 ${
    isFirebaseReady ? "animate-pulse" : ""
  }"></div>
                <span class="font-semibold text-${
                  isFirebaseReady ? "green" : "red"
                }-800">
                  ${isFirebaseReady ? "✅ متصل بقاعدة البيانات" : "❌ غير متصل"}
                </span>
              </div>
              <p class="text-${isFirebaseReady ? "green" : "red"}-700 mt-2">
                ${
                  isFirebaseReady
                    ? "جميع البيانات محفوظة في السحابة"
                    : "يتم استخدام التخزين المحلي حالياً"
                }
              </p>
            </div>
          </div>
  
          <!-- إحصائيات البيانات -->
          <div class="mb-8">
            <h4 class="text-xl font-bold text-gray-800 mb-4">📊 إحصائيات البيانات</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-blue-50 rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-blue-600">${
                  (window.exams || []).length
                }</div>
                <div class="text-blue-700 text-sm">اختبارات</div>
              </div>
              <div class="bg-green-50 rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-green-600">${
                  (window.worksheets || []).length
                }</div>
                <div class="text-green-700 text-sm">أوراق عمل</div>
              </div>
              <div class="bg-purple-50 rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-purple-600">${
                  (window.photoAchievements || []).length
                }</div>
                <div class="text-purple-700 text-sm">إنجازات مصورة</div>
              </div>
              <div class="bg-orange-50 rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-orange-600">${
                  (window.reminders || []).length
                }</div>
                <div class="text-orange-700 text-sm">تذكيرات</div>
              </div>
            </div>
          </div>
  
          <!-- أدوات الإدارة -->
          <div class="space-y-4">
            <h4 class="text-xl font-bold text-gray-800 mb-4">🛠️ أدوات الإدارة</h4>
            
            <button onclick="syncAllDataToFirebase()" 
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center"
                    ${syncInProgress ? "disabled" : ""}>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              ${
                syncInProgress
                  ? "🔄 جاري المزامنة..."
                  : "🔄 مزامنة البيانات الآن"
              }
            </button>
            
            <button onclick="createBackup()" 
                    class="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              💾 إنشاء نسخة احتياطية
            </button>
            
            <button onclick="restoreFromBackup()" 
                    class="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              📥 استرجاع النسخة الاحتياطية
            </button>
            
            <button onclick="exportAllData()" 
                    class="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              📤 تصدير جميع البيانات
            </button>
          </div>
          
          <!-- معلومات إضافية -->
          <div class="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h5 class="font-bold text-blue-800 mb-3">💡 معلومات مهمة</h5>
            <ul class="text-blue-700 space-y-2">
              <li>• يتم حفظ البيانات في السحابة تلقائياً كل 30 ثانية</li>
              <li>• النسخ الاحتياطية تحتوي على جميع بيانات الموقع</li>
              <li>• يمكنك الوصول للبيانات من أي جهاز متصل بالإنترنت</li>
              <li>• جميع البيانات محمية ومشفرة</li>
            </ul>
          </div>
        </div>
      </div>
    `;

  document.body.appendChild(modal);
}

// إغلاق لوحة إدارة Firebase
function closeFirebasePanel() {
  const modal = document.getElementById("firebaseManagementModal");
  if (modal) {
    modal.remove();
  }
}

// تصدير جميع البيانات
async function exportAllData() {
  try {
    const allData = {
      exams: window.exams || [],
      students: window.students || {},
      worksheets: window.worksheets || [],
      weeklyPlans: window.weeklyPlans || [],
      photoAchievements: window.photoAchievements || [],
      achievementFiles: window.achievementFiles || [],
      reminders: window.reminders || [],
      studentErrors: window.studentErrors || {},
      examHistory: window.examHistory || [],
      studentTracking: window.studentTracking || {},
      studentUploadCounts: window.studentUploadCounts || {},
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `بيانات_الموقع_${new Date()
      .toLocaleDateString("ar-SA")
      .replace(/\//g, "-")}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showFirebaseNotification("تم تصدير البيانات بنجاح!", "success");
  } catch (error) {
    console.error("❌ خطأ في تصدير البيانات:", error);
    showFirebaseNotification("خطأ في تصدير البيانات", "error");
  }
}

// ===========================================
// واجهة الإشعارات الخاصة بـ Firebase
// ===========================================

function showFirebaseNotification(message, type = "info") {
  // إزالة الإشعارات السابقة
  const existingNotifications = document.querySelectorAll(
    ".firebase-notification"
  );
  existingNotifications.forEach((notification) => notification.remove());

  const notification = document.createElement("div");
  notification.className =
    "firebase-notification fixed bottom-4 right-4 z-50 p-4 rounded-2xl shadow-2xl transform transition-all duration-300 translate-y-full max-w-md";

  const colors = {
    success: "bg-green-500 text-white border-green-600",
    error: "bg-red-500 text-white border-red-600",
    info: "bg-blue-500 text-white border-blue-600",
    warning: "bg-yellow-500 text-white border-yellow-600",
  };

  notification.className += ` ${colors[type] || colors.info} border-2`;

  const icons = {
    success: "✅",
    error: "❌",
    info: "🔥",
    warning: "⚠️",
  };

  notification.innerHTML = `
      <div class="flex items-center">
        <div class="flex-shrink-0 ml-3">
          <span class="text-2xl">${icons[type] || icons.info}</span>
        </div>
        <div class="font-medium">
          ${message}
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="mr-3 hover:opacity-75">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;

  document.body.appendChild(notification);

  // إظهار الإشعار
  setTimeout(() => notification.classList.remove("translate-y-full"), 100);

  // إخفاء الإشعار تلقائياً
  setTimeout(() => {
    notification.classList.add("translate-y-full");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 4000);
}

// ===========================================
// تهيئة النظام والتكامل
// ===========================================

// تهيئة النظام بعد تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  // انتظار تحميل الكود الأصلي أولاً
  setTimeout(() => {
    updateLocalStorageFunctions();
    console.log("🔥 تم تفعيل تكامل Firebase مع الموقع");
  }, 1000);
});

// إضافة زر إدارة Firebase للمعلم
function addFirebaseManagementButton() {
  // البحث عن منطقة أزرار المعلم
  const adminButtons = document.querySelector(".admin-controls");

  if (adminButtons && window.isAdmin) {
    const firebaseBtn = document.createElement("button");
    firebaseBtn.onclick = showFirebasePanel;
    firebaseBtn.className =
      "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center";
    firebaseBtn.innerHTML = `
        <span class="text-xl mr-2">🔥</span>
        إدارة قاعدة البيانات
      `;

    adminButtons.appendChild(firebaseBtn);
  }
}

// مراقبة تسجيل دخول المعلم لإضافة زر الإدارة
function monitorAdminLogin() {
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        const adminPanel = document.getElementById("adminPanelBtn");
        if (adminPanel && !adminPanel.classList.contains("hidden")) {
          // المعلم سجل دخوله
          setTimeout(addFirebaseManagementButton, 500);
        }
      }
    });
  });

  const adminPanelBtn = document.getElementById("adminPanelBtn");
  if (adminPanelBtn) {
    observer.observe(adminPanelBtn, { attributes: true });
  }
}

// بدء مراقبة تسجيل دخول المعلم
setTimeout(monitorAdminLogin, 2000);

// ===========================================
// وظائف مساعدة للتوافق
// ===========================================

// تحقق من حالة Firebase
window.isFirebaseConnected = function () {
  return isFirebaseReady;
};

// إجبار المزامنة الفورية
window.forceSyncToFirebase = function () {
  if (window.isAdmin) {
    syncAllDataToFirebase();
  } else {
    showFirebaseNotification("هذه الميزة متاحة للمعلم فقط", "error");
  }
};

// إجبار إعادة التحميل من Firebase
window.forceLoadFromFirebase = function () {
  if (window.isAdmin) {
    loadAllDataFromFirebase();
  } else {
    showFirebaseNotification("هذه الميزة متاحة للمعلم فقط", "error");
  }
};

console.log("🔥 Firebase Integration Ready - تكامل Firebase جاهز!");

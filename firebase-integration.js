// ===========================================
// تحديث وظائف التخزين الحالية لتعمل مع Firebase
// ===========================================

// هذا الملف يحدث الكود الموجود ليستخدم Firebase بدلاً من localStorage فقط

// تحديث جميع localStorage.setItem للعمل مع Firebase
function updateStorageFunctions() {
  // حفظ المرجع الأصلي
  const originalSetItem = localStorage.setItem.bind(localStorage);

  // تحديث localStorage.setItem
  localStorage.setItem = function (key, value) {
    // حفظ في localStorage (للتوافق)
    originalSetItem(key, value);

    // مزامنة مع Firebase
    if (window.isFirebaseConnected && window.isFirebaseConnected()) {
      try {
        const parsedValue = JSON.parse(value);
        window.database
          .ref(key)
          .set(parsedValue)
          .then(() => {
            console.log(`🔥 تم حفظ ${key} في Firebase`);
          })
          .catch((error) => {
            console.error(`❌ خطأ في حفظ ${key} في Firebase:`, error);
          });
      } catch (e) {
        // إذا لم يكن JSON صالح، احفظ كنص
        window.database.ref(key).set(value);
      }
    }
  };
}

// تحديث localStorage.getItem لقراءة من Firebase أولاً
function updateGetStorageFunctions() {
  const originalGetItem = localStorage.getItem.bind(localStorage);

  localStorage.getItem = function (key) {
    // للآن نستخدم localStorage، لكن يمكن تطوير هذا لقراءة من Firebase
    return originalGetItem(key);
  };
}

// ===========================================
// وظائف خاصة لتحديث الكود الموجود
// ===========================================

// تحديث وظيفة uploadWorksheet لتستخدم Firebase
function updateUploadWorksheet() {
  if (window.uploadWorksheet) {
    const originalUploadWorksheet = window.uploadWorksheet;

    window.uploadWorksheet = function () {
      // استخدام الوظيفة الأصلية
      const result = originalUploadWorksheet.apply(this, arguments);

      // مزامنة فورية مع Firebase
      if (window.isFirebaseConnected && window.isFirebaseConnected()) {
        setTimeout(() => {
          window.database.ref("worksheets").set(window.worksheets);
          console.log("🔥 تم حفظ أوراق العمل في Firebase");
        }, 500);
      }

      return result;
    };
  }
}

// تحديث وظيفة uploadWeeklyPlan لتستخدم Firebase
function updateUploadWeeklyPlan() {
  if (window.uploadWeeklyPlan) {
    const originalUploadWeeklyPlan = window.uploadWeeklyPlan;

    window.uploadWeeklyPlan = function () {
      const result = originalUploadWeeklyPlan.apply(this, arguments);

      if (window.isFirebaseConnected && window.isFirebaseConnected()) {
        setTimeout(() => {
          window.database.ref("weeklyPlans").set(window.weeklyPlans);
          console.log("🔥 تم حفظ الخطط الأسبوعية في Firebase");
        }, 500);
      }

      return result;
    };
  }
}

// تحديث وظيفة uploadPhotoAchievement لتستخدم Firebase
function updateUploadPhotoAchievement() {
  if (window.uploadPhotoAchievement) {
    const originalUploadPhotoAchievement = window.uploadPhotoAchievement;

    window.uploadPhotoAchievement = function () {
      const result = originalUploadPhotoAchievement.apply(this, arguments);

      if (window.isFirebaseConnected && window.isFirebaseConnected()) {
        setTimeout(() => {
          window.database
            .ref("photoAchievements")
            .set(window.photoAchievements);
          console.log("🔥 تم حفظ الإنجازات المصورة في Firebase");
        }, 500);
      }

      return result;
    };
  }
}

// تحديث وظيفة saveReminder لتستخدم Firebase
function updateSaveReminder() {
  if (window.saveReminder) {
    const originalSaveReminder = window.saveReminder;

    window.saveReminder = function () {
      const result = originalSaveReminder.apply(this, arguments);

      if (window.isFirebaseConnected && window.isFirebaseConnected()) {
        setTimeout(() => {
          window.database.ref("reminders").set(window.reminders);
          console.log("🔥 تم حفظ التذكيرات في Firebase");
        }, 500);
      }

      return result;
    };
  }
}

// تحديث وظيفة saveStudent لتستخدم Firebase
function updateSaveStudent() {
  if (window.saveStudent) {
    const originalSaveStudent = window.saveStudent;

    window.saveStudent = function () {
      const result = originalSaveStudent.apply(this, arguments);

      if (window.isFirebaseConnected && window.isFirebaseConnected()) {
        setTimeout(() => {
          window.database.ref("students").set(window.students);
          console.log("🔥 تم حفظ الطلاب المتميزين في Firebase");
        }, 500);
      }

      return result;
    };
  }
}

// تحديث وظيفة finishExam لتستخدم Firebase
function updateFinishExam() {
  if (window.finishExam) {
    const originalFinishExam = window.finishExam;

    window.finishExam = function () {
      const result = originalFinishExam.apply(this, arguments);

      if (window.isFirebaseConnected && window.isFirebaseConnected()) {
        setTimeout(() => {
          window.database.ref("examHistory").set(window.examHistory);
          window.database.ref("studentErrors").set(window.studentErrors);
          console.log("🔥 تم حفظ نتائج الاختبار في Firebase");
        }, 500);
      }

      return result;
    };
  }
}

// ===========================================
// وظائف مساعدة للتكامل
// ===========================================

// مراقبة تغييرات البيانات وحفظها في Firebase
function watchDataChanges() {
  // مراقبة تغييرات المتغيرات العامة
  const dataWatchers = {
    exams: () => window.exams,
    students: () => window.students,
    worksheets: () => window.worksheets,
    weeklyPlans: () => window.weeklyPlans,
    photoAchievements: () => window.photoAchievements,
    achievementFiles: () => window.achievementFiles,
    reminders: () => window.reminders,
    studentErrors: () => window.studentErrors,
    examHistory: () => window.examHistory,
    studentTracking: () => window.studentTracking,
    studentUploadCounts: () => window.studentUploadCounts,
  };

  // حفظ القيم الحالية
  const currentValues = {};
  Object.keys(dataWatchers).forEach((key) => {
    currentValues[key] = JSON.stringify(dataWatchers[key]());
  });

  // مراقبة التغييرات كل ثانيتين
  setInterval(() => {
    if (!window.isFirebaseConnected || !window.isFirebaseConnected()) return;

    Object.keys(dataWatchers).forEach((key) => {
      const newValue = JSON.stringify(dataWatchers[key]());
      if (currentValues[key] !== newValue) {
        currentValues[key] = newValue;

        // حفظ التغيير في Firebase
        window.database
          .ref(key)
          .set(dataWatchers[key]())
          .then(() => {
            console.log(`🔥 تم تحديث ${key} في Firebase تلقائياً`);
          })
          .catch((error) => {
            console.error(`❌ خطأ في تحديث ${key}:`, error);
          });
      }
    });
  }, 2000);
}

// إضافة زر Firebase للمعلم
function addFirebaseButton() {
  // انتظار تحميل واجهة المعلم
  const checkForAdminUI = setInterval(() => {
    const adminPanel = document.getElementById("adminPanelBtn");

    if (
      adminPanel &&
      !adminPanel.classList.contains("hidden") &&
      window.isAdmin
    ) {
      // إضافة زر إدارة Firebase
      const firebaseBtn = document.createElement("button");
      firebaseBtn.onclick = () => window.showFirebasePanel();
      firebaseBtn.className =
        "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center mr-3";
      firebaseBtn.innerHTML = `
          <span class="ml-2">🔥</span>
          قاعدة البيانات
        `;

      // إضافة الزر بجانب زر لوحة التحكم
      adminPanel.parentNode.insertBefore(firebaseBtn, adminPanel.nextSibling);

      clearInterval(checkForAdminUI);
      console.log("🔥 تم إضافة زر إدارة Firebase");
    }
  }, 1000);

  // توقف عن المحاولة بعد 10 ثواني
  setTimeout(() => clearInterval(checkForAdminUI), 10000);
}

// ===========================================
// تهيئة التكامل
// ===========================================

// تهيئة التكامل عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  // انتظار تحميل الكود الأصلي
  setTimeout(() => {
    updateStorageFunctions();
    updateGetStorageFunctions();

    // تحديث الوظائف الموجودة
    setTimeout(() => {
      updateUploadWorksheet();
      updateUploadWeeklyPlan();
      updateUploadPhotoAchievement();
      updateSaveReminder();
      updateSaveStudent();
      updateFinishExam();

      // بدء مراقبة التغييرات
      watchDataChanges();

      // إضافة زر Firebase
      addFirebaseButton();

      console.log("🔥 تم تفعيل تكامل Firebase مع جميع وظائف الموقع");
    }, 2000);
  }, 1000);
});

// ===========================================
// وظائف خاصة للنسخ الاحتياطي السريع
// ===========================================

// نسخة احتياطية سريعة من localStorage إلى Firebase
window.quickBackupToFirebase = async function () {
  if (!window.isAdmin) {
    alert("هذه الميزة متاحة للمعلم فقط");
    return;
  }

  if (!window.isFirebaseConnected || !window.isFirebaseConnected()) {
    alert("Firebase غير متصل");
    return;
  }

  try {
    console.log("📤 بدء النسخ الاحتياطي السريع...");

    const backupData = {
      exams: JSON.parse(localStorage.getItem("exams") || "[]"),
      students: JSON.parse(localStorage.getItem("students") || "{}"),
      worksheets: JSON.parse(localStorage.getItem("worksheets") || "[]"),
      weeklyPlans: JSON.parse(localStorage.getItem("weeklyPlans") || "[]"),
      photoAchievements: JSON.parse(
        localStorage.getItem("photoAchievements") || "[]"
      ),
      achievementFiles: JSON.parse(
        localStorage.getItem("achievementFiles") || "[]"
      ),
      reminders: JSON.parse(localStorage.getItem("reminders") || "[]"),
      studentErrors: JSON.parse(localStorage.getItem("studentErrors") || "{}"),
      examHistory: JSON.parse(localStorage.getItem("examHistory") || "[]"),
      studentTracking: JSON.parse(
        localStorage.getItem("studentTracking") || "{}"
      ),
      studentUploadCounts: JSON.parse(
        localStorage.getItem("studentUploadCounts") || "{}"
      ),
      timestamp: new Date().toISOString(),
    };

    // حفظ البيانات
    await Promise.all([
      window.database.ref("exams").set(backupData.exams),
      window.database.ref("students").set(backupData.students),
      window.database.ref("worksheets").set(backupData.worksheets),
      window.database.ref("weeklyPlans").set(backupData.weeklyPlans),
      window.database
        .ref("photoAchievements")
        .set(backupData.photoAchievements),
      window.database.ref("achievementFiles").set(backupData.achievementFiles),
      window.database.ref("reminders").set(backupData.reminders),
      window.database.ref("studentErrors").set(backupData.studentErrors),
      window.database.ref("examHistory").set(backupData.examHistory),
      window.database.ref("studentTracking").set(backupData.studentTracking),
      window.database
        .ref("studentUploadCounts")
        .set(backupData.studentUploadCounts),
    ]);

    // حفظ نسخة احتياطية بالتاريخ
    await window.database.ref(`backups/${Date.now()}`).set(backupData);

    alert("✅ تم حفظ جميع البيانات في Firebase بنجاح!");
    console.log("✅ تم إكمال النسخ الاحتياطي السريع");
  } catch (error) {
    console.error("❌ خطأ في النسخ الاحتياطي:", error);
    alert("❌ حدث خطأ في حفظ البيانات");
  }
};

// استرجاع سريع من Firebase إلى localStorage
window.quickRestoreFromFirebase = async function () {
  if (!window.isAdmin) {
    alert("هذه الميزة متاحة للمعلم فقط");
    return;
  }

  if (!window.isFirebaseConnected || !window.isFirebaseConnected()) {
    alert("Firebase غير متصل");
    return;
  }

  if (
    !confirm(
      "هل تريد استرجاع البيانات من Firebase؟ سيتم استبدال البيانات المحلية."
    )
  ) {
    return;
  }

  try {
    console.log("📥 بدء الاسترجاع السريع...");

    // تحميل البيانات من Firebase
    const [
      exams,
      students,
      worksheets,
      weeklyPlans,
      photoAchievements,
      achievementFiles,
      reminders,
      studentErrors,
      examHistory,
      studentTracking,
      studentUploadCounts,
    ] = await Promise.all([
      window.database
        .ref("exams")
        .once("value")
        .then((snap) => snap.val()),
      window.database
        .ref("students")
        .once("value")
        .then((snap) => snap.val()),
      window.database
        .ref("worksheets")
        .once("value")
        .then((snap) => snap.val()),
      window.database
        .ref("weeklyPlans")
        .once("value")
        .then((snap) => snap.val()),
      window.database
        .ref("photoAchievements")
        .once("value")
        .then((snap) => snap.val()),
      window.database
        .ref("achievementFiles")
        .once("value")
        .then((snap) => snap.val()),
      window.database
        .ref("reminders")
        .once("value")
        .then((snap) => snap.val()),
      window.database
        .ref("studentErrors")
        .once("value")
        .then((snap) => snap.val()),
      window.database
        .ref("examHistory")
        .once("value")
        .then((snap) => snap.val()),
      window.database
        .ref("studentTracking")
        .once("value")
        .then((snap) => snap.val()),
      window.database
        .ref("studentUploadCounts")
        .once("value")
        .then((snap) => snap.val()),
    ]);

    // تحديث المتغيرات العامة
    if (exams) window.exams = exams;
    if (students) window.students = students;
    if (worksheets) window.worksheets = worksheets;
    if (weeklyPlans) window.weeklyPlans = weeklyPlans;
    if (photoAchievements) window.photoAchievements = photoAchievements;
    if (achievementFiles) window.achievementFiles = achievementFiles;
    if (reminders) window.reminders = reminders;
    if (studentErrors) window.studentErrors = studentErrors;
    if (examHistory) window.examHistory = examHistory;
    if (studentTracking) window.studentTracking = studentTracking;
    if (studentUploadCounts) window.studentUploadCounts = studentUploadCounts;

    // تحديث localStorage
    const originalSetItem = localStorage.setItem.bind(localStorage);
    originalSetItem("exams", JSON.stringify(window.exams));
    originalSetItem("students", JSON.stringify(window.students));
    originalSetItem("worksheets", JSON.stringify(window.worksheets));
    originalSetItem("weeklyPlans", JSON.stringify(window.weeklyPlans));
    originalSetItem(
      "photoAchievements",
      JSON.stringify(window.photoAchievements)
    );
    originalSetItem(
      "achievementFiles",
      JSON.stringify(window.achievementFiles)
    );
    originalSetItem("reminders", JSON.stringify(window.reminders));
    originalSetItem("studentErrors", JSON.stringify(window.studentErrors));
    originalSetItem("examHistory", JSON.stringify(window.examHistory));
    originalSetItem("studentTracking", JSON.stringify(window.studentTracking));
    originalSetItem(
      "studentUploadCounts",
      JSON.stringify(window.studentUploadCounts)
    );

    // إعادة تحميل الواجهات
    if (typeof loadExams === "function") loadExams();
    if (typeof loadStudents === "function") loadStudents();
    if (typeof loadWorksheets === "function") loadWorksheets();
    if (typeof loadWeeklyPlans === "function") loadWeeklyPlans();
    if (typeof loadPhotoAchievements === "function") loadPhotoAchievements();
    if (typeof loadAchievementFiles === "function") loadAchievementFiles();
    if (typeof loadReminders === "function") loadReminders();
    if (typeof loadLatestReminders === "function") loadLatestReminders();

    alert("✅ تم استرجاع جميع البيانات من Firebase بنجاح!");
    console.log("✅ تم إكمال الاسترجاع السريع");
  } catch (error) {
    console.error("❌ خطأ في الاسترجاع:", error);
    alert("❌ حدث خطأ في استرجاع البيانات");
  }
};

// ===========================================
// تهيئة التكامل
// ===========================================

// بدء التكامل عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    updateStorageFunctions();
    updateGetStorageFunctions();

    console.log("🔥 تم تفعيل تكامل Firebase مع الكود الموجود");

    // إضافة أزرار سريعة للاختبار (للمعلم فقط)
    if (window.isAdmin) {
      addQuickFirebaseButtons();
    }
  }, 2000);
});

// إضافة أزرار سريعة للاختبار
function addQuickFirebaseButtons() {
  const quickButtons = document.createElement("div");
  quickButtons.id = "firebaseQuickButtons";
  quickButtons.className = "fixed bottom-4 left-4 space-y-2 z-40";
  quickButtons.innerHTML = `
      <button onclick="window.quickBackupToFirebase()" 
              class="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
              title="نسخ احتياطي سريع إلى Firebase">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      </button>
      
      <button onclick="window.quickRestoreFromFirebase()" 
              class="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
              title="استرجاع سريع من Firebase">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </button>
      
      <div class="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
        <div id="firebaseStatus" class="w-3 h-3 rounded-full ${
          window.isFirebaseConnected && window.isFirebaseConnected()
            ? "bg-green-500 animate-pulse"
            : "bg-red-500"
        }"></div>
      </div>
    `;

  document.body.appendChild(quickButtons);
}

// تحديث حالة Firebase كل 5 ثواني
setInterval(() => {
  const statusIndicator = document.getElementById("firebaseStatus");
  if (statusIndicator) {
    if (window.isFirebaseConnected && window.isFirebaseConnected()) {
      statusIndicator.className =
        "w-3 h-3 rounded-full bg-green-500 animate-pulse";
    } else {
      statusIndicator.className = "w-3 h-3 rounded-full bg-red-500";
    }
  }
}, 5000);

console.log("🔥 Firebase Integration Script Loaded - تم تحميل سكربت Firebase");

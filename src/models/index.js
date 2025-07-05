// =====================
// Model Imports
// =====================

// Core Models
const Course = require('./course.model');
const Lesson = require('./lesson.model');
const Modun = require('./modun.model');
const Program = require('./program.model');
const Role = require('./role.model');
const Staff = require('./staff.model');
const Student = require('./student.model');
const Teacher = require('./teacher.model');
const Grade = require('./grade.model');
const Majoring = require('./majoring.model');
const Department = require('./department.model');

// Thematic & Criteria
const Thematic = require('./thematic.model');
const ModunCriteria = require('./modun-criteria.model');
const SyntheticCriteria = require('./synthetic-criteria.model');
const OnlineCriteria = require('./online-criteria.model');
const DGNLCriteria = require('./dgnl-criteria.model');
const DGTDCriteria = require('./dgtd-criteria.model');
const ThematicCriteria = require('./thematic-criteria.model');

// Exam & Question
const Exam = require('./exam.model');
const ExamType = require('./exam-type.model');
const ExamQuestion = require('./exam-question.model');
const Question = require('./question.model');
const QuestionDetail = require('./question-detail.model');
const Option = require('./option.model');
const Answer = require('./answer.model');
const SelectedAnswer = require('./selected-answer.model');
const StudentExam = require('./student-exam.model');
const ExamSetStudent = require('./exam-set-student.model');

// Exceprt
const Exceprt = require('./exceprt.model');
const ExceprtType = require('./exceprt-type.model');

// Document & Media
const Document = require('./document.model');
const DocumentAd = require('./document-ad.model');
const DocumentType = require('./document-type.model');
const Media = require('./media.model');
const CourseMedia = require('./course-media.model');

// Course Ads & Description
const CourseAd = require('./course-ad.model');
const TeacherCourseAd = require('./teacher-course-ad.model');
const CourseDescription = require('./course-description.model');

// Discount & Invoice
const DealerDiscount = require('./dealer-discount.model');
const DetailedDiscount = require('./detailed-discount.model');
const DetailedInvoice = require('./detailed-invoice.model');
const DiscountCode = require('./discount-code.model');
const Invoice = require('./invoice.model');

// Comment & Notification
const Comment = require('./comment.model');
const SideComment = require('./side-comment.model');
const Notification = require('./notification.model');

// Other Models
const AccountBank = require('./account-bank.model');
const Footer = require('./footer.model');
const Contact = require('./contact.model');
const Token = require('./token.model');
const CourseStudent = require('./course-student.model');
const Province = require('./province.model');
const Evaluate = require('./evaluate.model');
const DGNLEvaluate = require('./dgnl-evaluate.model');
const DGTDEvaluate = require('./dgtd-evaluate.model');
const CourseType = require('./course-type.model');
const Permission = require('./permission.model');
const Position = require('./position.model');
const PositionPermission = require('./position-permission.model');
const Menu = require('./menu.model');
const MenuType = require('./menu-type.model');

// =====================
// Model Associations
// =====================

// --- Program & Course ---
Program.hasMany(Course, { foreignKey: 'kct_id', constraints: false });
Course.belongsTo(Program, { foreignKey: 'kct_id', constraints: false });

// --- Course & Modun ---
Course.hasMany(Modun, { foreignKey: 'khoa_hoc_id', constraints: false });
Modun.belongsTo(Course, { foreignKey: 'khoa_hoc_id', constraints: false });

// --- Modun & Thematic ---
Modun.hasMany(Thematic, { foreignKey: 'mo_dun_id', constraints: false });
Thematic.belongsTo(Modun, { foreignKey: 'mo_dun_id', constraints: false });
Grade.hasMany(Thematic, { foreignKey: 'lop_id', constraints: false });
Thematic.belongsTo(Grade, { foreignKey: 'lop_id', constraints: false });

// --- Thematic & Lesson ---
Thematic.hasMany(Lesson, { foreignKey: 'chuyen_de_id', constraints: false });
Lesson.belongsTo(Thematic, { foreignKey: 'chuyen_de_id', constraints: false });

// --- Majoring & Teacher ---
Majoring.hasMany(Teacher, {
    foreignKey: 'chuyen_nganh_id',
    constraints: false,
});
Teacher.belongsTo(Majoring, {
    foreignKey: 'chuyen_nganh_id',
    constraints: false,
});

// --- Modun & Teacher ---
Modun.belongsTo(Teacher, { foreignKey: 'giao_vien_id', constraints: false });
Teacher.hasMany(Modun, { foreignKey: 'giao_vien_id', constraints: false });

// --- Question Associations ---
Question.belongsTo(Exceprt, {
    foreignKey: 'trich_doan_id',
    constraints: false,
});
Exceprt.hasMany(Question, { foreignKey: 'trich_doan_id', constraints: false });
Question.belongsTo(Thematic, {
    foreignKey: 'chuyen_de_id',
    constraints: false,
});
Thematic.hasMany(Question, { foreignKey: 'chuyen_de_id', constraints: false });
Question.belongsTo(Modun, { foreignKey: 'mo_dun_id', constraints: false });
Modun.hasMany(Question, { foreignKey: 'mo_dun_id', constraints: false });
Majoring.hasMany(Question, {
    foreignKey: 'chuyen_nganh_id',
    constraints: false,
});
Question.belongsTo(Majoring, {
    foreignKey: 'chuyen_nganh_id',
    constraints: false,
});

// --- Answer Associations ---
Answer.belongsTo(Question, { foreignKey: 'cau_hoi_id', constraints: false });
Question.hasMany(Answer, { foreignKey: 'cau_hoi_id', constraints: false });

// --- SelectedAnswer Associations ---
SelectedAnswer.belongsTo(StudentExam, {
    foreignKey: 'dthv_id',
    constraints: false,
});
StudentExam.hasMany(SelectedAnswer, {
    foreignKey: 'dthv_id',
    constraints: false,
});
SelectedAnswer.belongsTo(Question, {
    foreignKey: 'cau_hoi_id',
    constraints: false,
});
Question.hasMany(SelectedAnswer, {
    foreignKey: 'cau_hoi_id',
    constraints: false,
});

// --- Exam Associations ---
Exam.belongsTo(ExamType, { foreignKey: 'loai_de_thi_id', constraints: false });
ExamType.hasMany(Exam, { foreignKey: 'loai_de_thi_id', constraints: false });
Exam.belongsTo(Course, { foreignKey: 'khoa_hoc_id', constraints: false });
Course.hasMany(Exam, { foreignKey: 'khoa_hoc_id', constraints: false });
Exam.belongsTo(Modun, { foreignKey: 'mo_dun_id', constraints: false });
Modun.hasMany(Exam, { foreignKey: 'mo_dun_id', constraints: false });
Exam.belongsTo(Thematic, { foreignKey: 'chuyen_de_id', constraints: false });
Thematic.hasMany(Exam, { foreignKey: 'chuyen_de_id', constraints: false });

// --- StudentExam Associations ---
StudentExam.belongsTo(Student, {
    foreignKey: 'hoc_vien_id',
    constraints: false,
});
Student.hasMany(StudentExam, { foreignKey: 'hoc_vien_id', constraints: false });
StudentExam.belongsTo(Exam, { foreignKey: 'de_thi_id', constraints: false });
Exam.hasMany(StudentExam, { foreignKey: 'de_thi_id', constraints: false });

// --- Criteria Associations ---
SyntheticCriteria.belongsTo(Course, {
    foreignKey: 'khoa_hoc_id',
    constraints: false,
});
Course.hasMany(SyntheticCriteria, {
    foreignKey: 'khoa_hoc_id',
    constraints: false,
});
OnlineCriteria.belongsTo(Course, {
    foreignKey: 'khoa_hoc_id',
    constraints: false,
});
Course.hasMany(OnlineCriteria, {
    foreignKey: 'khoa_hoc_id',
    constraints: false,
});
DGNLCriteria.belongsTo(Course, {
    foreignKey: 'khoa_hoc_id',
    constraints: false,
});
Course.hasMany(DGNLCriteria, { foreignKey: 'khoa_hoc_id', constraints: false });
DGTDCriteria.belongsTo(Course, {
    foreignKey: 'khoa_hoc_id',
    constraints: false,
});
Course.hasMany(DGTDCriteria, { foreignKey: 'khoa_hoc_id', constraints: false });
ModunCriteria.belongsTo(Modun, { foreignKey: 'mo_dun_id', constraints: false });
Modun.hasMany(ModunCriteria, { foreignKey: 'mo_dun_id', constraints: false });
ThematicCriteria.belongsTo(Modun, {
    foreignKey: 'mo_dun_id',
    constraints: false,
});
Modun.hasMany(ThematicCriteria, {
    foreignKey: 'mo_dun_id',
    constraints: false,
});

// --- ExamQuestion Associations ---
ExamQuestion.belongsTo(Exam, { foreignKey: 'de_thi_id', constraints: false });
Exam.hasMany(ExamQuestion, { foreignKey: 'de_thi_id', constraints: false });
ExamQuestion.belongsTo(Question, {
    foreignKey: 'cau_hoi_id',
    constraints: false,
});
Question.hasMany(ExamQuestion, {
    foreignKey: 'cau_hoi_id',
    constraints: false,
});

// --- Course Ads & Document Ads ---
CourseAd.belongsTo(Course, { foreignKey: 'khoa_hoc_id', constraints: false });
Course.hasMany(CourseAd, { foreignKey: 'khoa_hoc_id', constraints: false });
DocumentAd.belongsTo(Document, {
    foreignKey: 'tai_lieu_id',
    constraints: false,
});
Document.hasMany(DocumentAd, { foreignKey: 'tai_lieu_id', constraints: false });
TeacherCourseAd.belongsTo(Teacher, {
    foreignKey: 'giao_vien_id',
    constraints: false,
});
Teacher.hasMany(TeacherCourseAd, {
    foreignKey: 'giao_vien_id',
    constraints: false,
});
TeacherCourseAd.belongsTo(Course, {
    foreignKey: 'khoa_hoc_id',
    constraints: false,
});
Course.hasMany(TeacherCourseAd, {
    foreignKey: 'khoa_hoc_id',
    constraints: false,
});

// --- Document & Menu ---
Document.belongsTo(DocumentType, {
    foreignKey: 'loai_tai_lieu_id',
    constraints: false,
});
DocumentType.hasMany(Document, {
    foreignKey: 'loai_tai_lieu_id',
    constraints: false,
});
Menu.belongsTo(MenuType, { foreignKey: 'loai_menu_id', constraints: false });
MenuType.hasMany(Menu, { foreignKey: 'loai_menu_id', constraints: false });

// --- DealerDiscount & Invoice ---
DealerDiscount.belongsTo(Teacher, {
    foreignKey: 'giao_vien_id',
    constraints: false,
});
Teacher.hasMany(DealerDiscount, {
    foreignKey: 'giao_vien_id',
    constraints: false,
});
DealerDiscount.belongsTo(Course, {
    foreignKey: 'khoa_hoc_id',
    constraints: false,
});
Course.hasMany(DealerDiscount, {
    foreignKey: 'khoa_hoc_id',
    constraints: false,
});
DetailedDiscount.belongsTo(DealerDiscount, {
    foreignKey: 'chiet_khau_id',
    constraints: false,
});
DealerDiscount.hasMany(DetailedDiscount, {
    foreignKey: 'chiet_khau_id',
    constraints: false,
});
DetailedInvoice.belongsTo(Invoice, {
    foreignKey: 'hoa_don_id',
    constraints: false,
});
Invoice.hasMany(DetailedInvoice, {
    foreignKey: 'hoa_don_id',
    constraints: false,
});
Invoice.belongsTo(Student, { foreignKey: 'hoc_vien_id', constraints: false });
Student.hasMany(Invoice, { foreignKey: 'hoc_vien_id', constraints: false });
Invoice.belongsTo(Staff, { foreignKey: 'nhan_vien_id', constraints: false });
Staff.hasMany(Invoice, { foreignKey: 'nhan_vien_id', constraints: false });
DiscountCode.belongsTo(Course, {
    foreignKey: 'khoa_hoc_id',
    constraints: false,
});
Course.hasMany(DiscountCode, { foreignKey: 'khoa_hoc_id', constraints: false });

// --- Comment & SideComment ---
Comment.belongsTo(Course, { foreignKey: 'khoa_hoc_id', constraints: false });
Course.hasMany(Comment, { foreignKey: 'khoa_hoc_id', constraints: false });
Comment.belongsTo(Modun, { foreignKey: 'mo_dun_id', constraints: false });
Modun.hasMany(Comment, { foreignKey: 'mo_dun_id', constraints: false });
Comment.belongsTo(Student, { foreignKey: 'hoc_vien_id', constraints: false });
Student.hasMany(Comment, { foreignKey: 'hoc_vien_id', constraints: false });
SideComment.belongsTo(Comment, {
    foreignKey: 'binh_luan_id',
    constraints: false,
});
Comment.hasMany(Comment, { foreignKey: 'binh_luan_id', constraints: false });

// --- CourseStudent ---
CourseStudent.belongsTo(Course, {
    foreignKey: 'khoa_hoc_id',
    constraints: false,
});
Course.hasMany(CourseStudent, {
    foreignKey: 'khoa_hoc_id',
    constraints: false,
});
CourseStudent.belongsTo(Student, {
    foreignKey: 'hoc_vien_id',
    constraints: false,
});
Student.hasOne(CourseStudent, {
    foreignKey: 'hoc_vien_id',
    constraints: false,
});

// --- Evaluate & Exam ---
Exam.hasMany(Evaluate, {
    foreignKey: 'de_thi_id',
    sourceKey: 'de_thi_id',
    constraints: false,
});
Evaluate.belongsTo(Exam, {
    foreignKey: 'de_thi_id',
    targetKey: 'de_thi_id',
    constraints: false,
});

// --- DGNLEvaluate & DGTDEvaluate ---
Course.hasMany(DGNLEvaluate, {
    foreignKey: 'khoa_hoc_id',
    sourceKey: 'khoa_hoc_id',
    constraints: false,
});
DGNLEvaluate.belongsTo(Course, {
    foreignKey: 'khoa_hoc_id',
    targetKey: 'khoa_hoc_id',
    constraints: false,
});
Course.hasMany(DGTDEvaluate, {
    foreignKey: 'khoa_hoc_id',
    sourceKey: 'khoa_hoc_id',
    constraints: false,
});
DGTDEvaluate.belongsTo(Course, {
    foreignKey: 'khoa_hoc_id',
    targetKey: 'khoa_hoc_id',
    constraints: false,
});

// --- OnlineCriteria & Exam ---
Exam.hasOne(OnlineCriteria, {
    foreignKey: 'khoa_hoc_id',
    sourceKey: 'khoa_hoc_id',
    constraints: false,
});
OnlineCriteria.belongsTo(Exam, {
    foreignKey: 'khoa_hoc_id',
    targetKey: 'khoa_hoc_id',
    constraints: false,
});

// --- Student & Province ---
Student.belongsTo(Province, { foreignKey: 'ttp_id', constraints: false });

// --- ExceprtType & Exceprt ---
ExceprtType.hasMany(Exceprt, {
    foreignKey: 'loai_trich_doan_id',
    constraints: false,
});
Exceprt.belongsTo(ExceprtType, {
    foreignKey: 'loai_trich_doan_id',
    constraints: false,
});

// --- CourseDescription ---
Course.hasOne(CourseDescription, {
    foreignKey: 'khoa_hoc_id',
    sourceKey: 'khoa_hoc_id',
    constraints: false,
});
CourseDescription.belongsTo(Course, {
    foreignKey: 'khoa_hoc_id',
    targetKey: 'khoa_hoc_id',
    constraints: false,
});

// --- QuestionDetail & Option ---
Question.hasMany(QuestionDetail, {
    foreignKey: 'cau_hoi_id',
    sourceKey: 'cau_hoi_id',
    constraints: false,
});
QuestionDetail.belongsTo(Question, {
    foreignKey: 'cau_hoi_id',
    targetKey: 'cau_hoi_id',
    constraints: false,
});
Question.hasOne(Option, {
    foreignKey: 'cau_hoi_id',
    sourceKey: 'cau_hoi_id',
    constraints: false,
});
Option.belongsTo(Question, {
    foreignKey: 'cau_hoi_id',
    targetKey: 'cau_hoi_id',
    constraints: false,
});

// --- CourseType ---
CourseType.hasMany(Course, { foreignKey: 'lkh_id', constraints: false });
Course.belongsTo(CourseType, { foreignKey: 'lkh_id', constraints: false });

// --- CourseMedia & Media ---
Course.hasMany(CourseMedia, { foreignKey: 'khoa_hoc_id', constraints: false });
CourseMedia.belongsTo(Course, {
    foreignKey: 'khoa_hoc_id',
    constraints: false,
});
CourseMedia.hasOne(Media, {
    foreignKey: 'tep_tin_id',
    sourceKey: 'tep_tin_id',
    constraints: false,
});
Media.belongsTo(CourseMedia, {
    foreignKey: 'tep_tin_id',
    targetKey: 'tep_tin_id',
    constraints: false,
});

// --- ExamSetStudent & CourseMedia ---
ExamSetStudent.hasOne(CourseMedia, {
    foreignKey: 'khtt_id',
    sourceKey: 'khtt_id',
    constraints: false,
});
Student.hasOne(ExamSetStudent, {
    foreignKey: 'hoc_vien_id',
    sourceKey: 'hoc_vien_id',
    constraints: false,
});

// --- Media & Staff ---
Media.hasOne(Staff, {
    foreignKey: 'nhan_vien_id',
    sourceKey: 'nguoi_tao',
    constraints: false,
});

// --- PositionPermission, Position, Permission ---
PositionPermission.hasOne(Position, {
    foreignKey: 'chuc_vu_id',
    sourceKey: 'chuc_vu_id',
    constraints: false,
});
Position.hasMany(PositionPermission, {
    foreignKey: 'chuc_vu_id',
    sourceKey: 'chuc_vu_id',
    constraints: false,
});
PositionPermission.hasOne(Permission, {
    foreignKey: 'qtc_id',
    sourceKey: 'qtc_id',
    constraints: false,
});
Permission.hasMany(PositionPermission, {
    foreignKey: 'qtc_id',
    sourceKey: 'qtc_id',
    constraints: false,
});

// --- Teacher & Department ---
Teacher.hasOne(Department, {
    foreignKey: 'don_vi_id',
    sourceKey: 'don_vi_id',
    constraints: false,
});

// --- Course & Teacher ---
Course.hasOne(Teacher, {
    foreignKey: 'giao_vien_id',
    sourceKey: 'giao_vien_id',
    constraints: false,
});
Teacher.belongsTo(Course, {
    foreignKey: 'giao_vien_id',
    targetKey: 'giao_vien_id',
    constraints: false,
});

// =====================
// Module Exports
// =====================

module.exports = {
    // Core
    Course,
    Lesson,
    Modun,
    Program,
    Role,
    Staff,
    Student,
    Teacher,
    Grade,
    Majoring,
    Department,

    // Thematic & Criteria
    Thematic,
    ModunCriteria,
    SyntheticCriteria,
    OnlineCriteria,
    DGNLCriteria,
    DGTDCriteria,
    ThematicCriteria,

    // Exam & Question
    Exam,
    ExamType,
    ExamQuestion,
    Question,
    QuestionDetail,
    Option,
    Answer,
    SelectedAnswer,
    StudentExam,
    ExamSetStudent,

    // Exceprt
    Exceprt,
    ExceprtType,

    // Document & Media
    Document,
    DocumentAd,
    DocumentType,
    Media,
    CourseMedia,

    // Course Ads & Description
    CourseAd,
    TeacherCourseAd,
    CourseDescription,

    // Discount & Invoice
    DealerDiscount,
    DetailedDiscount,
    DetailedInvoice,
    DiscountCode,
    Invoice,

    // Comment & Notification
    Comment,
    SideComment,
    Notification,

    // Other
    AccountBank,
    Footer,
    Contact,
    Token,
    CourseStudent,
    Province,
    Evaluate,
    DGNLEvaluate,
    DGTDEvaluate,
    CourseType,
    Permission,
    Position,
    PositionPermission,
    Menu,
    MenuType,
};

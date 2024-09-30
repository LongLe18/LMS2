const Course = require('./Course');
const Lesson = require('./Lesson');
const Modun = require('./Modun');
const Program = require('./Program');
const Role = require('./Role');
const Staff = require('./Staff');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Thematic = require('./Thematic');
const Grade = require('./Grade');
const Majoring = require('./Majoring');
const Answer = require('./Answer');
const Exam = require('./Exam');
const ExamType = require('./ExamType');
const Exceprt = require('./Exceprt');
const ModunCriteria = require('./ModunCriteria');
const Question = require('./Question');
const SelectedAnswer = require('./SelectedAnswer');
const StudentExam = require('./StudentExam');
const SyntheticCriteria = require('./SyntheticCriteria');
const OnlineCriteria = require('./OnlineCriteria');
const DGNLCriteria = require('./DGNLCriteria');
const ThematicCriteria = require('./ThematicCriteria');
const ExamQuestion = require('./ExamQuestion');
const Document = require('./Document');
const DocumentAd = require('./DocumentAd');
const CourseAd = require('./CourseAd');
const TeacherCourseAd = require('./TeacherCourseAd');
const DocumentType = require('./DocumentType');
const Menu = require('./Menu');
const MenuType = require('./MenuType');
const CourseDescription = require('./CourseDescription');
const DealerDiscount = require('./DealerDiscount');
const DetailedDiscount = require('./DetailedDiscount');
const DetailedInvoice = require('./DetailedInvoice');
const DiscountCode=require('./DiscountCode');
const Invoice = require('./Invoice');
const Comment = require('./Comment');
const SideComment = require('./SideComment');
const Notification = require('./Notification');
const AccountBank = require('./AccountBank');
const Footer= require('./Footer');
const Contact = require('./Contact');
const Token = require('./Token');
const CourseStudent = require('./CourseStudent');
const Province = require('./Province');
const Evaluate = require('./Evaluate');
const DGNLEvaluate = require('./DGNLEvaluate');
const ExceprtType = require('./ExceprtType');

//khoa ngoai khoahoc
Program.hasMany(Course, { foreignKey: 'kct_id', constraints: false });
Course.belongsTo(Program, { foreignKey: 'kct_id', constraints: false });
//khoa ngoai modun
Course.hasMany(Modun, { foreignKey: 'khoa_hoc_id', constraints: false });
Modun.belongsTo(Course, { foreignKey: 'khoa_hoc_id', constraints: false });
//khoa ngoai chuyende
Modun.hasMany(Thematic, { foreignKey: 'mo_dun_id', constraints: false });
Thematic.belongsTo(Modun, { foreignKey: 'mo_dun_id', constraints: false });
Grade.hasMany(Thematic, { foreignKey: 'lop_id', constraints: false });
Thematic.belongsTo(Grade, { foreignKey: 'lop_id', constraints: false });
//khoa ngoai baigiang
Thematic.hasMany(Lesson, { foreignKey: 'chuyen_de_id' , constraints: false});
Lesson.belongsTo(Thematic, { foreignKey: 'chuyen_de_id' , constraints: false});
//khoa ngoai giao vien
Majoring.hasMany(Teacher, { foreignKey: 'chuyen_nganh_id' , constraints: false});
Teacher.belongsTo(Majoring, { foreignKey: 'chuyen_nganh_id' , constraints: false});
Modun.belongsTo(Teacher, { foreignKey: 'giao_vien_id' , constraints: false});
Teacher.hasMany(Modun, { foreignKey: 'giao_vien_id' , constraints: false});
//khoa ngoai cauhoi
Question.belongsTo(Exceprt, { foreignKey: 'trich_doan_id' , constraints: false});
Exceprt.hasMany(Question, { foreignKey: 'trich_doan_id' , constraints: false});
Question.belongsTo(Thematic, { foreignKey: 'chuyen_de_id' , constraints: false});
Thematic.hasMany(Question, { foreignKey: 'chuyen_de_id' , constraints: false});
Question.belongsTo(Modun, { foreignKey: 'mo_dun_id' , constraints: false});
Modun.hasMany(Question, { foreignKey: 'mo_dun_id' , constraints: false});
//khoa ngoai dapan
Answer.belongsTo(Question, { foreignKey: 'cau_hoi_id' , constraints: false});
Question.hasMany(Answer, { foreignKey: 'cau_hoi_id' , constraints: false});
//khoa ngoai dapandachon
SelectedAnswer.belongsTo(StudentExam, { foreignKey: 'dthv_id' , constraints: false});
StudentExam.hasMany(SelectedAnswer, { foreignKey: 'dthv_id' , constraints: false});
SelectedAnswer.belongsTo(Question, { foreignKey: 'cau_hoi_id' , constraints: false});
Question.hasMany(SelectedAnswer, { foreignKey: 'cau_hoi_id' , constraints: false});
//khoa ngoai dethi
Exam.belongsTo(ExamType, { foreignKey: 'loai_de_thi_id' , constraints: false});
ExamType.hasMany(Exam, { foreignKey: 'loai_de_thi_id' , constraints: false});
Exam.belongsTo(Course, { foreignKey: 'khoa_hoc_id' , constraints: false});
Course.hasMany(Exam, { foreignKey: 'khoa_hoc_id' , constraints: false});
Exam.belongsTo(Modun, { foreignKey: 'mo_dun_id' , constraints: false});
Modun.hasMany(Exam, { foreignKey: 'mo_dun_id' , constraints: false});
Exam.belongsTo(Thematic, { foreignKey: 'chuyen_de_id' , constraints: false});
Thematic.hasMany(Exam, { foreignKey: 'chuyen_de_id' , constraints: false});
//khoa ngoai dethihocvien
StudentExam.belongsTo(Student, { foreignKey: 'hoc_vien_id' , constraints: false});
Student.hasMany(StudentExam, { foreignKey: 'hoc_vien_id' , constraints: false});
StudentExam.belongsTo(Exam, { foreignKey: 'de_thi_id' , constraints: false});
Exam.hasMany(StudentExam, { foreignKey: 'de_thi_id' , constraints: false});
//khoa ngoai tieuchidetonghop
SyntheticCriteria.belongsTo(Course, { foreignKey: 'khoa_hoc_id' , constraints: false});
Course.hasMany(SyntheticCriteria, { foreignKey: 'khoa_hoc_id' , constraints: false});
//khoa ngoai tieuchidetonghop
OnlineCriteria.belongsTo(Course, { foreignKey: 'khoa_hoc_id' , constraints: false});
Course.hasMany(OnlineCriteria, { foreignKey: 'khoa_hoc_id' , constraints: false});

DGNLCriteria.belongsTo(Course, { foreignKey: 'khoa_hoc_id' , constraints: false});
Course.hasMany(DGNLCriteria, { foreignKey: 'khoa_hoc_id' , constraints: false});
//khoa ngoai tieuchidemodun
ModunCriteria.belongsTo(Modun, { foreignKey: 'mo_dun_id' , constraints: false});
Modun.hasMany(ModunCriteria, { foreignKey: 'mo_dun_id' , constraints: false});
//khoa ngoai tieuchidechuyende
ThematicCriteria.belongsTo(Modun, { foreignKey: 'mo_dun_id' , constraints: false});
Modun.hasMany(ThematicCriteria, { foreignKey: 'mo_dun_id' , constraints: false});
//khoa ngoai cauhoidethi
ExamQuestion.belongsTo(Exam, { foreignKey: 'de_thi_id' , constraints: false});
Exam.hasMany(ExamQuestion, { foreignKey: 'de_thi_id' , constraints: false});
ExamQuestion.belongsTo(Question, { foreignKey: 'cau_hoi_id' , constraints: false});
Question.hasMany(ExamQuestion, { foreignKey: 'cau_hoi_id' , constraints: false});
//khoangoai quangcaokhoahoc
CourseAd.belongsTo(Course, { foreignKey: 'khoa_hoc_id' , constraints: false});
Course.hasMany(CourseAd, { foreignKey: 'khoa_hoc_id' , constraints: false});
//khoa ngoai quangcaotailieu
DocumentAd.belongsTo(Document, { foreignKey: 'tai_lieu_id' , constraints: false});
Document.hasMany(DocumentAd, { foreignKey: 'tai_lieu_id' , constraints: false});
//khoa ngoai quangcaogiaovienkhoahoc
TeacherCourseAd.belongsTo(Teacher, { foreignKey: 'giao_vien_id' , constraints: false});
Teacher.hasMany(TeacherCourseAd, { foreignKey: 'giao_vien_id' , constraints: false});
TeacherCourseAd.belongsTo(Course, { foreignKey: 'khoa_hoc_id' , constraints: false});
Course.hasMany(TeacherCourseAd, { foreignKey: 'khoa_hoc_id' , constraints: false});
//khoa ngoai tailieu
Document.belongsTo(DocumentType, { foreignKey: 'loai_tai_lieu_id' , constraints: false});
DocumentType.hasMany(Document, { foreignKey: 'loai_tai_lieu_id' , constraints: false});
//khoa ngoai menu
Menu.belongsTo(MenuType, { foreignKey: 'loai_menu_id' , constraints: false});
MenuType.hasMany(Menu, { foreignKey: 'loai_menu_id' , constraints: false});
//khoa ngoai motakhoahoc

//khoa ngoai chietkhaudaily
DealerDiscount.belongsTo(Teacher, { foreignKey: 'giao_vien_id' , constraints: false});
Teacher.hasMany(DealerDiscount, { foreignKey: 'giao_vien_id' , constraints: false})
DealerDiscount.belongsTo(Course, { foreignKey: 'khoa_hoc_id' , constraints: false});
Course.hasMany(DealerDiscount, { foreignKey: 'khoa_hoc_id' , constraints: false});
//khoa ngoai chietkhauchitiet
DetailedDiscount.belongsTo(DealerDiscount, { foreignKey:'chiet_khau_id', constraints: false});
DealerDiscount.hasMany(DetailedDiscount, { foreignKey: 'chiet_khau_id' , constraints: false});
//khoa ngoai hoadonchitiet
DetailedInvoice.belongsTo(Invoice, { foreignKey: 'hoa_don_id', constraints: false});
Invoice.hasMany(DetailedInvoice, { foreignKey: 'hoa_don_id' , constraints: false});
//khoa ngoai hoadon
Invoice.belongsTo(Student, { foreignKey:'hoc_vien_id', constraints: false});
Student.hasMany(Invoice, { foreignKey: 'hoc_vien_id' , constraints: false});
Invoice.belongsTo(Staff, { foreignKey:'nhan_vien_id', constraints: false});
Staff.hasMany(Invoice, { foreignKey: 'nhan_vien_id' , constraints: false});
//khoa ngoai magiamgia
DiscountCode.belongsTo(Course, { foreignKey: 'khoa_hoc_id' , constraints: false});
Course.hasMany(DiscountCode, { foreignKey: 'khoa_hoc_id' , constraints: false});
//khoa ngoai binh luan
Comment.belongsTo(Course, { foreignKey: 'khoa_hoc_id', constraints: false});
Course.hasMany(Comment, { foreignKey: 'khoa_hoc_id', constraints: false});
Comment.belongsTo(Modun, { foreignKey: 'mo_dun_id' , constraints: false});
Modun.hasMany(Comment, { foreignKey: 'mo_dun_id' , constraints: false});
Comment.belongsTo(Student, { foreignKey: 'hoc_vien_id' , constraints: false});
Student.hasMany(Comment, { foreignKey: 'hoc_vien_id' , constraints: false});
//khoa hoc binh luan phu
SideComment.belongsTo(Comment, { foreignKey: 'binh_luan_id', constraints: false});
Comment.hasMany(Comment, { foreignKey: 'binh_luan_id', constraints: false});

Majoring.hasMany(Question, { foreignKey: 'chuyen_nganh_id', constraints: false});
Question.belongsTo(Majoring, { foreignKey: 'chuyen_nganh_id', constraints: false});

Exam.hasMany(Evaluate, { foreignKey: 'de_thi_id', sourceKey: 'de_thi_id', constraints: false});
Evaluate.belongsTo(Exam, { foreignKey: 'de_thi_id', targetKey: 'de_thi_id', constraints: false});

Course.hasMany(DGNLEvaluate, { foreignKey: 'khoa_hoc_id', sourceKey: 'khoa_hoc_id', constraints: false});
DGNLEvaluate.belongsTo(Course, { foreignKey: 'khoa_hoc_id', targetKey: 'khoa_hoc_id', constraints: false});

Exam.hasOne(OnlineCriteria, { foreignKey: 'khoa_hoc_id', sourceKey: 'khoa_hoc_id', constraints: false});
OnlineCriteria.belongsTo(Exam, { foreignKey: 'khoa_hoc_id', targetKey: 'khoa_hoc_id', constraints: false});

Student.belongsTo(Province, { foreignKey: 'ttp_id', constraints: false});

ExceprtType.hasMany(Exceprt, { foreignKey: 'loai_trich_doan_id', constraints: false});
Exceprt.belongsTo(ExceprtType, { foreignKey: 'loai_trich_doan_id', constraints: false});

Course.hasOne(CourseDescription, { foreignKey: 'khoa_hoc_id', sourceKey: 'khoa_hoc_id', constraints: false});
CourseDescription.belongsTo(Course, { foreignKey: 'khoa_hoc_id', targetKey: 'khoa_hoc_id', constraints: false});

module.exports = {
    Course,
    Lesson,
    Modun,
    Program,
    Role,
    Staff,
    Student,
    Teacher,
    Thematic,
    Grade,
    Majoring,
    Answer,
    Exam,
    ExamType,
    Exceprt,
    ModunCriteria,
    Question,
    SelectedAnswer,
    StudentExam,
    SyntheticCriteria,
    OnlineCriteria,
    ThematicCriteria,
    ExamQuestion,
    Document,
    DocumentAd,
    CourseAd,
    TeacherCourseAd,
    DocumentType,
    Menu,
    MenuType,
    CourseDescription,
    DealerDiscount,
    DetailedDiscount,
    DetailedInvoice,
    Invoice,
    DiscountCode,
    Comment,
    SideComment,
    Notification,
    AccountBank,
    Contact,
    Footer,
    Token,
    CourseStudent,
    Province,
    Evaluate,
    ExceprtType,
    DGNLCriteria,
    DGNLEvaluate
};

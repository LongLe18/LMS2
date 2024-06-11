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

//khoa ngoai khoahoc
Program.hasMany(Course, { foreignKey: 'kct_id' });
Course.belongsTo(Program, { foreignKey: 'kct_id' });
//khoa ngoai modun
Course.hasMany(Modun, { foreignKey: 'khoa_hoc_id' });
Modun.belongsTo(Course, { foreignKey: 'khoa_hoc_id' });
//khoa ngoai chuyende
Modun.hasMany(Thematic, { foreignKey: 'mo_dun_id' });
Thematic.belongsTo(Modun, { foreignKey: 'mo_dun_id' });
Grade.hasMany(Thematic, { foreignKey: 'lop_id' });
Thematic.belongsTo(Grade, { foreignKey: 'lop_id' });
//khoa ngoai baigiang
Thematic.hasMany(Lesson, { foreignKey: 'chuyen_de_id' });
Lesson.belongsTo(Thematic, { foreignKey: 'chuyen_de_id' });
//khoa ngoai giao vien
Majoring.hasMany(Teacher, { foreignKey: 'chuyen_nganh_id' });
Teacher.belongsTo(Majoring, { foreignKey: 'chuyen_nganh_id' });
Modun.belongsTo(Teacher, { foreignKey: 'giao_vien_id' });
Teacher.hasMany(Modun, { foreignKey: 'giao_vien_id' });
//khoa ngoai cauhoi
Question.belongsTo(Exceprt, { foreignKey: 'trich_doan_id' });
Exceprt.hasMany(Question, { foreignKey: 'trich_doan_id' });
Question.belongsTo(Thematic, { foreignKey: 'chuyen_de_id' });
Thematic.hasMany(Question, { foreignKey: 'chuyen_de_id' });
Question.belongsTo(Modun, { foreignKey: 'mo_dun_id' });
Modun.hasMany(Question, { foreignKey: 'mo_dun_id' });
//khoa ngoai dapan
Answer.belongsTo(Question, { foreignKey: 'cau_hoi_id' });
Question.hasMany(Answer, { foreignKey: 'cau_hoi_id' });
//khoa ngoai dapandachon
SelectedAnswer.belongsTo(StudentExam, { foreignKey: 'dthv_id' });
StudentExam.hasMany(SelectedAnswer, { foreignKey: 'dthv_id' });
SelectedAnswer.belongsTo(Question, { foreignKey: 'cau_hoi_id' });
Question.hasMany(SelectedAnswer, { foreignKey: 'cau_hoi_id' });
//khoa ngoai dethi
Exam.belongsTo(ExamType, { foreignKey: 'loai_de_thi_id' });
ExamType.hasMany(Exam, { foreignKey: 'loai_de_thi_id' });
Exam.belongsTo(Course, { foreignKey: 'khoa_hoc_id' });
Course.hasMany(Exam, { foreignKey: 'khoa_hoc_id' });
Exam.belongsTo(Modun, { foreignKey: 'mo_dun_id' });
Modun.hasMany(Exam, { foreignKey: 'mo_dun_id' });
Exam.belongsTo(Thematic, { foreignKey: 'chuyen_de_id' });
Thematic.hasMany(Exam, { foreignKey: 'chuyen_de_id' });
//khoa ngoai dethihocvien
StudentExam.belongsTo(Student, { foreignKey: 'hoc_vien_id' });
Student.hasMany(StudentExam, { foreignKey: 'hoc_vien_id' });
StudentExam.belongsTo(Exam, { foreignKey: 'de_thi_id' });
Exam.hasMany(StudentExam, { foreignKey: 'de_thi_id' });
//khoa ngoai tieuchidetonghop
SyntheticCriteria.belongsTo(Course, { foreignKey: 'khoa_hoc_id' });
Course.hasMany(SyntheticCriteria, { foreignKey: 'khoa_hoc_id' });
//khoa ngoai tieuchidetonghop
OnlineCriteria.belongsTo(Course, { foreignKey: 'khoa_hoc_id' });
Course.hasMany(OnlineCriteria, { foreignKey: 'khoa_hoc_id' });
//khoa ngoai tieuchidemodun
ModunCriteria.belongsTo(Modun, { foreignKey: 'mo_dun_id' });
Modun.hasMany(ModunCriteria, { foreignKey: 'mo_dun_id' });
//khoa ngoai tieuchidechuyende
ThematicCriteria.belongsTo(Modun, { foreignKey: 'mo_dun_id' });
Modun.hasMany(ThematicCriteria, { foreignKey: 'mo_dun_id' });
//khoa ngoai cauhoidethi
ExamQuestion.belongsTo(Exam, { foreignKey: 'de_thi_id' });
Exam.hasMany(ExamQuestion, { foreignKey: 'de_thi_id' });
ExamQuestion.belongsTo(Question, { foreignKey: 'cau_hoi_id' });
Question.hasMany(ExamQuestion, { foreignKey: 'cau_hoi_id' });
//khoangoai quangcaokhoahoc
CourseAd.belongsTo(Course, { foreignKey: 'khoa_hoc_id' });
Course.hasMany(CourseAd, { foreignKey: 'khoa_hoc_id' });
//khoa ngoai quangcaotailieu
DocumentAd.belongsTo(Document, { foreignKey: 'tai_lieu_id' });
Document.hasMany(DocumentAd, { foreignKey: 'tai_lieu_id' });
//khoa ngoai quangcaogiaovienkhoahoc
TeacherCourseAd.belongsTo(Teacher, { foreignKey: 'giao_vien_id' });
Teacher.hasMany(TeacherCourseAd, { foreignKey: 'giao_vien_id' });
TeacherCourseAd.belongsTo(Course, { foreignKey: 'khoa_hoc_id' });
Course.hasMany(TeacherCourseAd, { foreignKey: 'khoa_hoc_id' });
//khoa ngoai tailieu
Document.belongsTo(DocumentType, { foreignKey: 'loai_tai_lieu_id' });
DocumentType.hasMany(Document, { foreignKey: 'loai_tai_lieu_id' });
//khoa ngoai menu
Menu.belongsTo(MenuType, { foreignKey: 'loai_menu_id' });
MenuType.hasMany(Menu, { foreignKey: 'loai_menu_id' });
//khoa ngoai motakhoahoc

//khoa ngoai chietkhaudaily
DealerDiscount.belongsTo(Teacher, { foreignKey: 'giao_vien_id' });
Teacher.hasMany(DealerDiscount, { foreignKey: 'giao_vien_id' })
DealerDiscount.belongsTo(Course, { foreignKey: 'khoa_hoc_id' });
Course.hasMany(DealerDiscount, { foreignKey: 'khoa_hoc_id' });
//khoa ngoai chietkhauchitiet
DetailedDiscount.belongsTo(DealerDiscount, { foreignKey:'chiet_khau_id'});
DealerDiscount.hasMany(DetailedDiscount, { foreignKey: 'chiet_khau_id' });
//khoa ngoai hoadonchitiet
DetailedInvoice.belongsTo(Invoice, { foreignKey: 'hoa_don_id'});
Invoice.hasMany(DetailedInvoice, { foreignKey: 'hoa_don_id' });
//khoa ngoai hoadon
Invoice.belongsTo(Student, { foreignKey:'hoc_vien_id'});
Student.hasMany(Invoice, { foreignKey: 'hoc_vien_id' });
Invoice.belongsTo(Staff, { foreignKey:'nhan_vien_id'});
Staff.hasMany(Invoice, { foreignKey: 'nhan_vien_id' });
//khoa ngoai magiamgia
DiscountCode.belongsTo(Course, { foreignKey: 'khoa_hoc_id' });
Course.hasMany(DiscountCode, { foreignKey: 'khoa_hoc_id' });
//khoa ngoai binh luan
Comment.belongsTo(Course, { foreignKey: 'khoa_hoc_id'});
Course.hasMany(Comment, { foreignKey: 'khoa_hoc_id'});
Comment.belongsTo(Modun, { foreignKey: 'mo_dun_id' });
Modun.hasMany(Comment, { foreignKey: 'mo_dun_id' });
Comment.belongsTo(Student, { foreignKey: 'hoc_vien_id' });
Student.hasMany(Comment, { foreignKey: 'hoc_vien_id' });
//khoa hoc binh luan phu
SideComment.belongsTo(Comment, { foreignKey: 'binh_luan_id'});
Comment.hasMany(Comment, { foreignKey: 'binh_luan_id'});
// Khoá ngoại Đánh giá
Evaluate.belongsTo(Exam, { foreignKey: 'de_thi_id' });

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
};

const nodemailer = require('nodemailer');
const { oauth } = require('../config');
const res = require('express/lib/response');
const SendmailTransport = require('nodemailer/lib/sendmail-transport');
const { api } = require('../config');
const SMTPConnection = require('nodemailer/lib/smtp-connection');
require('dotenv').config();

// const oAuth2Client = new google.auth.OAuth2(
//     oauth.GOOGLE_CLIENT_ID,
//     oauth.GOOGLE_CLIENT_SECRET,
//     oauth.REDIRECT_URL
// );

// oAuth2Client.setCredentials({ refresh_token: oauth.REFRESH_TOKEN });

const sendMail = async (content, option) => {
    try {
        //const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER, // generated ethereal user
                pass: process.env.MAIL_PASSWORD  // generated ethereal password
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        let mailOptions;
        if (option == 1) {
            mailOptions = {
                from: `TRUNG TÂM LUYỆN THI QUỐC GIA CTT<${process.env.MAIL_FROM}>`,
                to: content.gmail,
                subject: 'THÔNG BÁO KÍCH HOẠT TÀI KHOẢN',
                sender: process.env.MAIL_SENDER,
                text: '',
                html: `
                <div style="max-width: 900px">
                    <img style="max-width:100%; height:auto" src="https://luyenthiquocgia.edu.vn/wp-content/uploads/2023/09/e803d5fc604eb510ec5f.png"></img>
                    <div>
                        <p><span style="color: black">Xin chào bạn ${content.ho_ten}!</span></p>
                        <p><span style="color: black">Bạn vừa đăng kí tài khoản trên hệ thống ôn thi Đánh giá năng lực ĐHQGHN của Trung tâm CT&T  https://luyenthiquocgia.edu.vn/.</p>
                        <p><span style="color: black">Để hoàn tất xác thực email vui lòng Click vào đây: <a style="font-style:italic" href="${api.be_url}/auth/confirm/${content.token}">Xác thực email</a></p>
                        <p><span style="color: black">Trân trọng!</p>
                    </div>
                    <hr/>
                    <p><span style="color: black"><span style="font-weight:bold">CHƯƠNG TRÌNH ĐƯỢC XÂY DỰNG VÀ PHÁT TRIỂN BỞI</span><br/>
                        CÔNG TY CỔ PHẦN GIÁO DỤC VÀ CÔNG NGHỆ TRI THỨC VIỆT<br/>
                        Địa chỉ: Số 7, Ngõ 210 Hoàng Quốc Việt, Cổ Nhuế 1, Bắc Từ Liêm, Hà Nội.<br/>
                        Điện thoại: 0968.958.680<br/>
                        Email: Trithucviet.hsa@gmail.com</span></p>
                </div>`,
            };
        } else if (option == 2) {
            mailOptions = {
                from: `TRUNG TÂM LUYỆN THI QUỐC GIA CTT<${process.env.MAIL_FROM}>`,
                to: content.gmail,
                subject: 'KHÔI PHỤC TÀI KHOẢN ĐĂNG NHẬP',
                sender: process.env.MAIL_SENDER,
                text: '',
                html: `
                <div style="max-width: 900px">
                    <img style="max-width:100%; height:auto" src="https://luyenthiquocgia.edu.vn/wp-content/uploads/2023/09/e803d5fc604eb510ec5f.png"></img>
                    <div>
                        <p><span style="color: black">Xin chào bạn ${content.ho_ten}!</span></p>
                        <p><span style="color: black">Thông tin đăng nhập trên hệ thống ôn thi Đánh giá năng lực ĐHQGHN của Trung tâm CT&T  https://luyenthiquocgia.edu.vn/ đã được khôi phục</p>
                        <div style="border: 2px solid rgb(137,166,191); border-radius: 20px; padding: 10px; background-color: rgb(219,238,244)">
                            <p><span style="color: black; font-weight:bold">Thông tin đăng nhập:</span></p>
                            <ul>
                                <li><p><span style="color: black">Tên đăng nhập: ${content.gmail}</span></p></li>
                                <li><p><span style="color: black">Mật khẩu: ${content.password}</span></p></li>
                            </ul>
                        </div>
                        <p><span style="color: black">Bạn hãy đăng nhập ${api.login_url} bằng tài khoản nêu trên.</p>
                        <p><span style="color: black">Trân trọng!</p>
                    </div>
                    <hr/>
                    <p><span style="color: black"><span style="font-weight:bold">CHƯƠNG TRÌNH ĐƯỢC XÂY DỰNG VÀ PHÁT TRIỂN BỞI</span><br/>
                    CÔNG TY CỔ PHẦN GIÁO DỤC VÀ CÔNG NGHỆ TRI THỨC VIỆT<br/>
                    Địa chỉ: Số 7, Ngõ 210 Hoàng Quốc Việt, Cổ Nhuế 1, Bắc Từ Liêm, Hà Nội.<br/>
                    Điện thoại: 0968.958.680<br/>
                    Email: Trithucviet.hsa@gmail.com</span></p>
                </div>`,
            };
        } else if (option == 3) {
            mailOptions = {
                from: `TRUNG TÂM LUYỆN THI QUỐC GIA CTT<${process.env.MAIL_FROM}>`,
                to: content.gmail,
                subject: 'THÔNG TIN ĐĂNG NHẬP',
                sender: process.env.MAIL_SENDER,
                text: '',
                html: `
                <div style="max-width: 900px">
                    <img style="max-width:100%; height:auto" src="https://luyenthiquocgia.edu.vn/wp-content/uploads/2023/09/e803d5fc604eb510ec5f.png"></img>
                    <div>
                        <p><span style="color: black">Xin chào bạn ${content.ho_ten}!</span></p>
                        <p><span style="color: black">Bạn vừa đăng kí tài khoản trên hệ thống ôn thi Đánh giá năng lực ĐHQGHN của Trung tâm CT&T  https://luyenthiquocgia.edu.vn/.  Dưới đây là thông tin tài khoản của bạn:</p>
                        <div style="border: 2px solid rgb(137,166,191); border-radius: 20px; padding: 10px; background-color: rgb(219,238,244)">
                            <p><span style="color: black; font-weight:bold">Thông tin tài khoản</span></p>
                            <ul>
                                <li><p><span style="color: black">Tên đăng nhập: ${content.gmail}</span></p></li>
                                <li><p><span style="color: black">Mật khẩu: ${content.password}</span></p></li>
                            </ul>
                        </div>
                        <p><span style="color: black">Bạn hãy đăng nhập ${api.login_url} bằng tài khoản nêu trên.</p>
                        <p><span style="color: black">Trân trọng!</p>
                    </div>
                    <hr/>
                        <p><span style="color: black"><span style="font-weight:bold">CHƯƠNG TRÌNH ĐƯỢC XÂY DỰNG VÀ PHÁT TRIỂN BỞI</span><br/>
                        CÔNG TY CỔ PHẦN GIÁO DỤC VÀ CÔNG NGHỆ TRI THỨC VIỆT<br/>
                        Địa chỉ: Số 7, Ngõ 210 Hoàng Quốc Việt, Cổ Nhuế 1, Bắc Từ Liêm, Hà Nội.<br/>
                        Điện thoại: 0968.958.680<br/>
                        Email: Trithucviet.hsa@gmail.com</span></p>
                </div>`,
            };
        } else if (option == 4) {
            mailOptions = {
                from: `TRUNG TÂM LUYỆN THI QUỐC GIA CTT<${process.env.MAIL_FROM}>`,
                to: content.gmail,
                subject: 'THANH TOÁN HÓA ĐƠN',
                sender: process.env.MAIL_SENDER,
                text: '',
                html: `
                `,
            };
        } else if (option == 5) {
            const d=new Date(content.ngay);
            mailOptions = {
                from: `TRUNG TÂM LUYỆN THI QUỐC GIA CTT<${process.env.MAIL_FROM}>`,
                to: content.gmail,
                subject: `TÀI KHOẢN LUYỆN THI`,
                sender: process.env.MAIL_SENDER,
                text: '',
                html: `
                <div style="max-width: 900px">
                    <img style="max-width:100%; height:auto" style="max-width:100%; height:auto" src="https://luyenthiquocgia.edu.vn/wp-content/uploads/2023/09/e803d5fc604eb510ec5f.png"></img>
                    <div>
                        <p><span style="color: black">Xin chào bạn ${content.ho_ten}!</span></p>
                        <p><span style="color: black">Tài khoản Luyện thi của bạn trên hệ thống trên hệ thống ôn thi Đánh giá năng lực ĐHQGHN của Trung tâm CT&T https://luyenthiquocgia.edu.vn/ đã được kích hoạt.</p>
                        <div style="border: 2px solid rgb(137,166,191); border-radius: 20px; padding: 10px; background-color: rgb(219,238,244)">
                            <p><span style="color: black; font-weight:bold">Thông tin khóa học</span></p>
                            <ul>
                                <li><p><span style="color: black">Tên khóa học: ${content.ten_khoa_hoc}</span></p></li>
                                <li><p><span style="color: black">Mã đơn hàng: #${content.ma_hoa_don}</span></p></li>
                                <li><p><span style="color: black">Ngày: ${d.getDay()}/${d.getMonth()}/${d.getFullYear()}</span></p></li>
                                <li><p><span style="color: black">Tổng cộng: (VND) ${content.tong_tien.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}</span></p></li>
                            </ul>
                        </div>
                        <p><span style="color: black">Bạn hãy đăng nhập ${api.login_url} bằng tài khoản để bắt đầu học tập theo lộ trình.</p>
                        <p><span style="color: black">Trân trọng!</p>
                    </div>
                    <hr/>
                        <p><span style="color: black"><span style="font-weight:bold">CHƯƠNG TRÌNH ĐƯỢC XÂY DỰNG VÀ PHÁT TRIỂN BỞI</span><br/>
                            CÔNG TY CỔ PHẦN GIÁO DỤC VÀ CÔNG NGHỆ TRI THỨC VIỆT<br/>
                            Địa chỉ: Số 7, Ngõ 210 Hoàng Quốc Việt, Cổ Nhuế 1, Bắc Từ Liêm, Hà Nội.<br/>
                            Điện thoại: 0968.958.680<br/>
                            Email: Trithucviet.hsa@gmail.com</span></p>
                </div>`,
            };
        } else if (option==6){
            mailOptions = {
                from: 'BAN TỔ CHỨC CUỘC THI TÀI NĂNG ANH NGỮ THỦ ĐÔ<support@luyenthiquocgia.edu.vn>',
                to: content.gmail,
                subject: 'THÔNG BÁO KÍCH HOẠT TÀI KHOẢN',
                sender: process.env.MAIL_SENDER,
                text: '',
                html: `
                <div style="max-width: 900px">
                    <img style="max-width:100%; height:auto" src="https://www.tainangtienganhthudo.vn/source/files/logo-web.png"></img>
                    <div>
                        <p><span style="color: black">Xin chào bạn ${content.ho_ten}!</span></p>
                        <p><span style="color: black">Chào mừng bạn đến với cuộc thi Tài Năng Anh Ngữ Thủ Đô.</p>
                        <p><span style="color: black">Bạn vừa đăng kí tài khoản Cuộc thi Tài năng Anh ngữ lần thứ VII năm 2023 thành công</span></p>
                        <p><span style="color: black">Cuộc thi Tài năng Anh ngữ lần thứ VII (The English Talent Contest) do Đoàn TNCS Hồ Chí Minh - Hội sinh viên Việt Nam Thành Phố Hà Nội và Hệ thống Anh ngữ ICE IELTS phối hợp tổ chức, nhằm tìm kiếm và tôn vinh những tài năng tiếng Anh, góp phần thúc đẩy phong trào học ngoại ngữ; đồng thời giúp cho học sinh, sinh viên, phụ huynh, giáo viên, nhà quản lý giáo dục đánh giá đúng thực chất việc dạy, học và năng lực tiếng Anh của học sinh, sinh viên theo tiêu chuẩn Quốc tế.
                        Cuộc thi tạo cơ hội cho Đoàn viên, thanh niên thành phố Hà Nội nâng cao trình độ ngoại ngữ, trang bị kỹ năng hội nhập quốc tế, phát triển sự nghiệp làm quen với định dạng bài thi tiếng Anh quốc tế IELTS</span></p>
                        <p><span style="color: black">Để hoàn tất xác thực email vui lòng Click vào đây: <a style="font-style:italic" href="${api.be_url}/auth/confirm/v2/${content.token}">Xác thực email</a></p>
                        <p><span style="color: black">Mật khẩu: ${content.password}</span></p>
                        <p><span style="color: black">Trân trọng!</p>
                    </div>
                    <hr/>
                    <p><span style="color: black"><span style="font-weight:bold">THÔNG TIN LIÊN HỆ, TRAO ĐỔI LIÊN QUAN TỚI CUỘC THI:</span><br/>
                        Website: https://www.tainangtienganhthudo.vn/   Email: etc.thudo@gmail.com<br/>
                        Fanpage: www.facebook.com/Etcthudo<br/>
                        Youtube: https://www.youtube.com/@TheEnglishTalentContest/featured<br/>
                        Hotline: 0963.499.365/ 033.905.1197<br/>
                        Cuộc thi Tài năng Anh ngữ lần thứ VII năm 2023 sẽ được tổ chức từ tháng 4/2023 đến tháng 06/2023 trên phạm vi toàn thành phố Hà Nội.</span></p>
                </div>`,
            };
        }
        await transport.sendMail(mailOptions);
    } catch (error) {
        console.log('error: ' + error.message);
    }
};

module.exports = sendMail;

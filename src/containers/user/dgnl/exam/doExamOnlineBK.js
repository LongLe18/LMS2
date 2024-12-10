import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Row, Progress, Tooltip, Tag, Space, Image, Col, Input, Checkbox } from 'antd';
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import { BookOutlined } from '@ant-design/icons';
import { getAnswerCols, secondsToMinutes } from 'helpers/common.helper';
import './css/ExamDetailDGTD.scss';
import MathJax from 'react-mathjax';
import config from '../../../../configs/index';

const { Header, Sider, Content } = Layout;

const cau_hoi_de_this = [
    {
        "chdt_id": 220171,
        "phan": 2,
        "cau_hoi_id": 19700,
        "de_thi_id": 2663,
        "chuyen_nganh_id": 7,
        "nguoi_tao": null,
        "ngay_tao": "2024-11-09T20:56:14.000Z",
        "nguoi_sua": null,
        "ngay_sua": "2024-11-09T20:56:14.000Z",
        "cau_hoi": {
            "cau_hoi_id": 19748,
            "noi_dung": "Đoạn trích sau được kể từ điểm nhìn trần thuật từ ai?\n<em>Bây giờ thì hắn đã thành mõ hẳn rồi</em>.<em> Một thẳng mõ đủ tư cách mõ, chẳng chịu kém những anh mõ chính tông một tí gì: cũng đê tiện, cũng lầy là, cũng tham ăn</em>.<em> Hơi thấy nhà nào lách cách mâm bát là hắn đến ngay</em>.<em> Hắn ngồi tít ngoài xa, ngay chỗ cổng vào</em>.<em> Người ta bưng cho một mình hắn một mâm</em>.<em> Hắn trơ tráo ngồi ăn</em>.<em> Ăn xong, còn thừa bao nhiêu, hộn tất cả vào, lấy lá đùm thành một đùm to bằng cái vế đùi, để đem về cho vợ, cho con</em>.<em> Có khi hắn còn sán đến những chỗ người ta thái thịt, dỡ xôi, lấy cắp hoặc xin thêm một đùm to nữa</em>.<em> Hắn bỏ cả hai đùm vào cái tay nải rất to, lần đi ăn cỗ nào hắn cũng đem theo</em>.<em> Thế rồi một tay xách tay nải, một tay chống ba toong, hắn ra về, mặt đỏ gay vì rượu, và trầu, đầy vẻ phè phỡn và hể hả…</em>\n(Trích <em>Tư cách mõ</em> - Nam Cao, in trong “Nam Cao – Tác phẩm”, tập 1, NXB Văn học, Hà Nội, 1977)",
            "loai_cau_hoi": 1,
            "diem": "1.00",
            "loi_giai": "<b>Chọn </b>C\nĐoạn trích được viết từ điểm nhìn của tác giả - người kể chuyện.",
            "cot_tren_hang": 1,
            "trich_doan_id": null,
            "mdch_id": null,
            "chuyen_de_id": null,
            "mo_dun_id": null,
            "de_thi_id": 1631,
            "kct_id": 1,
            "chuyen_nganh_id": 7,
            "nguoi_tao": null,
            "ngay_tao": "2024-08-29T12:32:06.000Z",
            "nguoi_sua": null,
            "ngay_sua": "2024-08-29T12:32:06.000Z",
            "dap_ans": [
                {
                    "dap_an_id": 21530,
                    "noi_dung_dap_an": "Nhân vật mõ",
                    "dap_an_dung": false,
                    "cau_hoi_id": 19748,
                    "de_thi_id": 1631,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-29T12:32:06.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-29T12:32:06.000Z"
                },
                {
                    "dap_an_id": 21531,
                    "noi_dung_dap_an": "Dân làng",
                    "dap_an_dung": false,
                    "cau_hoi_id": 19748,
                    "de_thi_id": 1631,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-29T12:32:06.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-29T12:32:06.000Z"
                },
                {
                    "dap_an_id": 21532,
                    "noi_dung_dap_an": "Người kể chuyện",
                    "dap_an_dung": true,
                    "cau_hoi_id": 19748,
                    "de_thi_id": 1631,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-29T12:32:06.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-29T12:32:06.000Z"
                },
                {
                    "dap_an_id": 21533,
                    "noi_dung_dap_an": "Nhân vật vợ mõ",
                    "dap_an_dung": false,
                    "cau_hoi_id": 19748,
                    "de_thi_id": 1631,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-29T12:32:06.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-29T12:32:06.000Z"
                }
            ],
            "trich_doan": null,
            "dap_an_dungs": [
                2
            ]
        }
    },
    {
        "chdt_id": 220203,
        "phan": 2,
        "cau_hoi_id": 19703,
        "de_thi_id": 2663,
        "chuyen_nganh_id": 7,
        "nguoi_tao": null,
        "ngay_tao": "2024-11-09T20:56:14.000Z",
        "nguoi_sua": null,
        "ngay_sua": "2024-11-09T20:56:14.000Z",
        "cau_hoi": {
            "cau_hoi_id": 19703,
            "noi_dung": "Câu nào sau đây <b>KHÔNG</b> nêu đúng đặc điểm của thần thoại được thể hiện trong văn bản trên?",
            "loai_cau_hoi": 1,
            "diem": "1.00",
            "loi_giai": "<b>Chọn</b><b> A</b>\n<b>Phản ánh các sự kiện, biến cố lớn trong đời sống cộng đồng cư dân cổ đại</b> là đặc điểm của thể loại sử thi.",
            "cot_tren_hang": 1,
            "trich_doan_id": 561,
            "mdch_id": null,
            "chuyen_de_id": null,
            "mo_dun_id": null,
            "de_thi_id": 1631,
            "exceprtFrom": 1,
            "exceprtTo": 2,
            "kct_id": 1,
            "chuyen_nganh_id": 7,
            "nguoi_tao": null,
            "ngay_tao": "2024-08-29T12:32:05.000Z",
            "nguoi_sua": null,
            "ngay_sua": "2024-08-29T12:32:05.000Z",
            "dap_ans": [
                {
                    "dap_an_id": 21350,
                    "noi_dung_dap_an": "Truyện phản ánh các sự kiện, biến cố lớn trong đời sống cộng đồng cư dân cổ đại.",
                    "dap_an_dung": true,
                    "cau_hoi_id": 19703,
                    "de_thi_id": 1631,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-29T12:32:05.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-29T12:32:05.000Z"
                },
                {
                    "dap_an_id": 21351,
                    "noi_dung_dap_an": "Nhân vật trung tâm là các vị thần, những nhân vật sáng tạo ra thế giới.",
                    "dap_an_dung": false,
                    "cau_hoi_id": 19703,
                    "de_thi_id": 1631,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-29T12:32:05.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-29T12:32:05.000Z"
                },
                {
                    "dap_an_id": 21352,
                    "noi_dung_dap_an": "Truyện có nhiều chi tiết kì ảo, thể hiện cách lí giải của con người về các hiện tượng tự nhiên.",
                    "dap_an_dung": false,
                    "cau_hoi_id": 19703,
                    "de_thi_id": 1631,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-29T12:32:05.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-29T12:32:05.000Z"
                },
                {
                    "dap_an_id": 21353,
                    "noi_dung_dap_an": "Không gian trong truyện là vũ trụ nguyên sơ, bao la với các cõi liên thông.",
                    "dap_an_dung": false,
                    "cau_hoi_id": 19703,
                    "de_thi_id": 1631,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-29T12:32:05.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-29T12:32:05.000Z"
                }
            ],
            "trich_doan": {
                "trich_doan_id": 561,
                "noi_dung": "\r\n<em>Chuyện kể rằng, xưa kia khi thần Dớt sáng tạo ra loài người, sáng tạo rồi nhưng thần Dớt lại không ban cho một đặc ân gì hết để họ có thể dùng làm vũ khí bảo vệ giống nòi</em>.<em> Họ sống trần trụi trong một cuộc sống tối tăm, hoang dại với biết bao nỗi hiểm nguy đe dọa họ từng phút từng giờ</em>.<em> […]</em>\r\n<em>Bữa kia, nhân vụ phân xử một cuộc tranh chấp giữa các vị thần bất tử và loài người đoản mệnh ở Mê-cô-nê, Prô-mê-tê với trái tim ưu ái đối với loài người đã chọn một con bò to béo giết thịt để dâng các vị thần và ban cho loài người. Vốn yêu quý loài người và không ưa gì thần Dớt, Prô-mê-tê đã chia thịt ra làm hai phần. Một phần là bộ lòng và những miếng thịt ngon Prô-mê-tê đem bọc lại trong một mảnh da xấu xí. Còn một phần là những miếng xương ngắn, xẩu dài, gân dai, bạc nhạc, thần đem bọc lại trong một lớp mỡ béo ngon lành. Và Prô-mê-tê kính cẩn dâng cả hai phần lên để cho Dớt lựa chọn. Dớt chẳng nghi ngờ gì, chọn ngay phần mỡ béo bọc ngoài vì nó hấp dẫn hơn cả. Nhưng hỡi ôi! Khi mở ra thì bên trong toàn là xương xẩu chẳng có lấy một miếng thịt nào. Dớt tức uất lên tận cổ song đành ngậm đắng nuốt cay. Nhưng cũng vì thế mà trong trái tim của vị thần này bùng lên một nỗi căm tức, thù địch đối với Prô-mê-tê và loài người. […] “Loài người là cái gì mà Prô-mê-tê lại quan tâm, chăm sóc chúng đến như thế? Đã thế ta sẽ không ban cho chúng ngọn lửa thiêng liêng nữa. Ta sẽ chẳng lấy cây tần bì làm đuốc, đốt cháy lên ngọn lửa hồng không mệt mỏi để trao cho chúng nữa. Để xem xem chúng sẽ sống ra sao và Prô-mê-tê liệu có cứu chúng khỏi họa tuyệt diệt không nào!”. Dớt nghĩ thế và làm như thế. Nhưng Prô-mê-tê đã đoán được ý đồ của Dớt bởi vì thần vốn là người tiên đoán được mọi việc. Và lập tức Prô-mê-tê lấy ngọn lửa thiêng liêng của thiên đình ủ kín vào trong lớp ruột xốp khô của một loài cây sậy đem xuống trần trao cho loài người. Bằng cách ấy Prô-mê-tê đã đem “tia lửa giống” băng qua bầu trời xuống trần mà Dớt không hay không biết. […] Dớt biết thôi thế là mưu đồ của mình đã bị Prô-mê-tê phá vỡ</em>.\r\n(Nguyễn Văn Khỏa sưu tầm, <em>Thần thoại Hy Lạp</em>, NXB Văn học, Hà Nội, 2014, trang 66 – 67)\r\n",
                "tep_dinh_kem": null,
                "loai_trich_doan_id": 1,
                "nguoi_tao": null,
                "ngay_tao": "2024-08-29T12:32:04.000Z",
                "nguoi_sua": null,
                "ngay_sua": "2024-09-17T15:47:19.000Z",
                "loai_trich_doan": {
                    "loai_trich_doan_id": 1,
                    "noi_dung": "Đọc đoạn trích sau đây và trả lời các câu hỏi từ",
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-26T00:25:30.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-26T00:25:30.000Z"
                }
            },
            "dap_an_dungs": [
                0
            ]
        }
    },
    {
        "chdt_id": 220204,
        "phan": 2,
        "cau_hoi_id": 19706,
        "de_thi_id": 2663,
        "chuyen_nganh_id": 7,
        "nguoi_tao": null,
        "ngay_tao": "2024-11-09T20:56:14.000Z",
        "nguoi_sua": null,
        "ngay_sua": "2024-11-09T20:56:14.000Z",
        "cau_hoi": {
            "cau_hoi_id": 19706,
            "noi_dung": "Cho câu trong văn bản: <em>“Dớt biết thôi thế là mưu đồ của mình đã bị Prô-mê-tê phá vỡ”</em>. Có thể thay từ “mưu đồ” trong câu trên bằng từ nào?",
            "loai_cau_hoi": 1,
            "diem": "1.00",
            "loi_giai": "<b>Chọn</b> C\nTừ “mưu kế” đồng nghĩa và cùng sắc thái biểu cảm với từ “mưu đồ”",
            "cot_tren_hang": 1,
            "trich_doan_id": 561,
            "mdch_id": null,
            "chuyen_de_id": null,
            "mo_dun_id": null,
            "de_thi_id": 1631,
            "kct_id": 1,
            "chuyen_nganh_id": 7,
            "nguoi_tao": null,
            "ngay_tao": "2024-08-29T12:32:05.000Z",
            "nguoi_sua": null,
            "ngay_sua": "2024-08-29T12:32:05.000Z",
            "dap_ans": [
                {
                    "dap_an_id": 21362,
                    "noi_dung_dap_an": "Mưu trí",
                    "dap_an_dung": false,
                    "cau_hoi_id": 19706,
                    "de_thi_id": 1631,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-29T12:32:05.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-29T12:32:05.000Z"
                },
                {
                    "dap_an_id": 21363,
                    "noi_dung_dap_an": "Mưu lược",
                    "dap_an_dung": false,
                    "cau_hoi_id": 19706,
                    "de_thi_id": 1631,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-29T12:32:05.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-29T12:32:05.000Z"
                },
                {
                    "dap_an_id": 21364,
                    "noi_dung_dap_an": "Mưu kế",
                    "dap_an_dung": true,
                    "cau_hoi_id": 19706,
                    "de_thi_id": 1631,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-29T12:32:05.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-29T12:32:05.000Z"
                },
                {
                    "dap_an_id": 21365,
                    "noi_dung_dap_an": "Mưu cầu",
                    "dap_an_dung": false,
                    "cau_hoi_id": 19706,
                    "de_thi_id": 1631,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-29T12:32:05.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-29T12:32:05.000Z"
                }
            ],
            "trich_doan": {
                "trich_doan_id": 561,
                "noi_dung": "\r\n<em>Chuyện kể rằng, xưa kia khi thần Dớt sáng tạo ra loài người, sáng tạo rồi nhưng thần Dớt lại không ban cho một đặc ân gì hết để họ có thể dùng làm vũ khí bảo vệ giống nòi</em>.<em> Họ sống trần trụi trong một cuộc sống tối tăm, hoang dại với biết bao nỗi hiểm nguy đe dọa họ từng phút từng giờ</em>.<em> […]</em>\r\n<em>Bữa kia, nhân vụ phân xử một cuộc tranh chấp giữa các vị thần bất tử và loài người đoản mệnh ở Mê-cô-nê, Prô-mê-tê với trái tim ưu ái đối với loài người đã chọn một con bò to béo giết thịt để dâng các vị thần và ban cho loài người. Vốn yêu quý loài người và không ưa gì thần Dớt, Prô-mê-tê đã chia thịt ra làm hai phần. Một phần là bộ lòng và những miếng thịt ngon Prô-mê-tê đem bọc lại trong một mảnh da xấu xí. Còn một phần là những miếng xương ngắn, xẩu dài, gân dai, bạc nhạc, thần đem bọc lại trong một lớp mỡ béo ngon lành. Và Prô-mê-tê kính cẩn dâng cả hai phần lên để cho Dớt lựa chọn. Dớt chẳng nghi ngờ gì, chọn ngay phần mỡ béo bọc ngoài vì nó hấp dẫn hơn cả. Nhưng hỡi ôi! Khi mở ra thì bên trong toàn là xương xẩu chẳng có lấy một miếng thịt nào. Dớt tức uất lên tận cổ song đành ngậm đắng nuốt cay. Nhưng cũng vì thế mà trong trái tim của vị thần này bùng lên một nỗi căm tức, thù địch đối với Prô-mê-tê và loài người. […] “Loài người là cái gì mà Prô-mê-tê lại quan tâm, chăm sóc chúng đến như thế? Đã thế ta sẽ không ban cho chúng ngọn lửa thiêng liêng nữa. Ta sẽ chẳng lấy cây tần bì làm đuốc, đốt cháy lên ngọn lửa hồng không mệt mỏi để trao cho chúng nữa. Để xem xem chúng sẽ sống ra sao và Prô-mê-tê liệu có cứu chúng khỏi họa tuyệt diệt không nào!”. Dớt nghĩ thế và làm như thế. Nhưng Prô-mê-tê đã đoán được ý đồ của Dớt bởi vì thần vốn là người tiên đoán được mọi việc. Và lập tức Prô-mê-tê lấy ngọn lửa thiêng liêng của thiên đình ủ kín vào trong lớp ruột xốp khô của một loài cây sậy đem xuống trần trao cho loài người. Bằng cách ấy Prô-mê-tê đã đem “tia lửa giống” băng qua bầu trời xuống trần mà Dớt không hay không biết. […] Dớt biết thôi thế là mưu đồ của mình đã bị Prô-mê-tê phá vỡ</em>.\r\n(Nguyễn Văn Khỏa sưu tầm, <em>Thần thoại Hy Lạp</em>, NXB Văn học, Hà Nội, 2014, trang 66 – 67)\r\n",
                "tep_dinh_kem": null,
                "loai_trich_doan_id": 1,
                "nguoi_tao": null,
                "ngay_tao": "2024-08-29T12:32:04.000Z",
                "nguoi_sua": null,
                "ngay_sua": "2024-09-17T15:47:19.000Z",
                "loai_trich_doan": {
                    "loai_trich_doan_id": 1,
                    "noi_dung": "Đọc đoạn trích sau đây và trả lời các câu hỏi từ",
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-26T00:25:30.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-26T00:25:30.000Z"
                }
            },
            "dap_an_dungs": [
                2
            ]
        }
    },
    {
        "chdt_id": 220190,
        "phan": 2,
        "cau_hoi_id": 19390,
        "de_thi_id": 2663,
        "chuyen_nganh_id": 7,
        "nguoi_tao": null,
        "ngay_tao": "2024-11-09T20:56:14.000Z",
        "nguoi_sua": null,
        "ngay_sua": "2024-11-09T20:56:14.000Z",
        "cau_hoi": {
            "cau_hoi_id": 19748,
            "noi_dung": "Cho hàm số y = f(x) có đồ thị là đường cong ở hình trên",
            "lua_chon": ['Tylototriton ngoclinhensis', 'Rhacophorus dennysi', 'Paramesotriton deloustali'], // tag lựa chọn để kéo thả
            "loai_cau_hoi": 3, // kéo thả
            "diem": "1.00",
            "loi_giai": "<b>Chọn </b>C\nĐoạn trích được viết từ điểm nhìn của tác giả - người kể chuyện.",
            "cot_tren_hang": 1,
            "trich_doan_id": null,
            "mdch_id": null,
            "chuyen_de_id": null,
            "mo_dun_id": null,
            "de_thi_id": 1631,
            "kct_id": 1,
            "chuyen_nganh_id": 7,
            "nguoi_tao": null,
            "ngay_tao": "2024-08-29T12:32:06.000Z",
            "nguoi_sua": null,
            "ngay_sua": "2024-08-29T12:32:06.000Z",
            "dap_ans": ["Loài ... có họ hàng gần nhất với loài ếch giun đông dương Ichthyophis kohtaoensis", 'Hàm số có ... điểm cực trị'],
            "trich_doan": null,
            "dap_an_dungs": [
                'Tylototriton ngoclinhensis', 'Rhacophorus dennysi'
            ]
        }
    },
    {
        "chdt_id": 220108,
        "phan": 1,
        "cau_hoi_id": 19792,
        "de_thi_id": 2663,
        "chuyen_nganh_id": 1,
        "nguoi_tao": null,
        "ngay_tao": "2024-11-09T20:56:14.000Z",
        "nguoi_sua": null,
        "ngay_sua": "2024-11-09T20:56:14.000Z",
        "cau_hoi": {
            "cau_hoi_id": 19792,
            "noi_dung": "Cho hộp đựng bóng tennis hình trụ chứa ... 4 quả bóng tennis sao cho các quả bóng trong hộp tiếp xúc nhau và tiếp xúc với thành hộp. Tính thể tích của hộp đựng bóng đó <em>(theo đơn vị </em>$c{{m}^{3}}$<em> và được </em><em>làm tròn đến </em><em>hàng phần trăm</em><em>)</em> biết bán kính của một quả bóng là $6,25cm$, coi độ dày thành hộp là không đáng kể.",
            "loai_cau_hoi": 0,
            "diem": "1.00",
            "loi_giai": "Ta có: $\\left\\{\\begin{align}  & {{R}_{bong}}={{R}_{tru}}=6,25cm \\\\  & {{h}_{tru}}=8R=50cm \\\\ \\end{align} \\right.$ $\\Rightarrow \\left\\{\\begin{align}  & {{V}_{tru}}=\\pi.R_{tru}^{2}.{{h}_{tru}}=1953,125\\pi \\left( c{{m}^{3}} \\right) \\\\  & {{V}_{bong}}=4.\\dfrac{4}{3}\\pi.6,{{25}^{3}}=1302,084\\pi \\left( c{{m}^{3}} \\right) \\\\ \\end{align} \\right.$\nKhi đó thể tích cần tìm là $V={{V}_{tru}}-{{V}_{bong}}\\approx 2045,31\\left( c{{m}^{3}} \\right)$.",
            "cot_tren_hang": 1,
            "trich_doan_id": null,
            "mdch_id": null,
            "chuyen_de_id": null,
            "mo_dun_id": null,
            "de_thi_id": 1631,
            "kct_id": 1,
            "chuyen_nganh_id": 1,
            "nguoi_tao": null,
            "ngay_tao": "2024-08-29T12:56:52.000Z",
            "nguoi_sua": null,
            "ngay_sua": "2024-08-29T12:56:52.000Z",
            "dap_ans": [
                {
                    "dap_an_id": 21691,
                    "noi_dung_dap_an": "<b>2045,31</b>",
                    "dap_an_dung": true,
                    "cau_hoi_id": 19792,
                    "de_thi_id": 1631,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-29T12:56:52.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-29T12:56:52.000Z"
                }
            ],
            "trich_doan": null,
            "dap_an_dungs": [
                0
            ]
        }
    },
    {
        "chdt_id": 220527,
        "phan": 1,
        "cau_hoi_id": 30443,
        "de_thi_id": 2673,
        "chuyen_nganh_id": 1,
        "nguoi_tao": null,
        "ngay_tao": "2024-11-22T12:09:53.000Z",
        "nguoi_sua": null,
        "ngay_sua": "2024-11-23T14:00:26.000Z",
        "cau_hoi": {
            "cau_hoi_id": 30443,
            "noi_dung": "<span style=\"color: rgb(206, 145, 120);\">Cho câu trong văn bản: </span><em style=\"color: rgb(206, 145, 120);\">“Dớt biết thôi thế là mưu đồ của mình đã bị Prô-mê-tê phá vỡ” </em>thể thay từ “mưu đồ” trong câu trên bằng từ nào?\r\n",
            "loai_cau_hoi": 2,
            "diem": "1.00",
            "loi_giai": "test\r\n",
            "cot_tren_hang": 1,
            "trich_doan_id": null,
            "mdch_id": 1,
            "chuyen_de_id": null,
            "mo_dun_id": null,
            "de_thi_id": null,
            "kct_id": null,
            "chuyen_nganh_id": 1,
            "nguoi_tao": null,
            "ngay_tao": "2024-11-23T13:38:18.000Z",
            "nguoi_sua": null,
            "ngay_sua": "2024-11-23T13:38:18.000Z",
            "dap_ans": [
                {
                    "dap_an_id": 59642,
                    "noi_dung_dap_an": "A\r\n",
                    "dap_an_dung": true,
                    "cau_hoi_id": 30443,
                    "de_thi_id": null,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-11-23T13:38:19.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-11-23T13:38:19.000Z"
                },
                {
                    "dap_an_id": 59643,
                    "noi_dung_dap_an": "B\r\n",
                    "dap_an_dung": true,
                    "cau_hoi_id": 30443,
                    "de_thi_id": null,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-11-23T13:38:19.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-11-23T13:38:19.000Z"
                },
                {
                    "dap_an_id": 59644,
                    "noi_dung_dap_an": "C\r\n",
                    "dap_an_dung": false,
                    "cau_hoi_id": 30443,
                    "de_thi_id": null,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-11-23T13:38:19.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-11-23T13:38:19.000Z"
                },
                {
                    "dap_an_id": 59645,
                    "noi_dung_dap_an": "D\r\n",
                    "dap_an_dung": false,
                    "cau_hoi_id": 30443,
                    "de_thi_id": null,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-11-23T13:38:19.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-11-23T13:38:19.000Z"
                }
            ],
            "trich_doan": null,
            "dap_an_dungs": [
                0,
                1
            ]
        }
    },
    {
        "chdt_id": 220527,
        "phan": 1,
        "cau_hoi_id": 30543,
        "de_thi_id": 2673,
        "chuyen_nganh_id": 1,
        "nguoi_tao": null,
        "ngay_tao": "2024-11-22T12:09:53.000Z",
        "nguoi_sua": null,
        "ngay_sua": "2024-11-23T14:00:26.000Z",
        "cau_hoi": {
            "cau_hoi_id": 30443,
            "noi_dung": "<span style=\"color: rgb(206, 145, 120);\">Cho câu trong văn bản: </span><em style=\"color: rgb(206, 145, 120);\">“Dớt biết thôi thế là mưu đồ của mình đã bị Prô-mê-tê phá vỡ” </em>thể thay từ “mưu đồ” trong câu trên bằng từ nào?\r\n",
            "loai_cau_hoi": 4,
            "diem": "1.00",
            "loi_giai": "test\r\n",
            "cot_tren_hang": 1,
            "trich_doan_id": null,
            "mdch_id": 1,
            "chuyen_de_id": null,
            "mo_dun_id": null,
            "de_thi_id": null,
            "kct_id": null,
            "chuyen_nganh_id": 1,
            "nguoi_tao": null,
            "ngay_tao": "2024-11-23T13:38:18.000Z",
            "nguoi_sua": null,
            "ngay_sua": "2024-11-23T13:38:18.000Z",
            "dap_ans": [
                {
                    "dap_an_id": 59642,
                    "noi_dung_dap_an": "A\r\n",
                    "dap_an_dung": true,
                    "cau_hoi_id": 30443,
                    "de_thi_id": null,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-11-23T13:38:19.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-11-23T13:38:19.000Z"
                },
                {
                    "dap_an_id": 59643,
                    "noi_dung_dap_an": "B\r\n",
                    "dap_an_dung": true,
                    "cau_hoi_id": 30443,
                    "de_thi_id": null,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-11-23T13:38:19.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-11-23T13:38:19.000Z"
                },
                {
                    "dap_an_id": 59644,
                    "noi_dung_dap_an": "C\r\n",
                    "dap_an_dung": false,
                    "cau_hoi_id": 30443,
                    "de_thi_id": null,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-11-23T13:38:19.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-11-23T13:38:19.000Z"
                },
                {
                    "dap_an_id": 59645,
                    "noi_dung_dap_an": "D\r\n",
                    "dap_an_dung": false,
                    "cau_hoi_id": 30443,
                    "de_thi_id": null,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-11-23T13:38:19.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-11-23T13:38:19.000Z"
                }
            ],
            "trich_doan": null,
            "dap_an_dungs": [
                0,
                1
            ]
        }
    },
    {
        "chdt_id": 220204,
        "phan": 2,
        "cau_hoi_id": 100,
        "de_thi_id": 2663,
        "chuyen_nganh_id": 7,
        "nguoi_tao": null,
        "ngay_tao": "2024-11-09T20:56:14.000Z",
        "nguoi_sua": null,
        "ngay_sua": "2024-11-09T20:56:14.000Z",
        "cau_hoi": {
            "cau_hoi_id": 100,
            "noi_dung": "Cho câu trong văn bản: <em>“Dớt biết thôi thế là mưu đồ của mình đã bị Prô-mê-tê phá vỡ”</em>. Có thể thay từ “mưu đồ” trong câu trên bằng từ nào?",
            "loai_cau_hoi": 1,
            "diem": "1.00",
            "loi_giai": "<b>Chọn</b> C\nTừ “mưu kế” đồng nghĩa và cùng sắc thái biểu cảm với từ “mưu đồ”",
            "cot_tren_hang": 1,
            "trich_doan_id": 562,
            "exceprtTo": 9,
            "exceprtFrom": 8,
            "mdch_id": null,
            "chuyen_de_id": null,
            "mo_dun_id": null,
            "de_thi_id": 1631,
            "kct_id": 1,
            "chuyen_nganh_id": 7,
            "nguoi_tao": null,
            "ngay_tao": "2024-08-29T12:32:05.000Z",
            "nguoi_sua": null,
            "ngay_sua": "2024-08-29T12:32:05.000Z",
            "dap_ans": [
                {
                    "dap_an_id": 21362,
                    "noi_dung_dap_an": "Mưu trí",
                    "dap_an_dung": false,
                    "cau_hoi_id": 100,
                    "de_thi_id": 1631,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-29T12:32:05.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-29T12:32:05.000Z"
                },
                {
                    "dap_an_id": 21363,
                    "noi_dung_dap_an": "Mưu lược",
                    "dap_an_dung": false,
                    "cau_hoi_id": 100,
                    "de_thi_id": 1631,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-29T12:32:05.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-29T12:32:05.000Z"
                },
                {
                    "dap_an_id": 21364,
                    "noi_dung_dap_an": "Mưu kế",
                    "dap_an_dung": true,
                    "cau_hoi_id": 100,
                    "de_thi_id": 1631,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-29T12:32:05.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-29T12:32:05.000Z"
                },
                {
                    "dap_an_id": 21365,
                    "noi_dung_dap_an": "Mưu cầu",
                    "dap_an_dung": false,
                    "cau_hoi_id": 100,
                    "de_thi_id": 1631,
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-29T12:32:05.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-29T12:32:05.000Z"
                }
            ],
            "trich_doan": {
                "trich_doan_id": 562,
                "noi_dung": "test",
                "tep_dinh_kem": null,
                "loai_trich_doan_id": 1,
                "nguoi_tao": null,
                "ngay_tao": "2024-08-29T12:32:04.000Z",
                "nguoi_sua": null,
                "ngay_sua": "2024-09-17T15:47:19.000Z",
                "loai_trich_doan": {
                    "loai_trich_doan_id": 1,
                    "noi_dung": "Đọc đoạn trích sau đây và trả lời các câu hỏi từ",
                    "nguoi_tao": null,
                    "ngay_tao": "2024-08-26T00:25:30.000Z",
                    "nguoi_sua": null,
                    "ngay_sua": "2024-08-26T00:25:30.000Z"
                }
            },
            "dap_an_dungs": [
                2
            ]
        }
    },
];

export default function ExamOnlineDetaiDGTD() {
    let answers = [];

    const regex = /\\begin{center}\\includegraphics\[scale = 0\.5\]{(.*?)}\\end{center}/;

    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [listQuestion, setListQuestion] = useState(); // danh sách câu hỏi
    const [timeLeft, setTimeLeft] = useState(60); // 60 minutes
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [isDoing, setIsDoing] = useState(true);
    const [pause, setPause] = useState(false);

    const [gaps, setGaps] = useState([
        { id: "gap-0" }, { id: "gap-1" },
        { id: "gap-2" }, { id: "gap-3" },
        { id: "gap-4" }, { id: "gap-5" },
        { id: "gap-6" }, { id: "gap-7" },
        { id: "gap-8" }, { id: "gap-9" },
        { id: "gap-10" }, { id: "gap-11" },
        { id: "gap-12" }, { id: "gap-13" },
        { id: "gap-14" }, { id: "gap-15" },
        { id: "gap-16" }, { id: "gap-17" },
        { id: "gap-18" }, { id: "gap-19" },
        { id: "gap-20" }, { id: "gap-21" },
        { id: "gap-22" }, { id: "gap-23" },
        { id: "gap-24" }, { id: "gap-25" },
    ])


    function filterAndGroupQuestions(questions) {
        const groupedQuestions = new Map();
        const groupedQuestionIds = new Set();
      
        // Iterate through each question
        questions.forEach(question => {
          const trichDoanId = question.cau_hoi.trich_doan_id;
          
          // If the trich_doan_id exists and is not null
          if (trichDoanId !== null && trichDoanId !== undefined) {
            if (!groupedQuestions.has(trichDoanId)) {
              groupedQuestions.set(trichDoanId, []);
            }
            
            groupedQuestions.get(trichDoanId).push(question);
            groupedQuestionIds.add(question.cau_hoi.cau_hoi_id);
          }
        });
      
        // Convert the Map to an array of arrays, filtering out groups with only one question
        const filteredGroups = Array.from(groupedQuestions.values()).filter(group => group.length >= 1);
      
        // Remove grouped questions from the original array
        const remainingQuestions = questions.filter(question => !groupedQuestionIds.has(question.cau_hoi.cau_hoi_id));
      
        return { filteredGroups, remainingQuestions };
    }

    useEffect(() => {
        const { filteredGroups, remainingQuestions } = filterAndGroupQuestions(cau_hoi_de_this);
        setListQuestion({ 'one': remainingQuestions, 'group': filteredGroups });
    }, []);
    
    const handleDragEnd = (result) => {
        if (!result.destination) return
    
        const { source, destination } = result
    
        if (destination.droppableId === "word-bank") {
          if (source.droppableId.startsWith("gap")) {
            setGaps((prev) =>
                prev.map((gap) =>
                    gap.id === source.droppableId ? { ...gap, userWord: undefined } : gap
                )
            )
          }
          return
        }
    
        if (destination.droppableId.startsWith("gap")) {
            let index = 0;
            if (source.index !== 0) index = 1 * source?.index;
            const word = cau_hoi_de_this.find((w) => (w.cau_hoi_id + index).toString() === result.draggableId);
            if (!word) return
    
            if (source.droppableId.startsWith("gap")) {
                setGaps((prev) =>
                    prev.map((gap) =>
                        gap.id === source.droppableId ? { ...gap, userWord: undefined } : gap
                    )
                )
            }
    
            setGaps((prev) =>
                prev.map((gap) => 
                    gap.id === destination.droppableId ? { ...gap, userWord: word?.cau_hoi?.lua_chon[source.index] } : gap
                )
            )
        }
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // hàm xử lý đánh dấu câu hỏi
    const handleMarkQuestion = () => {

    }

    const renderTitleQuestion = (question) => {
        return (
            <div className="title-exam">
                    <MathJax.Provider>
                        {question.cau_hoi?.noi_dung.split('\n').map((item, index_cauhoi) => {
                            return (
                                <div className="title-exam-content" key={index_cauhoi}>
                                    {
                                        (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                            <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}><Image src={config.API_URL + `/${item?.match(regex)[1]}`} alt={`img_question4_${index_cauhoi}`}></Image></div>
                                        ) : 
                                        (
                                            <div style={{textAlign: 'justify'}}>{item.split('$').map((item2, index2) => {
                                                return (item.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
                                                    <MathJax.Node key={index2} formula={item2} />
                                                ) : (
                                                    <span key={index2} dangerouslySetInnerHTML={{ __html: item2 }}></span>
                                                )
                                            })}</div>
                                        )
                                    }
                                </div>
                            )}
                        )}
                    </MathJax.Provider>
                </div>
        )
    }

    const renderAnswerKey = (index) => {
        if (index === 3) return 'D';
        else if (index === 2) return 'C';
        else if (index === 1) return 'B';
        else if (index === 0) return 'A'
    };

    const renderAnswer = (question, answer, index) => {
        // Render lựa chọn (A hoặc B hoặc C hoặc D)
        // Khi nộp bài => Check lựa chọn đã nộp là đúng hay sai;
        // - Đáp án đúng của câu hỏi => màu xanh
        // - Lựa chọn đúng với đáp án => màu xanh
        // - Lựa chọn sai với đáp án => màu đỏ
        let regex = /\\begin{center}\\includegraphics\[scale = 0\.5\]{(.*?)}\\end{center}/;
        let isWrong = false;
        // let currentSubmitAnswer = results.find((item) => item.cau_hoi_id === question.cau_hoi_id);
        // if (currentSubmitAnswer?.gia_tri_dap_an && question?.dap_an_dungs) {
        //     if (convertAnswer(currentSubmitAnswer?.gia_tri_dap_an)[index] !== convertAnswer(question?.dap_an_dungs)[index]) {
        //         isWrong = true;  
        //     }

        return (
            // <div className={`answer ${!isDoing && (isWrong && !answer.dap_an_dung) ? 'incorrect' : ''} ${!isDoing && answer.dap_an_dung ? 'correct' : ''}`}>
            <div className={`answer `}>
                <span className="answer-label">{renderAnswerKey(index)}</span>
                <div className="answer-content">             
                    <MathJax.Provider>
                        {answer.noi_dung_dap_an.split('\n').map((item, index_cauhoi) => {
                            return (
                                <div className="help-answer-content" key={index_cauhoi}> 
                                {
                                    (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                        <Image src={config.API_URL + `/${item.match(regex)[1]}`} alt={`img_cauhoi_${index_cauhoi}`}></Image>
                                    ) : (
                                        item.split('$').map((item2, index2) => {
                                            return (item.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
                                                <MathJax.Node key={index2} formula={item2} />
                                            ) : (
                                                <span style={{fontFamily: 'MJXc-TeX-main-R, MJXc-TeX-main-Rw'}} key={index2} dangerouslySetInnerHTML={{ __html: item2 }}></span>
                                            )
                                        })
                                    )
                                }
                                </div>
                            )}
                        )}
                    </MathJax.Provider>
                </div>
            </div>
        );
    };

    // Hàm render lựa chọn cho câu hỏi chọn được nhiều đáp án
    const renderAnswerMultipleChoice = (question, answer, index) => {
        // Khi nộp bài => Check lựa chọn đã nộp là đúng hay sai;
        // - Đáp án đúng của câu hỏi => màu xanh
        // - Lựa chọn đúng với đáp án => màu xanh
        // - Lựa chọn sai với đáp án => màu đỏ
        let regex = /\\begin{center}\\includegraphics\[scale = 0\.5\]{(.*?)}\\end{center}/;
        let isWrong = false;
        // let currentSubmitAnswer = results.find((item) => item.cau_hoi_id === question.cau_hoi_id);
        // if (currentSubmitAnswer?.gia_tri_dap_an && question?.dap_an_dungs) {
        //     if (convertAnswer(currentSubmitAnswer?.gia_tri_dap_an)[index] !== convertAnswer(question?.dap_an_dungs)[index]) {
        //         isWrong = true;  
        //     }

        return (
            // <div className={`answer ${!isDoing && (isWrong && !answer.dap_an_dung) ? 'incorrect' : ''} ${!isDoing && answer.dap_an_dung ? 'correct' : ''}`}>
            <div className={`answer `}>
                <Checkbox.Group 
                    // value={selectedAnswers}
                    // onChange={onAnswerChange}
                >
                    <Checkbox value={`${index}`}>
                        <div className="answer-content">             
                            <MathJax.Provider>
                                {answer.noi_dung_dap_an.split('\n').map((item, index_cauhoi) => {
                                    return (
                                        <div className="help-answer-content" key={index_cauhoi}> 
                                        {
                                            (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                                <Image src={config.API_URL + `/${item.match(regex)[1]}`} alt={`img_cauhoi_${index_cauhoi}`}></Image>
                                            ) : (
                                                item.split('$').map((item2, index2) => {
                                                    return (item.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
                                                        <MathJax.Node key={index2} formula={item2} />
                                                    ) : (
                                                        <span style={{fontFamily: 'MJXc-TeX-main-R, MJXc-TeX-main-Rw'}} key={index2} dangerouslySetInnerHTML={{ __html: item2 }}></span>
                                                    )
                                                })
                                            )
                                        }
                                        </div>
                                    )}
                                )}
                            </MathJax.Provider>
                        </div>
                    </Checkbox>
                </Checkbox.Group>
            </div>
        );
    };

    // Hàm UI câu hỏi kéo thả
    const questionDragAndDrop = (question, key) => {
        return (
            <>
                <div style={{fontSize: 20}}>Kéo thả các đáp án vào vị trí thích hợp:</div>
                    
                <div className='fill-box-question'>
                    <Droppable droppableId="word-bank" direction="horizontal" >
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} style={{margin: 12}}>
                                <Space wrap >
                                    {question?.cau_hoi?.lua_chon.map((lua_chon, index) => (
                                        <Draggable key={`${question?.cau_hoi_id + index}`} 
                                            draggableId={(question?.cau_hoi_id + index).toString()} index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <Tag
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`cursor-move ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                                                    color="blue"
                                                >
                                                    {lua_chon}
                                                </Tag>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </Space>
                            </div>
                        )}
                    </Droppable>

                    {question?.cau_hoi?.dap_ans?.map((dap_an, index) => {
                        const partDap_an = dap_an.split('...');
                        return (
                            <Row key={index}>
                                {
                                    partDap_an.map((dap_an, index_2) => {
                                        return (
                                            <div style={{fontSize: 18, marginBottom: 8}} key={index_2}>
                                                {dap_an.split('\n').map((item, index) => {
                                                    return (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                                        <div style={{display: 'flex', justifyContent: 'center', width: '100%'}} key={index}>
                                                            <Image src={config.API_URL + `/${item?.match(regex)[1]}`} alt={`img_question4_${index}`}></Image>
                                                        </div>
                                                    ) : 
                                                    (
                                                        <span key={index}>{item.split('$').map((item2, index2) => {
                                                            return (item.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
                                                                <MathJax.Node key={index2} formula={item2} />
                                                            ) : (
                                                                <span key={index2} dangerouslySetInnerHTML={{ __html: item2 }}></span>
                                                            )
                                                        })}</span>
                                                    )
                                                })}
                                                {index_2 < partDap_an.length - 1 && (
                                                    <Droppable droppableId={`gap-${index}`}>
                                                        {(provided, snapshot) => (
                                                            <div ref={provided.innerRef}
                                                                {...provided.droppableProps}
                                                                className={`empty-box ${
                                                                    snapshot.isDraggingOver ? 'bg-gray-50' : ''
                                                                } ${gaps[index]?.userWord ? 'border-solid border-blue-500' : ''}`}
                                                            >
                                                                {gaps[index]?.userWord && (
                                                                    <Draggable draggableId={`gap-${index}-word`} index={index}>
                                                                        {(provided) => (
                                                                            <Tag
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                className="cursor-move m-0"
                                                                                color="blue"
                                                                            >
                                                                                {gaps[index]?.userWord}
                                                                            </Tag>
                                                                        )}
                                                                    </Draggable>
                                                                )}
                                                                {provided.placeholder}
                                                            </div>
                                                        )}
                                                    </Droppable>
                                                )}
                                            </div>
                                        )
                                    })
                                }
                            </Row>
                        )
                    })}
                </div>
            </>
        )
    };

    // Hàm UI câu hỏi trắc nghiệm
    const renderChoiceQuestion = (question, key) => {
        return (
            <div className="content-answer-question">
                <Row gutter={[20, 10]} className="multi-choice" style={{rowGap: 0}}>
                    {question.cau_hoi.dap_ans.map((answer, index) => {
                        // const isAnswered = results.find((it) => it.cau_hoi_id === question.cau_hoi_id);
                        return (
                            <Col xs={24} sm={24} md={12} key={index}>
                                <ul>
                                    {/* <li className={`item ${isAnswered && isAnswered.dap_an === renderAnswerKey(index) ? 'active' : ''}`}> */}
                                    <li className={`item`}>
                                        <button style={{width:"100%"}} disabled={pause}
                                            className="btn-onClick"
                                            onClick={() => {   
                                                if (isDoing) {
                                                    // setPause(true); // Tạm dừng để ngăn chặn việc thay đổi đáp án quá nhanh
                                                    // dispatch(answerActions.getAnswersUser({ idDeThi: params.idExamUser, idQuestion: '' }, 
                                                    //     (res) => {
                                                    //         if (res.status === 'success') {
                                                    //             answers = res.data;
                                                    //             onChooseAnswer(question, renderAnswerKey(index), index, res.data)   
                                                    //         }
                                                    //     }
                                                    // ))
                                                }
                                            }}
                                        >
                                            {renderAnswer(question.cau_hoi, answer, index)}
                                        </button>
                                    </li>
                                </ul>
                            </Col>
                        )
                    })}
                </Row>
            </div>
        );
    };
    
    // Hàm UI câu hỏi tự luận
    const renderEssayQuestion = (question, key) => {
        return (
            <div className="title-exam">
                <MathJax.Provider>
                    <Row style={{fontSize: 18, marginBottom: 8}} >
                        {question.cau_hoi?.noi_dung?.split('...').map((noi_dung, idx) => {
                            const partNoiDung = question.cau_hoi?.noi_dung?.split('...');
                            return (
                                <>
                                    {noi_dung.split('\n').map((item, index) => {
                                        return (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                            <div style={{display: 'flex', justifyContent: 'center', width: '100%'}} key={index}>
                                                <Image src={config.API_URL + `/${item?.match(regex)[1]}`} alt={`img_question4_${index}`}></Image>
                                            </div>
                                        ) : 
                                        (
                                            <span key={index}>{item.split('$').map((item2, index2) => {
                                                return (item.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
                                                    <MathJax.Node key={index2} formula={item2} />
                                                ) : (
                                                    <span key={index2} dangerouslySetInnerHTML={{ __html: item2 }}></span>
                                                )
                                            })}</span>
                                        )
                                    })}
                                    {idx < partNoiDung.length - 1 && (
                                        <Input placeholder='Nhập đáp án' rows={1} style={{width:"15%", margin: 6}} disabled={!isDoing} 
                                            // defaultValue={isAnswered !== undefined ? isAnswered.noi_dung : null}
                                            onChange={(e) => {
                                                localStorage.setItem('answerText', null);
                                                localStorage.setItem('question', null);
                                                localStorage.setItem('answerText', e.target.value);
                                                localStorage.setItem('question', JSON.stringify(question));                            
                                            }
                                        }/>
                                    )}
                                </>
                            )
                        })}
                    </Row>
                </MathJax.Provider>
            </div>
        );
    };  

    // Hàm UI câu hỏi đúng sai
    const renderRightWrongQuestion = (question, key) => {
        return (
            <div className="content-answer-question">
                <Row style={{marginTop: 12}}>
                    <div className="option-answer"></div>
                    <div style={{fontWeight: 700, width: '12%', fontSize: 16}}>ĐÚNG</div>
                    <div style={{fontWeight: 700, width: '12%', fontSize: 16}}>SAI</div>
                </Row>
                <Row gutter={[20, 10]} className="multi-choice" style={{rowGap: 0}}>
                    {question.cau_hoi.dap_ans.map((answer, index) => {
                        // const isAnswered = results.find((it) => it.cau_hoi_id === question.cau_hoi_id);
                        return (
                            <Col xs={24} sm={24} md={24} key={index}>
                                <div className='wrongrightAnswer'>
                                    <div className="option-answer">
                                        <MathJax.Provider>
                                            {answer.noi_dung_dap_an.split('\n').map((item, index_cauhoi) => {
                                                return (
                                                    <div className="option-answer-content" key={index_cauhoi}>
                                                        {
                                                            (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                                                <Image src={config.API_URL + `/${item?.match(regex)[1]}`} alt={`img_question3_${index_cauhoi}`}></Image>
                                                            ) : 
                                                            (
                                                                <div style={{textAlign: 'justify'}}>{item.split('$').map((item2, index2) => {
                                                                    return (item.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
                                                                        <MathJax.Node key={index2} formula={item2} />
                                                                    ) : (
                                                                        <span dangerouslySetInnerHTML={{ __html: item2 }}></span>
                                                                    )
                                                                })}</div>
                                                            )
                                                        }
                                                    </div>
                                                )}
                                            )}
                                        </MathJax.Provider>
                                    </div>
                                    <div style={{width: '12%'}}>
                                        <button id={`button-Right-${index}`}
                                            // className={`btn-DS ${isAnswered && isAnswered.ket_qua_chon[index] === '1' ? 'active' : '' }`}
                                            className={`btn-DS`}
                                            onClick={() => {
                                                // dispatch(answerActions.getAnswersUser({ idDeThi: params.idExamUser, idQuestion: '' }, 
                                                //     (res) => {
                                                //         if (res.status === 'success') {
                                                //             answers = res.data;
                                                //             onChooseAnswer(question, renderAnswerKey(index), index, res.data)   
                                                //         }
                                                //     }
                                                // ))
                                            }}
                                        >
                                            <span className="answer-label">Đ</span>
                                        </button>
                                    </div>
                                    <div style={{width: '12%'}}>
                                        <button id={`button-Wrong-${index}`}
                                            // className={`btn-DS ${isAnswered && isAnswered.ket_qua_chon[index] === '0' ? 'active' : '' }`}
                                            className={`btn-DS`}
                                            onClick={() => {
                                                // dispatch(answerActions.getAnswersUser({ idDeThi: params.idExamUser, idQuestion: '' }, 
                                                //     (res) => {
                                                //         if (res.status === 'success') {
                                                //             answers = res.data;
                                                //             onChooseAnswer(question, renderAnswerKey(index), index, res.data);
                                                //         }
                                                //     }
                                                // ))
                                            }}
                                        >
                                            <span className="answer-label">S</span>
                                        </button>
                                    </div>
                                </div>
                            </Col>
                        )
                    })}
                </Row>
            </div>
        );
    }

    // Hàm UI câu hỏi Chọn nhiều đáp án
    const renderMultipleChoiceQuestion = (question, key) => {
        return (
            <div className="content-answer-question">
                <Row gutter={[20, 10]} className="multi-choice" style={{rowGap: 0}}>
                    {question.cau_hoi.dap_ans.map((answer, index) => {
                        // const isAnswered = results.find((it) => it.cau_hoi_id === question.cau_hoi_id);
                        return (
                            <Col xs={24} sm={24} md={getAnswerCols(question.cau_hoi.cot_tren_hang)} key={index}>
                                <ul>
                                    {/* <li className={`item ${isAnswered && isAnswered.dap_an === renderAnswerKey(index) ? 'active' : ''}`}> */}
                                    <li className={`item`}>
                                        <button style={{width:"100%"}} disabled={pause}
                                            className="btn-onClick"
                                            onClick={() => {   
                                                if (isDoing) {
                                                    // setPause(true); // Tạm dừng để ngăn chặn việc thay đổi đáp án quá nhanh
                                                    // dispatch(answerActions.getAnswersUser({ idDeThi: params.idExamUser, idQuestion: '' }, 
                                                    //     (res) => {
                                                    //         if (res.status === 'success') {
                                                    //             answers = res.data;
                                                    //             onChooseAnswer(question, renderAnswerKey(index), index, res.data)   
                                                    //         }
                                                    //     }
                                                    // ))
                                                }
                                            }}
                                        >
                                            {renderAnswerMultipleChoice(question.cau_hoi, answer, index)}
                                        </button>
                                    </li>
                                </ul>
                            </Col>
                        )
                    })}
                </Row>
            </div>
        );
    }

    // Hàm UI câu hỏi Nhóm
    const renderGroupQuestion = (group, key) => {
        return (
            <div key={key} className='card-question'
                extra={
                    <Tooltip title="Đánh dấu câu hỏi">
                        <Button shape="circle" icon={<BookOutlined />} onClick={() => handleMarkQuestion()}/>
                    </Tooltip>
                } 
                style={{ borderRadius: 8 }}
            >   
                <Row gutter={12}>
                    {group.map((question, index) => {
                        return (
                            <>
                                {((question.cau_hoi.trich_doan && question.cau_hoi.exceprtFrom !== undefined && question.cau_hoi.exceprtTo !== undefined)  || (question.cau_hoi?.trich_doan?.loai_trich_doan_id === 0)) &&
                                    <Col md={12} style={{overflowY: 'scroll', maxHeight: 800}}>
                                        {(question.cau_hoi?.trich_doan?.loai_trich_doan_id !== 0) &&
                                            <>
                                                <span className="exceprt-label">
                                                    {/* {`${question.cau_hoi?.trich_doan?.loai_trich_doan?.noi_dung} ${ParentIndex + 1}`}  */}
                                                    {question.cau_hoi.chuyen_nganh_id === 5 ? ' to ' : ' đến '}    
                                                    {/* {question.cau_hoi.exceprtTo - (partQuestions.length * (state.sectionExam - 1)) + 1} */}
                                                </span>
                                                <br/>
                                            </>
                                        }
                                        <div className="answer-content" style={{paddingLeft: '0px', fontSize: 18}}> 
                                            <MathJax.Provider>
                                                {question.cau_hoi?.trich_doan?.noi_dung?.split('\n').filter((item) => item !== '').map((item, index_cauhoi) => {
                                                    return (
                                                        <div className="title-exam-content" key={index_cauhoi}>
                                                            {
                                                                (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                                                    <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}><Image src={config.API_URL + `/${item.match(regex)[1]}`} alt={`img_question_${index_cauhoi}`}></Image></div>
                                                                ) : 
                                                                (
                                                                    <div style={{textAlign: 'justify'}}>{item.split('$').map((item2, index2) => {
                                                                        return (item.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
                                                                            <MathJax.Node key={index2} formula={item2} />
                                                                        ) : (
                                                                            <span dangerouslySetInnerHTML={{ __html: item2 }}></span>
                                                                        )
                                                                    })}</div>
                                                                )
                                                            }
                                                        </div>
                                                    )}
                                                )}
                                            </MathJax.Provider>
                                        </div>
                                    </Col>
                                }
                            </>    
                        )
                    })}
                    <Col md={12} style={{overflowY: 'scroll', maxHeight: 800, overflowX: 'hidden'}}>
                        {group.map((question, index) => {
                            return (
                                <>
                                    {
                                    question?.cau_hoi?.loai_cau_hoi === 3 ? questionDragAndDrop(question, index) :
                                        question?.cau_hoi?.loai_cau_hoi === 1 ? 
                                            <div key={index} 
                                                style={{ width: '100%', borderRadius: 8 }}
                                            >   
                                                <Row justify={'space-between'} style={{marginBottom: 8}}>
                                                    <div style={{fontSize: 20, fontWeight: 700}}>Câu {currentQuestion + 1}</div>
                                                    <Tooltip title="Đánh dấu câu hỏi">
                                                        <Button shape="circle" icon={<BookOutlined />} onClick={() => handleMarkQuestion()}/>
                                                    </Tooltip>
                                                </Row>
                                                {renderTitleQuestion(question)}
                                                {renderChoiceQuestion(question, index)}
                                            </div> :
                                        question?.cau_hoi?.loai_cau_hoi === 0 ? renderEssayQuestion(question, index) : 
                                        question?.cau_hoi?.loai_cau_hoi === 2 ? renderRightWrongQuestion(question, index) : 
                                        question?.cau_hoi?.loai_cau_hoi === 4 ? renderMultipleChoiceQuestion(question, index) :
                                        null
                                    }
                                </>
                            )
                        })}
                    </Col>
                </Row>
            </div>
        )
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header className='header-dgtd'>
                <h5 >ĐỀ TRẢI NGHIỆM ĐÁNH GIÁ TƯ DUY BÁCH KHOA NĂM 2025</h5>
                <h6 style={{marginBottom: 0, fontWeight: 700}}>Phần thi: Tư duy toán học (60 phút)</h6>
            </Header>
            <Layout className={`${isDoing ? 'doing-exam' : 'history-exam'}`}>
                <Content className='body-dgtd'>
                    {listQuestion?.one?.map((question, index) => {
                        if (index === currentQuestion) {
                            if (question?.cau_hoi?.loai_cau_hoi === 3) // kéo thả
                                return (
                                    <DragDropContext onDragEnd={handleDragEnd} key={index}>
                                        <Card key={index} title={`Câu ${currentQuestion + 1}`}
                                            extra={
                                                <Tooltip title="Đánh dấu câu hỏi">
                                                    <Button shape="circle" icon={<BookOutlined />} onClick={() => handleMarkQuestion()}/>
                                                </Tooltip>
                                            } 
                                            style={{ width: '100%', borderRadius: 8 }}
                                        >
                                            {renderTitleQuestion(question)}
                                            {questionDragAndDrop(question, index)}
                                        </Card>
                                    </DragDropContext>
                                )
                            else if (question?.cau_hoi?.loai_cau_hoi === 1) // ABCD
                                return (
                                    <Card key={index} title={`Câu ${currentQuestion + 1}`}
                                        extra={
                                            <Tooltip title="Đánh dấu câu hỏi">
                                                <Button shape="circle" icon={<BookOutlined />} onClick={() => handleMarkQuestion()}/>
                                            </Tooltip>
                                        } 
                                        style={{ width: '100%', borderRadius: 8 }}
                                    >
                                        {renderTitleQuestion(question)}
                                        {renderChoiceQuestion(question, index)}
                                    </Card>
                                )
                            else if (question?.cau_hoi?.loai_cau_hoi === 0)  // Tự luận
                                return (
                                    <Card title={`Câu ${currentQuestion + 1}`} key={index}
                                        extra={
                                            <Tooltip title="Đánh dấu câu hỏi">
                                                <Button shape="circle" icon={<BookOutlined />} onClick={() => handleMarkQuestion()}/>
                                            </Tooltip>
                                        } 
                                        style={{ width: '100%', borderRadius: 8 }}
                                    >
                                        {renderEssayQuestion(question, index)}
                                    </Card>
                                )
                            else if (question?.cau_hoi?.loai_cau_hoi === 2) // câu hỏi đúng sai
                                return (
                                    <Card key={index} title={`Câu ${currentQuestion + 1}`}
                                        extra={
                                            <Tooltip title="Đánh dấu câu hỏi">
                                                <Button shape="circle" icon={<BookOutlined />} onClick={() => handleMarkQuestion()}/>
                                            </Tooltip>
                                        } 
                                        style={{ width: '100%', borderRadius: 8 }}
                                    >
                                        {renderTitleQuestion(question)}
                                        {renderRightWrongQuestion(question, index)}
                                    </Card>
                                )
                            else if (question?.cau_hoi?.loai_cau_hoi === 4) // câu hỏi chọn nhiều đáp án
                                return (
                                    <Card key={index} title={`Câu ${currentQuestion + 1}`}
                                        extra={
                                            <Tooltip title="Đánh dấu câu hỏi">
                                                <Button shape="circle" icon={<BookOutlined />} onClick={() => handleMarkQuestion()}/>
                                            </Tooltip>
                                        } 
                                        style={{ width: '100%', borderRadius: 8 }}
                                    >
                                        {renderTitleQuestion(question)}
                                        {renderMultipleChoiceQuestion(question, index)}
                                    </Card>
                                )
                        } return null;
                    })}
                    {listQuestion?.group?.map((group, index) => {
                        if (index + listQuestion?.one?.length === currentQuestion)
                            return renderGroupQuestion(group);
                    })}
                    <Row style={{marginTop: 16}} align={'middle'} justify={'space-between'}>
                        <Row  align={'middle'}>
                            <Button type="primary" className='btn-chinh' style={{ marginRight: 12 }} onClick={() => setCurrentQuestion(currentQuestion - 1)}>Câu trước</Button>
                            <Button type="primary" className='btn-chinh' style={{ marginRight: 12 }} onClick={() => setCurrentQuestion(currentQuestion + 1)}>Câu tiếp</Button>
                            <h6 style={{marginBottom: 0}}>Thời gian còn lại: <b>{secondsToMinutes(timeLeft)}</b></h6>
                        </Row>
                        <div>
                            <Button 
                                type="primary" 
                                onClick={() => setSidebarVisible(!sidebarVisible)} 
                                style={{ marginLeft: 'auto', background: '#f26725', borderColor: '#f26725' }}
                            >
                                {sidebarVisible ? 'Ẩn menu' : 'Hiện menu'}
                            </Button>
                        </div>
                    </Row>
                </Content>
                {sidebarVisible && (
                    <Sider width={500} className='list-question-side' style={{maxHeight: 500}}>
                        <div style={{ padding: 16 }}>
                            <h6>Thời gian còn lại: <b>{secondsToMinutes(timeLeft)}</b></h6> 
                        </div>
                        <Row style={{ padding: 16, paddingTop: 0 }} justify={'center'}>
                            <Button type="primary" style={{ marginBottom: 16, marginRight: 12, background: '#ff6a00', borderColor: '#ff6a00', width: '25%', borderRadius: 20 }}>Nộp bài</Button>
                            <Button type='primary' className='btn-chinh' style={{ marginBottom: 16, marginRight: 12, width: '25%' }}>Tạm dừng</Button>
                        </Row>
                        <Row align={'middle'} style={{ padding: 16, paddingTop: 0 }}>
                            <h6 style={{margin: 0}}>Chỉ thị màu sắc: </h6>
                            <button className='a-tag' style={{borderRadius: 8, marginLeft: 6}}>0</button>
                            <button className='a-tag selected' style={{borderRadius: 8, marginLeft: 6}}>0</button>
                            <button className='a-tag marked' style={{borderRadius: 8, marginLeft: 6}}>0</button>
                        </Row>
                        <div className='list-question-area'>
                            {[...Array(40)].map((_, index) => (
                                <button className={`a-tag ${currentQuestion === index ? 'selected' : ''}`}
                                    key={index} 
                                    style={{ margin: '4px' }}
                                    onClick={() => setCurrentQuestion(index)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        <div style={{ padding: 16 }}>
                            <h6>Bạn đã hoàn thành 10/40</h6> 
                            <Progress percent={(10/40) * 100} />
                        </div>
                    </Sider>
                )}
            </Layout>
        </Layout>
    );
}


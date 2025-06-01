import { useState, useEffect, useMemo } from "react"
import { Form, Switch, Typography, Row, Col, Tabs } from "antd"

const { Text } = Typography
const { TabPane } = Tabs

export default function PermissionForm({ permissions, data, onValuesChange }) {
    const [selectedPermissions, setSelectedPermissions] = useState([])

    const labelPermissionType = [
    // {
    //     type: "accountBank",
    //     label: "Ngân hàng",
    //     group: "Hệ thống"
    // },
    {
        type: "staff",
        label: "Nhân viên",
        group: 'Thành viên',
    }, {
        type: "syntheticCriteria",
        label: "Tiêu chí tổng hợp",
        group: 'Tiêu chí đề thi'
    },
    {
        type: "footer",
        label: "Footer",
        group: 'Hệ thống'
    },
    // {
    //     type: "answer",
    //     label: "Câu trả lời",
    //     group: 'Đề thi'
    // },
    // {
    //     type: "auth",
    //     label: "Xác thực",
    //     group: 'Thành viên'
    // }, 
    // {
    //     type: "comment",
    //     label: "Bình luận",
    //     group: 'Hỏi đáp'
    // }, 
    {
        type: "contact",
        label: "Liên hệ",
        group: 'Hệ thống'
    }, {
        type: "course",
        label: "Khóa học",
        group: 'Đào tạo',
    }, {
        type: "courseAd",
        label: "Quảng cáo khóa học",
        group: 'Đào tạo'
    }, {
        type: "courseDescription",
        label: "Mô tả khóa học",
        group: 'Đào tạo'
    }, {
        type: "courseStudent",
        label: "Học viên khóa học",
        group: 'Đào tạo'
    }, {
        type: "dealerDiscount",
        label: "Giảm giá đại lý",
        group: 'Kinh doanh'
    }, {
        type: "department",
        label: "Phòng ban",
        group: 'Hệ thống'
    }, {
        type: "detailedDiscount",
        label: "chi tiết Giảm giá",
        group: 'Kinh doanh'
    }, {
        type: "detailedInvoice",
        label: "Chi tiết hóa đơn",
        group: 'Kinh doanh'
    }, {
        type: "dgnlCriteria",
        label: "Tiêu chí ĐGNL",
        group: 'Tiêu chí đề thi'
    }, {
        type: "dgnlEvaluate",
        label: "Đánh giá ĐGNL",
        group: "Đề thi",
    }, {
        type: "dgtdCriteria",
        label: "Tiêu chí ĐGTD",
        group: 'Tiêu chí đề thi'
    }, {
        type: "dgtdEvaluate",
        label: "Đánh giá ĐGTD",
        group: "Đề thi",
    }, {
        type: "discountCode",
        label: "Mã giảm giá",
        group: 'Kinh doanh'
    }, {
        type: "document",
        label: "Tài liệu",
        group: 'Kinh doanh'
    }, {
        type: "documentAd",
        label: "Quảng cáo tài liệu",
        group: 'Kinh doanh'
    }, {
        type: "documentType",
        label: "Loại tài liệu",
        group: 'Kinh doanh'
    }, {
        type: "evaluate",
        label: "Đánh giá",
        group: 'Đề thi'
    }, {
        type: "exam",
        label: "Đề thi",
        group: 'Đề thi'
    }, {
        type: "examQuestion",
        label: "Câu hỏi thi",
        group: 'Đề thi'
    }, {
        type: "examSet",
        label: "Bộ đề thi",
        group: 'Đề thi'
    }, {
        type: "examSetStudent",
        label: "Bộ đề thi học viên",
        group: 'Đề thi'
    }, {
        type: "exceprt",
        label: "Trích đoạn",
        group: 'Đào tạo'
    }, {
        type: "invoice",
        label: "Hóa đơn",
        group: 'Kinh doanh'
    }, {
        type: "lesson",
        label: "Bài giảng",
        group: 'Đào tạo'
    }, {
        type: "majoring",
        label: "Chuyên ngành",
        group: 'Đào tạo'
    }, {
        type: "menu",
        label: "Menu",
        group: 'Hệ thống'
    }, {
        type: "menuType",
        label: "Loại menu",
        group: 'Hệ thống'
    }, {
        type: "grade",
        label: "Lớp",
        group: 'Đào tạo'
    }, {
        type: "modun",
        label: "Modun",
        group: 'Đào tạo'
    }, {
        type: "modunCriteria",
        label: "Tiêu chí modun",
        group: 'Tiêu chí đề thi'
    }, {
        type: "onlineCriteria",
        label: "Tiêu chí online",
        group: 'Tiêu chí đề thi'
    }, {
        type: "position",
        label: "Chức vụ",
        group: 'Hệ thống'
    }, {
        type: "program",
        label: "Khung chương trình",
        group: 'Đào tạo'
    }, {
        type: "province",
        label: "Tỉnh thành",
        group: 'Hệ thống'
    }, {
        type: "question",
        label: "Câu hỏi",
        group: 'Đề thi'
    }, {
        type: "student",
        label: "Học viên",
        group: 'Thành viên'
    }, {
        type: "studentExam",
        label: "Đề thi học viên",
        group: 'Đề thi'
    }, {
        type: "teacher",
        label: "Giáo viên",
        group: 'Thành viên'
    }, {
        type: "teacherCourseAd",
        label: "Quảng cáo giáo viên",
        group: 'Kinh doanh'
    }, {
        type: "thematic",
        label: "Chuyên đề",
        group: 'Đào tạo'
    }, {
        type: "thematicCriteria",
        label: "Tiêu chí chuyên đề",
        group: 'Tiêu chí đề thi'
    }];

    const groupedLabelPermissions = useMemo(() => {
        const grouped = {}
      
        labelPermissionType.forEach(({ group, type, label }) => {
            if (!grouped[group]) {
                grouped[group] = []
            }
            grouped[group].push({ type, label })
        })
      
        return grouped
    }, [])

    // Group permissions by loai
    const permissionsByType = useMemo(() => {
        const grouped = {}

        permissions.forEach((permission) => {
            if (!grouped[permission.loai]) {
                grouped[permission.loai] = []
            }
            grouped[permission.loai].push(permission)
        })

        return grouped
    }, [permissions])
    
    useEffect(() => {
        if (data) {
            const selectedIds = data.map((item) => item.qtc_id)
            setSelectedPermissions(selectedIds)
        }
    }, [data])
    
    const handleSwitchChange = (checked, permissionId) => {
        let newSelectedPermissions;

        if (checked) {
            newSelectedPermissions = [...selectedPermissions, permissionId]
        } else {
            newSelectedPermissions = selectedPermissions.filter((id) => id !== permissionId)
        }

        setSelectedPermissions(newSelectedPermissions)

        // Update the form field value
        const chuc_vu_qtcs = newSelectedPermissions.map((qtc_id) => (qtc_id ))
        // form.setFieldsValue({ chuc_vu_qtcs })

        // Call the onValuesChange callback if provided
        if (onValuesChange) {
            onValuesChange({ chuc_vu_qtcs })
        }
    }

    const renderPermissionItems = (type) => {
        return <Row gutter={[16, 16]}>
            {permissionsByType[type].map((permission) => (
                <Col span={24} md={12} lg={8} key={permission.qtc_id}>
                    <div
                        key={permission.qtc_id}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                        <Text>{permission.ten}</Text>
                        <Switch
                            onChange={(checked) => handleSwitchChange(checked, permission.qtc_id)}
                            checked={selectedPermissions.includes(permission.qtc_id)}
                        />
                    </div>
                </Col>
            ))}
        </Row>
    }

    return (
        <Form.Item
            label={<span className="required-label">Quyền truy cập</span>}
            name="chuc_vu_qtcs"
            rules={[{ required: true, message: "Vui lòng chọn ít nhất một quyền truy cập" }]}
            getValueProps={(value) => ({ value })}
            getValueFromEvent={(e) => e}
        >
            <Tabs type="card">
                {Object.entries(groupedLabelPermissions).map(([groupName, types]) => (
                    <TabPane tab={groupName} key={groupName}>
                        <Tabs tabPosition="left" type="line">
                            {types.map(({ type, label }) => (
                                <TabPane tab={label} key={type}>
                                    {permissionsByType[type]
                                        ? renderPermissionItems(type)
                                        : <Text type="secondary">Không có quyền nào</Text>}
                                </TabPane>
                            ))}
                        </Tabs>
                    </TabPane>
                ))}
            </Tabs>
        </Form.Item>
    )
}

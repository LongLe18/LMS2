import { useState, useEffect, useMemo } from "react"
import { Form, Switch, Typography, Row, Col, Tabs } from "antd"

const { Text } = Typography
const { TabPane } = Tabs

export default function PermissionForm({ permissions, data, onValuesChange }) {
    const [selectedPermissions, setSelectedPermissions] = useState([])

    const labelPermissionType = [{
        type: "accountBank",
        label: "Ngân hàng"
    }, {
        type: "staff",
        label: "Nhân viên"
    }, {
        type: "syntheticCriteria",
        label: "Tiêu chí tổng hợp"
    },
    {
        type: "answer",
        label: "Câu trả lời"
    }, {
        type: "auth",
        label: "Xác thực"
    }, {
        type: "comment",
        label: "Bình luận"
    }, {
        type: "contact",
        label: "Liên hệ"
    }, {
        type: "course",
        label: "Khóa học"
    }, {
        type: "courseAd",
        label: "Quảng cáo khóa học"
    }, {
        type: "courseDescription",
        label: "Mô tả khóa học"
    }, {
        type: "courseStudent",
        label: "Học viên khóa học"
    }, {
        type: "dealerDiscount",
        label: "Giảm giá đại lý"
    }, {
        type: "department",
        label: "Phòng ban"
    }, {
        type: "detailedDiscount",
        label: "chi tiết Giảm giá"
    }, {
        type: "detailedInvoice",
        label: "Chi tiết hóa đơn"
    }, {
        type: "dgnlCriteria",
        label: "Tiêu chí ĐGNL"
    }, {
        type: "dgnlEvaluate",
        label: "Đánh giá ĐGNL"
    }, {
        type: "dgtdCriteria",
        label: "Tiêu chí ĐGTD"
    }, {
        type: "dgtdEvaluate",
        label: "Đánh giá ĐGTD"
    }, {
        type: "discountCode",
        label: "Mã giảm giá"
    }, {
        type: "document",
        label: "Tài liệu"
    }, {
        type: "documentAd",
        label: "Quảng cáo tài liệu"
    }, {
        type: "documentType",
        label: "Loại tài liệu"
    }, {
        type: "evaluate",
        label: "Đánh giá"
    }, {
        type: "exam",
        label: "Đề thi"
    }, {
        type: "examQuestion",
        label: "Câu hỏi thi"
    }, {
        type: "examSet",
        label: "Bộ đề thi"
    }, {
        type: "examSetStudent",
        label: "Bộ đề thi học viên"
    }, {
        type: "exceprt",
        label: "Trích đoạn"
    }, {
        type: "invoice",
        label: "Hóa đơn"
    }, {
        type: "lesson",
        label: "Bài giảng"
    }, {
        type: "majoring",
        label: "Chuyên ngành"
    }, {
        type: "menu",
        label: "Menu"
    }, {
        type: "menuType",
        label: "Loại menu"
    }, {
        type: "grade",
        label: "Lớp"
    }, {
        type: "modun",
        label: "Modun",
    }, {
        type: "modunCriteria",
        label: "Tiêu chí modun"
    }, {
        type: "onlineCriteria",
        label: "Tiêu chí online"
    }, {
        type: "position",
        label: "Chức vụ"
    }, {
        type: "program",
        label: "Khung chương trình"
    }, {
        type: "province",
        label: "Tỉnh thành"
    }, {
        type: "question",
        label: "Câu hỏi"
    }, {
        type: "student",
        label: "Học viên"
    }, {
        type: "studentExam",
        label: "Đề thi học viên"
    }, {
        type: "teacher",
        label: "Giáo viên"
    }, {
        type: "teacherCourseAd",
        label: "Quảng cáo giáo viên"
    }, {
        type: "thematic",
        label: "Chuyên đề"
    }, {
        type: "thematicCriteria",
        label: "Tiêu chí chuyên đề"
    }];

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
    
    const permissionTypes = useMemo(() => {
        return Object.keys(permissionsByType)
    }, [permissionsByType]);

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
                <Tabs defaultActiveKey={permissionTypes[0]} type="card">
                    {permissionTypes.map((type) => (
                        <TabPane tab={labelPermissionType.find((item) => item.type === type)?.label} key={type}>
                            {renderPermissionItems(type)}
                        </TabPane>
                    ))}
                </Tabs>
        </Form.Item>
    )
}

import { useState, useEffect } from "react"
import { Form, Switch, Typography, Row, Col } from "antd"

const { Text } = Typography

export default function PermissionForm({ permissions, data, onValuesChange }) {
    const [selectedPermissions, setSelectedPermissions] = useState([])

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

    return (
        <Form.Item
            label={<span className="required-label">Quyền truy cập</span>}
            name="chuc_vu_qtcs"
            rules={[{ required: true, message: "Vui lòng chọn ít nhất một quyền truy cập" }]}
            // This is important - we need to preserve the array structure
            getValueProps={(value) => ({ value })}
            getValueFromEvent={(e) => e}
        >
            <Row gutter={[16, 16]}>
                {permissions?.map((permission) => (
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
        </Form.Item>
    )
}

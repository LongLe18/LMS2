import React from 'react';
import { Link } from 'react-router-dom';
import { Result, Button } from 'antd';

function NoRecord(props) {
  return (
    <Result
      status={props.status ? props.status : '404'}
      title={props.title ? props.title : 'Dữ liệu chưa được cập nhật.'}
      subTitle={props.subTitle ? props.subTitle : 'Không tìm thấy dữ liệu.'}
      extra={
        <Button type="primary">
          <Link to="/luyen-tap/kinh-doanh-khoa-hoc">Về trang chủ</Link>
        </Button>
      }
    />
  );
}

export default NoRecord;

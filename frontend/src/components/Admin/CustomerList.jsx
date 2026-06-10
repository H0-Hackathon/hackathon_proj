import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Input, Space, message as antMessage } from 'antd';
import { EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../../services/api';
import { formatUTCDateTimeCN } from '../../utils/timeUtils';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getCustomers();
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      antMessage.error('Failed to load customer list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const getCategoryTag = (category, priority) => {
    const config = {
      HIGH_VALUE: { color: 'red', text: 'High Value' },
      NORMAL: { color: 'green', text: 'Standard' },
      LOW_VALUE: { color: 'default', text: 'Low Value' }
    };
    const { color, text } = config[category] || config.NORMAL;
    return <Tag color={color}>{text} ({priority})</Tag>;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filteredValue: [searchText],
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      render: (text) => text || '-'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category, record) => getCategoryTag(category, record.priority_score),
      sorter: (a, b) => b.priority_score - a.priority_score,
      defaultSortOrder: 'ascend'
    },
    {
      title: 'Created (UTC)',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => formatUTCDateTimeCN(text),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at)
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/conversations/${record.id}`)}
          >
            View Conversations
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Input
          placeholder="Search by customer name"
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button icon={<ReloadOutlined />} onClick={fetchCustomers}>
          Refresh
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={customers}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} customers`
        }}
      />
    </div>
  );
};

export default CustomerList;

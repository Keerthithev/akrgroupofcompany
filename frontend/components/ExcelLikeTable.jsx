import React, { useState, useEffect, useRef } from 'react';
import { Table, Input, InputNumber, Select, DatePicker, Button, Space, message, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const ExcelLikeTable = ({ 
  data, 
  columns, 
  onSave, 
  onDelete, 
  onAdd,
  loading = false,
  employees = [],
  vehicles = []
}) => {
  const [editingKey, setEditingKey] = useState('');
  const [editingData, setEditingData] = useState({});
  const [newRow, setNewRow] = useState({});

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    setEditingKey(record.key);
    setEditingData({ ...record });
  };

  const cancel = () => {
    setEditingKey('');
    setEditingData({});
    setNewRow({});
  };

  const save = async () => {
    try {
      if (editingKey) {
        await onSave(editingData);
        message.success('Record updated successfully');
      } else {
        await onAdd(newRow);
        message.success('Record added successfully');
        setNewRow({});
      }
      cancel();
    } catch (error) {
      message.error('Failed to save record');
    }
  };

  const EditableCell = ({ 
    editing, 
    dataIndex, 
    title, 
    record, 
    index, 
    children, 
    type = 'text',
    options = [],
    ...restProps 
  }) => {
    const inputNode = (() => {
      switch (type) {
        case 'number':
          return <InputNumber style={{ width: '100%' }} />;
        case 'select':
          return (
            <Select style={{ width: '100%' }} placeholder={`Select ${title}`}>
              {options.map(option => (
                <Option key={option.value || option} value={option.value || option}>
                  {option.label || option}
                </Option>
              ))}
            </Select>
          );
        case 'date':
          return <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />;
        case 'textarea':
          return <Input.TextArea rows={2} />;
        default:
          return <Input />;
      }
    })();

    return (
      <td {...restProps}>
        {editing ? (
          <Input
            defaultValue={children}
            onChange={(e) => {
              const value = type === 'number' ? Number(e.target.value) : e.target.value;
              if (editingKey) {
                setEditingData(prev => ({ ...prev, [dataIndex]: value }));
              } else {
                setNewRow(prev => ({ ...prev, [dataIndex]: value }));
              }
            }}
          />
        ) : (
          children
        )}
      </td>
    );
  };

  const getColumns = () => {
    return columns.map(col => ({
      ...col,
      dataIndex: col.dataIndex,
      title: col.title,
      width: col.width || 120,
      render: (text, record) => {
        if (col.render) {
          return col.render(text, record);
        }
        
        if (col.type === 'date' && text) {
          return dayjs(text).format('DD/MM/YYYY');
        }
        
        if (col.type === 'number' && text) {
          return text.toLocaleString();
        }
        
        if (col.type === 'select' && col.options) {
          const option = col.options.find(opt => opt.value === text);
          return option ? option.label : text;
        }
        
        return text;
      },
      onCell: (record) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        type: col.type,
        options: col.options
      }),
    }));
  };

  const mergedColumns = getColumns().map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        type: col.type,
        options: col.options
      }),
    };
  });

  const actionColumn = {
    title: 'Actions',
    dataIndex: 'operation',
    width: 120,
    render: (_, record) => {
      const editable = isEditing(record);
      return editable ? (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<SaveOutlined />}
            onClick={save}
          />
          <Button
            size="small"
            icon={<CloseOutlined />}
            onClick={cancel}
          />
        </Space>
      ) : (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            disabled={editingKey !== ''}
            onClick={() => edit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this record?"
            onConfirm={() => onDelete(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={editingKey !== ''}
            />
          </Popconfirm>
        </Space>
      );
    },
  };

  const finalColumns = [...mergedColumns, actionColumn];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setEditingKey('new')}
          disabled={editingKey !== ''}
        >
          Add New Record
        </Button>
      </div>
      
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={finalColumns}
        rowClassName="editable-row"
        pagination={{
          onChange: cancel,
        }}
        loading={loading}
        scroll={{ x: 1500 }}
        size="small"
      />
    </div>
  );
};

export default ExcelLikeTable; 
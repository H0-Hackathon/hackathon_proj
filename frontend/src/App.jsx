import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import './App.css';

import { CommonHeader } from './components/CommonHeader';
import { AlertsDashboard } from './pages/AlertsDashboard';
import { DemoPage } from './pages/DemoPage';
import { AdminPage } from './pages/AdminPage';
import { SuppliersPage } from './pages/SuppliersPage';

function App() {
  return (
    <ConfigProvider locale={enUS}>
      <BrowserRouter>
        <CommonHeader />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<AlertsDashboard />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;

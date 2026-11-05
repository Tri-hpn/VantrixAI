/**
 * ============================================================================
 * FILE: main.tsx (Điểm Khởi Động Ứng Dụng React)
 * DỰ ÁN: Vantrix AI — Nền tảng Khảo thí & Luyện thi Toàn cấp
 * PHÂN HỆ: ENTRYPOINT
 * ĐƯỜNG DẪN: /src/main.tsx
 * ============================================================================
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    '[Vantrix AI] Không tìm thấy phần tử #root trong index.html. Ứng dụng không thể khởi động.'
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
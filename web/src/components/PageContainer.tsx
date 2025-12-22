import { ReactNode } from 'react';
import './PageContainer.css';

interface PageContainerProps {
  children: ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => {
  return (
    <main className="page-container">
      {children}
    </main>
  );
};

export default PageContainer;

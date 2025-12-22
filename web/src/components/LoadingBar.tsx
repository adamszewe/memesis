import { useEffect, useState } from 'react';
import './LoadingBar.css';

interface LoadingBarProps {
  isLoading: boolean;
}

const LoadingBar = ({ isLoading }: LoadingBarProps) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(0);

      // Quick initial progress
      const timer1 = setTimeout(() => setProgress(30), 50);
      const timer2 = setTimeout(() => setProgress(60), 150);
      const timer3 = setTimeout(() => setProgress(80), 300);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      // Complete the progress
      setProgress(100);

      // Hide after animation completes
      const hideTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);

      return () => clearTimeout(hideTimer);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className="loading-bar-container">
      <div
        className="loading-bar"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default LoadingBar;

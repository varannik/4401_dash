import React from 'react';
import styles from './background.module.css';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none" style={{ backgroundColor: '#070808' }}>
      <div className="absolute top-0 left-0 right-0 h-full mx-auto w-[90vw]">
        <div className={`${styles.animatedLine1} absolute w-px h-full top-0 left-[20%] bg-white/10 overflow-hidden`} />
        <div className={`${styles.animatedLine2} absolute w-px h-full top-0 left-[40%] bg-white/10 overflow-hidden`} />
        <div className={`${styles.animatedLine3} absolute w-px h-full top-0 left-[60%] bg-white/10 overflow-hidden`} />
        <div className={`${styles.animatedLine4} absolute w-px h-full top-0 left-[80%] bg-white/10 overflow-hidden`} />
      </div>
    </div>
  );
};

export default AnimatedBackground; 
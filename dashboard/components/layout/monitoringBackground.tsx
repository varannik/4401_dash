import React from 'react'

export default function MonitoringBackground() {
  return (
    <>
      <style jsx>{`
        .monitoring-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: linear-gradient(135deg, #e6ddd4 0%, #d4c4aa 25%, #b8a082 50%, #8b7355 75%, #5d4a37 100%);
          overflow: hidden;
          z-index: -1;
        }

        .mountain-layer {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(ellipse at 20% 80%, rgba(139, 115, 85, 0.7) 0%, transparent 40%),
            radial-gradient(ellipse at 60% 85%, rgba(180, 160, 130, 0.6) 0%, transparent 30%),
            radial-gradient(ellipse at 80% 90%, rgba(93, 74, 55, 0.8) 0%, transparent 35%);
        }

        .industrial-elements {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 50%;
          background: 
            linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%),
            radial-gradient(circle at 80% 90%, rgba(255, 255, 255, 0.05) 0%, transparent 15%),
            radial-gradient(circle at 20% 95%, rgba(255, 255, 255, 0.08) 0%, transparent 10%);
        }

        .grid-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 98px,
              rgba(255, 255, 255, 0.03) 100px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 98px,
              rgba(255, 255, 255, 0.03) 100px
            );
        }

        .floating-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: float 6s infinite ease-in-out;
        }

        .particle:nth-child(1) {
          left: 10%;
          animation-delay: 0s;
          animation-duration: 8s;
        }

        .particle:nth-child(2) {
          left: 20%;
          animation-delay: 1s;
          animation-duration: 6s;
        }

        .particle:nth-child(3) {
          left: 30%;
          animation-delay: 2s;
          animation-duration: 7s;
        }

        .particle:nth-child(4) {
          left: 40%;
          animation-delay: 0.5s;
          animation-duration: 9s;
        }

        .particle:nth-child(5) {
          left: 50%;
          animation-delay: 1.5s;
          animation-duration: 5s;
        }

        .particle:nth-child(6) {
          left: 60%;
          animation-delay: 2.5s;
          animation-duration: 8s;
        }

        .particle:nth-child(7) {
          left: 70%;
          animation-delay: 3s;
          animation-duration: 6s;
        }

        .particle:nth-child(8) {
          left: 80%;
          animation-delay: 0.8s;
          animation-duration: 7s;
        }

        .particle:nth-child(9) {
          left: 90%;
          animation-delay: 1.8s;
          animation-duration: 5s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          50% {
            transform: translateY(50vh) scale(1);
            opacity: 0.8;
          }
        }

        .sun-glow {
          position: absolute;
          top: 10%;
          right: 20%;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(255, 220, 180, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
          }
        }
      `}</style>
      
      <div className="monitoring-background">
        <div className="mountain-layer"></div>
        <div className="industrial-elements"></div>
        <div className="grid-overlay"></div>
        <div className="sun-glow"></div>
        <div className="floating-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </div>
    </>
  )
} 
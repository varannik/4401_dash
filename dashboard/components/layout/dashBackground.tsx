import React from 'react'

export default function DashBackground() {
  return (
    <>
      <style jsx>{`
        .dash-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: radial-gradient(#0D1802, #070808);
          overflow: hidden;
          z-index: 1;
        }

        .light {
          position: absolute;
          width: 0px;
          opacity: 0.75;
          background-color: white;
          box-shadow: #e9f1f1 0px 0px 10px 0.5px;
          opacity: 0;
          top: 100vh;
          bottom: 0px;
          left: 0px;
          right: 0px;
          margin: auto;
        }

        .x1 {
          animation: floatUp 4s infinite linear;
          transform: scale(1.0);
        }

        .x2 {
          animation: floatUp 7s infinite linear;
          transform: scale(1.6);
          left: 15%;
        }

        .x3 {
          animation: floatUp 2.5s infinite linear;
          transform: scale(0.5);
          left: -15%;
        }

        .x4 {
          animation: floatUp 4.5s infinite linear;
          transform: scale(1.2);
          left: -34%;
        }

        .x5 {
          animation: floatUp 8s infinite linear;
          transform: scale(2.2);
          left: -57%;
        }

        .x6 {
          animation: floatUp 3s infinite linear;
          transform: scale(0.8);
          left: -81%;
        }

        .x7 {
          animation: floatUp 5.3s infinite linear;
          transform: scale(3.2);
          left: 37%;
        }

        .x8 {
          animation: floatUp 4.7s infinite linear;
          transform: scale(1.7);
          left: 62%;
        }

        .x9 {
          animation: floatUp 4.1s infinite linear;
          transform: scale(0.9);
          left: 85%;
        }

        @keyframes floatUp {
          0% {
            top: -100vh;
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          50% {
            top: 0vh;
            opacity: 0.8;
          }
          75% {
            opacity: 1;
          }
          100% {
            top: 100vh;
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
      
      <div className="dash-background">
        <div className="light x1"></div>
        <div className="light x2"></div>
        <div className="light x3"></div>
        <div className="light x4"></div>
        <div className="light x5"></div>
        <div className="light x6"></div>
        <div className="light x7"></div>
        <div className="light x8"></div>
        <div className="light x9"></div>
      </div>
    </>
  )
}
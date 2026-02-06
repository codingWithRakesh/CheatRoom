import React from 'react';

const LoadingDots = () => {
  return (
    <>
      <style>
        {`
          @keyframes jump {
            0%, 100% {
              transform: translateY(0);
            }
            20% {
              transform: translateY(-15px);
            }
            40% {
              transform: translateY(0);
            }
          }
          .animate-jump {
            animation: jump 1.2s infinite ease-in-out;
          }
        `}
      </style>
      
  
        {/* SVG Component with 3 white dots */}
        <svg 
          width="50" 
          height="20" 
          viewBox="0 0 120 60" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="white"
        >
          {/* Dot 1 */}
          <circle 
            className="animate-jump" 
            style={{ animationDelay: '0s' }} 
            cx="20" cy="40" r="10" 
          />
          {/* Dot 2 */}
          <circle 
            className="animate-jump" 
            style={{ animationDelay: '0.1s' }} 
            cx="60" cy="40" r="10" 
          />
          {/* Dot 3 */}
          <circle 
            className="animate-jump" 
            style={{ animationDelay: '0.2s' }} 
            cx="100" cy="40" r="10" 
          />
        </svg>

    </>
  );
};

export default LoadingDots;
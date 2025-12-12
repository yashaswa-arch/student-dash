import React, { useRef, useState, MouseEvent, ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  glowColor?: string;
  backgroundColor?: string;
  textColor?: string;
  hoverTextColor?: string;
}

const HoverButton: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  glowColor = '#3B82F6', // var(--accent) default
  backgroundColor = 'transparent', // transparent by default
  textColor = '#F3F4F6', // var(--text-primary) default
  hoverTextColor = '#60A5FA' // lighter blue for hover
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current && isHovered) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setGlowPosition({ x, y });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative inline-block px-6 py-3 border 
        cursor-pointer overflow-hidden transition-all duration-300 
        text-base font-medium rounded-lg z-10 font-sans
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{
        backgroundColor: backgroundColor,
        borderColor: isHovered ? glowColor : 'rgba(255,255,255,0.1)',
        color: isHovered ? hoverTextColor : textColor,
      }}
    >
      {/* Glow effect div - only visible on hover */}
      {isHovered && (
        <div
          className="absolute w-[200px] h-[200px] rounded-full pointer-events-none transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${glowPosition.x}px`,
            top: `${glowPosition.y}px`,
            background: `radial-gradient(circle, ${glowColor} 20%, transparent 70%)`,
            zIndex: 0,
            transform: `translate(-50%, -50%) scale(1.5)`,
            opacity: 0.6,
          }}
        />
      )}
      
      {/* Button content */}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export { HoverButton };


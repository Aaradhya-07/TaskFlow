import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  width?: 'auto' | 'sm' | 'md' | 'lg';
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'left',
  width = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const widthClasses = {
    auto: 'w-auto',
    sm: 'w-48',
    md: 'w-56',
    lg: 'w-64',
  };

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={toggleDropdown} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute z-10 mt-2 ${alignmentClasses[align]} ${widthClasses[width]} rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
        >
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, className = '', disabled = false }) => {
  return (
    <div
      className={`
        px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </div>
  );
};

export const DropdownDivider: React.FC = () => {
  return <div className="my-1 h-px bg-gray-200" />;
};

export default Dropdown;
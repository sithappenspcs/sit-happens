import React from 'react';

export const Card = ({ children, className = '' }: any) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-warm-100 overflow-hidden hover:shadow-md transition-shadow duration-300 ${className}`}>
      {children}
    </div>
  );
};

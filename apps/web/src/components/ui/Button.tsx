import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const baseStyle = "px-6 py-3 font-semibold rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-md transform hover:-translate-y-0.5";
  const variants: Record<string, string> = {
    primary: "bg-sage-600 text-white hover:bg-sage-700",
    secondary: "bg-warm-200 text-warm-900 hover:bg-warm-300",
    outline: "border-2 border-sage-600 text-sage-700 hover:bg-sage-50",
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

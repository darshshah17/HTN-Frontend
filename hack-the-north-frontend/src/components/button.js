// button.js

import React from 'react';
import '../button.css'; // Import the button styles

const Button = ({ variant, onClick, children }) => {
  const buttonClasses = `button ${variant === 'secondary' ? 'secondary' : 'outline'}`;

  return (
    <button className={buttonClasses} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;

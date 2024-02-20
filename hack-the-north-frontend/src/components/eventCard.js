import React from 'react';
import '../eventCard.css';

const EventCard = ({ children, className }) => {
  return (
    <div className={`custom-EventCard ${className}`}>
      {children}
    </div>
  );
};

const EventCardHeader = ({ children }) => {
  return <div className="EventCard-header">{children}</div>;
};

const EventCardTitle = ({ children }) => {
  return <h2 className="EventCard-title">{children}</h2>;
};

const EventCardContent = ({ children }) => {
  return <div className="EventCard-content">{children}</div>;
};

export { EventCard, EventCardHeader, EventCardTitle, EventCardContent };

// ./src/components/ui/tabs.js
import React from 'react';

const Tabs = ({ children }) => {
  return (
    <div className="flex space-x-2 mb-6">
      {children}
    </div>
  );
};

export default Tabs;

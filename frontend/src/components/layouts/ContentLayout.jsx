import React from "react";
import "./ContentLayout.css";

const ContentLayout = ({ children }) => {
  return (
    <main className="content-layout">
      <div className="content-container">{children}</div>
    </main>
  );
};

export default ContentLayout;

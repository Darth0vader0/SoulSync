import React from "react";
import Sidebar from "../components/Sidebar";

 const Layout = ({ children }) => {
  return (
    <div className="flex h-screen w-full">
    <Sidebar className="w-72 flex-shrink-0" /> {/* Sidebar has fixed width */}
    <main className="flex-1 flex flex-col">  {/* Main content takes remaining space */}
      {children}
    </main>
  </div>
  
  
  );
};

export default Layout
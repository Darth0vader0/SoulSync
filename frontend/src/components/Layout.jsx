import React from "react";
import Sidebar from "../components/Sidebar";

 const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#36393f] text-[#dcddde]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">{children}</main>
    </div>
  );
};

export default Layout
import React from "react";

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen w-screen justify-center items-center">
      <div className="w-full h-full">{children}</div>
    </div>
  );
};

export default ChatLayout;

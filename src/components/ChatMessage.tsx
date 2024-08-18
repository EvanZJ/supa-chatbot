import { MessageProps } from "@/types";
import React, { useEffect, useRef, useState } from "react";

const ChatMessage = () => {
  const [data, setData] = useState<MessageProps[]>([]);
  const [prompt, setPrompt] = useState("");
  return <div>ChatMessage</div>;
};

export default ChatMessage;

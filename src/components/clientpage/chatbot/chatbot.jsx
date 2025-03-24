import React, { useEffect } from "react";
import "./chatbot.css";

const Chatbot = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//code.tidio.co/n1sxwcgou7sjtuvbm8e79l49v1l2bkwm.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="chatbot-container" id="tidio-chat-container"></div>
  );
};

export default Chatbot;
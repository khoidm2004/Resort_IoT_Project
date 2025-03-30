import { useEffect } from "react";
import "./chatbot.css";

const Chatbot = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//code.tidio.co/xhsqvmw9x5lsl6m6j2jma9ywaqongd2o.js";
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
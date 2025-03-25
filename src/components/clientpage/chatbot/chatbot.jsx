import { useEffect } from "react";
import "./chatbot.css";

const Chatbot = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//code.tidio.co/kjzzgidishhdfwg3nzsdiiwhtufo0cxn.js";
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
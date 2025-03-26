import React from "react";
import './footer.css';

const Footer = ({ isAdmin, className = "" }) => {  
  return (
    <div className={`footer ${isAdmin ? "admin" : "no-left-padding"} ${className}`}>
      <div className="footer-row">
        <div className="footer-left">
          <img src="../logo.png" alt="Logo" className="footer-logo" />
          <div className="footer-contact">
            <p>Neljäs Avenjku 3, 89400 Hyrynsalmi</p>
            <p>(+358) 504-040-373</p>
            <p>
              <a href="mailto:maarinen4@gmail.com">maarinen4@gmail.com</a>
            </p>
          </div>
        </div>
        <div className="footer-right">
          <div className="footer-column">
            <ul>
              <li><a href="https://rakkaranta.fi/pages/tietoa-meista">About</a></li>
              <li><a href="https://rakkaranta.fi/pages/contact">Contact Us</a></li>
              <li><a href="https://rakkaranta.fi/pages/majoituksen-edut">Accommodation Benefits</a></li>
              <li><a href="https://rakkaranta.fi/pages/nain-saavut-ukkohallaan">How to get to Ukkohalla</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <ul>
              <li><a href="https://www.facebook.com/profile.php?id=61560052920308" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              <li><a href="https://www.instagram.com/rakkaranta/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © Copyright - Authors:
        <a href="https://github.com/khoidm2004" target="_blank" rel="noopener noreferrer">Khoi Do</a>
        ●
        <a href="https://github.com/truonghoangthong" target="_blank" rel="noopener noreferrer">Thong Truong</a>
        ●
        <a href="https://github.com/nhingnguyen" target="_blank" rel="noopener noreferrer">Nhi Nguyen</a>
        ●
        <a href="https://github.com/pingviini314159" target="_blank" rel="noopener noreferrer">Dung Nguyen</a>
      </div>
    </div>
  );
};

export default Footer;
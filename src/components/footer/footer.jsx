import React from "react";
import './footer.css';

const Footer = ({ isAdmin, className = "" }) => {  
  return (
    <div className={`footer ${isAdmin ? "admin" : "no-left-padding"} ${className}`}>
      <div className="footer-left">
        <img src="../logo.png" alt="Logo" className="footer-logo" />
        <div className="footer-contact">
          <p>Neljäs Avenjku 3, 89400 Hyrynsalmi</p>
          <p>(+358) 504-040-373</p>
          <p>
            <a href="mailto:contact@rakkaranta">contact@rakkaranta</a>
          </p>
        </div>
      </div>
      <div className="footer-right">
        <div className="footer-column">
          <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/accommodation-benefits">Accommodation Benefits</a></li>
            <li><a href="/how-to-get-to-ukko-killa">How to get to Ukko-Killa</a></li>
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
  );
};

export default Footer;
import Modal from "../modal/Modal";
import { FiMail, FiPhone, FiMapPin, FiClock } from "react-icons/fi";
import "./ContactModal.css";

const ContactModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contact Us">
      <div className="contact-content">
        <p className="contact-intro">
          Have questions or need assistance? We're here to help!
        </p>

        <div className="contact-methods">
          <div className="contact-method">
            <div className="contact-icon">
              <FiMail />
            </div>
            <div className="contact-details">
              <h4>Email</h4>
              <a href="mailto:support@citycare.com">support@citycare.com</a>
              <p>We'll respond within 24 hours</p>
            </div>
          </div>

          <div className="contact-method">
            <div className="contact-icon">
              <FiPhone />
            </div>
            <div className="contact-details">
              <h4>Phone</h4>
              <a href="tel:+911234567890">+91 123-456-7890</a>
              <p>Mon-Fri, 9 AM - 6 PM</p>
            </div>
          </div>

          <div className="contact-method">
            <div className="contact-icon">
              <FiMapPin />
            </div>
            <div className="contact-details">
              <h4>Office Address</h4>
              <p>
                CityCare Headquarters
                <br />
                Municipal Building, City Center
                <br />
                Your City, State - 123456
              </p>
            </div>
          </div>

          <div className="contact-method">
            <div className="contact-icon">
              <FiClock />
            </div>
            <div className="contact-details">
              <h4>Working Hours</h4>
              <p>
                Monday - Friday: 9:00 AM - 6:00 PM
                <br />
                Saturday: 10:00 AM - 2:00 PM
                <br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </div>

        <div className="contact-footer">
          <p>
            For urgent issues, please mark your complaint as{" "}
            <strong>"Urgent"</strong> when reporting.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ContactModal;

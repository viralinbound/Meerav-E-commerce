import { useState } from "react";
import Toast from "../components/Toast";
import { brand } from "../data/staticContent";
import JaaliDivider from "../components/JaaliDivider";

export default function Contact() {
  const [toast, setToast] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setToast("Message sent! We'll get back to you within 24 hours.");
    e.target.reset();
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="hindi-accent hindi-accent-light">हमसे जुड़ें</span>
          <div className="breadcrumb">Home / Contact</div>
          <h1>Get in Touch</h1>
        </div>
      </div>
      <JaaliDivider tone="light" />

      <div className="container section">
        <div className="contact-grid">
          <div>
            <div className="section-eyebrow">Contact Info</div>
            <h2 style={{ color: "var(--maroon-dark)", marginBottom: 20 }}>We'd Love to Hear From You</h2>

            <div className="info-card">
              <div>
                <h4>Visit Us</h4>
                <p>{brand.address}</p>
              </div>
            </div>
            <div className="info-card">
              <div>
                <h4>Call Us</h4>
                <p>{brand.phone} (Mon–Sat, 10am–7pm)</p>
              </div>
            </div>
            <div className="info-card">
              <div>
                <h4>Email Us</h4>
                <p>{brand.email}</p>
              </div>
            </div>
            <div className="info-card">
              <div>
                <h4>WhatsApp Quick Order</h4>
                <p><a href={`https://wa.me/${brand.phone.replace(/\D/g, "")}`}>Chat with us on WhatsApp</a></p>
              </div>
            </div>
            <div className="info-card">
              <div>
                <h4>Wholesale &amp; Bulk Orders</h4>
                <p>Reach out for distributor and bulk pricing enquiries.</p>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <input type="tel" placeholder="Phone Number" />
            <textarea placeholder="Your Message" required />
            <button type="submit" className="btn btn-gold" style={{ justifyContent: "center" }}>
              Send Message
            </button>
          </form>
        </div>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast("")} />}
    </>
  );
}

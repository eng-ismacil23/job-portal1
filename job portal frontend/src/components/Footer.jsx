// footer
import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaGithub,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { BRAND, LogoMark } from "../brand";

const socialStyle = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  background: BRAND.card,
  color: BRAND.text,
  border: "1px solid rgba(255,255,255,.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  transition: "all .3s ease",
};

const linkStyle = {
  color: BRAND.textSecondary,
  textDecoration: "none",
  transition: "color .3s ease",
  fontSize: 15,
};

const contactStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  color: BRAND.textSecondary,
  fontSize: 15,
};

export default function Footer() {
  return (
    <footer
      style={{
        background: BRAND.bg,
        color: BRAND.textSecondary,
        marginTop: 80,
        borderTop: `1px solid ${BRAND.card}`,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "70px 24px 50px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: 40,
        }}
      >
        {/* Company */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <LogoMark size={42} />

            <div>
              <h2
                style={{
                  margin: 0,
                  color: BRAND.text,
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                JobPortal
              </h2>

              <span
                style={{
                  color: BRAND.primary,
                  fontSize: 13,
                }}
              >
                Find Your Dream Career
              </span>
            </div>
          </div>

          <p
            style={{
              lineHeight: 1.8,
              color: BRAND.textSecondary,
              maxWidth: 320,
            }}
          >
            JobPortal connects talented professionals with the world's leading
            companies. Discover opportunities, build your career, and get hired
            faster.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 28,
            }}
          >
            {[
              { icon: <FaFacebookF />, url: "#" },
              { icon: <FaTwitter />, url: "#" },
              { icon: <FaLinkedinIn />, url: "#" },
              { icon: <FaGithub />, url: "#" },
            ].map((item, index) => (
              <a
                key={index}
                href={item.url}
                style={socialStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = BRAND.primary;
                  e.currentTarget.style.color = BRAND.dark;
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = BRAND.card;
                  e.currentTarget.style.color = BRAND.text;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3
            style={{
              color: BRAND.text,
              marginBottom: 20,
            }}
          >
            Quick Links
          </h3>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: 14,
            }}
          >
            {[
              "Home",
              "Browse Jobs",
              "Companies",
              "Dashboard",
              "Contact",
            ].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.target.style.color = BRAND.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = BRAND.textSecondary;
                  }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3
            style={{
              color: BRAND.text,
              marginBottom: 20,
            }}
          >
            Job Categories
          </h3>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: 14,
            }}
          >
            {[
              "Software Engineering",
              "UI / UX Design",
              "Marketing",
              "Finance",
              "Remote Jobs",
            ].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.target.style.color = BRAND.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = BRAND.textSecondary;
                  }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3
            style={{
              color: BRAND.text,
              marginBottom: 20,
            }}
          >
            Contact Us
          </h3>

          <div
            style={{
              display: "grid",
              gap: 18,
            }}
          >
            <div style={contactStyle}>
              <FaMapMarkerAlt color={BRAND.primary} />
              <span>Mogadishu, Somalia</span>
            </div>

            <div style={contactStyle}>
              <FaEnvelope color={BRAND.primary} />
              <span>support@jobportal.com</span>
            </div>

            <div style={contactStyle}>
              <FaPhoneAlt color={BRAND.primary} />
              <span>+252 61 0000000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}

      <div
        style={{
          borderTop: `1px solid ${BRAND.card}`,
          padding: "22px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 15,
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <span
          style={{
            color: BRAND.textSecondary,
            fontSize: 14,
          }}
        >
          ©️ 2026 JobPortal. All Rights Reserved.
        </span>

        <div
          style={{
            display: "flex",
            gap: 22,
            flexWrap: "wrap",
          }}
        >
          {["Privacy Policy", "Terms of Service", "Cookies"].map((item) => (
            <a
              key={item}
              href="#"
              style={{
                ...linkStyle,
                fontSize: 14,
              }}
              onMouseEnter={(e) => {
                e.target.style.color = BRAND.primary;
              }}
              onMouseLeave={(e) => {
                e.target.style.color = BRAND.textSecondary;
              }}
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
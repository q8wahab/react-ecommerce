import React from "react";

const Footer = () => {
  const icons = {
  instagram: "/assets/Instagram.svg",
  whatsapp: "/assets/whatsapp.svg",
};


  return (
    <>
      <footer className="mb-0 text-center">
        <div className="d-flex align-items-center justify-content-center pb-5">
          <div className="col-md-6">
            <p className="mb-3 mb-md-0">@24ozKw</p>

            {/* Icons from /public/assets/icons */}
            <div className="d-flex justify-content-center align-items-center mt-3">
              {/* Instagram */}
              <a
                href="https://instagram.com/24ozkw"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @24ozkw"
                title="Instagram @24ozkw"
                className="mx-2 d-inline-flex align-items-center justify-content-center rounded-circle bg-white border shadow-sm"
                style={{ width: 44, height: 44 }}
              >
                <img
                  src={icons.instagram}
                  alt="Instagram"
                  width={50}
                  height={50}
                  style={{ objectFit: "contain", display: "block" }}
                  onError={(e) => {
                    // fallback لو الملف مو موجود
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement.innerHTML = '<span class="fw-bold">IG</span>';
                  }}
                />
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/96596770021"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp +96596770021"
                title="WhatsApp +96596770021"
                className="mx-2 d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 44, height: 44, background: "#25D366" }}
              >
                <img
                  src={icons.whatsapp}
                  alt="WhatsApp"
                  width={50}
                  height={50}
                  style={{ objectFit: "contain", filter: "brightness(0) invert(1)", display: "block" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement.innerHTML = '<span class="text-white fw-bold">WA</span>';
                  }}
                />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;

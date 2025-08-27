import React from "react";

const Home = () => {
  return (
    <>
      <div className="hero border-1 pb-3">
        <div className="card text-white border-0 mx-3 hero-card">
          <img
            className="card-img hero-img"
            src={`${process.env.PUBLIC_URL}/assets/IMG_9646.jpg`} // أو "/assets/IMG_9646.jpg"
            alt="Coffee accessories hero"
          />
          <div className="card-img-overlay d-flex align-items-center">
            <div className="container">
              {/* العنوان: AR ثم EN */}
              <h1 className="display-5 fw-light mb-3 lh-sm hero-title">
                <span className="d-block ar" dir="rtl">
                  رتّب كبسولاتك.. وعيش المزاج — مساحة أقل، قهوة أكثر
                </span>
                <span className="d-block en">
                  Organize your capsules, elevate your ritual — Start your day organized
                </span>
              </h1>

              {/* الوصف: AR ثم EN */}
              <p className="fs-5 mb-0 lh-base hero-subtext">
                <span className="d-block ar mb-1" dir="rtl">
                  إكسسوارات أنيقة لنسبريسو ودولشي قوستو بتنظيم موفّر للمساحة، عشان تبدأ يومك مُرتّب وتستمتع بأول رشفة.
                </span>
                <span className="d-block en">
                  Elegant accessories for Nespresso® & Dolce Gusto® with space-saving storage,
                  keeping every capsule in its place for a smoother morning.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
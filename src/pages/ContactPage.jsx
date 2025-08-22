import React from "react";
import { Footer, Navbar } from "../components";
import { useTranslation } from "react-i18next";

const ContactPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center">{t("contact.title")}</h1>
        <hr />
        <div class="row my-4 h-100">
          <div className="col-md-4 col-lg-4 col-sm-8 mx-auto">
            <form>
              <div class="form my-3">
                <label for="Name">{t("contact.form.name")}</label>
                <input
                  type="email"
                  class="form-control"
                  id="Name"
                  placeholder={t("contact.form.name")}
                />
              </div>
              <div class="form my-3">
                <label for="Email">{t("contact.form.email")}</label>
                <input
                  type="email"
                  class="form-control"
                  id="Email"
                  placeholder="name@example.com"
                />
              </div>
              <div class="form  my-3">
                <label for="Password">{t("contact.form.message")}</label>
                <textarea
                  rows={5}
                  class="form-control"
                  id="Password"
                  placeholder={t("contact.form.message")}
                />
              </div>
              <div className="text-center">
                <button
                  class="my-2 px-4 mx-auto btn btn-dark"
                  type="submit"
                  disabled
                >
                  {t("contact.form.send")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;

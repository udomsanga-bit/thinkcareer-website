// About the founder + Services
const { useState: useStateA } = React;

function About() {
  const { t } = window.useLang();
  return (
    <section className="tc-about" id="about">
      <div className="tc-about__grid">
        <div className="tc-about__media">
          <div className="tc-about__media-frame">
            <div className="tc-placeholder tc-placeholder--tall">
              <span className="tc-placeholder__label">{t("about_media_placeholder")}</span>
              <span className="tc-placeholder__meta">{t("about_media_placeholder_meta")}</span>
            </div>
            <img
              src={window.TC_GET_MEDIA("aboutMedia", "assets/about-media.jpg")}
              alt=""
              className="tc-about__img"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </div>
          <div className="tc-about__caption">
            <span>{t("about_caption_1")}</span>
            <span>{t("about_caption_2")}</span>
          </div>
        </div>

        <div className="tc-about__copy">
          <div className="tc-eyebrow">
            <span className="tc-eyebrow__dot" />
            {t("about_eyebrow")}
          </div>
          <h2 className="tc-h2 tc-about__h2">{t("about_h2")}</h2>

          <div className="tc-about__prose">
            <p className="tc-lede">{t("about_p1")}</p>
            <p dangerouslySetInnerHTML={{ __html: t("about_p2_html") }} />
            <p>{t("about_p3")}</p>
            <p className="tc-about__quote">
              {t("about_quote")}
              <span className="tc-about__quote-attr">{t("about_quote_attr")}</span>
            </p>
          </div>

          <ul className="tc-cred">
            {[1,2,3,4].map(n => (
              <li key={n}>
                <span className="tc-cred__label">{t(`cred_${n}_l`)}</span>
                <span className="tc-cred__val">{t(`cred_${n}_v`)}</span>
              </li>
            ))}
          </ul>

          <a href="#contact" className="tc-btn tc-btn--ghost tc-about__cta">
            {t("about_cta")}
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const { t } = window.useLang();
  const [active, setActive] = useStateA(0);

  const tierKeys = [
    { key: "t1", icon: "🚀", featured: false },
    { key: "t2", icon: "📈", featured: true },
    { key: "t3", icon: "🛡", featured: false },
  ];

  return (
    <section className="tc-services" id="services">
      <div className="tc-section__head">
        <div className="tc-eyebrow tc-eyebrow--light">
          <span className="tc-eyebrow__dot" />
          {t("services_eyebrow")}
        </div>
        <h2 className="tc-h2 tc-h2--light">{t("services_h2")}</h2>
        <p className="tc-section__lede tc-section__lede--light">{t("services_lede")}</p>
      </div>

      <div className="tc-services__tabs" role="tablist">
        {tierKeys.map((tk, i) => (
          <button
            key={tk.key}
            role="tab"
            aria-selected={active === i}
            className={`tc-services__tab ${active === i ? "is-active" : ""}`}
            onClick={() => setActive(i)}
          >
            <span className="tc-services__tab-tag">{t(`${tk.key}_tag`)}</span>
            <span className="tc-services__tab-name">{t(`${tk.key}_name`)}</span>
          </button>
        ))}
      </div>

      <div className="tc-services__panel">
        {tierKeys.map((tk, i) => (
          <div
            key={tk.key}
            className={`tc-tier ${active === i ? "is-active" : ""}`}
            role="tabpanel"
            aria-hidden={active !== i}
          >
            <div className="tc-tier__head">
              <div>
                <span className="tc-tier__tag">{t(`${tk.key}_tag`)}{tk.featured ? t("tier_most_booked") : ""}</span>
                <h3 className="tc-tier__name">
                  <span className="tc-tier__icon" aria-hidden>{tk.icon}</span>
                  {t(`${tk.key}_name`)}
                </h3>
                <p className="tc-tier__pitch">{t(`${tk.key}_pitch`)}</p>
              </div>
              <div className="tc-tier__price">
                <span className="tc-tier__price-label">{t("tier_price_label")}</span>
                <span className="tc-tier__price-val">{t(`${tk.key}_price`)}</span>
                <span className="tc-tier__price-note">{t(`${tk.key}_price_note`)}</span>
              </div>
            </div>

            <dl className="tc-tier__meta tc-tier__meta--row">
              <div><dt>{t("tier_duration")}</dt><dd>{t(`${tk.key}_duration`)}</dd></div>
              <div><dt>{t("tier_format")}</dt><dd>{t(`${tk.key}_format`)}</dd></div>
              <div><dt>{t("tier_best")}</dt><dd>{t(`${tk.key}_best`)}</dd></div>
            </dl>

            <p className="tc-tier__summary">{t(`${tk.key}_summary`)}</p>

            <div className="tc-tier__columns">
              <div>
                <h4 className="tc-tier__subhead">{t("tier_included")}</h4>
                <ul className="tc-tier__list">
                  {[1,2,3,4,5].map(n => <li key={n}>{t(`${tk.key}_inc_${n}`)}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="tc-tier__subhead">{t("tier_outcomes")}</h4>
                <ul className="tc-tier__list tc-tier__list--outcomes">
                  {[1,2,3].map(n => <li key={n}>{t(`${tk.key}_out_${n}`)}</li>)}
                </ul>
              </div>
            </div>

            <div className="tc-tier__cta-row">
              <a href="#contact" className="tc-btn tc-btn--gold">
                {t("tier_enquire")} {t(`${tk.key}_name`)}
                <span aria-hidden>→</span>
              </a>
              <span className="tc-tier__fineprint">{t("tier_fineprint")}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

window.About = About;
window.Services = Services;

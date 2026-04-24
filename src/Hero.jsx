// Hero + Why ThinkCareer
const { useState: useStateH } = React;

function Hero({ headlineIndex = 0, onBook }) {
  const { t, lang } = window.useLang();
  const titleKey = `headline_${headlineIndex + 1}_title`;
  const subKey = `headline_${headlineIndex + 1}_sub`;
  const title = t(titleKey);
  const sub = t(subKey);

  // For Khmer, don't split on '.' (different punctuation).
  const lines = lang === "en"
    ? title.split(".").map(s => s.trim()).filter(Boolean).map(s => s + ".")
    : [title];

  return (
    <section className="tc-hero" id="top">
      <div className="tc-hero__grid">
        <div className="tc-hero__copy">
          <div className="tc-eyebrow">
            <span className="tc-eyebrow__dot" />
            {t("hero_eyebrow")}
          </div>

          <h1 className="tc-hero__title">
            {lines.map((line, i) => (
              <span key={i} className="tc-hero__line">{line}</span>
            ))}
          </h1>

          <p className="tc-hero__sub">{sub}</p>

          <div className="tc-hero__actions">
            <a href="#contact" className="tc-btn tc-btn--primary" onClick={onBook}>
              {t("hero_book")}
              <span aria-hidden>→</span>
            </a>
            <a href="#services" className="tc-btn tc-btn--ghost">
              {t("hero_packages")}
            </a>
          </div>

          <dl className="tc-hero__proof">
            <div>
              <dt>{t("hero_proof_1_h")}</dt>
              <dd>{t("hero_proof_1_b")}</dd>
            </div>
            <div>
              <dt>{t("hero_proof_2_h")}</dt>
              <dd>{t("hero_proof_2_b")}</dd>
            </div>
            <div>
              <dt>{t("hero_proof_3_h")}</dt>
              <dd>{t("hero_proof_3_b")}</dd>
            </div>
          </dl>
        </div>

        <aside className="tc-hero__art" aria-hidden="true">
          <div className="tc-portrait">
            <div className="tc-portrait__frame">
              <div className="tc-placeholder">
                <span className="tc-placeholder__label">{t("portrait_placeholder")}</span>
                <span className="tc-placeholder__meta">{t("portrait_placeholder_meta")}</span>
              </div>
              <img
                src={window.TC_GET_MEDIA("heroPortrait", "assets/hero-portrait.jpg")}
                alt=""
                className="tc-portrait__img"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
            <div className="tc-portrait__card">
              <span className="tc-portrait__card-eyebrow">{t("portrait_eyebrow")}</span>
              <span className="tc-portrait__card-name">{t("portrait_name")}</span>
              <span className="tc-portrait__card-role">{t("portrait_role")}</span>
            </div>
            <div className="tc-portrait__sticker">
              {t("portrait_sticker").split("\n").map((l, i) => (
                <React.Fragment key={i}>{l}{i === 0 ? <br/> : null}</React.Fragment>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="tc-hero__marquee" role="presentation">
        <div className="tc-hero__marquee-inner">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="tc-hero__marquee-track">
              {[1,2,3,4,5,6,7].map(n => (
                <React.Fragment key={n}>
                  <span>{t(`marquee_${n}`)}</span><span>·</span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Why() {
  const { t } = window.useLang();
  return (
    <section className="tc-why" id="approach">
      <div className="tc-section__head">
        <div className="tc-eyebrow">
          <span className="tc-eyebrow__dot" />
          {t("why_eyebrow")}
        </div>
        <h2 className="tc-h2">
          {t("why_h2_pre")}<em>{t("why_h2_em")}</em>{t("why_h2_post")}
        </h2>
        <p className="tc-section__lede">{t("why_lede")}</p>
      </div>

      <div className="tc-why__grid">
        {[1,2,3,4].map(n => (
          <article key={n} className="tc-pillar">
            <span className="tc-pillar__n">{String(n).padStart(2,"0")}</span>
            <h3 className="tc-pillar__title">{t(`pillar_${n}_t`)}</h3>
            <p className="tc-pillar__body">{t(`pillar_${n}_b`)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

window.Hero = Hero;
window.Why = Why;

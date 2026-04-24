// Sticky top navigation with scroll progress + language toggle
const { useState, useEffect } = React;

function Nav({ onBook }) {
  const { lang, t, setLang } = window.useLang();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      const p = total > 0 ? (h.scrollTop / total) * 100 : 0;
      setProgress(p);
      setScrolled(h.scrollTop > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    [t("nav_about"), "#about"],
    [t("nav_services"), "#services"],
    [t("nav_approach"), "#approach"],
    [t("nav_faq"), "#faq"],
  ];

  const LangToggle = () => (
    <div className="tc-lang" role="group" aria-label={t("lang_switch_aria")}>
      <button
        className={`tc-lang__btn ${lang === "en" ? "is-on" : ""}`}
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
      >EN</button>
      <button
        className={`tc-lang__btn tc-lang__btn--km ${lang === "km" ? "is-on" : ""}`}
        onClick={() => setLang("km")}
        aria-pressed={lang === "km"}
      >ខ្មែរ</button>
    </div>
  );

  return (
    <header className={`tc-nav ${scrolled ? "tc-nav--scrolled" : ""}`}>
      <div className="tc-nav__progress" style={{ width: `${progress}%` }} />
      <div className="tc-nav__inner">
        <a href="#top" className="tc-nav__brand" aria-label="ThinkCareer home">
          <img src={window.TC_GET_MEDIA("logo", "assets/logo.jpg")} alt="" className="tc-nav__logo" />
          <span className="tc-nav__wordmark">
            <span className="tc-nav__wordmark-main">ThinkCareer</span>
            <span className="tc-nav__wordmark-sub">{t("nav_brand_sub")}</span>
          </span>
        </a>

        <nav className="tc-nav__links" aria-label="Primary">
          {links.map(([label, href]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>

        <div className="tc-nav__cta">
          <LangToggle />
          <a href="#contact" className="tc-btn tc-btn--primary tc-btn--sm" onClick={onBook}>
            {t("nav_book")}
            <span aria-hidden>→</span>
          </a>
        </div>

        <button
          className="tc-nav__menu"
          aria-label={t("nav_menu")}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span /><span /><span />
        </button>
      </div>

      {open && (
        <div className="tc-nav__mobile">
          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <LangToggle />
          <a href="#contact" onClick={() => setOpen(false)} className="tc-btn tc-btn--primary">
            {t("nav_book")} →
          </a>
        </div>
      )}
    </header>
  );
}

window.Nav = Nav;

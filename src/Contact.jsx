// Contact + Booking form with real validation, FAQ accordion, Footer
const { useState: useStateC } = React;

function Contact() {
  const { t } = window.useLang();
  const [step, setStep] = useStateC(0);
  const [form, setForm] = useStateC({ name:"", email:"", stage:"", tier:"", goal:"", consent:false });
  const [errors, setErrors] = useStateC({});
  const [touched, setTouched] = useStateC({});

  const stages = [t("stage_1"), t("stage_2"), t("stage_3"), t("stage_4"), t("stage_5")];
  const tiers = [t("tier_pick_1"), t("tier_pick_2"), t("tier_pick_3"), t("tier_pick_4")];

  const validate = (f) => {
    const e = {};
    if (!f.name.trim() || f.name.trim().length < 2) e.name = t("err_name");
    if (!f.email.trim()) e.email = t("err_email_required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = t("err_email_invalid");
    if (!f.stage) e.stage = t("err_stage");
    if (!f.tier) e.tier = t("err_tier");
    if (!f.goal.trim() || f.goal.trim().length < 12) e.goal = t("err_goal");
    if (!f.consent) e.consent = t("err_consent");
    return e;
  };

  const set = (k, v) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (touched[k]) setErrors(validate(next));
  };
  const blur = (k) => { setTouched({ ...touched, [k]: true }); setErrors(validate(form)); };
  const submit = (ev) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    setTouched({ name:true, email:true, stage:true, tier:true, goal:true, consent:true });
    if (Object.keys(e).length === 0) setStep(1);
  };

  return (
    <section className="tc-contact" id="contact">
      <div className="tc-contact__grid">
        <div className="tc-contact__copy">
          <div className="tc-eyebrow"><span className="tc-eyebrow__dot" />{t("contact_eyebrow")}</div>
          <h2 className="tc-h2">{t("contact_h2")}</h2>
          <p className="tc-contact__lede">{t("contact_lede")}</p>

          <ul className="tc-contact__promise">
            <li><span>01</span><p>{t("promise_1")}</p></li>
            <li><span>02</span><p>{t("promise_2")}</p></li>
            <li><span>03</span><p>{t("promise_3")}</p></li>
          </ul>

          <div className="tc-contact__alt">
            <div>
              <span className="tc-contact__alt-label">{t("alt_phone")}</span>
              <a href="tel:+85570719991">+855 70 71 99 91</a>
            </div>
            <div>
              <span className="tc-contact__alt-label">{t("alt_linkedin")}</span>
              <a href="https://www.linkedin.com/company/thinkcareer/" target="_blank" rel="noreferrer">/company/thinkcareer</a>
            </div>
            <div>
              <span className="tc-contact__alt-label">{t("alt_telegram")}</span>
              <a href="#" onClick={(e) => e.preventDefault()}>{t("alt_telegram_val")}</a>
            </div>
          </div>
        </div>

        <form className="tc-form" onSubmit={submit} noValidate aria-live="polite">
          {step === 0 && (
            <>
              <div className="tc-form__row">
                <label className={`tc-field ${errors.name && touched.name ? "has-error" : ""}`}>
                  <span className="tc-field__label">{t("form_name")}</span>
                  <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} onBlur={() => blur("name")} placeholder={t("form_name_ph")} autoComplete="name" />
                  {errors.name && touched.name && <span className="tc-field__err">{errors.name}</span>}
                </label>
                <label className={`tc-field ${errors.email && touched.email ? "has-error" : ""}`}>
                  <span className="tc-field__label">{t("form_email")}</span>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} onBlur={() => blur("email")} placeholder={t("form_email_ph")} autoComplete="email" />
                  {errors.email && touched.email && <span className="tc-field__err">{errors.email}</span>}
                </label>
              </div>

              <fieldset className={`tc-field ${errors.stage && touched.stage ? "has-error" : ""}`}>
                <legend className="tc-field__label">{t("form_stage")}</legend>
                <div className="tc-chips">
                  {stages.map((s) => (
                    <button type="button" key={s} className={`tc-chip ${form.stage === s ? "is-on" : ""}`} onClick={() => { set("stage", s); blur("stage"); }}>{s}</button>
                  ))}
                </div>
                {errors.stage && touched.stage && <span className="tc-field__err">{errors.stage}</span>}
              </fieldset>

              <fieldset className={`tc-field ${errors.tier && touched.tier ? "has-error" : ""}`}>
                <legend className="tc-field__label">{t("form_tier")}</legend>
                <div className="tc-chips">
                  {tiers.map((s) => (
                    <button type="button" key={s} className={`tc-chip ${form.tier === s ? "is-on" : ""}`} onClick={() => { set("tier", s); blur("tier"); }}>{s}</button>
                  ))}
                </div>
                {errors.tier && touched.tier && <span className="tc-field__err">{errors.tier}</span>}
              </fieldset>

              <label className={`tc-field ${errors.goal && touched.goal ? "has-error" : ""}`}>
                <span className="tc-field__label">
                  {t("form_goal")}
                  <span className="tc-field__hint">{t("form_goal_hint")}</span>
                </span>
                <textarea rows={5} value={form.goal} onChange={(e) => set("goal", e.target.value)} onBlur={() => blur("goal")} placeholder={t("form_goal_ph")} />
                <span className="tc-field__count">{form.goal.length} {t("form_char")}</span>
                {errors.goal && touched.goal && <span className="tc-field__err">{errors.goal}</span>}
              </label>

              <label className={`tc-consent ${errors.consent && touched.consent ? "has-error" : ""}`}>
                <input type="checkbox" checked={form.consent} onChange={(e) => { set("consent", e.target.checked); blur("consent"); }} />
                <span>{t("form_consent")}</span>
              </label>
              {errors.consent && touched.consent && <span className="tc-field__err tc-field__err--block">{errors.consent}</span>}

              <button type="submit" className="tc-btn tc-btn--primary tc-btn--block">
                {t("form_send")}<span aria-hidden>→</span>
              </button>
              <p className="tc-form__fineprint">{t("form_fineprint")}</p>
            </>
          )}

          {step === 1 && (
            <div className="tc-form__thanks" role="status">
              <div className="tc-form__thanks-mark" aria-hidden>✓</div>
              <h3>{t("thanks_pre")}{form.name.split(" ")[0]}.</h3>
              <p>{t("thanks_body")}</p>
              <ul>
                <li>{t("thanks_1")}</li>
                <li>{t("thanks_2")}</li>
              </ul>
              <p className="tc-form__signoff">{t("thanks_signoff")}</p>
              <button type="button" className="tc-btn tc-btn--ghost" onClick={() => { setStep(0); setForm({ name:"", email:"", stage:"", tier:"", goal:"", consent:false }); setErrors({}); setTouched({}); }}>
                {t("thanks_again")}
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

function FAQ() {
  const { t } = window.useLang();
  const [open, setOpen] = useStateC(0);
  const items = [1,2,3,4,5,6].map(n => ({ q: t(`faq_${n}_q`), a: t(`faq_${n}_a`) }));
  return (
    <section className="tc-faq" id="faq">
      <div className="tc-section__head">
        <div className="tc-eyebrow"><span className="tc-eyebrow__dot" />{t("faq_eyebrow")}</div>
        <h2 className="tc-h2">{t("faq_h2")}</h2>
      </div>
      <div className="tc-faq__list">
        {items.map((it, i) => (
          <details key={it.q} open={open === i} onToggle={(e) => { if (e.target.open) setOpen(i); }} className="tc-faq__item">
            <summary>
              <span className="tc-faq__n">{String(i+1).padStart(2,"0")}</span>
              <span className="tc-faq__q">{it.q}</span>
              <span className="tc-faq__icon" aria-hidden>+</span>
            </summary>
            <p className="tc-faq__a">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  const { t } = window.useLang();
  return (
    <footer className="tc-footer">
      <div className="tc-footer__grid">
        <div className="tc-footer__brand">
          <img src={window.TC_GET_MEDIA("logo", "assets/logo.jpg")} alt="" />
          <div>
            <strong>ThinkCareer</strong>
            <span>{t("nav_brand_sub")}</span>
          </div>
        </div>
        <nav className="tc-footer__col">
          <h4>{t("foot_explore")}</h4>
          <a href="#about">{t("foot_about")}</a>
          <a href="#services">{t("foot_services")}</a>
          <a href="#approach">{t("foot_approach")}</a>
          <a href="#faq">{t("foot_faq")}</a>
        </nav>
        <nav className="tc-footer__col">
          <h4>{t("foot_programs")}</h4>
          <a href="#services">🚀 {t("t1_name")}</a>
          <a href="#services">📈 {t("t2_name")}</a>
          <a href="#services">🛡 {t("t3_name")}</a>
          <a href="#contact">{t("foot_workshops")}</a>
        </nav>
        <div className="tc-footer__col">
          <h4>{t("foot_hello")}</h4>
          <a href="tel:+85570719991">+855 70 71 99 91</a>
          <a href="https://www.linkedin.com/company/thinkcareer/" target="_blank" rel="noreferrer">{t("foot_linkedin")}</a>
          <a href="#" onClick={(e)=>e.preventDefault()}>{t("foot_telegram")}</a>
        </div>
      </div>
      <div className="tc-footer__base">
        <span>{t("foot_rights")}</span>
        <span>{t("foot_tagline")}</span>
      </div>
    </footer>
  );
}

window.Contact = Contact;
window.FAQ = FAQ;
window.Footer = Footer;

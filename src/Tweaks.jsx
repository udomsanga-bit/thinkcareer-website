// Tweaks panel — toggles palette / headline / density live
const { useState: useStateT, useEffect: useEffectT } = React;

function TweaksPanel({ state, setState }) {
  const { t } = window.useLang();
  const [available, setAvailable] = useStateT(false);
  const [shown, setShown] = useStateT(false);

  useEffectT(() => {
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.type === "__activate_edit_mode") setShown(true);
      if (d.type === "__deactivate_edit_mode") setShown(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    setAvailable(true);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const update = (patch) => {
    const next = { ...state, ...patch };
    setState(next);
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: patch }, "*");
  };

  if (!shown) return null;

  return (
    <aside className="tc-tweaks" role="dialog" aria-label="Tweaks">
      <div className="tc-tweaks__head">
        <span className="tc-eyebrow">
          <span className="tc-eyebrow__dot" />
          Tweaks
        </span>
        {/* title stays EN — toolbar label is fixed */}
        <button className="tc-tweaks__close" onClick={() => setShown(false)} aria-label="Close">×</button>
      </div>

      <div className="tc-tweaks__group">
        <label className="tc-tweaks__label">{t("tw_palette")}</label>
        <div className="tc-tweaks__swatches">
          {Object.entries(window.TC_PALETTES).map(([key, p]) => (
            <button
              key={key}
              className={`tc-tweaks__swatch ${state.palette === key ? "is-on" : ""}`}
              onClick={() => update({ palette: key })}
              title={p.name}
            >
              <span style={{ background: p.navy }} />
              <span style={{ background: p.sage }} />
              <span style={{ background: p.cream }} />
              <em>{p.name}</em>
            </button>
          ))}
        </div>
      </div>

      <div className="tc-tweaks__group">
        <label className="tc-tweaks__label">{t("tw_headline")}</label>
        <div className="tc-tweaks__stack">
          {[0,1,2].map((i) => (
            <button
              key={i}
              className={`tc-tweaks__opt ${state.headlineIndex === i ? "is-on" : ""}`}
              onClick={() => update({ headlineIndex: i })}
            >
              <span className="tc-tweaks__opt-n">{String(i+1).padStart(2,"0")}</span>
              <span className="tc-tweaks__opt-t">{t(`headline_${i+1}_title`)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tc-tweaks__group">
        <label className="tc-tweaks__label">{t("tw_density")}</label>
        <div className="tc-tweaks__segmented">
          {[["spacious",t("tw_density_1")],["standard",t("tw_density_2")],["compact",t("tw_density_3")]].map(([d,label]) => (
            <button
              key={d}
              className={`tc-tweaks__seg ${state.density === d ? "is-on" : ""}`}
              onClick={() => update({ density: d })}
            >{label}</button>
          ))}
        </div>
      </div>

      <div className="tc-tweaks__group">
        <label className="tc-tweaks__label">{t("tw_heading_font")}</label>
        <div className="tc-tweaks__segmented">
          {[
            ["serif", "Instrument Serif"],
            ["display", "Fraunces"],
            ["sans", "Inter Tight"],
          ].map(([key, name]) => (
            <button
              key={key}
              className={`tc-tweaks__seg ${state.headingFont === key ? "is-on" : ""}`}
              onClick={() => update({ headingFont: key })}
            >{name}</button>
          ))}
        </div>
      </div>
    </aside>
  );
}

window.TweaksPanel = TweaksPanel;

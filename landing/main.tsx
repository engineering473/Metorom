import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ArrowUpRight } from "lucide-react";
import InversionCircleScrollAnimation from "@/components/ui/inversion-circle-scroll-animation";
import { Navbar1 } from "@/concepts/monochrome/sculptural-v3/navbar";
import { previewHref, useLanguage } from "@/concepts/monochrome/sculptural-v3/language";
import { DEFAULT_COPY, DEFAULT_COPY_JA } from "@/concepts/monochrome/sculptural-v3/site-copy";
import SiteFooter from "@/concepts/monochrome/sculptural-v3/site-footer";
import { LANDING_COPY } from "./copy";
import "@/concepts/monochrome/sculptural-v3/styles.css";
import "@/concepts/monochrome/sculptural-v3/blue-theme.css";
import "./landing.css";

const PHOTO = `${import.meta.env.BASE_URL}images/gallery-speakers/dscf3008-edited.webp`;
const PRODUCT = `${import.meta.env.BASE_URL}images/concepts/speaker-render-front-v3.webp`;

function Landing() {
  const [language] = useLanguage();
  const c = LANDING_COPY[language];
  const productHref = previewHref("/product/");
  const contactHref = previewHref("/contact/");
  const sharedCopy = language === "ja" ? DEFAULT_COPY_JA : DEFAULT_COPY;

  useEffect(() => {
    document.title = c.metaTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", c.metaDescription);
  }, [c]);

  return <div className="mt-landing">
    <Navbar1 landing />
    <main id="main">
      <InversionCircleScrollAnimation title={c.heroTitle} description={c.heroBody} actionLabel={c.heroProduct} actionHref={productHref}
        scrollLabel={c.heroScroll} caption={c.eyebrow}>
        <div className="mt-overview">
          <h2 id="landing-concept-title">{c.overviewTitle}</h2>
          <div className="mt-overview__text"><p>{c.overviewBody}</p><span className="mt-caption">{c.overviewLabel}</span></div>
        </div>
      </InversionCircleScrollAnimation>

      <section className="mt-mission mt-section" aria-labelledby="mission-title">
        <div className="mt-section-heading"><h2 id="mission-title">{c.missionTitle}</h2><div><p>{c.missionIntro}</p><span className="mt-caption">{c.missionLabel}</span></div></div>
        <div className="mt-mission__list">
          {c.missions.map(mission => <article className="mt-mission__row" key={mission.number}>
            <div className="mt-mission__index"><span>{mission.number}</span><span>{mission.kicker}</span></div>
            <h3>{mission.title}</h3><p>{mission.body}</p>
          </article>)}
        </div>
      </section>

      <section className="mt-values mt-section" id="values" aria-labelledby="values-title">
        <div className="mt-section-heading"><h2 id="values-title">{c.valuesTitle}</h2><span className="mt-caption">{c.valuesLabel}</span></div>
        {c.values.map((value, index) => <article className="mt-value" key={value.number}>
          <div className="mt-value__identity">
            <h3>{value.title}</h3><span className="mt-caption">{value.kicker}</span>
            <div className={`mt-module-study mt-module-study--${index === 0 ? "human" : "modular"}`} aria-hidden="true"><i /><i /><i /></div>
          </div>
          <div className="mt-value__body"><p className="mt-value__intro">{value.intro}</p><ul>{value.points.map(point => <li key={point}>{point}</li>)}</ul></div>
        </article>)}
      </section>

      <section className="mt-vision mt-section" id="vision" aria-labelledby="vision-title">
        <div className="mt-section-heading"><h2 id="vision-title">{c.visionTitle}</h2><div><p>{c.visionIntro}</p><span className="mt-caption">{c.visionLabel}</span></div></div>
        <div className="mt-vision__sequence">
          {c.visions.map((vision, index) => <article className="mt-vision__item" key={vision.word}>
            <div className="mt-vision__word">{vision.word}<span className={`mt-wave mt-wave--${index}`} aria-hidden="true"><i /><i /><i /></span></div>
            <div className="mt-vision__body"><h3>{vision.title}</h3><p>{vision.body}</p></div>
          </article>)}
        </div>
        <div className="mt-vision__close"><h3>{c.visionCloseTitle}</h3><p>{c.visionCloseBody}</p></div>
      </section>

      <section className="mt-japan" id="japan" aria-labelledby="japan-title">
        <figure className="mt-japan__image"><img src={PHOTO} alt={language === "ja" ? "木々と水辺に佇むMetoromのスピーカー" : "Metorom loudspeakers beside a quiet lake and trees"} width="1600" height="1067" loading="lazy" decoding="async" /><figcaption>{c.footerTag}</figcaption></figure>
        <div className="mt-japan__content mt-section">
          <div className="mt-section-heading"><h2 id="japan-title">{c.japanTitle}</h2><div><p>{c.japanIntro}</p><span className="mt-caption">{c.japanLabel}</span></div></div>
          <div className="mt-japan__points">{c.japanPoints.map(point => <article key={point.number}><h3>{point.title}</h3><p>{point.body}</p></article>)}</div>
        </div>
      </section>

      <section className="mt-product mt-section" id="product-preview" aria-labelledby="product-title">
        <div className="mt-product__copy"><h2 id="product-title">{c.productTitle}</h2><p>{c.productBody}</p><span className="mt-caption">{c.productLabel}</span>
          <div className="mt-product__actions"><a className="sc-outline-link" href={productHref}>{c.productLink}<ArrowUpRight size={17} aria-hidden="true" /></a><a className="mt-contact-link" href={contactHref}>{c.contactLink}<ArrowUpRight size={16} aria-hidden="true" /></a></div>
        </div>
        <a className="mt-product__image" href={productHref} aria-label={c.productLink}><img src={PRODUCT} alt="Ground Sound I" width="1200" height="1600" loading="lazy" decoding="async" /></a>
      </section>
    </main>
    <SiteFooter copy={{ ...sharedCopy, footerTag: c.footerTag, footerBack: c.productLink, footerBackAria: c.productLink }} backToStudy />
  </div>;
}

const root = document.getElementById("root");
if (!root) throw new Error("Metorom landing root element is missing");
const productAnchors = ["architecture", "object", "measurements", "listening", "listening-design", "philosophy", "conversation"];
if (productAnchors.includes(window.location.hash.slice(1))) {
  window.location.replace(`/product/${window.location.search}${window.location.hash}`);
} else {
  createRoot(root).render(<Landing />);
}

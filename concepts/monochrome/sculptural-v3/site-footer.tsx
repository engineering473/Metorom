import { ArrowUpRight } from "lucide-react";
import { previewHref } from "./language";

type SharedFooterCopy = {
  brandName: string;
  footerTag: string;
  footerPhilosophy: string;
  footerEdit: string;
  footerNavigationAria: string;
};

type FooterProps =
  | { copy: SharedFooterCopy & { footerTopAria: string; footerStudies: string }; backToStudy?: false }
  | { copy: SharedFooterCopy & { footerBackAria: string; footerBack: string }; backToStudy: true };

export default function SiteFooter(props: FooterProps) {
  const { copy } = props;
  const editUrl = new URL(window.location.href);
  editUrl.searchParams.set("edit", "1");

  return <footer className="sc-footer">
    <a href={props.backToStudy ? previewHref("./index.html") : "#top"} className="sc-footer__wordmark" aria-label={props.backToStudy ? props.copy.footerBackAria : props.copy.footerTopAria}>{copy.brandName}</a>
    <div>
      <span>{copy.footerTag}</span>
      <nav className="sc-footer__links" aria-label={copy.footerNavigationAria}>
        <a href={previewHref("./design.html")}>{document.documentElement.lang === "ja" ? "デザインの詳細" : "Design details"} <ArrowUpRight size={15} aria-hidden="true" /></a>
        <a href={previewHref("./specifications.html")}>{document.documentElement.lang === "ja" ? "仕様" : "Specifications"} <ArrowUpRight size={15} aria-hidden="true" /></a>
        <a href={previewHref("./philosophy.html")}>{copy.footerPhilosophy} <ArrowUpRight size={15} aria-hidden="true" /></a>
        {new URLSearchParams(window.location.search).get("edit") === "1" && <a href={editUrl.pathname + editUrl.search + editUrl.hash}>{copy.footerEdit}</a>}
        {props.backToStudy
          ? <a href={previewHref("./index.html")}>{props.copy.footerBack} <ArrowUpRight size={15} aria-hidden="true" /></a>
          : <a href={previewHref("./contact.html")}>{document.documentElement.lang === "ja" ? "お問い合わせ" : "Contact"} <ArrowUpRight size={15} aria-hidden="true" /></a>}
      </nav>
    </div>
  </footer>;
}

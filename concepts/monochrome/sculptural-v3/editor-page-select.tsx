import { useLanguage } from "./language";

const pages = [
  { id: "home", path: "./index.html", label: "Home" },
  { id: "contact", path: "./contact.html", label: "Contact" },
  { id: "event", path: "./event.html", label: "Listening event" },
];

export default function EditorPageSelect({ page }: { page: string }) {
  const [language] = useLanguage();
  return <label className="sc-editor__page-select">Page to edit
    <select value={page} onChange={(event) => {
      const selected = pages.find((entry) => entry.id === event.target.value);
      if (selected) window.location.assign(`${selected.path}?edit=1&lang=${language}`);
    }}>
      {pages.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
    </select>
  </label>;
}

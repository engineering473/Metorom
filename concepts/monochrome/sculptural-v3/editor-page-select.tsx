import { useLanguage } from "./language";

const pages = [
  { id: "home", path: "./index.html", label: "Home" },
  { id: "design", path: "./index.html?editor=design#architecture", label: "Speaker design (on home)" },
  { id: "specifications", path: "./index.html#measurements", label: "Specifications (on home)" },
  { id: "philosophy", path: "./philosophy.html", label: "Philosophy" },
  { id: "contact", path: "./contact.html", label: "Contact" },
  { id: "event", path: "./event.html", label: "Listening event" },
];

export default function EditorPageSelect({ page }: { page: string }) {
  const [language] = useLanguage();
  return <label className="sc-editor__page-select">Page to edit
    <select value={page} onChange={(event) => {
      const selected = pages.find((entry) => entry.id === event.target.value);
      if (selected) {
        const destination = new URL(selected.path, window.location.href);
        destination.searchParams.set("edit", "1");
        destination.searchParams.set("lang", language);
        window.location.assign(destination.href);
      }
    }}>
      {pages.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
    </select>
  </label>;
}

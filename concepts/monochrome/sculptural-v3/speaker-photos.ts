import type { LiquidGlassCarouselItem } from "@/components/ui/liquid-glass-carousel";

const photos: { id: string; en: string; ja: string; focalPoint: [number, number] }[] = [
  { id: "2852", en: "Cabinet and drivers", ja: "キャビネットとドライバー", focalPoint: [.5, .5] },
  { id: "2862", en: "In the open", ja: "ひらけた場所で", focalPoint: [1, .5] },
  { id: "2889", en: "Among the trees", ja: "木々の間で", focalPoint: [.5, .55] },
  { id: "2928", en: "Forest light", ja: "森の光", focalPoint: [.5, .5] },
  { id: "2936", en: "From the back", ja: "背面から", focalPoint: [.5, .55] },
  { id: "2999", en: "By the water", ja: "水辺で", focalPoint: [.5, .5] },
  { id: "3008", en: "Lakeside listening", ja: "湖畔で聴く", focalPoint: [1, .5] },
  { id: "3021", en: "Along the path", ja: "小道に沿って", focalPoint: [.5, .75] },
];

export function speakerPhotos(language: "en" | "ja"): LiquidGlassCarouselItem[] {
  return photos.map(({ id, en, ja, focalPoint }) => ({
    src: `${import.meta.env.BASE_URL}images/gallery-speakers/dscf${id}-edited.webp`,
    title: language === "ja" ? ja : en,
    aspect: 3 / 4,
    focalPoint,
  }));
}

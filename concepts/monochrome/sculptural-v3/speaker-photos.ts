import type { LiquidGlassCarouselItem } from "@/components/ui/liquid-glass-carousel";

const photos: { id: string; en: string; ja: string; focalPoint: [number, number] }[] = [
  { id: "2839", en: "On the hillside", ja: "丘の上で", focalPoint: [1, .5] },
  { id: "2852", en: "Cabinet and drivers", ja: "キャビネットとドライバー", focalPoint: [.5, .5] },
  { id: "2855", en: "A closer look", ja: "かたちを見つめる", focalPoint: [.45, .5] },
  { id: "2862", en: "In the open", ja: "ひらけた場所で", focalPoint: [1, .5] },
  { id: "2864", en: "At ground level", ja: "地面と同じ高さで", focalPoint: [.46, .5] },
  { id: "2893", en: "Among the trees", ja: "木々の間で", focalPoint: [.6, .5] },
  { id: "2915", en: "From the back", ja: "背面から", focalPoint: [.42, .5] },
  { id: "2928", en: "Forest light", ja: "森の光", focalPoint: [.5, .5] },
  { id: "2930", en: "Through the ferns", ja: "シダ越しに", focalPoint: [.47, .5] },
  { id: "2931", en: "Under the canopy", ja: "木陰で", focalPoint: [.5, .6] },
  { id: "2999", en: "By the water", ja: "水辺で", focalPoint: [.5, .5] },
  { id: "3001", en: "Lakeside listening", ja: "湖畔で聴く", focalPoint: [1, .5] },
  { id: "3021", en: "Along the path", ja: "小道に沿って", focalPoint: [.5, .75] },
];

export function speakerPhotos(language: "en" | "ja"): LiquidGlassCarouselItem[] {
  return photos.map(({ id, en, ja, focalPoint }) => ({
    src: `${import.meta.env.BASE_URL}images/gallery-speakers/dscf${id}.webp`,
    title: language === "ja" ? ja : en,
    aspect: 3 / 4,
    focalPoint,
  }));
}

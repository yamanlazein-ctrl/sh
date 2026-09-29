// محتوى تجريبي للعرض فقط — يُستبدل لاحقاً بمحتوى الأرشيف الحقيقي

export type Tone = "mint" | "cream" | "black" | "gray";

export interface Book {
  id: number;
  title: string;
  short: string;
  field: string;
  volumes: string;
  pages: string;
  desc: string;
  tone: Tone;
  h: number;
  w: number;
  itemId?: number;
}

export const BOOKS: Book[] = [
  { id: 1, title: "صفوة التفاسير", short: "صفوة التفاسير", field: "تفسير", volumes: "٣ مجلدات", pages: "١٨٥٠ صفحة", desc: "أشهر مؤلفات الشيخ. يجمع خلاصة أمهات كتب التفسير بعبارة واضحة، ويبيّن مقاصد كل سورة ومعاني مفرداتها ولطائفها البلاغية.", tone: "mint", h: 300, w: 66, itemId: 1 },
  { id: 2, title: "روائع البيان في تفسير آيات الأحكام", short: "روائع البيان", field: "فقه مقارن", volumes: "مجلدان", pages: "١٢٠٠ صفحة", desc: "دراسة مقارنة لآيات الأحكام بين المذاهب الأربعة، دُرّست سنوات طويلة في كلية الشريعة.", tone: "cream", h: 282, w: 58, itemId: 2 },
  { id: 3, title: "المواريث في الشريعة الإسلامية", short: "المواريث", field: "فرائض", volumes: "مجلد واحد", pages: "٣٢٠ صفحة", desc: "علم الفرائض مبسّطاً بالجداول والأمثلة، من أصحاب الفروض إلى حساب المسائل.", tone: "black", h: 250, w: 50, itemId: 3 },
  { id: 4, title: "التبيان في علوم القرآن", short: "التبيان", field: "علوم القرآن", volumes: "مجلد واحد", pages: "٢٦٠ صفحة", desc: "مدخل منهجي إلى الوحي والنزول وجمع القرآن والناسخ والمنسوخ والإعجاز.", tone: "gray", h: 266, w: 48, itemId: 4 },
  { id: 5, title: "مختصر تفسير ابن كثير", short: "مختصر ابن كثير", field: "تفسير", volumes: "٣ مجلدات", pages: "٢١٠٠ صفحة", desc: "تهذيب لتفسير ابن كثير يحذف المكرر والأسانيد الطويلة ويحافظ على روح الأصل.", tone: "cream", h: 296, w: 62, itemId: 5 },
  { id: 6, title: "من كنوز السنة", short: "من كنوز السنة", field: "حديث", volumes: "مجلد واحد", pages: "٣٨٠ صفحة", desc: "دراسات أدبية ولغوية في مختارات من الحديث النبوي الشريف.", tone: "mint", h: 240, w: 46, itemId: 6 },
  { id: 7, title: "قبس من نور القرآن الكريم", short: "قبس من نور القرآن", field: "تفسير موضوعي", volumes: "عدة أجزاء", pages: "—", desc: "وقفات تفسيرية موضوعية تربط معاني الآيات بحياة المسلم اليومية.", tone: "black", h: 286, w: 56 },
  { id: 8, title: "النبوة والأنبياء", short: "النبوة والأنبياء", field: "عقيدة وسيرة", volumes: "مجلد واحد", pages: "—", desc: "دراسة في حقيقة النبوة وسِيَر الأنبياء كما وردت في القرآن الكريم.", tone: "gray", h: 256, w: 50 },
];

export interface Video {
  id: number;
  title: string;
  series: string;
  duration: string;
  views: string;
  poster: string;
  youtubeId?: string;
}

export const VIDEO_SERIES = ["الكل", "برامج تلفزيونية", "لقاءات", "محاضرات"];

export const VIDEOS: Video[] = [
  { id: 1, title: "قصة تأليف صفوة التفاسير", series: "لقاءات", duration: "52:10", views: "68 ألف مشاهدة", poster: "/images/sheikh-portrait.jpg" },
  { id: 2, title: "لطائف من البيان القرآني", series: "برامج تلفزيونية", duration: "45:00", views: "56 ألف مشاهدة", poster: "/images/sheikh-lecture-side.jpg" },
  { id: 3, title: "أحكام الصيام من سورة البقرة", series: "برامج تلفزيونية", duration: "31:40", views: "38 ألف مشاهدة", poster: "/images/archive-manuscripts.jpg" },
  { id: 4, title: "الشباب والقرآن", series: "محاضرات", duration: "38:20", views: "29 ألف مشاهدة", poster: "/images/sheikh-meeting-left.jpg" },
  { id: 5, title: "ذكريات حلب والمدرسة الخسروية", series: "لقاءات", duration: "41:05", views: "24 ألف مشاهدة", poster: "/images/aleppo-scholar.jpg" },
  { id: 6, title: "منهج التعامل مع كتب التفسير", series: "محاضرات", duration: "47:30", views: "19 ألف مشاهدة", poster: "/images/sheikh-meeting-right.jpg" },
];

export interface Track {
  id: number;
  title: string;
  series: string;
  place: string;
  duration: number; // seconds
}

export const TRACKS: Track[] = [
  { id: 1, title: "تفسير سورة الكهف", series: "مجالس التفسير", place: "المسجد الحرام", duration: 2895 },
  { id: 2, title: "تفسير سورة الفاتحة", series: "مجالس التفسير", place: "المسجد الحرام", duration: 2060 },
  { id: 3, title: "شرح آية الكرسي", series: "مجالس التفسير", place: "مكة المكرمة", duration: 1620 },
  { id: 4, title: "خطبة: التقوى وثمارها", series: "خطب الجمعة", place: "مكة المكرمة", duration: 1720 },
  { id: 5, title: "مدخل إلى علم المواريث", series: "دروس الفقه", place: "جامعة أم القرى", duration: 3120 },
  { id: 6, title: "خطبة: بر الوالدين", series: "خطب الجمعة", place: "حلب", duration: 1440 },
  { id: 7, title: "أسرار سورة يس", series: "مجالس التفسير", place: "المسجد الحرام", duration: 2480 },
  { id: 8, title: "فضل ليلة القدر", series: "مواعظ", place: "مكة المكرمة", duration: 1270 },
];

// شكل موجة ثابت لكل تسجيل (مولّد بشكل حتمي)
export function waveform(seed: number, n = 64): number[] {
  let s = seed * 9301 + 49297;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    const env = 0.55 + 0.45 * Math.sin((i / n) * Math.PI);
    out.push(Math.max(0.12, Math.min(1, (0.3 + r * 0.7) * env)));
  }
  return out;
}

export function fmt(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

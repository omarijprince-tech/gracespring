import HomeContent from "../components/HomeContent";

export const metadata = {
  title: "Grace Spring Water — 5-Gallon Water Delivery in NJ & NYC",
  description: "Grace Spring delivers 5-gallon bottles of alkaline, purified, and natural spring water to homes and offices across northern New Jersey and the five NYC boroughs. Buy a cooler, get 5 bottles + a stand free. Monthly refill reminders — no auto-charge. Se Habla Español.",
  openGraph: {
    title: "Grace Spring Water — 5-Gallon Water Delivery, NJ & NYC",
    description: "5-gallon alkaline, purified & natural spring water delivered. Buy 1 cooler, get 5 bottles + a stand FREE. Monthly refill reminders, no auto-charge.",
    type: "website",
  },
};

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "What's the bottle deposit?",
      "acceptedAnswer": { "@type": "Answer", "text": "Your first order includes a one-time $5 deposit per 5-gallon bottle. It's non-recurring as long as we swap your empties for full bottles, and refundable when you return your empties for good." } },
    { "@type": "Question", "name": "How does monthly delivery work?",
      "acceptedAnswer": { "@type": "Answer", "text": "There are no auto-charges. Each month, the day before your route runs, we remind you by text, email, or phone call. Reply with how many jugs you'd like and we'll bring them." } },
    { "@type": "Question", "name": "How much is delivery?",
      "acceptedAnswer": { "@type": "Answer", "text": "Shipping is a flat $5.00 per delivery anywhere in our service area, no matter how many bottles you order." } },
    { "@type": "Question", "name": "Can I add a water cooler?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Buy any Avalon cooler for $180 and we automatically add 5 free 5-gallon bottles and a bottle stand. Hot & cold, top or bottom loader, black or white." } },
    { "@type": "Question", "name": "Do you deliver to my area?",
      "acceptedAnswer": { "@type": "Answer", "text": "We cover northern New Jersey — Bergen, Hudson, Passaic, Essex, Union, and Morris counties — plus all five NYC boroughs: Manhattan, Brooklyn, Queens, the Bronx, and Staten Island." } },
    { "@type": "Question", "name": "What if my order arrives damaged or goes missing?",
      "acceptedAnswer": { "@type": "Answer", "text": "If your water arrives damaged, keep it — we'll send a replacement at no charge. If a delivery is stolen after drop-off, we'll issue a refund. Every delivery is photo-documented by our driver." } },
    { "@type": "Question", "name": "Is Grace Spring the same company as Blue Star and ALKAID?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes — Grace Spring, Blue Star, and ALKAID are all from the same family water company, serving New Jersey and New York since 2010." } }
  ]
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }} />
      <HomeContent />
    </>
  );
}

import BottleDefs from "../../components/BottleDefs";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import ContactClient from "./ContactClient";

export const metadata = {
  title: "Contact Us — Grace Spring Water",
  description:
    "Questions about a delivery, monthly refill, or an order? Reach the Grace Spring Water team — we serve northern New Jersey and the NYC metro.",
  alternates: { canonical: "https://gracespringwater.com/contact" },
};

export default function ContactPage() {
  return (
    <>
      <BottleDefs />
      <SiteHeader variant="simple" />
      <main className="container" id="contactMain">
        <ContactClient />
      </main>
      <SiteFooter />
    </>
  );
}

import SiteHeader from "../../components/SiteHeader";
import AdminClient from "./AdminClient";

export const metadata = {
  title: "Operations — Grace Spring Water",
  robots: { index: false },
};

export default function AdminPage() {
  return (
    <>
      <SiteHeader variant="simple" />
      <main className="container" style={{ padding: "28px 0 72px" }}>
        <AdminClient />
      </main>
    </>
  );
}

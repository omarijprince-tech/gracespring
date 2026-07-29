import SiteHeader from "../../components/SiteHeader";
import AccountClient from "./AccountClient";

export const metadata = {
  title: "My Account — Grace Spring Water",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <>
      <SiteHeader variant="simple" />
      <main className="container account-layout">
        <AccountClient />
      </main>
    </>
  );
}

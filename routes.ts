import SiteHeader from "../../components/SiteHeader";
import LoginClient from "./LoginClient";

export const metadata = {
  title: "Sign In — Grace Spring Water",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader variant="simple" />
      <main className="container auth-layout">
        <LoginClient />
      </main>
    </>
  );
}

import RouteClient from "./RouteClient";

export const metadata = {
  title: "Delivery Route — Grace Spring Water",
  robots: { index: false },
};

export default async function RoutePage({ params }) {
  const { token } = await params;
  return <RouteClient token={token} />;
}

import { SessionsPage } from "@/components/sessions/sessions-page";

export default function Page() {
  // NOTE:
  // Client side fetching is intentional here: for this small project, keeping the
  // interactive pagination and session data in one component is clearer for this kind of projects.
  return <SessionsPage />;
}

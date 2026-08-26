import { useParams } from "react-router-dom";
import { StudyDashboard } from "../components/dashboard/StudyDashboard";

export default function GroupDashboardPage() {
  const { id } = useParams();
  if (!id) return null;
  return <StudyDashboard groupId={id} />;
}

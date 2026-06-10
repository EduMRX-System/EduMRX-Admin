import LearningCenterDetailView from "@/views/DetailView/LearningCenterDetailView";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LearningCenterDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return <LearningCenterDetailView />;
}
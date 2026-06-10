import DirectorDetailView from "@/views/DetailView/DirectorDetailView";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function DirectorDetailPage({ params }: Props) {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    return <DirectorDetailView directorId={id} />;
}
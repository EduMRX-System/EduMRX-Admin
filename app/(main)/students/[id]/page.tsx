import StudentDetailView from "@/views/DetailView/StudentDetailView";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;

    return <StudentDetailView id={id} />;
}   
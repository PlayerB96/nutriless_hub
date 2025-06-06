import RecetaDetalle from "../components/RecetaDetalle";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RecetaPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <RecetaDetalle id={id} />
    </div>
  );
}

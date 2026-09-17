export function ErrorState({
  title = "Unable to complete this read",
  detail,
}: {
  title?: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-red-900/40 bg-[#120808] px-5 py-5">
      <p className="text-sm font-medium text-red-100">{title}</p>
      <p className="mt-1 text-sm leading-6 text-red-200/80">{detail}</p>
    </div>
  );
}

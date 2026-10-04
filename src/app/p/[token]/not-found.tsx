export default function NotAvailable() {
  return (
    <main className="mx-auto mt-24 max-w-md space-y-3 p-6 text-center">
      <h1 className="text-xl font-semibold">This profile isn&apos;t available</h1>
      <p className="text-sm text-gray-600">
        The link may have expired or been withdrawn, or you may not have access to it.
      </p>
    </main>
  );
}
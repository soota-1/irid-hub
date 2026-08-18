export function AdminAccessDenied() {
  return (
    <div className="max-w-md">
      <h1 className="text-h2">Akses Ditolak</h1>
      <p className="text-surface-muted mt-2">
        Kamu masuk sebagai member, tapi belum punya akses admin/pengurus untuk halaman ini.
      </p>
    </div>
  );
}

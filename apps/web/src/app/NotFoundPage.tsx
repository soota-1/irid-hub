import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-h1 bg-iridescent bg-clip-text text-transparent font-display font-bold">404</p>
      <h1 className="text-h3 mt-2">Halaman tidak ditemukan</h1>
      <p className="text-surface-muted mt-2 max-w-sm">
        Halaman yang kamu cari mungkin sudah dipindahkan atau tidak pernah ada.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center h-11 px-5 rounded-md text-sm font-medium text-white bg-iridescent"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}

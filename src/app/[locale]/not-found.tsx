import { Link } from '@/i18n/navigation';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-void px-4 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">404</p>
      <h1 className="font-display text-2xl font-bold text-white">Signal lost</h1>
      <p className="max-w-sm text-sm text-mist">
        We couldn&apos;t find that station or country. It may be off the air, or the link may be outdated.
      </p>
      <Link href="/" className="mt-2 rounded-full bg-signal px-4 py-2 text-sm font-medium text-void hover:brightness-110">
        Back to the globe
      </Link>
    </main>
  );
}

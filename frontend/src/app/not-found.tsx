import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Page introuvable</h1>
        <Link className="text-accent mt-4 inline-block hover:underline" href="/sessions">
          Retour aux sessions
        </Link>
      </div>
    </main>
  );
}

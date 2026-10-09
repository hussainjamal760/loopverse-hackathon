import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#DEDCD1] p-8 rounded-2xl shadow-xs space-y-4">
        <h1
          className="text-3xl font-bold text-[#24352B]"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          404 - Page Not Found
        </h1>
        <p className="text-xs text-[#59645B] leading-relaxed">
          The requested examination portal page or administrative resource could not be found.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#285742] hover:bg-[#204735] text-white text-xs font-semibold transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

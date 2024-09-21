import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-start justify-items-start min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 ">
        <Link href={'/deploy'} className="border p-2 rounded-md bg-gray-200">Deploy Agent</Link>
      </main>
    </div>
  );
}

import { DynamicWidget } from "../lib/dynamic";

export default function Header() {
  return (
    <header className="sticky flex justify-between border-b items-center w-full max-w-3xl py-4 px-6 mx-auto">
      <h1 className="text-3xl font-semibold text-[#694FFF]">AIConomy</h1>
      <DynamicWidget />
    </header>
  );
}

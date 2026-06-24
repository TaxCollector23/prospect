import { LogoMark } from "@/components/brand/logo";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LogoMark className="h-10 w-10 animate-pulse" />
    </div>
  );
}

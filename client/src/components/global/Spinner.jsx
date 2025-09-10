import { Loader2 } from "lucide-react";

export default function Spinner({ size, text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center text-gray-900">
      <Loader2 size={size} className="animate-spin text-blue-500" />
      {text && <p className="text-base text-gray-600">{text}</p>}
    </div>
  );
}

import { X } from "lucide-react";

export default function DeleteModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-content center z-[999] sm:p-4">
      <div className="w-[500px] max-w-[90%] rounded-2xl overflow-hidden animate-[fadeIn_0.3s_ease] bg-white border border-gray-200 sm:w-full sm:max-h-[90vh] sm:overflow-y-auto">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl m-0 text-gray-900">{title}</h2>
          <button
            className="bg-transparent border-none cursor-pointer text-gray-900 transition-transform duration-200 ease-in-out hover:rotate-90"
            onClick={onCancel}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 text-base text-gray-600">
          <p>{message}</p>
        </div>

        <div className="flex justify-end gap-4 p-4 border-t border-gray-200">
          <button
            className="px-4 py-2 rounded-lg border-none cursor-pointer font-semibold transition-all duration-200 ease-in-out bg-gray-100 text-gray-700 hover:opacity-90"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg border-none cursor-pointer font-semibold transition-all duration-200 ease-in-out bg-red-500 text-white hover:opacity-90"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

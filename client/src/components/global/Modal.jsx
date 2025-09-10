import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center z-[999] mt-[70px] sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-[550px] max-w-[90%] max-h-[90vh] rounded-2xl overflow-y-auto overflow-x-hidden animate-[fadeIn_0.3s_ease] bg-white border border-gray-200 sm:w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent scrollbar-thumb-rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl m-0 text-gray-900">{title}</h2>
          <button
            className="bg-transparent border-none cursor-pointer text-gray-900 transition-transform duration-200 ease-in-out hover:rotate-90"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-5 text-base text-gray-600">{children}</div>
      </div>
    </div>
  );
}

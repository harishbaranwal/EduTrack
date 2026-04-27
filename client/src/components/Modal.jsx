import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative bg-white rounded-xl shadow-2xl ${size} w-full transform transition-all duration-300 scale-100`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          )}
          
          {/* Body */}
          <div className={title ? "p-6" : "p-6"}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
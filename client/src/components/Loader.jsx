const Loader = ({ size = 'medium', fullScreen = false, text = '' }) => {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-2',
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-indigo-600 border-t-transparent rounded-full animate-spin`}
      ></div>
      {text && <p className="mt-4 text-gray-600 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/90 z-50">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      {loaderContent}
    </div>
  );
};

export default Loader;

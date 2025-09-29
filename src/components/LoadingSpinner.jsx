export default function LoadingSpinner({ size = "h-12 w-12", className = "" }) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className={`relative ${size}`}>
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-600 text-sm font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
export default function LoadingSpinner({ size = "h-16 w-16", className = "" }) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 ${className}`}>
      <div className="flex flex-col items-center space-y-6">
        <div className={`relative ${size}`}>
          <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 border-r-pink-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-blue-500 border-l-indigo-600 animate-spin animation-reverse"></div>
        </div>
        <div className="text-center">
          <p className="text-purple-700 text-lg font-semibold animate-pulse">Memuat...</p>
          <p className="text-purple-500 text-sm mt-1">Harap tunggu</p>
        </div>
      </div>
    </div>
  );
}
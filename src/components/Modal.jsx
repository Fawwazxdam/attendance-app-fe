export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-indigo-900/80 overflow-y-auto h-full w-full z-50 transition-all duration-500 backdrop-blur-sm ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      id="my-modal"
    >
      <div
        className={`relative top-20 mx-auto p-6 border w-96 shadow-2xl rounded-2xl bg-white transform transition-all duration-500 ${
          isOpen ? 'scale-100 translate-y-0 rotate-0' : 'scale-90 translate-y-8 rotate-1'
        }`}
      >
        <div className="">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 transition-all duration-200 p-2 rounded-full hover:bg-red-50 transform hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
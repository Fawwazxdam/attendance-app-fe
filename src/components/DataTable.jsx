export default function DataTable({ columns, data, actions }) {
  return (
    <div className="bg-white shadow-xl overflow-hidden sm:rounded-2xl border border-purple-100">
      <table className="min-w-full divide-y divide-purple-100">
        <thead className="bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider transition-all duration-300"
              >
                {column.header}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider transition-all duration-300">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-purple-50">
          {data.map((item, index) => (
            <tr
              key={item.id || index}
              className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 ease-in-out transform hover:scale-[1.005] hover:shadow-lg border-l-4 border-transparent hover:border-purple-300"
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 transition-all duration-300">
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium transition-all duration-300">
                  <div className="flex space-x-2">
                    {actions(item)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
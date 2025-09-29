export default function DataTable({ columns, data, actions }) {
  return (
    <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl border border-gray-100">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider transition-colors duration-200"
              >
                {column.header}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider transition-colors duration-200">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((item, index) => (
            <tr
              key={item.id || index}
              className="hover:bg-gray-50 transition-colors duration-200 ease-in-out transform hover:scale-[1.01] hover:shadow-sm"
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 transition-colors duration-200">
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium transition-all duration-200">
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
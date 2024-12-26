import React from 'react';
import { UrlProcessingResult } from '../../utils/url/types';

interface ErrorListProps {
  results: UrlProcessingResult[];
}

export default function ErrorList({ results }: ErrorListProps) {
  return (
    <div>
      <h4 className="font-medium mb-2 text-red-600">Errors</h4>
      <div className="bg-red-50 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-red-200">
          <thead className="bg-red-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase">Row Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase">Errors</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-200">
            {results.slice(0, 5).map((result, index) => (
              <tr key={index}>
                <td className="px-6 py-4 text-sm text-red-500">
                  {Object.entries(result.originalRow)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')}
                </td>
                <td className="px-6 py-4 text-sm text-red-500">
                  {result.errors.join('; ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
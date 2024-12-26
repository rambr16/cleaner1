import React from 'react';
import { UrlProcessingResult } from '../../utils/url/types';

interface ResultsPreviewProps {
  results: UrlProcessingResult[];
}

export default function ResultsPreview({ results }: ResultsPreviewProps) {
  return (
    <div>
      <h4 className="font-medium mb-2">Preview (first 10 results)</h4>
      <div className="bg-gray-50 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Original Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cleaned Domains</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {results.slice(0, 10).map((result, index) => (
              <tr key={index}>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {Object.entries(result.originalRow)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {Array.from(result.cleanedDomains).join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Search, Download, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { useProcessing } from '../hooks/useProcessing';
import { cleanupAfterDownload } from '../utils/cleanup';
import { enrichApolloData } from '../utils/apollo/enricher';
import { ApolloSearchResult } from '../utils/apollo/types';

export default function ApolloLeads() {
  const {
    isProcessing,
    setIsProcessing,
    error,
    setError,
    progress,
    setProgress,
    resetProcessing
  } = useProcessing();
  const [searchUrl, setSearchUrl] = useState('');
  const [results, setResults] = useState<ApolloSearchResult[]>([]);

  const handleSearch = async () => {
    if (!searchUrl.trim()) {
      setError('Please enter an Apollo search URL');
      return;
    }

    resetProcessing();
    setIsProcessing(true);

    try {
      const enrichedData = await enrichApolloData(searchUrl);
      setResults(enrichedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error processing Apollo data';
      setError(errorMessage);
      console.error(err);
      setResults([]);
    } finally {
      setIsProcessing(false);
      setProgress(prev => ({ ...prev, stage: 'complete' }));
    }
  };

  const handleExport = () => {
    if (results.length === 0) return;

    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'apollo_leads.csv';

    link.addEventListener('click', () => {
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
        cleanupAfterDownload(setResults, resetProcessing);
      }, 100);
    });

    link.click();
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Apollo Lead Finder</h2>
            <div className="text-gray-600 mb-4">
              <p>Paste your Apollo search URL to find and export leads.</p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={searchUrl}
                onChange={(e) => setSearchUrl(e.target.value)}
                placeholder="Paste Apollo search URL here..."
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isProcessing}
              />
              <button
                onClick={handleSearch}
                disabled={isProcessing || !searchUrl.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                <span className="ml-2">Search</span>
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {results.length > 0 && !isProcessing && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Results ({results.length} leads found)</h3>
                  <button
                    onClick={handleExport}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Export to CSV
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.slice(0, 5).map((result) => (
                        <tr key={result.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {`${result.first_name} ${result.last_name}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.company_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
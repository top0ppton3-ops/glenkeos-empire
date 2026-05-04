/**
 * Backend API Test Component
 * Tests connectivity to GlenKeos backend
 */

import { useState } from 'react';
import { BACKEND_URL } from '../services/api/client';
import { publicAnonKey } from '../../../utils/supabase/info';
import { mockBackend } from '../services/api/mockBackend';

// Toggle between real and mock
const USE_MOCK = true;

interface TestResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  statusCode?: number;
  message?: string;
  data?: unknown;
}

export function BackendTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const tests = [
    {
      name: 'Health Check',
      endpoint: '/health',
      method: 'GET',
      description: 'Basic health check endpoint'
    },
    {
      name: 'Analytics Dashboard',
      endpoint: '/analytics/dashboard',
      method: 'GET',
      description: 'Get analytics data'
    },
    {
      name: 'List Customers',
      endpoint: '/customers',
      method: 'GET',
      description: 'Get all customers'
    }
  ];

  const runTests = async () => {
    setTesting(true);
    const newResults: TestResult[] = [];

    if (USE_MOCK) {
      // Test mock backend
      const mockTests = [
        { name: 'Health Check', fn: () => mockBackend.health() },
        { name: 'Analytics Dashboard', fn: () => mockBackend.getAnalytics() },
        { name: 'List Customers', fn: () => mockBackend.listCustomers() }
      ];

      for (let i = 0; i < mockTests.length; i++) {
        const test = tests[i];
        const mockTest = mockTests[i];
        const result: TestResult = {
          endpoint: test.endpoint,
          status: 'pending'
        };

        try {
          const data = await mockTest.fn();
          result.status = 'success';
          result.statusCode = 200;
          result.data = data;
          result.message = JSON.stringify(data, null, 2);
        } catch (error: any) {
          result.status = 'error';
          result.message = error.message || String(error);
        }

        newResults.push(result);
        setResults([...newResults]);
      }
    } else {
      // Test real backend
      for (const test of tests) {
        const result: TestResult = {
          endpoint: test.endpoint,
          status: 'pending'
        };

        try {
          const url = `${BACKEND_URL}${test.endpoint}`;
          console.log(`Testing: ${test.method} ${url}`);

          const response = await fetch(url, {
            method: test.method,
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          });

          result.statusCode = response.status;
          
          try {
            const data = await response.json();
            result.data = data;
            result.message = JSON.stringify(data, null, 2);
          } catch {
            const text = await response.text();
            result.message = text || 'No response body';
          }

          if (response.ok) {
            result.status = 'success';
          } else {
            result.status = 'error';
          }
        } catch (error: any) {
          result.status = 'error';
          result.message = error.message || String(error);
          console.error(`Test failed for ${test.endpoint}:`, error);
        }

        newResults.push(result);
        setResults([...newResults]);
      }
    }

    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">GlenKeos Backend Test</h1>
          <p className="text-gray-600 mb-4">
            Testing connectivity to backend API
          </p>
          
          {USE_MOCK && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ MOCK MODE ACTIVE</strong><br />
                Using local mock backend. Deploy real backend and set USE_MOCK=false in BackendTest.tsx
              </p>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <p className="text-sm font-mono text-blue-900">
              <strong>Backend URL:</strong> {USE_MOCK ? 'Mock Backend (Local)' : BACKEND_URL}
            </p>
          </div>

          <button
            onClick={runTests}
            disabled={testing}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {testing ? 'Testing...' : 'Run Tests'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            {tests.map((test, index) => {
              const result = results[index];
              
              if (!result) {
                return (
                  <div key={test.endpoint} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-400 animate-pulse" />
                      <h3 className="font-semibold">{test.name}</h3>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={test.endpoint}
                  className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                    result.status === 'success'
                      ? 'border-green-500'
                      : result.status === 'error'
                      ? 'border-red-500'
                      : 'border-gray-400'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          result.status === 'success'
                            ? 'bg-green-500'
                            : result.status === 'error'
                            ? 'bg-red-500'
                            : 'bg-gray-400'
                        }`}
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{test.name}</h3>
                        <p className="text-sm text-gray-600">{test.description}</p>
                      </div>
                    </div>
                    {result.statusCode && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          result.statusCode >= 200 && result.statusCode < 300
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {result.statusCode}
                      </span>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <p className="text-xs font-mono text-gray-700">
                      {test.method} {BACKEND_URL}{test.endpoint}
                    </p>
                  </div>

                  {result.message && (
                    <div className="bg-gray-900 text-gray-100 rounded p-4 overflow-x-auto">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {result.message}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!testing && results.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-3">Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 rounded p-4">
                <div className="text-3xl font-bold text-green-600">
                  {results.filter(r => r.status === 'success').length}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="bg-red-50 rounded p-4">
                <div className="text-3xl font-bold text-red-600">
                  {results.filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="bg-blue-50 rounded p-4">
                <div className="text-3xl font-bold text-blue-600">
                  {results.length}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
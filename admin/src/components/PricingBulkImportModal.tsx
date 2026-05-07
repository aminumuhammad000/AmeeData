import React, { useState } from 'react';

interface PricingBulkImportModalProps {
  onClose: () => void;
  onImport: (plans: any[]) => void;
  isImporting: boolean;
}

const PricingBulkImportModal: React.FC<PricingBulkImportModalProps> = ({ onClose, onImport, isImporting }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [csvInput, setCsvInput] = useState('');
  const [importMode, setImportMode] = useState<'json' | 'csv'>('json');
  const [error, setError] = useState('');

  const handleJsonImport = () => {
    try {
      setError('');
      const plans = JSON.parse(jsonInput);
      
      if (!Array.isArray(plans)) {
        setError('JSON must be an array of plans');
        return;
      }

      // Validate each plan
      for (const plan of plans) {
        if (!plan.providerId || !plan.providerName || !plan.name || plan.price === undefined || !plan.type) {
          setError('Each plan must have: providerId, providerName, name, price, type');
          return;
        }
      }

      onImport(plans);
    } catch (err: any) {
      setError('Invalid JSON: ' + err.message);
    }
  };

  const handleCsvImport = () => {
    try {
      setError('');
      const lines = csvInput.trim().split('\n');
      if (lines.length < 2) {
        setError('CSV must have at least header and one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const plans = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const plan: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index];
          const lowerHeader = header.toLowerCase();
          // Try to parse as number
          if (value && !isNaN(Number(value)) && (lowerHeader.includes('price') || lowerHeader.includes('discount') || lowerHeader.includes('id'))) {
            plan[header] = Number(value);
          } else if (value === 'true' || value === 'false') {
            plan[header] = value === 'true';
          } else {
            plan[header] = value;
          }
        });

        plans.push(plan);
      }

      // Validate
      for (const plan of plans) {
        if (!plan.providerId || !plan.providerName || !plan.name || plan.price === undefined || !plan.type) {
          setError('Each plan must have: providerId, providerName, name, price, type');
          return;
        }
      }

      onImport(plans);
    } catch (err: any) {
      setError('Invalid CSV: ' + err.message);
    }
  };

  const downloadSampleJson = () => {
    const sample = [
      {
        providerId: 1,
        providerName: "MTN",
        externalPlanId: "mtn-100",
        code: "MTN100",
        name: "MTN 1GB Daily",
        price: 300,
        type: "DATA",
        discount: 5,
        active: true
      },
      {
        providerId: 2,
        providerName: "Glo",
        externalPlanId: "glo-100",
        code: "GLO100",
        name: "Glo 1GB Daily",
        price: 250,
        type: "DATA",
        discount: 3,
        active: true
      }
    ];
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-plans.json';
    a.click();
  };

  const downloadSampleCsv = () => {
    const sample = `providerId,providerName,externalPlanId,code,name,price,type,discount,active
1,MTN,mtn-100,MTN100,MTN 1GB Daily,300,DATA,5,true
2,Glo,glo-100,GLO100,Glo 1GB Daily,250,DATA,3,true
3,Airtel,airtel-100,AIRTEL100,Airtel 1GB Daily,280,DATA,4,true`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-plans.csv';
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-lg max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Bulk Import Plans</h2>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-4 border-b border-gray-200 pb-4">
          <button
            onClick={() => {
              setImportMode('json');
              setError('');
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              importMode === 'json'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            📋 JSON Format
          </button>
          <button
            onClick={() => {
              setImportMode('csv');
              setError('');
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              importMode === 'csv'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            📊 CSV Format
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-500 rounded p-3 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* JSON Mode */}
        {importMode === 'json' && (
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Paste JSON Array of Plans
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`[\n  {\n    "providerId": 1,\n    "providerName": "MTN",\n    "name": "MTN 1GB Daily",\n    "price": 300,\n    "type": "DATA",\n    "discount": 5,\n    "active": true\n  }\n]`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm h-32"
              />
            </div>
            <button
              onClick={downloadSampleJson}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ⬇️ Download Sample JSON
            </button>
          </div>
        )}

        {/* CSV Mode */}
        {importMode === 'csv' && (
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Paste CSV Content
              </label>
              <textarea
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder={`providerId,providerName,name,price,type,discount,active
1,MTN,MTN 1GB Daily,300,DATA,5,true
2,Glo,Glo 1GB Daily,250,DATA,3,true`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm h-32"
              />
            </div>
            <button
              onClick={downloadSampleCsv}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ⬇️ Download Sample CSV
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">Required Fields:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li><code>providerId</code> - 1=MTN, 2=Glo, 3=Airtel, 4=9mobile</li>
            <li><code>providerName</code> - Provider name (MTN, Glo, etc.)</li>
            <li><code>name</code> - Plan name (e.g., MTN 1GB Daily)</li>
            <li><code>price</code> - Price in Naira</li>
            <li><code>type</code> - AIRTIME or DATA</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => importMode === 'json' ? handleJsonImport() : handleCsvImport()}
            disabled={isImporting || (!jsonInput && !csvInput)}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition font-semibold"
          >
            {isImporting ? 'Importing...' : '📤 Import Plans'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingBulkImportModal;

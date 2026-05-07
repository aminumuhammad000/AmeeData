import React from 'react';

interface PricingViewModalProps {
  plan: any;
  onClose: () => void;
}

const PricingViewModal: React.FC<PricingViewModalProps> = ({ plan, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Plan Details</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600">Plan Name</label>
            <p className="text-gray-900 text-lg">{plan.name}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Provider</label>
              <p className="text-gray-900">{plan.providerName}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Type</label>
              <p className="text-gray-900">{plan.type}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Price (₦)</label>
              <p className="text-gray-900 text-lg font-semibold">₦{plan.price?.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Discount</label>
              <p className="text-gray-900">{plan.discount || 0}%</p>
            </div>
          </div>

          {plan.code && (
            <div>
              <label className="text-sm font-semibold text-gray-600">Code</label>
              <p className="text-gray-900 font-mono">{plan.code}</p>
            </div>
          )}

          {plan.externalPlanId && (
            <div>
              <label className="text-sm font-semibold text-gray-600">External Plan ID</label>
              <p className="text-gray-900 font-mono">{plan.externalPlanId}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-600">Status</label>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              plan.active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {plan.active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {plan.meta && Object.keys(plan.meta).length > 0 && (
            <div>
              <label className="text-sm font-semibold text-gray-600">Metadata</label>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(plan.meta, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PricingViewModal;

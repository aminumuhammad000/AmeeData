import React from 'react';

interface PricingDeleteModalProps {
  plan: any;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const PricingDeleteModal: React.FC<PricingDeleteModalProps> = ({ plan, onClose, onDelete, isDeleting }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Plan?</h3>
        <p className="text-gray-600 text-center mb-4">
          Are you sure you want to delete <strong>{plan.name}</strong>? This action cannot be undone.
        </p>

        <div className="bg-red-50 border border-red-200 rounded p-3 mb-6">
          <p className="text-sm text-red-800">
            <strong>Provider:</strong> {plan.providerName} | <strong>Type:</strong> {plan.type} | <strong>Price:</strong> ₦{plan.price}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition font-semibold"
          >
            {isDeleting ? 'Deleting...' : 'Delete Plan'}
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

export default PricingDeleteModal;

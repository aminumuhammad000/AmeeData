import React from 'react';

interface TransactionViewModalProps {
  transaction: any;
  onClose: () => void;
}

const TransactionViewModal: React.FC<TransactionViewModalProps> = ({ transaction, onClose }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'airtime':
        return 'bg-blue-100 text-blue-800';
      case 'data':
        return 'bg-purple-100 text-purple-800';
      case 'electricity':
        return 'bg-yellow-100 text-yellow-800';
      case 'cable':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold">Transaction Details</h2>
            <p className="text-blue-100 text-sm">Complete transaction information</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Type Badges */}
          <div className="flex gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(transaction.status)}`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              {transaction.status?.toUpperCase()}
            </span>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getTypeColor(transaction.type)}`}>
              {transaction.type?.toUpperCase()}
            </span>
          </div>

          {/* Transaction Info */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Transaction Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Transaction ID</p>
                <p className="font-mono text-sm text-slate-900 bg-white px-3 py-2 rounded border border-slate-200">
                  {transaction._id || transaction.id}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Reference</p>
                <p className="font-mono text-sm text-slate-900 bg-white px-3 py-2 rounded border border-slate-200">
                  {transaction.reference || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Amount</p>
                <p className="text-2xl font-bold text-green-600">₦{transaction.amount?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Date & Time</p>
                <p className="text-sm text-slate-900 font-medium">
                  {transaction.created_at ? new Date(transaction.created_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              User Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Full Name</p>
                <p className="text-sm text-slate-900 font-medium bg-white px-3 py-2 rounded border border-blue-200">
                  {transaction.user_id?.first_name} {transaction.user_id?.last_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Email</p>
                <p className="text-sm text-slate-900 font-medium bg-white px-3 py-2 rounded border border-blue-200">
                  {transaction.user_id?.email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Phone Number</p>
                <p className="text-sm text-slate-900 font-medium bg-white px-3 py-2 rounded border border-blue-200">
                  {transaction.user_id?.phone_number || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase font-semibold mb-1">User ID</p>
                <p className="text-sm text-slate-900 font-mono bg-white px-3 py-2 rounded border border-blue-200">
                  {transaction.user_id?._id || transaction.user_id}
                </p>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Service Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Service Type</p>
                <p className="text-sm text-slate-900 font-medium bg-white px-3 py-2 rounded border border-purple-200">
                  {transaction.type?.toUpperCase() || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Provider</p>
                <p className="text-sm text-slate-900 font-medium bg-white px-3 py-2 rounded border border-purple-200">
                  {transaction.provider || transaction.network || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Recipient</p>
                <p className="text-sm text-slate-900 font-medium bg-white px-3 py-2 rounded border border-purple-200">
                  {transaction.recipient || transaction.phone_number || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Plan/Package</p>
                <p className="text-sm text-slate-900 font-medium bg-white px-3 py-2 rounded border border-purple-200">
                  {transaction.plan_name || transaction.package || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {transaction.description && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Description
              </h3>
              <p className="text-sm text-slate-700">{transaction.description}</p>
            </div>
          )}

          {/* Response/Error Message */}
          {(transaction.response_message || transaction.error_message) && (
            <div className={`rounded-lg p-4 border ${
              transaction.status === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                {transaction.status === 'success' ? 'Response Message' : 'Error Message'}
              </h3>
              <p className="text-sm text-slate-700">
                {transaction.response_message || transaction.error_message}
              </p>
            </div>
          )}

          {/* Metadata */}
          {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                Additional Metadata
              </h3>
              <pre className="text-xs bg-white p-3 rounded border border-slate-200 overflow-x-auto">
                {JSON.stringify(transaction.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionViewModal;

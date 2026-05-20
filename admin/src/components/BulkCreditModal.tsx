import React, { useState } from 'react';
import Modal from './Modal';

interface BulkCreditModalProps {
  userIds: string[];
  userEmails: string[];
  onClose: () => void;
  onConfirm: (amount: number, description: string) => void;
  isProcessing: boolean;
}

const BulkCreditModal: React.FC<BulkCreditModalProps> = ({ 
  userIds, 
  userEmails, 
  onClose, 
  onConfirm, 
  isProcessing 
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    onConfirm(Number(amount), description);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Bulk Credit Wallets"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <p className="text-sm text-purple-800 font-medium">
            You are about to credit <span className="font-bold">{userIds.length}</span> users.
          </p>
          <div className="mt-2 text-xs text-purple-600 max-h-24 overflow-y-auto">
            {userEmails.join(', ')}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Amount (₦)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1000"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Reason for crediting..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none min-h-[80px]"
          />
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex gap-3 text-xs text-yellow-800">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>This action will immediately deduct from the platform and add to these users' wallets. This cannot be easily reversed.</p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors shadow-md disabled:bg-purple-400"
          >
            {isProcessing ? 'Processing...' : `Credit ₦${Number(amount || 0).toLocaleString()} to all`}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BulkCreditModal;

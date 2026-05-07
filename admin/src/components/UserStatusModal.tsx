import React, { useState } from 'react';

interface UserStatusModalProps {
  user: any;
  onClose: () => void;
  onSave: (status: string) => void;
  isSaving: boolean;
}

const UserStatusModal: React.FC<UserStatusModalProps> = ({ user, onClose, onSave, isSaving }) => {
  const [status, setStatus] = useState(user.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Update User Status</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave(status);
          }}
        >
          <div className="mb-4">
            <label className="block mb-1 font-medium">Status</label>
            <select
              className="w-full px-3 py-2 border rounded"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Status'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserStatusModal;

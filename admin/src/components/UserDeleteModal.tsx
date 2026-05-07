import React from 'react';

interface UserDeleteModalProps {
  user: any;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const UserDeleteModal: React.FC<UserDeleteModalProps> = ({ user, onClose, onDelete, isDeleting }) => {
  if (!user) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-red-600">Delete User</h2>
        <p className="mb-6">Are you sure you want to delete <strong>{user.first_name} {user.last_name}</strong>?</p>
        <div className="flex gap-4">
          <button
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDeleteModal;

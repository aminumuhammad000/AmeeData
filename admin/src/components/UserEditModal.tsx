import React from 'react';
import { useForm } from 'react-hook-form';

interface UserEditModalProps {
  user: any;
  onClose: () => void;
  onSave: (data: any) => void;
  isSaving: boolean;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onSave, isSaving }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: user,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Edit User</h2>
        <form onSubmit={handleSubmit(onSave)}>
          <div className="mb-3">
            <label className="block mb-1 font-medium">First Name</label>
            <input className="w-full px-3 py-2 border rounded" {...register('first_name', { required: true })} />
            {errors.first_name && <p className="text-red-500 text-sm">First name is required</p>}
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Last Name</label>
            <input className="w-full px-3 py-2 border rounded" {...register('last_name', { required: true })} />
            {errors.last_name && <p className="text-red-500 text-sm">Last name is required</p>}
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Email</label>
            <input className="w-full px-3 py-2 border rounded" type="email" {...register('email', { required: true })} />
            {errors.email && <p className="text-red-500 text-sm">Email is required</p>}
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Phone Number</label>
            <input className="w-full px-3 py-2 border rounded" {...register('phone_number', { required: true })} />
            {errors.phone_number && <p className="text-red-500 text-sm">Phone number is required</p>}
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Status</label>
            <select className="w-full px-3 py-2 border rounded" {...register('status', { required: true })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">KYC Status</label>
            <select className="w-full px-3 py-2 border rounded" {...register('kyc_status', { required: true })}>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;

import React from 'react';

interface UserViewModalProps {
  user: any;
  onClose: () => void;
}

const UserViewModal: React.FC<UserViewModalProps> = ({ user, onClose }) => {
  if (!user) return null;

  const getInitials = (first: string, last: string) => {
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
        {/* Modal Header with Profile Background */}
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile Image & Basic Info */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
              <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold text-2xl border-4 border-white">
                {getInitials(user.first_name, user.last_name)}
              </div>
            </div>
            <div className="mt-4 sm:mt-12 sm:ml-4 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-slate-900">{user.first_name} {user.last_name}</h2>
              <p className="text-slate-500 text-sm flex items-center justify-center sm:justify-start gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user.email}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">User ID</label>
                <p className="text-sm font-mono text-slate-700 break-all">{user._id}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</label>
                <p className="text-slate-900 font-medium">{user.phone_number || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</label>
                <p className="text-slate-900 font-medium">₦{user.balance ? user.balance.toLocaleString() : '0.00'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Status</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                    {user.status || 'Unknown'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">KYC Verification</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${user.kyc_status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                      user.kyc_status === 'pending' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                    {user.kyc_status || 'Unverified'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined Date</label>
                <p className="text-slate-900 font-medium">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Actions Footer - Optional expansion space */}
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserViewModal;

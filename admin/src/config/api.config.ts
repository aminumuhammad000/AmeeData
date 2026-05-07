export const USE_LOCAL_API = true; // Toggle this for local vs production testing

export const API_URLS = {
    LOCAL: 'http://localhost:5000/api',
    PRODUCTION: 'https://api.ibdata.com.ng/api'
};

export const getApiUrl = () => {
    return USE_LOCAL_API ? API_URLS.LOCAL : API_URLS.PRODUCTION;
};

export const getAdminApiUrl = () => {
    return USE_LOCAL_API ? `${API_URLS.LOCAL}/admin` : `${API_URLS.PRODUCTION}/admin`;
};

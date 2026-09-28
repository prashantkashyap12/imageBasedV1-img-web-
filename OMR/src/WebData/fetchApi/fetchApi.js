const STATIC_TOKEN = "abc123xyz";

const fetchApi = async (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      token: STATIC_TOKEN, // ✅ FORCE STRING
      ...(options.headers || {}),
    },
  });
};

export default fetchApi;
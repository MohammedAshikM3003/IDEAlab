const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

const toJson = async (response) => {
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed')
  }

  return payload
}

export const api = {
  get: (endpoint) =>
    fetch(`${BASE_URL}${endpoint}`, {
      headers: getHeaders(),
    }).then(toJson),

  post: (endpoint, data) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(toJson),

  patch: (endpoint, data) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(toJson),

  delete: (endpoint) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(toJson),

  put: (endpoint, data) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(toJson),
}

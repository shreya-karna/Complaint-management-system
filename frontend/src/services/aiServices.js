import api from './api'

export const suggestCategory = async ({ departmentId, text }) => {
    const response = await api.post('/ai/suggest-category', { departmentId, text })
    return response.data
}

export const moderateComplaint = async (text) => {
  const response = await fetch(
    "http://127.0.0.1:8000/moderate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    },
  );

  if (!response.ok) {
    throw new Error("AI moderation request failed");
  }

  return response.json();
};
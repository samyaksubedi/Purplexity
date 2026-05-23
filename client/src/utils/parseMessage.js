const parseMessage = (role, content) => {
  if (role === 'User') return { answer: content, followUps: [] };
  try {
    const parsed = JSON.parse(content);
    return {
      answer: parsed.answer || '',
      followUps: parsed.followUps || [],
    };
  } catch {
    return { answer: content, followUps: [] };
  }
};

export { parseMessage };

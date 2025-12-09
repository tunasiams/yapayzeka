export interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function sendMessageToGroq(
  apiKey: string,
  model: string,
  messages: GroqMessage[]
): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Groq API hatası');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

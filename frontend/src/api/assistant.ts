import api from "./client";

export async function askAssistant(question: string, pageContext: string, pageData: string): Promise<string> {
  const res = await api.post("/ai/assistant", {
    question,
    page_context: pageContext,
    page_data: pageData,
  });
  return res.data.answer;
}

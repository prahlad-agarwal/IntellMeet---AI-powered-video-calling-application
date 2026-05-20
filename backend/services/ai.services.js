import axios from "axios";
import fs from "fs";
import FormData from "form-data";

export const transcribeAudio = async (audioUrl) => {
  try {
    console.log("audioUrl", audioUrl);
    const formData = new FormData();

    formData.append("file", fs.createReadStream(audioUrl));

    formData.append("model", "whisper-large-v3");

    const response = await axios.post(
      `${process.env.GROQ_API_URL}/audio/transcriptions`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          ...formData.getHeaders(),
        },
      },
    );
    console.log("response.data", response.data);
    return response.data.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
};

export const generateSummaryAndTasks = async (transcript) => {
  console.log("transcript", transcript);
  const prompt = `Analyze this meeting transcript.

    IMPORTANT:
    Return ONLY valid JSON.
    Do not add explanation.
    Do not use markdown.
    Do not write \`\`\`json.

    Format:
    {
        "summary": "short summary",
        "tasks": [
            {
              "title": "task title",
              "assignee": "person name",
              "status": "todo"
            }
        ]
    }

    Transcript:
    ${transcript}
    `;

  const res = await axios.post(
    `${process.env.GROQ_API_URL}/chat/completions`,
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  const content = res.data.choices[0].message.content;

  console.log("content", content);

  // remove markdown if AI returns ```json
  const cleaned = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
};

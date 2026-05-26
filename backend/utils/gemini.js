const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Auto-detect category and priority from complaint text using Gemini
const analyzeComplaint = async (title, description) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Categorize this apartment maintenance complaint.

Allowed categories:
Plumbing, Electrical, Cleaning, Internet, Security, Other

Allowed priorities:
Low, Medium, High

Return ONLY valid JSON:
{
  "category": "",
  "priority": ""
}

Complaint Title:
${title}

Complaint Description:
${description}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract the JSON object from the response
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) throw new Error('Gemini did not return valid JSON');

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate the values are within allowed enums
    const validCategories = ['Plumbing', 'Electrical', 'Cleaning', 'Internet', 'Security', 'Other'];
    const validPriorities = ['Low', 'Medium', 'High'];

    return {
      category: validCategories.includes(parsed.category) ? parsed.category : 'Other',
      priority: validPriorities.includes(parsed.priority) ? parsed.priority : 'Low',
    };
  } catch (err) {
    console.error('Gemini analysis failed:', err.message);
    // Fallback if AI fails — complaint still gets submitted
    return { category: 'Other', priority: 'Low' };
  }
};

module.exports = { analyzeComplaint };

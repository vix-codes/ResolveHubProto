// Talks to Google Gemini AI to auto-categorize a complaint.
//
// When a tenant submits a complaint we send the title + description here.
// Gemini figures out the category (Plumbing, Electrical, etc.) and priority
// so the tenant doesn't have to pick them manually.
//
// If Gemini fails for any reason — bad API key, rate limit, unexpected response —
// we fall back to { category: 'Other', priority: 'Low' } so the complaint
// still gets saved and the admin can fix the category manually.

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeComplaint = async (title, description) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Categorize this apartment maintenance complaint.

Allowed categories: Plumbing, Electrical, Cleaning, Internet, Security, Other
Allowed priorities: Low, Medium, High

Return ONLY valid JSON:
{ "category": "", "priority": "" }

Complaint Title: ${title}
Complaint Description: ${description}`;

    const result = await model.generateContent(prompt);
    const text   = result.response.text();

    // Gemini sometimes wraps the JSON in markdown code blocks,
    // so we use a regex to pull out just the { } part
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) throw new Error('No JSON found in Gemini response');

    const parsed = JSON.parse(jsonMatch[0]);

    const validCategories = ['Plumbing', 'Electrical', 'Cleaning', 'Internet', 'Security', 'Other'];
    const validPriorities  = ['Low', 'Medium', 'High'];

    return {
      category: validCategories.includes(parsed.category) ? parsed.category : 'Other',
      priority: validPriorities.includes(parsed.priority)  ? parsed.priority  : 'Low',
    };
  } catch (err) {
    console.error('Gemini failed, using defaults:', err.message);
    return { category: 'Other', priority: 'Low' };
  }
};

module.exports = { analyzeComplaint };

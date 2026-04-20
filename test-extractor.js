const SKILL_MAP = {
  'react': 'React',
  'node.js': 'Node.js',
  'c++': 'C++',
  'python': 'Python'
};

function extractSkillsFromText(text) {
  if (!text || text.trim().length === 0) return [];
  const normalised = text.toLowerCase().replace(/\s+/g, ' ');
  const found = new Set();
  const sortedKeys = Object.keys(SKILL_MAP).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
    if (pattern.test(normalised)) {
      found.add(SKILL_MAP[key]);
    }
  }
  return [...found].sort();
}

const testText = "Experienced in React, Node.js, and TypeScript. Also know C++ and Python.";
console.log(extractSkillsFromText(testText));

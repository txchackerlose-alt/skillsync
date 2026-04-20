export interface EmployeeWithSkills {
  id: string;
  name: string;
  skills: string[];
}

export function calculateSkillMatch(requiredSkills: string[], employee: EmployeeWithSkills) {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { matchPercentage: 100, matchedSkills: [], missingSkills: [] };
  }
  
  if (!employee.skills || employee.skills.length === 0) {
    return { matchPercentage: 0, matchedSkills: [], missingSkills: requiredSkills };
  }

  const lowerRequired = requiredSkills.map(s => s.toLowerCase().trim());
  const lowerEmployeeSkills = employee.skills.map(s => s.toLowerCase().trim());

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (let i = 0; i < lowerRequired.length; i++) {
    const req = lowerRequired[i];
    const originalReq = requiredSkills[i];
    
    if (lowerEmployeeSkills.includes(req)) {
      matchedSkills.push(originalReq);
    } else {
      missingSkills.push(originalReq);
    }
  }

  const matchPercentage = Math.round((matchedSkills.length / requiredSkills.length) * 100);

  return {
    matchPercentage,
    matchedSkills,
    missingSkills
  };
}

export function getBestMatch(requiredSkills: string[], employees: EmployeeWithSkills[]) {
  const ranked = employees.map(emp => {
    const matchData = calculateSkillMatch(requiredSkills, emp);
    return {
      ...emp,
      ...matchData
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);

  return ranked;
}

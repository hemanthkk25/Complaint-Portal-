/**
 * Deterministic Rule Engines for Complaint Management Portal
 * Strictly Rule-Based (No AI/ML as per SRS specifications)
 */

// Critical & High Priority Keywords
const EMERGENCY_KEYWORDS = [
  'leak', 'water leak', 'pipe burst', 'flooding', 'flood',
  'fire', 'smoke', 'spark', 'sparks', 'explosion', 'short circuit',
  'no power', 'blackout', 'power cut', 'gas leak', 'hazard',
  'broken glass', 'sewage', 'overflow', 'collapsed', 'danger'
];

const MODERATE_KEYWORDS = [
  'ac stopped', 'no cooling', 'elevator stuck', 'lift fault',
  'internet down', 'wi-fi down', 'router off', 'door stuck', 'jammed'
];

/**
 * Module 3: Priority Assignment (Rule-Based Engine)
 * Computes priority deterministically based on:
 * 1. Category weight (Fire/Electrical/Water Leak = High base)
 * 2. Keyword matching in title and description
 * 3. User-selected urgency
 */
export function calculatePriority(categoryName, title, description, userUrgency) {
  const combinedText = `${title || ''} ${description || ''}`.toLowerCase();
  
  // Keyword analysis
  const matchedEmergencyKeywords = EMERGENCY_KEYWORDS.filter(kw => combinedText.includes(kw));
  const matchedModerateKeywords = MODERATE_KEYWORDS.filter(kw => combinedText.includes(kw));

  let score = 0;
  let reasons = [];

  // Category weight
  const cat = (categoryName || '').toLowerCase();
  if (['fire & emergency', 'fire', 'electrical'].includes(cat)) {
    score += 40;
    reasons.push(`Category '${categoryName}' carries critical safety weight (+40 pts)`);
  } else if (['plumbing', 'hvac & ac', 'hvac'].includes(cat)) {
    score += 25;
    reasons.push(`Category '${categoryName}' carries infrastructure weight (+25 pts)`);
  } else {
    score += 10;
    reasons.push(`Category '${categoryName}' carries standard weight (+10 pts)`);
  }

  // Keyword match score
  if (matchedEmergencyKeywords.length > 0) {
    score += 45;
    reasons.push(`Critical keywords detected: [${matchedEmergencyKeywords.join(', ')}] (+45 pts)`);
  } else if (matchedModerateKeywords.length > 0) {
    score += 20;
    reasons.push(`Urgent service keywords detected: [${matchedModerateKeywords.join(', ')}] (+20 pts)`);
  }

  // User urgency flag
  if (userUrgency === 'Urgent') {
    score += 25;
    reasons.push(`User flagged as 'Urgent' (+25 pts)`);
  }

  // Decision Thresholds
  let priority = 'low';
  if (score >= 60) {
    priority = 'high';
  } else if (score >= 35) {
    priority = 'medium';
  } else {
    priority = 'low';
  }

  return {
    priority, // 'low' | 'medium' | 'high'
    score,
    reasons,
    summary: reasons.join(' • '),
  };
}

/**
 * Module 4: Staff Assignment (Rule-Based Engine)
 * Finds eligible staff members in the matching department
 * and assigns to the staff member with the FEWEST open tickets.
 */
export function findBestStaffAssignment(categoryObj, allStaffList, allComplaints) {
  if (!categoryObj || !allStaffList || allStaffList.length === 0) return null;

  // Filter staff by department
  const deptStaff = allStaffList.filter(s => 
    s.role === 'staff' && s.departmentId === categoryObj.departmentId
  );

  if (deptStaff.length === 0) {
    // Fallback to any active staff if department match isn't available
    return allStaffList.find(s => s.role === 'staff') || null;
  }

  // Count active tickets per staff member (Submitted, Assigned, In Progress)
  const staffWorkloadMap = deptStaff.map(staff => {
    const openTicketsCount = allComplaints.filter(c => 
      c.assignedTo?.id === staff.id && 
      ['submitted', 'assigned', 'in_progress'].includes(c.status)
    ).length;

    return {
      staff,
      openTicketsCount,
    };
  });

  // Sort by lowest open tickets count (workload balancing)
  staffWorkloadMap.sort((a, b) => a.openTicketsCount - b.openTicketsCount);

  return staffWorkloadMap[0].staff;
}

/**
 * Module 10: Duplicate Complaint Detection (Rule-Based Engine)
 * Checks existing OPEN complaints for:
 * 1. Same Category AND same Location (Block, Floor, Room)
 * 2. Active status (submitted, assigned, in_progress)
 * 3. Text similarity (Jaccard similarity on tokens / title / description)
 */
export function detectDuplicates(newComplaint, existingComplaints, maxHours = 168) {
  if (!newComplaint || !existingComplaints || !Array.isArray(existingComplaints)) return [];

  const now = new Date().getTime();
  const timeWindowMs = maxHours * 60 * 60 * 1000;

  const matches = existingComplaints.filter(existing => {
    // 1. Only check open/unresolved tickets
    const existingStatus = (existing.status || '').toLowerCase();
    if (['completed', 'closed', 'resolved'].includes(existingStatus)) return false;

    // 2. Time window check (only apply limit if timestamp exists and ticket is resolved, for open tickets extend window)
    if (existing.createdAt) {
      const createdTime = new Date(existing.createdAt).getTime();
      if (!isNaN(createdTime) && (now - createdTime > timeWindowMs)) {
        // If it's open, keep checking up to maxHours (default 7 days)
        return false;
      }
    }

    // 3. Category matching (case-insensitive, trimmed)
    const newCat = (newComplaint.category || '').trim().toLowerCase();
    const exCat = (existing.category || '').trim().toLowerCase();
    const sameCategory = newCat && exCat && (newCat === exCat);

    // 4. Location matching (normalized)
    const newLoc = newComplaint.location || {};
    const exLoc = existing.location || {};

    const sameBlock = Boolean(newLoc.block && exLoc.block && 
      newLoc.block.trim().toLowerCase() === exLoc.block.trim().toLowerCase());
    const sameFloor = Boolean(newLoc.floor && exLoc.floor && 
      newLoc.floor.trim().toLowerCase() === exLoc.floor.trim().toLowerCase());
    const sameRoom = Boolean(newLoc.room && exLoc.room && 
      newLoc.room.trim().toLowerCase() === exLoc.room.trim().toLowerCase());

    const isLocationExact = sameBlock && sameFloor && sameRoom;
    const isLocationPartial = sameBlock && sameFloor;

    // 5. Token-based Text Similarity (Jaccard Similarity)
    const getTokens = (str) => {
      if (!str) return new Set();
      return new Set(
        str.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .split(/\s+/)
          .filter(w => w.length > 2)
      );
    };

    const newTokens = getTokens(`${newComplaint.title || ''} ${newComplaint.description || ''}`);
    const exTokens = getTokens(`${existing.title || ''} ${existing.description || ''}`);

    let jaccardSim = 0;
    if (newTokens.size > 0 && exTokens.size > 0) {
      const intersection = [...newTokens].filter(t => exTokens.has(t)).length;
      const union = new Set([...newTokens, ...exTokens]).size;
      jaccardSim = union > 0 ? intersection / union : 0;
    }

    // Substring fallback check
    const newTitle = (newComplaint.title || '').toLowerCase().trim();
    const exTitle = (existing.title || '').toLowerCase().trim();
    const substringMatch = newTitle.length >= 4 && exTitle.length >= 4 && (
      newTitle.includes(exTitle) || exTitle.includes(newTitle)
    );

    // Matching Criteria:
    // A. Same category & Exact Location
    if (sameCategory && isLocationExact) {
      return true;
    }

    // B. Same category & Partial Location + text match (token similarity or substring)
    if (sameCategory && isLocationPartial && (jaccardSim >= 0.2 || substringMatch)) {
      return true;
    }

    // C. Exact Location + high text similarity even if category misclassified
    if (isLocationExact && (jaccardSim >= 0.25 || substringMatch)) {
      return true;
    }

    // D. High overall text similarity (e.g. campus-wide outage)
    if (sameCategory && jaccardSim >= 0.4) {
      return true;
    }

    return false;
  });

  return matches.map(match => ({
    matchedTicket: match,
    reason: `Matching open ticket #${match.ticketId || match.id} (${match.category}) in ${match.location?.block || ''}, ${match.location?.room || ''}`,
  }));
}

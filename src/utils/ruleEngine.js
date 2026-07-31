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
 * 2. Created within last N hours (e.g. 48 hours)
 * 3. Title/Description substring similarity
 */
export function detectDuplicates(newComplaint, existingComplaints, maxHours = 48) {
  if (!newComplaint || !newComplaint.category || !newComplaint.location) return [];

  const now = new Date().getTime();
  const timeWindowMs = maxHours * 60 * 60 * 1000;

  const matches = existingComplaints.filter(existing => {
    // Only check open/unresolved tickets
    if (['completed', 'closed'].includes(existing.status)) return false;

    // Time window check
    const createdTime = new Date(existing.createdAt).getTime();
    if (now - createdTime > timeWindowMs) return false;

    // Check same category
    const sameCategory = existing.category.toLowerCase() === newComplaint.category.toLowerCase();

    // Check same location
    const sameBlock = existing.location?.block === newComplaint.location?.block;
    const sameFloor = existing.location?.floor === newComplaint.location?.floor;
    const sameRoom = existing.location?.room === newComplaint.location?.room;

    // Location match score
    const isLocationExact = sameBlock && sameFloor && sameRoom;
    const isLocationPartial = sameBlock && sameFloor;

    // Text substring overlap
    const newTitle = (newComplaint.title || '').toLowerCase();
    const exTitle = (existing.title || '').toLowerCase();
    const titleOverlap = newTitle.length > 5 && exTitle.length > 5 && (
      newTitle.includes(exTitle) || exTitle.includes(newTitle)
    );

    if (sameCategory && isLocationExact) {
      return true;
    }

    if (sameCategory && isLocationPartial && titleOverlap) {
      return true;
    }

    return false;
  });

  return matches.map(match => ({
    matchedTicket: match,
    reason: `Matching '${match.category}' complaint in ${match.location.block}, ${match.location.room} created recently (#${match.ticketId})`,
  }));
}

/**
 * Deterministic Rule Engines for Complaint Management Portal Backend
 * Strictly Rule-Based Execution
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
 */
export function calculatePriority(categoryName, title, description, userUrgency) {
  const combinedText = `${title || ''} ${description || ''}`.toLowerCase();
  
  const matchedEmergencyKeywords = EMERGENCY_KEYWORDS.filter(kw => combinedText.includes(kw));
  const matchedModerateKeywords = MODERATE_KEYWORDS.filter(kw => combinedText.includes(kw));

  let score = 0;
  let reasons = [];

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

  if (matchedEmergencyKeywords.length > 0) {
    score += 45;
    reasons.push(`Critical keywords detected: [${matchedEmergencyKeywords.join(', ')}] (+45 pts)`);
  } else if (matchedModerateKeywords.length > 0) {
    score += 20;
    reasons.push(`Urgent service keywords detected: [${matchedModerateKeywords.join(', ')}] (+20 pts)`);
  }

  if (userUrgency === 'Urgent') {
    score += 25;
    reasons.push(`User flagged as 'Urgent' (+25 pts)`);
  }

  let priority = 'low';
  if (score >= 60) {
    priority = 'high';
  } else if (score >= 35) {
    priority = 'medium';
  } else {
    priority = 'low';
  }

  return {
    priority,
    score,
    reasons,
    summary: reasons.join(' • '),
  };
}

/**
 * Module 4: Staff Assignment (Rule-Based Engine)
 */
export function findBestStaffAssignment(categoryObj, allStaffList, allComplaints) {
  if (!categoryObj || !allStaffList || !Array.isArray(allStaffList) || allStaffList.length === 0) return null;

  const deptStaff = allStaffList.filter(s => {
    if (s.isDeactivated) return false;
    const isTechOrStaff = s.role === 'technician' || s.role === 'staff';
    if (!isTechOrStaff) return false;

    const matchDeptId = Boolean(categoryObj.departmentId && s.departmentId === categoryObj.departmentId);
    const catName = (categoryObj.name || '').toLowerCase();
    const matchDeptName = Boolean(catName && (
      (s.departmentName && s.departmentName.toLowerCase().includes(catName)) ||
      (s.department && s.department.toLowerCase().includes(catName)) ||
      (s.assignedCategory && s.assignedCategory.toLowerCase() === catName)
    ));

    return matchDeptId || matchDeptName;
  });

  const candidates = deptStaff.length > 0
    ? deptStaff
    : allStaffList.filter(s => !s.isDeactivated && (s.role === 'technician' || s.role === 'staff'));

  if (candidates.length === 0) return null;

  const staffWorkloadMap = candidates.map(staff => {
    const openTicketsCount = (allComplaints || []).filter(c => 
      c.assignedTo?.id === staff.id && 
      ['submitted', 'assigned', 'in_progress'].includes(c.status)
    ).length;

    return {
      staff,
      openTicketsCount,
    };
  });

  staffWorkloadMap.sort((a, b) => a.openTicketsCount - b.openTicketsCount);

  return staffWorkloadMap[0]?.staff || null;
}

/**
 * Module 10: Duplicate Complaint Detection (Rule-Based Engine)
 */
export function detectDuplicates(newComplaint, existingComplaints, maxHours = 168) {
  if (!newComplaint || !existingComplaints || !Array.isArray(existingComplaints)) return [];

  const now = new Date().getTime();
  const timeWindowMs = maxHours * 60 * 60 * 1000;

  const newLoc = newComplaint.location || {
    block: newComplaint.block || '',
    floor: newComplaint.floor || '',
    room: newComplaint.room || '',
  };

  const matches = existingComplaints.filter(existing => {
    const existingStatus = (existing.status || '').toLowerCase();
    if (['completed', 'closed', 'resolved'].includes(existingStatus)) return false;

    if (existing.createdAt) {
      const createdTime = new Date(existing.createdAt).getTime();
      if (!isNaN(createdTime) && (now - createdTime > timeWindowMs)) {
        return false;
      }
    }

    const newCat = (newComplaint.category || '').trim().toLowerCase();
    const exCat = (existing.category || '').trim().toLowerCase();
    const sameCategory = newCat && exCat && (newCat === exCat);

    const exLoc = existing.location || {};

    const sameBlock = Boolean(newLoc.block && exLoc.block && 
      newLoc.block.trim().toLowerCase() === exLoc.block.trim().toLowerCase());
    const sameFloor = Boolean(newLoc.floor && exLoc.floor && 
      newLoc.floor.trim().toLowerCase() === exLoc.floor.trim().toLowerCase());
    const sameRoom = Boolean(newLoc.room && exLoc.room && 
      newLoc.room.trim().toLowerCase() === exLoc.room.trim().toLowerCase());

    // Location matching: At least same Block and Room MUST match for a ticket to be a duplicate!
    const isLocationMatch = sameBlock && sameRoom;

    // Strict requirement: A duplicate MUST be in the same category AND same location!
    if (!sameCategory || !isLocationMatch) {
      return false;
    }

    const GENERIC_STOP_WORDS = new Set([
      'in', 'at', 'on', 'to', 'is', 'it', 'my', 'by', 'or', 'an', 'be', 'do', 'if', 'me', 'no', 'of', 'so', 'we',
      'the', 'and', 'for', 'with', 'this', 'that', 'from', 'as', 'are', 'was', 'were', 'been', 'has', 'have', 'had',
      'standardized', 'maintenance', 'request', 'complaint', 'issue', 'problem', 'ticket', 'reported', 'reporting',
      'please', 'urgent', 'attention', 'required', 'location', 'block', 'floor', 'room', 'lab', 'building', 'wing',
      'academic', 'hall', 'storage', 'department', 'ground', '1st', '2nd', '3rd', '4th', '5th', 'st', 'nd', 'rd', 'th'
    ]);

    const getLocationTokens = (loc) => {
      if (!loc) return new Set();
      const str = `${loc.block || ''} ${loc.floor || ''} ${loc.room || ''}`.toLowerCase();
      return new Set(str.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
    };

    const locTokens = new Set([
      ...getLocationTokens(newLoc),
      ...getLocationTokens(existing.location),
    ]);

    const getIssueTokens = (str) => {
      if (!str) return new Set();
      return new Set(
        str.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .split(/\s+/)
          .filter(w => w.length > 1 && !GENERIC_STOP_WORDS.has(w) && !locTokens.has(w))
      );
    };

    const newTokens = getIssueTokens(`${newComplaint.title || ''} ${newComplaint.description || ''}`);
    const exTokens = getIssueTokens(`${existing.title || ''} ${existing.description || ''}`);

    let jaccardSim = 0;
    if (newTokens.size > 0 && exTokens.size > 0) {
      const intersection = [...newTokens].filter(t => exTokens.has(t)).length;
      const union = new Set([...newTokens, ...exTokens]).size;
      jaccardSim = union > 0 ? intersection / union : 0;
    }

    const cleanNewTitle = [...getIssueTokens(newComplaint.title)].join(' ');
    const cleanExTitle = [...getIssueTokens(existing.title)].join(' ');
    const substringMatch = cleanNewTitle.length >= 4 && cleanExTitle.length >= 4 && (
      cleanNewTitle.includes(cleanExTitle) || cleanExTitle.includes(cleanNewTitle)
    );

    // If Category and Location (Block + Room) match, check for issue similarity or matching issue selection
    if (jaccardSim >= 0.15 || substringMatch || cleanNewTitle === cleanExTitle) {
      return true;
    }

    return false;
  });

  return matches.map(match => ({
    matchedTicket: match,
    reason: `Matching open ticket #${match.ticketId || match.id} (${match.category}) in ${match.location?.block || ''}, ${match.location?.room || ''}`,
  }));
}

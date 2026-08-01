import { IssuePreset } from '../models/IssuePreset.js';
import { memoryStore, isDbConnected } from '../config/memoryStore.js';

export async function getPresets(req, res) {
  try {
    if (isDbConnected()) {
      const presetsDocs = await IssuePreset.find();
      const predefinedIssues = {};
      presetsDocs.forEach(doc => {
        predefinedIssues[doc.categoryName] = doc.presets;
      });
      return res.json({ success: true, predefinedIssues });
    }
    res.json({ success: true, predefinedIssues: memoryStore.predefinedIssues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function addPreset(req, res) {
  try {
    const { categoryName, issueText } = req.body;
    if (!categoryName || !issueText) {
      return res.status(400).json({ success: false, message: 'Category name and issue text are required.' });
    }

    if (isDbConnected()) {
      let presetDoc = await IssuePreset.findOne({ categoryName });
      if (!presetDoc) {
        presetDoc = new IssuePreset({ categoryName, presets: [issueText] });
      } else {
        if (!presetDoc.presets.includes(issueText)) {
          presetDoc.presets.push(issueText);
        }
      }
      await presetDoc.save();
      return res.json({ success: true, presets: presetDoc.presets });
    }

    if (!memoryStore.predefinedIssues[categoryName]) {
      memoryStore.predefinedIssues[categoryName] = [];
    }
    if (!memoryStore.predefinedIssues[categoryName].includes(issueText)) {
      memoryStore.predefinedIssues[categoryName].push(issueText);
    }
    res.json({ success: true, presets: memoryStore.predefinedIssues[categoryName] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function removePreset(req, res) {
  try {
    const { categoryName, issueText } = req.body;

    if (isDbConnected()) {
      let presetDoc = await IssuePreset.findOne({ categoryName });
      if (presetDoc) {
        presetDoc.presets = presetDoc.presets.filter(p => p !== issueText);
        await presetDoc.save();
      }
      return res.json({ success: true, presets: presetDoc?.presets || [] });
    }

    if (memoryStore.predefinedIssues[categoryName]) {
      memoryStore.predefinedIssues[categoryName] = memoryStore.predefinedIssues[categoryName].filter(p => p !== issueText);
    }
    res.json({ success: true, presets: memoryStore.predefinedIssues[categoryName] || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

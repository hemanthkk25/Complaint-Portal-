import { Category } from '../models/Category.js';
import { Department } from '../models/Department.js';
import { memoryStore, isDbConnected } from '../config/memoryStore.js';

export async function getCategories(req, res) {
  try {
    if (isDbConnected()) {
      const categories = await Category.find().sort({ createdAt: 1 });
      const departments = await Department.find().sort({ createdAt: 1 });
      return res.json({ success: true, categories, departments });
    }
    res.json({ success: true, categories: memoryStore.categories, departments: memoryStore.departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function addCategory(req, res) {
  try {
    const { categoryName, description } = req.body;
    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const trimmed = categoryName.trim();
    const catId = `cat-${Date.now()}`;
    const deptId = `dept-${Date.now()}`;

    const newCategory = {
      id: catId,
      name: trimmed,
      description: description || `${trimmed} Maintenance & Workorder Management`,
      departmentId: deptId,
      basePriority: 'medium',
      icon: 'Zap',
    };

    const newDepartment = {
      id: deptId,
      name: `${trimmed} Department`,
      code: trimmed.substring(0, 3).toUpperCase(),
    };

    if (isDbConnected()) {
      await new Category(newCategory).save();
      await new Department(newDepartment).save();
    } else {
      memoryStore.categories.push(newCategory);
      memoryStore.departments.push(newDepartment);
    }

    res.status(201).json({ success: true, category: newCategory, department: newDepartment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

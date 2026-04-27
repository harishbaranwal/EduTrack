import Counter from "../models/counter.model.js";

/**
 * Generate Registration Number/UID based on role
 * 
 * Format: XYYNNNN
 * - X: Role prefix (1=Student, 2=Teacher, 3=Admin)
 * - YY: Last 2 digits of current year (e.g., 25 for 2025)
 * - NNNN: 4-digit sequential number (0001-9999)
 * 
 * Examples:
 * - Student 2025, 1st: 1250001
 * - Teacher 2025, 5th: 2250005
 * - Admin 2025, 2nd: 3250002
 * 
 * @param {String} role - User role: "Student", "Teacher", or "Admin"
 * @returns {Promise<String>} - Generated registration number/UID
 */
export const generateRegistrationNumber = async (role) => {
  try {
    // Validate role
    const validRoles = ["Student", "Teacher", "Admin"];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}. Must be Student, Teacher, or Admin.`);
    }

    // Get current year and year suffix
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2); // "2025" → "25"

    // Role prefix mapping
    const rolePrefix = {
      Student: "1",
      Teacher: "2",
      Admin: "3",
    };

    // Find or create counter for this role and year
    let counter = await Counter.findOne({ year: currentYear, role });
    
    if (!counter) {
      counter = await Counter.create({
        year: currentYear,
        role,
        lastSequence: 0,
      });
    }

    // Increment sequence atomically to prevent race conditions
    counter.lastSequence += 1;
    await counter.save();

    // Format: X + YY + NNNN (e.g., 1 + 25 + 0001 = 1250001)
    const sequence = counter.lastSequence.toString().padStart(4, "0");
    const registrationNumber = `${rolePrefix[role]}${yearSuffix}${sequence}`;

    return registrationNumber;
  } catch (error) {throw new Error("Failed to generate registration number");
  }
};

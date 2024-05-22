/**
 * Checks if the current user has one of the supplied roles.
 * Returns true if the user has one of the roles, otherwise false.
 * Also returns false if the user is null, undefined or invalid.
 *
 * @param {User["role"][]} allRoles - List of the accepted roles.
 * @param {User} [user] - The user whose role is to be checked.
 * @returns {boolean} True if the user has one of the roles in allRoles, otherwise false.
 *
 * @example
 * // Example 1: Checking for a single role
 * const result = checkRole(['admin'], user);
 *
 * @example
 * // Example 2: Checking for multiple roles
 * const result = checkRole(['admin', 'super_admin'], user);
 */

import { User } from "payload/generated-types";

export const checkRole = (allRoles: User["role"][], user?: User): boolean => {
  if (user) {
    try {
      return allRoles.some((role) => user.role === role);
    } catch (_) {
      return false;
    }
  } else {
    return false;
  }
};

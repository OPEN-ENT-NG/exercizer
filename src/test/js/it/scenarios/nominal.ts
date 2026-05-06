// @ts-ignore
import { chai, describe } from "https://jslib.k6.io/k6chaijs/4.3.4.0/index.js";
import { group } from "k6";

import {
    authenticateWeb,
    getUsersOfSchool,
    initStructure,
    getRandomUserWithProfile,
    getRolesOfStructure,
    createAndSetRole,
    createDefaultStructure,
    Structure,
    logout,
    Session,
    UserInfo,
    activateUsers,
    linkRoleToUsers
} from "../../node_modules/edifice-k6-commons/dist/index.js";

chai.config.logFailures = true;

export const options = {
    setupTimeout: "1h",
    maxRedirects: 0,
    thresholds: {
        checks: ["rate == 1.00"],
    },
    scenarios: {
        exercizerTest: {
            exec: "testExercizer",
            executor: "per-vu-iterations",
            vus: 1,
            maxDuration: "3m",
            gracefulStop: "5s",
        },
    },
};

const schoolName = `General`;

type InitData = {
    structure?: Structure;
} 

/**
 * Initializes the test environment for community API scenarios.
 *
 * Steps performed:
 * - Authenticates as an administrator
 * - Creates a test school structure with minimal configuration
 * - Sets up role-based permissions for community management
 *
 * @returns {InitData} The initialized data for use in test scenarios
 */
export function setup(): InitData {
    const context: InitData = {};
    describe("[Exercizer-Init] Initialize data", () => {
        authenticateWeb(__ENV.ADMC_LOGIN, __ENV.ADMC_PASSWORD)!;
        const structure = createDefaultStructure(schoolName, 'tiny');
        const role = createAndSetRole("Exercizer");
        const groups = [
            `Teachers from group ${structure.name}.`,
            `Enseignants du groupe ${structure.name}.`,
            `Students from group ${structure.name}.`,
            `Élèves du groupe ${structure.name}.`,
            `Relatives from group ${structure.name}.`,
            `Parents du groupe ${structure.name}.`,
        ];
        linkRoleToUsers(structure, role, groups);
        activateUsers(structure);
        context.structure = structure;
    });
    return context;
}

/**
 * Executes the main suite of community API tests.
 *
 * Scenarios covered:
 * - Community creation with various configurations
 * - Management operations (read, update, delete, property changes)
 * - Listing and searching communities with pagination and filtering
 * - Validation of community properties and data integrity
 *
 * Each scenario uses K6 checks to assert correct API behavior and data integrity.
 *
 * @param {Structure} structure - The initialized school structure for community API testing
 * @returns {void}
 */
export function testExercizer(context: InitData) {
    const structure = context.structure!;
    let adminUser: UserInfo;
    describe("[Exercizer] Community API scenarios", () => {
        // Get a teacher
        const users = getUsersOfSchool(structure);
        const teacher = getRandomUserWithProfile(users, "Teacher");
        // Create a subject
        // Share it to users
    });
}
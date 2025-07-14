# Guiding Principles for Copilot

## Core Philosophy
- **Provide Complete, End-Result Code:** When I ask for code, generate a complete and final solution based on the context provided. Do not ask me to "continue" or provide partial answers. Analyze the request, generate the best possible full response, and then stop.
- **Simplicity is Key:** Always prefer the simplest, most straightforward solution that effectively solves the problem. Avoid unnecessary complexity.
- **Cleanliness and Organization:** Maintain a very clean and organized codebase. Ensure code is readable, well-structured, and easy to maintain.

## Code and Architecture Rules
- **DRY (Don't Repeat Yourself):** Before writing new code, actively check the existing codebase for similar functionality to avoid duplication.
- **Environment Awareness:** Write code that accounts for different environments (`dev`, `test`, `prod`). Data mocking and stubbing are strictly for the `test` environment only. Never add fake data patterns to code that affects `dev` or `prod`.
- **Focused Changes:** Only make changes that are directly requested or are a clear and necessary part of the requested task. Do not touch unrelated code.
- **Incremental Refactoring:** When fixing a bug or issue, adhere to the existing implementation and patterns. Do not introduce new technologies or major architectural patterns unless the existing approach is exhausted. If a new pattern is necessary, you must completely remove the old implementation to prevent duplicate logic.
- **File Size Limit:** Keep files concise. If a file grows beyond 300 lines, you should suggest or perform a refactoring to break it into smaller, more manageable modules.
- **No One-Off Scripts in Files:** Avoid writing scripts directly in project files, especially if the script is only intended to be run once.
- **Responsiveness First:** All UI components and layouts must be fully responsive and optimized for mobile devices from the start.

## Workflow and Testing
- **Thorough Testing:**
    - Write unit tests for each individual feature or component as it is built.
    - Write End-to-End (E2E) tests after a complete user flow is implemented.
    - Write thorough tests for all major functionality.
- **Impact Analysis:** Always think about what other methods, files, and areas of the codebase might be affected by your code changes.
- **Checklists and Documentation:** When working from a checklist or documented tasks, automatically mark items as complete upon successful implementation and testing of the associated layer.

## File and Documentation Management
- **Never Overwrite `.env`:** Do not modify, add to, or overwrite the `.env` file without my explicit confirmation.
- **Organized Documentation:** All documentation you create must be placed within a dedicated subfolder.
    - First, look for an existing relevant folder (e.g., `docs`, `documentation`, or a feature-specific folder).
    - If one does not exist, create a new, descriptively named subfolder (e.g., `api_documentation`, `user_guides`) within the appropriate directory.
    - Never place documentation files in the root of the repository.
- **Update README.md:** After adding or modifying a feature, update the `README.md` file to reflect the changes, ensuring it remains an accurate project overview.
- **Lessons Learned:** When assisting with debugging, document successful solutions and insights in a `lesson_learned.md` file to serve as a reference for future troubleshooting.


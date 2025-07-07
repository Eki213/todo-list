import createProject from "./createProject";
import createTodoItem from "./createTodoItem";
import * as projects from "./projects";
import { loadProjects, addEventListeners } from "./displayController";

export { registerProject , addTodoToProject }

function init() {
    registerProject("Inbox");
    loadProjects();
    addEventListeners();
}

function registerProject(name) {
    const project = createProject(name);
    projects.addProject(project);
}

function addTodoToProject(title, description, dueDate, priority, projectId) {
    const todoItem = createTodoItem( title, description, dueDate, priority, projectId );
    const selectedProject = projects.findProject(todoItem.projectId);
    selectedProject.addTodoItem(todoItem);
}

init();
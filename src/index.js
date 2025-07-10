import createProject from "./createProject";
import createTodoItem from "./createTodoItem";
import * as projects from "./projects";
import { loadProjects, addEventListeners } from "./displayController";
import "./style.css";

export { registerProject , addTodoToProject, getProjectTodos }

function init() {
    loadProjects();
    addEventListeners();
}

function registerProject(name) {
    const project = createProject(name);
    projects.addProject(project);
}

function addTodoToProject( {title, description, date, priority, projectId} ) {
    const todoItem = createTodoItem( title, description, date, priority, projectId );
    const project = projects.findProject(todoItem.projectId);
    project.addTodoItem(todoItem);
}

function getProjectTodos(projectId) {
    const project = projects.findProject(projectId);
    return project.getTodoItems();
}

init();
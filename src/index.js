import createProject from "./createProject";
import createTodoItem from "./createTodoItem";
import * as projects from "./projects";
import { load, addEventListeners } from "./displayController";
import  { saveProjects } from "./storage";
import "./formatDate.js";
import "./style.css";

export { registerProject , addTodoToProject, getProjectTodos, deleteTodoByIndex, getTodoFromProject, editTodo, checkTodo, editProject, removeProject, getProject }

function init() {
    load();
    addEventListeners();
}

function registerProject( { title } ) {
    const project = createProject(title);
    projects.addProject(project);
    saveProjects();

    return project.id;
}

function editProject(projectId, data) {
    const project = projects.findProject(projectId);
    Object.assign(project, data);
    saveProjects();
}

function getProject(projectId) {
    return projects.findProject(projectId);
}

function removeProject(projectId) {
    projects.deleteProject(projectId);
    saveProjects();
}

function addTodoToProject( {title, description, date, priority, projectId} ) {
    const todoItem = createTodoItem( title, description, date, priority );
    const project = projects.findProject(projectId);
    project.addTodoItem(todoItem);
    saveProjects();
}

function deleteTodoByIndex(projectId, index) {
    const project = projects.findProject(projectId);
    project.deleteTodoItem(index);
    saveProjects();
}

function getProjectTodos(projectId) {
    const project = projects.findProject(projectId);
    return project.getTodoItems();
}

function getTodoFromProject(projectId, index) {
    const project = projects.findProject(projectId);
    return project.getTodoItems().at(index);
}

function editTodo(projectId, index, data) {
    const todo = getTodoFromProject(projectId, index);

    const { projectId: selectedProjectId, ...todoData } = data;
    
    if (selectedProjectId !== projectId) {
        deleteTodoByIndex(projectId, index);
        addTodoToProject(data);
    }
    
    Object.assign(todo, todoData);
    saveProjects();
}

function checkTodo(projectId, index, isChecked) {
    const todo = getTodoFromProject(projectId, index);
    todo.isCompleted = isChecked;
    saveProjects();
}

init();
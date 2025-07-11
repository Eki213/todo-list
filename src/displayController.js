import { registerProject, addTodoToProject, getProjectTodos } from "./index";
import { getProjects, DEFAULT_PROJECT_ID } from "./projects";
import { saveLastProjectId, getLastProjectId } from "./storage";
export { loadProjects, addEventListeners }

let currentProjectId = getLastProjectId() || DEFAULT_PROJECT_ID;
const select = document.querySelector("select#project");
const projectsSection = document.querySelector("aside section.projects");
function loadProjects() {
    const projects = getProjects();
    loadArrayToEl(projects, select, addProjectOption);
    loadArrayToEl(projects, projectsSection, addProjectButton);
    loadTodos(currentProjectId);
    selectCurrentProject();
}

function selectCurrentProject() {
    const currentProject = [...select.options].find((option) => option.value === currentProjectId);
    currentProject.selected = true;
}

function loadTodos(projectId) {
    const todoItemsEl = document.querySelector("section.todo-items");
    const todos = getProjectTodos(projectId);
    loadArrayToEl(todos, todoItemsEl, addTodoParas);
}

function addEventListeners() {

    const form = document.querySelector("form");
    const button = document.querySelector("#add-todo-form");
    const dialog = document.querySelector("dialog");

    function toggleTodoForm() {
        if (dialog.open) {
            dialog.close();
            form.reset();
            selectCurrentProject();
        } else {
            dialog.show();
        }
        
        toggleTodoFormButton();
    } 

    document.querySelector("#add-todo").addEventListener("click", (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        addTodoToProject(readForm());
        loadTodos(currentProjectId);
        toggleTodoForm();
    });

    document.querySelector("#add-project").addEventListener("click", () => {
        const projectName = document.querySelector("input").value;
        if (projectName === "") return;
        registerProject(projectName);
        loadProjects();
    });

    function toggleTodoFormButton() {
        button.hidden = !button.hidden;
    }

    document.querySelector("section.projects").addEventListener("click", (event) => {
        const projectId = event.target.dataset.projectId;
        if (!projectId || projectId === currentProjectId) return;
        currentProjectId = projectId;
        loadTodos(currentProjectId);
        selectCurrentProject();
        saveLastProjectId(currentProjectId);
        if (dialog.open) toggleTodoForm();
    });

    document.querySelector("#add-todo-form").addEventListener("click", () => toggleTodoForm());
}

function readForm() {
    return {
        title: document.querySelector("#todo-name").value,
        description: document.querySelector("#description").value,
        date: document.querySelector("#date").value,
        priority: document.querySelector("#priority").value,
        projectId: select.value,
    }
}

function loadArrayToEl(array, el, mapFunc) {
    el.replaceChildren(...array.map(mapFunc));
}

function addProjectOption(project) {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.name;

    return option;
}

function addProjectButton(project) {
    const button = document.createElement("button");
    button.dataset.projectId = project.id;
    button.textContent = project.name;

    return button;
}

function addTodoParas(todo) {
    const div = document.createElement("div");
    for (const prop in todo) {
        if (prop === "projectId") continue;
        const para = document.createElement("p");
        para.textContent = todo[prop];
        div.appendChild(para);
    }

    return div;
}
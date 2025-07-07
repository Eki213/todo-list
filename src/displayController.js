import { registerProject, addTodoToProject } from "./index";
import { getProjects } from "./projects";
export { loadProjects, addEventListeners }

function createProjectEl() {
    const projectEl = document.createElement("div");
    return projectEl;
}

function createTodoItemEl() {
    const todoItemEl = document.createElement("div");
    todoItemEl.textContent = "";
    return todoItemEl;
}

const select = document.querySelector("select");
function loadProjects() {

    for (const project of getProjects()) {
        const option = document.createElement("option");
        option.value = project.id;
        option.textContent = project.name;
        select.appendChild(option);
    }
}

function refreshProjects() {
    select.replaceChildren();
    loadProjects();
}

function addEventListeners() {
    document.querySelector("#add-todo").addEventListener("click", () => addTodoToProject("birthday", "It's my birthday", "2025-09-12", 2, select.value));

    document.querySelector("#add-project").addEventListener("click", () => {
        const projectName = document.querySelector("input").value;
        if (projectName === "") return;
        registerProject(projectName);
        refreshProjects();
    });
}
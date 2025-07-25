import { registerProject, addTodoToProject, getProjectTodos, deleteTodoByIndex, getTodoFromProject, editTodo, checkTodo } from "./index";
import { getProjects, DEFAULT_PROJECT_ID } from "./projects";
import { saveLastProjectId, getLastProjectId } from "./storage";
import { getFormattedDate, parseDate } from "./formatDate";
import { format } from "date-fns";
export { loadProjects, addEventListeners };

let currentProjectId = getLastProjectId() || DEFAULT_PROJECT_ID;

function loadProjects() {
    const projectsSection = document.querySelector("aside section.projects");
    const projects = getProjects();
    loadArrayToEl(projects, projectsSection, createProjectButton);
    loadTodos();
}

function loadTodos() {
    const todoItemsEl = document.querySelector("section.todo-items");
    const todos = getProjectTodos(currentProjectId);
    closeForm();
    loadArrayToEl(todos, todoItemsEl, createTodoEl);
}

function addEventListeners() {
    document.querySelector("#add-project").addEventListener("click", () => {
        const projectName = document.querySelector("input").value;
        if (projectName === "") return;
        registerProject(projectName);
        loadProjects();
    });

    document.querySelector("section.projects").addEventListener("click", (event) => {
        const projectId = event.target.dataset.projectId;
        if (!projectId || projectId === currentProjectId) return;
        currentProjectId = projectId;
        loadTodos();
        saveLastProjectId(currentProjectId);
    });

    document.querySelector("main").addEventListener("click", (event) => {
        if (event.target.tagName !== "BUTTON" && event.target.type !== "checkbox") return;
        const button = event.target;
        const todoEl = button.closest(".todo-item");
        const todoIndex = todoEl && todoEl.dataset.index;

        switch (button.className) {
            case "delete-button":
                deleteTodoByIndex(currentProjectId, todoIndex);
                loadTodos();
                break;

            case "save-button":
                todoEl ? editTodo(currentProjectId, todoIndex, readForm()) : addTodoToProject(readForm());
                loadTodos();
                break;

            case "edit-button":
            case "add-button":
                closeForm();
                openForm(todoIndex);
                break;

            case "cancel-button":
                closeForm();
                break;

            default:
                const todoCheckbox = event.target;
                checkTodo(currentProjectId, todoIndex, todoCheckbox.checked);
                break;
        }
    });
}

function closeForm() {
    const form = document.querySelector("main form");
    if (!form) return;
    const activeTodoEl = form.closest(".todo-item");

    if (activeTodoEl) {
        const todo = getTodoFromProject(currentProjectId, activeTodoEl.dataset.index);
        form.replaceWith(createTodoEl(todo));
    } else {
        form.remove();
        toggleAddButton();
    }
}

function toggleAddButton() {
    document.querySelector(".add-button").toggleAttribute("hidden");
}

function openForm(index) {
    const form = document.createElement("form");

    const title = createTitleEl();
    const description = createDescriptionEl();
    const datePicker = createDatePicker();
    const prioritySelect = createPrioritySelect();
    const projectSelect = createProjectSelect();
    
    const saveButton = createSaveButton();
    const cancelButton = createCancelButton();
        
    form.appendChild(title);
    form.appendChild(description);
    form.appendChild(datePicker);
    form.appendChild(prioritySelect);
    form.appendChild(projectSelect);
    form.appendChild(cancelButton);
    form.appendChild(saveButton);

    if (index) {
        const todoEl = document.querySelector(`.todo-item[data-index="${index}"]`);
        const todo = getTodoFromProject(currentProjectId, index);

        setTitle(title, todo);
        setDescription(description, todo);
        setDatePicker(datePicker, todo);
        setPrioritySelect(prioritySelect, todo);

        todoEl.replaceChildren(form);
    } else {
        document.querySelector("section.todo-items").appendChild(form);
        toggleAddButton();
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

function addPriorityOption(priority) {
    const option = document.createElement("option");
    option.value = priority;
    option.textContent = priority;

    return option;
}

function createProjectButton(project) {
    const button = document.createElement("button");
    button.dataset.projectId = project.id;
    button.textContent = project.name;

    return button;
}

function createDeleteButton() {
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.type = "button";
    deleteButton.className = "delete-button";

    return deleteButton;
}

function createEditButton() {
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.type = "button";
    editButton.className = "edit-button";

    return editButton;
}

function createTodoEl(todo) {
    const div = document.createElement("div");
    div.className = "todo-item";
    div.dataset.index = getProjectTodos(currentProjectId).indexOf(todo);
    const deleteButton = createDeleteButton();
    const editButton = createEditButton();
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    checkbox.checked = todo.isCompleted;
    div.appendChild(checkbox);
    
    for (const prop in todo) {
        if (prop === "isCompleted") continue;
        const para = document.createElement("p");
        para.textContent = prop === "date" ? getFormattedDate(todo[prop]) : todo[prop];
        para.className = prop;
        div.appendChild(para);
    }

    div.appendChild(deleteButton);
    div.appendChild(editButton);
    return div;
}

function readForm() {
    const form = document.querySelector("main form");
    return {
        title: form.querySelector(".title").value,
        description: form.querySelector(".description").value,
        date: parseDate(form.querySelector(".date").value),
        priority: form.querySelector(".priority").value,
        projectId: form.querySelector(".project").value,
    }
}

function createTitleEl() {
    const title = document.createElement("input");
    title.required = true;
    title.className = "title";

    return title;
}

function createDescriptionEl() {
    const description = document.createElement("input");
    description.className = "description";

    return description;
}

function createDatePicker() {
    const datePicker = document.createElement("input");
    datePicker.min = format(new Date(), "yyyy-MM-dd");
    datePicker.type = "date";
    datePicker.className = "date";

    return datePicker;
}

function createSaveButton() {
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.className = "save-button";
    saveButton.type = "button";

    return saveButton;
}

function createCancelButton() {
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.className = "cancel-button";
    cancelButton.type = "button";

    return cancelButton;
}

function createPrioritySelect() {
    const prioritySelect = document.createElement("select");
    prioritySelect.className = "priority";
    const PRIORITIES = ["priority1", "priority2", "priority3", "priority4"];
    loadArrayToEl(PRIORITIES, prioritySelect, addPriorityOption);

    return prioritySelect;
}

function createProjectSelect() {
    const projectSelect = document.createElement("select");
    projectSelect.className = "project";
    const projects = getProjects();
    loadArrayToEl(projects, projectSelect, addProjectOption);

    const currentProject = [...projectSelect.options].find((option) => option.value === currentProjectId);
    currentProject.selected = true;

    return projectSelect;
}

function setTitle(title, todo) {
    title.value = todo.title;
}

function setDescription(description, todo) {
    description.value = todo.description;
}

function setDatePicker(datePicker, todo) {
    const todoDate = todo.date;
    if (todoDate) datePicker.value = format(todoDate, "yyyy-MM-dd");
}

function setPrioritySelect(prioritySelect, todo) {
    const priorityOption = [...prioritySelect.options].find((option) => option.value === todo.priority);
    priorityOption.selected = true;
}
import { registerProject, addTodoToProject, getProjectTodos, deleteTodoByIndex, getTodoFromProject, editTodo, checkTodo, removeProject, editProject, getProject } from "./index";
import { getProjects, DEFAULT_PROJECT_ID } from "./projects";
import { saveLastProjectId, getLastProjectId } from "./storage";
import { getFormattedDate, parseDate } from "./formatDate";
import { format } from "date-fns";
export { load, addEventListeners };

let currentProjectId = getLastProjectId() || DEFAULT_PROJECT_ID;

function loadItems(type) {
    const listElement = entityHandlers[type]?.getListElement();
    const items = entityHandlers[type]?.getAll();

    loadArrayToEl(items, listElement, entityHandlers[type]?.createEl);
}

function load() {
    entityHandlers.project.load();
    entityHandlers.todo.load();
}

function addEventListeners() {
    document.body.addEventListener("click", (event) => {
        const itemEl = event.target.closest("[data-type]");
        if (!itemEl) return;
        
        const type = itemEl.dataset.type;
        const keyValue = itemEl.dataset[entityHandlers[type]?.getKey()];

        if (event.target.type === "checkbox") {
            const todoCheckbox = event.target;
            checkTodo(currentProjectId, keyValue, todoCheckbox.checked);
            return;
        }

        if (event.target.tagName === "BUTTON") {
            const button = event.target;
            const form = entityHandlers[type]?.getForm();

            switch (button.className) {
                case "delete-button":
                    entityHandlers[type]?.delete(keyValue);
                    entityHandlers[type]?.load();
                    break;

                case "save-button":
                    event.preventDefault();
                    if (!form.isValid()) return;

                    form.close();
                    entityHandlers[type]?.save(keyValue, form.read());
                    entityHandlers[type]?.load();
                    break;

                case "edit-button":
                case "add-button":
                    form.close();
                    form.open(keyValue);
                    break;

                case "cancel-button":
                    form.close();
                    break;
            }

            return;
        }

        if (itemEl.className === "project-item" && !itemEl.querySelector("form")) {
            const projectItem = itemEl;
            const projectId = projectItem.dataset.projectId;
            if (projectId === currentProjectId) return;
            changeProject(projectId);
        }
    });
}

function changeProject(id) {
    todoForm.close();
    currentProjectId = id;
    entityHandlers.todo.load();
    saveLastProjectId(currentProjectId);
}

const projectForm = createForm("project", {
    title: createTitleEl(),
});

const todoForm = createForm("todo", {
    title: createTitleEl(),
    description: createDescriptionEl(),
    date: createDatePicker(),
    priority: createPrioritySelect(),
    projectId: createProjectSelect(),
});

const todoListEl = document.querySelector("section.todo-items");
const projectListEl = document.querySelector("section.projects");

const entityHandlers = {
    todo: {
        delete: (index) => deleteTodoByIndex(currentProjectId, index),
        save: (index, formData) =>
            index
                ? editTodo(currentProjectId, index, formData)
                : addTodoToProject(formData),
        getKey: () => "index",
        get: (index) => getTodoFromProject(currentProjectId, index),
        getAll: () => getProjectTodos(currentProjectId),
        getEl: (index) => document.querySelector(`.todo-item[data-index="${index}"]`),
        getForm: () => todoForm,
        getListElement: () => todoListEl,
        createEl: (todo) => createTodoEl(todo),
        load: () => loadItems("todo"),
    },
    project: {
        delete: (id) => {
            if (currentProjectId === id) changeProject(DEFAULT_PROJECT_ID);
            removeProject(id);
            todoForm.updateField("projectId");
        },
        save: (id, formData) => {
            if (id) {
                editProject(id, formData);
            } else {
                const newProjectId = registerProject(formData);
                changeProject(newProjectId);
            }
            todoForm.updateField("projectId");
        },
        getKey: () => "projectId",
        get: (id) => getProject(id),
        getAll: () => getProjects(),
        getEl: (id) => document.querySelector(`.project-item[data-project-id="${id}"]`),
        getForm : () => projectForm,
        getListElement: () => projectListEl,
        createEl: (project) => createProjectEl(project),
        load: () => loadItems("project"),
    },
};

function createForm(type, fieldsMap) {
    const form = document.createElement("form");
    const fields = Object.values(fieldsMap);
    const addButton = document.querySelector(`[data-type="${type}"].add-button`);
    const isOpen = () => form.isConnected;
    const isValid = () => form.reportValidity();
    let currentKey; 

    fields.forEach(el => form.appendChild(el.getEl()));
    form.appendChild(createSaveButton());
    form.appendChild(createCancelButton());

    const toggleAddButton = () => addButton.toggleAttribute("hidden");

    function updateField(prop) {
        const field = fieldsMap[prop];
        if (field) field.setEl();
    }

    function setFields(key) {
        if (!key) {
            form.reset();
            updateField("projectId");
            return;
        }

        const item = entityHandlers[type]?.get(key);
        fields.forEach(el => el.setEl(item));
    }

    function displayForm(key) {
        if (key) {
            delete form.dataset.type;
            entityHandlers[type]?.getEl(key).replaceChildren(form);
        } else {
            entityHandlers[type]?.getListElement().appendChild(form);
            toggleAddButton();
            form.dataset.type = type;
        }
    }

    function read() {
        return Object.fromEntries(
            Object.entries(fieldsMap).map(([key, field]) => [key, field.getValue()])
        );
    }

    function open(key) {
        setFields(key);
        displayForm(key);
        currentKey = key;
    }

    function close() {
        if (!isOpen()) return;

        if (currentKey) {
            const item = entityHandlers[type]?.get(currentKey);
            const itemEl = form.closest("[data-type]");
            itemEl.replaceChildren(...entityHandlers[type]?.createEl(item).children);
        } else {
            form.remove();
            toggleAddButton();
        }
    }

    return { setFields, displayForm, open, close, read, isValid, updateField };
}

function loadArrayToEl(array, el, mapFunc) {
    el.replaceChildren(...array.map(mapFunc));
}

function addProjectOption(project) {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.title;

    return option;
}

function addPriorityOption(priority) {
    const option = document.createElement("option");
    option.value = priority;
    option.textContent = priority;

    return option;
}

function createProjectEl(project) {
    const projectEl = document.createElement("div");
    projectEl.dataset.projectId = project.id;
    projectEl.dataset.type = "project";
    projectEl.className = "project-item";

    const para = document.createElement("p");
    para.textContent = project.title;
    para.className = "title";
    projectEl.appendChild(para);
    

    if (project.id !== DEFAULT_PROJECT_ID) {
        // const editButton = createEditButton();
        // const deleteButton = createDeleteButton();
        // projectEl.appendChild(editButton);
        // projectEl.appendChild(deleteButton);
        const buttons = createButtons();
        projectEl.appendChild(buttons);
    }

    return projectEl;
}

function createButtons() {
    const buttons = document.createElement("div");
    buttons.className = "buttons";

    const editButton = createEditButton();
    const deleteButton = createDeleteButton();

    buttons.appendChild(editButton);
    buttons.appendChild(deleteButton);

    return buttons;
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
    const todoEl = document.createElement("div");
    todoEl.className = "todo-item";
    todoEl.dataset.type = "todo";
    todoEl.dataset.index = getProjectTodos(currentProjectId).indexOf(todo);

    // const deleteButton = createDeleteButton();
    // const editButton = createEditButton();
    const buttons = createButtons();
    const checkbox = createCheckbox(todo);

    const info = document.createElement("div");
    info.classList = "info";

    todoEl.appendChild(checkbox);

    for (const prop in todo) {
        if (prop === "isCompleted") continue;
        const para = document.createElement("p");
        para.textContent = prop === "date" ? getFormattedDate(todo[prop]) : todo[prop];
        para.className = prop;
        info.appendChild(para);
    }

    // div.appendChild(deleteButton);
    // div.appendChild(editButton);
    todoEl.appendChild(info);
    todoEl.appendChild(buttons);

    return todoEl;
}

function createCheckbox(todo) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.isCompleted;

    const container = document.createElement("div")
    container.className = "checkbox"

    container.appendChild(checkbox);

    return container;
}

function createTitleEl() {
    const title = document.createElement("input");
    title.required = true;
    title.className = "title";

    function setEl(item) {
        title.value = item.title;
    }

    const getEl = () => title;

    const getValue = () => title.value;

    return { setEl, getEl, getValue };
}

function createDescriptionEl() {
    const description = document.createElement("input");
    description.className = "description";

    function setEl(item) {
        description.value = item.description;
    }

    const getEl = () => description;

    const getValue = () => description.value;

    return { setEl, getEl, getValue };
}

function createDatePicker() {
    const datePicker = document.createElement("input");
    datePicker.min = format(new Date(), "yyyy-MM-dd");
    datePicker.type = "date";
    datePicker.className = "date";

    function setEl(item) {
        const itemDate = item.date;
        if (itemDate) datePicker.value = format(itemDate, "yyyy-MM-dd");
    }

    const getEl = () => datePicker;

    const getValue = () => parseDate(datePicker.value);

    return { setEl, getEl, getValue };
}

function createSaveButton() {
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.className = "save-button";
    saveButton.type = "submit";

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

    function setEl(item) {
        const priorityOption = [...prioritySelect.options].find((option) => option.value === item.priority);
        priorityOption.selected = true;
    }

    const getEl = () => prioritySelect;

    const getValue = () => prioritySelect.value;

    return { setEl, getEl, getValue };
}

function createProjectSelect() {
    const projectSelect = document.createElement("select");
    projectSelect.className = "project";

    const getEl = () => projectSelect;
    const setEl = () => {
        const projects = getProjects();
        loadArrayToEl(projects, projectSelect, addProjectOption);
        const currentProject = [...projectSelect.options].find((option) => option.value === currentProjectId);
        currentProject.selected = true;
    };
    const getValue = () => projectSelect.value;

    return { getEl, setEl, getValue };
}
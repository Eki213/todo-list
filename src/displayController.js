import { registerProject, addTodoToProject, getProjectTodos, deleteTodoByIndex, getTodoFromProject, editTodo, checkTodo, removeProject, editProject, getProject } from "./index";
import { getProjects, DEFAULT_PROJECT_ID } from "./projects";
import { saveLastProjectId, getLastProjectId } from "./storage";
import { getFormattedDate, parseDate } from "./formatDate";
import { format, startOfDay } from "date-fns";
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
                    itemEl.remove();
                    entityHandlers[type]?.delete(keyValue);
                    break;

                case "save-button":
                    if (!form.isValid()) return;
                    entityHandlers[type]?.save(keyValue, form.read());
                    form.close();
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
    projectForm.close();

    const currentProject = entityHandlers.project.getEl(currentProjectId);
    const newProject = entityHandlers.project.getEl(id);
    if (currentProject) currentProject.classList.remove("active");
    newProject.classList.add("active");

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

function setProjectTitleEl() {
    const currentProject = getProject(currentProjectId);
    const title = document.querySelector(".project-title");
    title.textContent = currentProject.title;
}

const entityHandlers = {
    todo: {
        delete: (index) => { 
            deleteTodoByIndex(currentProjectId, index);
            [...todoListEl.children].forEach((item, index) => item.dataset.index = index);
        },
        save: (index, formData) => {
            if (index) {
                editTodo(currentProjectId, index, formData);
            } else {
                addTodoToProject(formData);
                if (formData.projectId === currentProjectId) todoListEl.appendChild(createTodoEl(entityHandlers.todo.get(-1)));
            }
        },
        getKey: () => "index",
        get: (index) => getTodoFromProject(currentProjectId, index),
        getAll: () => getProjectTodos(currentProjectId),
        getEl: (index) => document.querySelector(`.todo-item[data-index="${index}"]`),
        getForm: () => todoForm,
        getListElement: () => todoListEl,
        createEl: (todo) => createTodoEl(todo),
        load: () => {
            setProjectTitleEl();
            loadItems("todo");
        },
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
                setProjectTitleEl();
            } else {
                const newProjectId = registerProject(formData);
                projectListEl.appendChild(createProjectEl(getProject(newProjectId)));
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

    const pickers = document.createElement("div");
    const footer = document.createElement("div"); 
    pickers.className = "pickers";
    footer.className = "footer";
    fields.forEach(elObj => {
        const el = elObj.getEl();
        const containers = {
            pickers: ["date", "priority",],
            footer: ["project",],
        };
        let container;
        if (containers.pickers.includes(el.className)) {
            container = pickers;
        } else if (containers.footer.includes(el.className)) {
            container = footer;
        } else {
            container = form;
        }
        container.appendChild(el);
    });
    form.appendChild(pickers);
    form.appendChild(footer);

    const buttons = document.createElement("div");
    buttons.className = "buttons";

    buttons.appendChild(createSaveButton());
    buttons.appendChild(createCancelButton());

    footer.appendChild(buttons);

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
            delete form.dataset.priority;
            delete form.dataset.type;
            entityHandlers[type]?.getEl(key).replaceChildren(form);
        } else {
            entityHandlers[type]?.getListElement().appendChild(form);
            toggleAddButton();
            form.dataset.priority = "priority4";
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
            item ? itemEl.replaceWith(entityHandlers[type]?.createEl(item)) : itemEl.remove();
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
    const names = {
        priority1: "Priority 1",
        priority2: "Priority 2",
        priority3: "Priority 3",
        priority4: "Priority 4",
    };

    option.textContent = names[priority];

    return option;
}

function createProjectEl(project) {
    const projectEl = document.createElement("div");
    projectEl.dataset.projectId = project.id;
    projectEl.dataset.type = "project";
    projectEl.className = "project-item";

    const info = document.createElement("div");
    info.className = "info";

    const div = document.createElement("div");
    div.textContent = project.title;
    div.className = "title";

    info.appendChild(div);
    projectEl.appendChild(info);
    
    if (project.id === currentProjectId) projectEl.classList.add("active");

    if (project.id !== DEFAULT_PROJECT_ID) {
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

    const buttons = createButtons();
    const info = document.createElement("div");
    info.classList = "info";

    for (const prop in todo) {
        const div = document.createElement("div");
        const render = renderers[prop];
        const value = render ? render(todo[prop], todoEl) : todo[prop];
        if (value) {
            div.append(value);
            div.className = prop;
            prop === "isCompleted" ? todoEl.appendChild(div) : info.appendChild(div);
        }
    }

    todoEl.appendChild(info);
    todoEl.appendChild(buttons);

    return todoEl;
}

function isPast(date) {
    const today = startOfDay(new Date());
    const itemDate = startOfDay(new Date(date));

    return itemDate < today;
}

const renderers = {
    date: (date, el) => {
        if (date && isPast(date)) el.classList.add("isPast");
        return getFormattedDate(date);
    },
    isCompleted: (isCompleted, el) => createCheckbox(isCompleted),
    priority: (priority, el) => loadPriority(priority, el),
};

function loadPriority(priority, el) {
    el.dataset.priority = priority;
}

function createCheckbox(isCompleted) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isCompleted;

    return checkbox;
}

function createTitleEl() {
    const title = document.createElement("input");
    title.required = true;
    title.className = "title";
    title.placeholder = "Title";
    title.maxLength = 100;

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
    description.placeholder = "Description";
    description.maxLength = 150;

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
    datePicker.addEventListener("change", () => {
        const item = datePicker.closest("[data-type]");
        const value = datePicker.value;
        item.classList.toggle("isPast", value < format(new Date(), "yyyy-MM-dd"));
    });

    function setEl(item) {
        const itemDate = item.date;
        datePicker.value = itemDate ? format(itemDate, "yyyy-MM-dd") : "";
    }

    const getEl = () => datePicker;

    const getValue = () => parseDate(datePicker.value);

    return { setEl, getEl, getValue };
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
    prioritySelect.options[3].defaultSelected = true;

    prioritySelect.addEventListener("change", (event) => {
        const item = prioritySelect.closest("[data-priority]");

        item.dataset.priority = event.target.value;
    });

    function setEl(item) {
        prioritySelect.value = item.priority;
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
        projectSelect.value = currentProjectId;
    };
    const getValue = () => projectSelect.value;

    return { getEl, setEl, getValue };
}
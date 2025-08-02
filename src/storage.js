import { getProjects } from "./projects";
import  createProject  from "./createProject";
import { parseDate } from "./formatDate";
export { saveProjects, load, saveLastProjectId , getLastProjectId };

function saveProjects() {
    const projects = getProjects();
    const projectData = projects.map(project => ( {id: project.id, todos: project.getTodoItems(), title: project.title,} ));
    localStorage.setItem("projects", JSON.stringify(projectData));
}


function load() {
    const rawProjectData = localStorage.getItem("projects");
    if (!rawProjectData) return null;
    const projectData = JSON.parse(rawProjectData);

    const projects = projectData.map(p => {
        const project = createProject(p.title, p.id);
        p.todos.forEach(todo => {
            todo.date = parseDate(todo.date);
            project.addTodoItem(todo);
        });
        return project;
    });
    return projects;
    
}

function saveLastProjectId(projectId) {
    localStorage.setItem("projectId", projectId);
}

function getLastProjectId() {
    return localStorage.getItem("projectId");
}
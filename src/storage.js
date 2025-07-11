import { getProjects } from "./projects";
import  createProject  from "./createProject";
export { saveProjects, load, saveLastProjectId , getLastProjectId };

function saveProjects() {
    const projects = getProjects();
    const projectData = projects.map(project => ( {id: project.id, todos: project.getTodoItems(), name: project.name,} ));
    localStorage.setItem("projects", JSON.stringify(projectData));
}


function load() {
    const rawProjectData = localStorage.getItem("projects");
    if (!rawProjectData) return null;
    const projectData = JSON.parse(rawProjectData);

    const projects = projectData.map(p => {
        const project = createProject(p.name, p.id);
        p.todos.forEach(todo => project.addTodoItem(todo));
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

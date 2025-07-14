import { getProjects } from "./projects";
import  createProject  from "./createProject";
import { parseJSON } from "date-fns";
import { parseDate } from "./formatDate";
export { saveProjects, load, saveLastProjectId , getLastProjectId };

function saveProjects() {
    const projects = getProjects();
    const projectData = projects.map(project => ( {id: project.id, todos: project.getTodoItems(), name: project.name,} ));
    localStorage.setItem("projects", JSON.stringify(projectData));
}


function load() {
    const rawProjectData = localStorage.getItem("projects");
    console.log(parseJSON(""));
    if (!rawProjectData) return null;
    const projectData = JSON.parse(rawProjectData);

    const projects = projectData.map(p => {
        const project = createProject(p.name, p.id);
        p.todos.forEach(todo => {
            console.log(todo.date);
            todo.date = parseDate(todo.date);
            console.log(todo.date);
            project.addTodoItem(todo);
        });
        return project;
    });
    console.log(projects[0].getTodoItems());
    return projects;
    
}

function saveLastProjectId(projectId) {
    localStorage.setItem("projectId", projectId);
}

function getLastProjectId() {
    return localStorage.getItem("projectId");
}
export { addProject, findProject, getProjects, DEFAULT_PROJECT_ID };
import createProject from "./createProject";

const projects = [ createProject("Inbox") ];
const DEFAULT_PROJECT_ID = projects[0].id;
const addProject = (project) => {projects.push(project)
    console.log(projects);
};
const findProject = (id) => projects.find((project) => project.id === id);
const getProjects = () => [...projects];
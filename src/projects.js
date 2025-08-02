export { addProject, findProject, getProjects, deleteProject, DEFAULT_PROJECT_ID };
import createProject from "./createProject";
import { load } from "./storage"

let projects = load() || [ createProject("Inbox") ];
const DEFAULT_PROJECT_ID = projects[0].id;
const addProject = (project) => projects.push(project);
const deleteProject = (id) => projects = projects.filter((project) => project.id !== id);
const findProject = (id) => projects.find((project) => project.id === id);
const getProjects = () => [...projects];
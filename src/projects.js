export { addProject, findProject, getProjects, DEFAULT_PROJECT_ID };
import createProject from "./createProject";
import { load } from "./storage"

const projects = load() || [ createProject("Inbox") ];
const DEFAULT_PROJECT_ID = projects[0].id;
const addProject = (project) => projects.push(project);
const findProject = (id) => projects.find((project) => project.id === id);
const getProjects = () => [...projects];
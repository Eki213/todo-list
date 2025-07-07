export { addProject, findProject, getProjects };

const projects = [];
const addProject = (project) => {projects.push(project)
    console.log(projects);
};
const findProject = (id) => projects.find((project) => project.id === id);
const getProjects = () => [...projects];
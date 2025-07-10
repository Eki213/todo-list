export default createTodoItem;

function createTodoItem(title, description, date, priority, projectId) {
    return { title, description, date, priority, projectId };
}
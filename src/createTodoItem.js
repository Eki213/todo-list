export default createTodoItem;

function createTodoItem(title, description, dueDate, priority, projectId) {
    return { title, description, dueDate, priority, projectId };
}
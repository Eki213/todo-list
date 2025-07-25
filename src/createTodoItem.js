export default createTodoItem;

function createTodoItem(title, description, date, priority, isCompleted = false) {
    return { title, description, date, priority, isCompleted };
}
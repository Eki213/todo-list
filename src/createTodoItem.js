export default createTodoItem;

function createTodoItem(title, description, date, priority) {
    return { title, description, date, priority };
}
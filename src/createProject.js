export default createProject;

function createProject(title, id = crypto.randomUUID()) {
    const todoItems = [];
    const addTodoItem = (todoItem) => todoItems.push(todoItem);
    const getTodoItems = () => [...todoItems];
    const deleteTodoItem = (index) => todoItems.splice(index, 1);
    return { id, title, addTodoItem, getTodoItems, deleteTodoItem };
}
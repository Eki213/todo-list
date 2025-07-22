export default createProject;

function createProject(name, id = crypto.randomUUID()) {
    const todoItems = [];
    const addTodoItem = (todoItem) => todoItems.push(todoItem);
    const getTodoItems = () => [...todoItems];
    const deleteTodoItem = (index) => todoItems.splice(index, 1);
    return { id, name, addTodoItem, getTodoItems, deleteTodoItem };
}
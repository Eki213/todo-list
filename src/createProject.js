export default createProject;

function createProject(name) {
    const id = crypto.randomUUID();
    const todoItems = [];
    const addTodoItem = (todoItem) => todoItems.push(todoItem);
    const getTodoItems = () => [...todoItems];

    return { id, name, addTodoItem, getTodoItems };
}
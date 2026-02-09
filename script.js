// DOM要素の取得
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');

// タスクを管理する配列
let todos = [];

// 1. 初期化：ローカルストレージからデータを読み込む
function init() {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
        todos = JSON.parse(storedTodos);
    }
    renderTodos();
}

// 2. 画面描画関数（状態に基づいてHTMLを生成）
function renderTodos() {
    todoList.innerHTML = ''; // リストを一旦クリア

    todos.forEach(todo => {
        // li要素を作成
        const li = document.createElement('li');
        if (todo.completed) {
            li.classList.add('completed');
        }

        // タスクのテキスト部分
        const span = document.createElement('span');
        span.textContent = todo.text;
        // クリックで完了状態を切り替え
        span.addEventListener('click', () => toggleTodo(todo.id));
        span.style.cursor = 'pointer';
        span.style.flex = '1'; // テキスト部分を広げる

        // 削除ボタン
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '削除';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        // 要素を組み立て
        li.appendChild(span);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    });
}

// 3. データをローカルストレージに保存
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 4. タスクを追加する関数
function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') return; // 空文字なら何もしない

    const newTodo = {
        id: Date.now(), // ユニークなIDとして現在時刻を使用
        text: text,
        completed: false
    };

    todos.push(newTodo);
    saveTodos();
    renderTodos();
    todoInput.value = ''; // 入力欄をクリア
}

// 5. タスクの完了状態を切り替える関数
function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveTodos();
    renderTodos();
}

// 6. タスクを削除する関数
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

// イベントリスナーの設定
addBtn.addEventListener('click', addTodo);

// Enterキーでも追加できるようにする
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// アプリ起動
init();
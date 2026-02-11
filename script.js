// DOM要素の取得
const todoInput = document.getElementById("todo-input");
const todoDueInput = document.getElementById("todo-due");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const searchInput = document.getElementById("search-input");

// タスクを管理する配列
let todos = [];

// 1. 初期化：ローカルストレージからデータを読み込む
function init() {
  const storedTodos = localStorage.getItem("todos");
  if (storedTodos) {
    todos = JSON.parse(storedTodos);
  }
  renderTodos();
}

// 2. 画面描画関数（状態に基づいてHTMLを生成）
function renderTodos() {
  const q = (searchInput && searchInput.value ? searchInput.value.trim().toLowerCase() : "").replace(/\s+/g, " ");
  todoList.innerHTML = ""; // リストを一旦クリア

  todos.forEach((todo) => {
    // フィルタ: タスク本文または期限表示にクエリが含まれるか
    if (q) {
      const textMatch = todo.text.toLowerCase().includes(q);
      const dueMatch = todo.due ? new Date(todo.due).toLocaleDateString().toLowerCase().includes(q) : false;
      if (!textMatch && !dueMatch) return; // マッチしないのでスキップ
    }

    const li = createTodoElement(todo);
    // 期限が設定されていて未完了かつ現在日付が期限を過ぎていれば overdue クラスを付与
    if (todo.due && !todo.completed) {
      const dueEnd = new Date(todo.due);
      // その日の終わりまでを有効期限とする
      dueEnd.setHours(23, 59, 59, 999);
      if (Date.now() > dueEnd.getTime()) li.classList.add("overdue");
    }
    todoList.appendChild(li);
  });
}

// Helper: DOM 要素を作る
function createTodoElement(todo, animate = false) {
  const li = document.createElement("li");
  li.dataset.id = todo.id;
  if (todo.completed) li.classList.add("completed");

  const span = document.createElement("span");
  span.textContent = todo.text;
  span.style.cursor = "pointer";
  span.style.flex = "1";
  span.addEventListener("click", () => toggleTodo(todo.id, li));

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "削除";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    animateRemove(li, todo.id);
  });

  li.appendChild(span);
  li.appendChild(deleteBtn);

  // 期限表示 (任意)
  if (todo.due) {
    const dueSpan = document.createElement("span");
    dueSpan.classList.add("due");
    const timeEl = document.createElement("time");
    const d = new Date(todo.due);
    // ユーザー環境に合わせた表示
    timeEl.textContent = d.toLocaleDateString();
    timeEl.dateTime = d.toISOString();
    dueSpan.appendChild(timeEl);
    li.appendChild(dueSpan);
  }

  if (animate) {
    li.classList.add("fade-in");
    // remove the class after animation so future toggles still work
    li.addEventListener("animationend", () => li.classList.remove("fade-in"), {
      once: true,
    });
  }

  return li;
}

// 3. データをローカルストレージに保存
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// 4. タスクを追加する関数
function addTodo() {
  const text = todoInput.value.trim();
  if (text === "") return; // 空文字なら何もしない

  const dueValue =
    todoDueInput && todoDueInput.value ? todoDueInput.value : null;
  const newTodo = {
    id: Date.now(), // ユニークなIDとして現在時刻を使用
    text: text,
    completed: false,
    due: dueValue ? new Date(dueValue).toISOString() : null,
  };

  todos.push(newTodo);
  saveTodos();
  // リストを再描画（検索中でも反映されるように）
  renderTodos();
  todoInput.value = ""; // 入力欄をクリア
  if (todoDueInput) todoDueInput.value = "";
}

// 5. タスクの完了状態を切り替える関数
function toggleTodo(id, liElement) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });
  saveTodos();
  // DOM を更新（効率化のため全体再描画は避ける）
  const li = liElement || document.querySelector(`li[data-id="${id}"]`);
  if (li) {
    li.classList.toggle("completed");
  } else {
    renderTodos();
  }
}

// 6. タスクを削除する関数
// アニメーション付きで削除
function animateRemove(li, id) {
  li.classList.add("removing");
  const onEnd = () => {
    li.removeEventListener("animationend", onEnd);
    // データから削除
    todos = todos.filter((todo) => todo.id !== id);
    saveTodos();
    // DOMから確実に削除
    if (li.parentNode) li.parentNode.removeChild(li);
  };
  li.addEventListener("animationend", onEnd);
}

// イベントリスナーの設定
addBtn.addEventListener("click", addTodo);

// 検索イベント（リアルタイム）
if (searchInput) {
  searchInput.addEventListener("input", () => renderTodos());
}

// Enterキーでも追加できるようにする
todoInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTodo();
  }
});

// アプリ起動
init();

document.addEventListener('DOMContentLoaded', () => {
  let wrapper = document.querySelector(".wrapper1");
  let modal_login = document.querySelector(".modal_login");
  let modal_signin = document.querySelector(".modal_signin");
  let mBtn = document.querySelector(".modal_login_form-button");
  let sBtn = document.querySelector(".modal_signin_form-button");
  let toSignin = document.querySelector(".to_sign_in");
  let toLogin = document.querySelector(".to_log_in");
  const dashboard = document.querySelector(".main__inner");

  const filterSelect = document.createElement('select');
  filterSelect.innerHTML = `
    <option value="all">All Tasks</option>
    <option value="current">Current Tasks</option>
    <option value="completed">Completed Tasks</option>
  `;

  wrapper.appendChild(filterSelect);

  filterSelect.addEventListener('change', async () => {
    const selectedValue = filterSelect.value;
    await filterTasks(selectedValue);
  });

  dashboard.addEventListener('click', async (event) => {
    const selectedFilter = filterSelect.value;

    if (selectedFilter === 'all') {
      if (event.target.classList.contains('mark_btn')) {
        const taskId = event.target.dataset.taskId;
        const completed = event.target.dataset.completed === 'true';

        await markTaskAsCompleted(taskId, idshnik, !completed);
        dashboard.innerHTML = "";
        await appendDash();
      } else if (event.target.classList.contains('todo_btn')) {
        const taskId = event.target.dataset.taskId;
        
        await editTask(taskId, idshnik);
      } else if (event.target.classList.contains('delete_btn')) {
        const taskId = event.target.dataset.taskId;
        await deleteTask(taskId, idshnik);
      }
    }
  });

  async function filterTasks(filterType) {
    // Clear existing content
    dashboard.innerHTML = "";
  
    let allTasks = await toShowTasks(idshnik);
  
    if (filterType === 'current') {
      let currentTasks = allTasks.filter(item => !item.completed);
      renderTasks(currentTasks);
    } else if (filterType === 'completed') {
      let completedTasks = allTasks.filter(item => item.completed);
      renderTasks(completedTasks);
    } else {
      // Default case: show all tasks
      renderTasks(allTasks);
    }
  
    // Toggle visibility of mark button based on the filter
    const markButtons = document.querySelectorAll('.mark_btn');
    markButtons.forEach((button) => {
      button.style.display = filterType === 'all' ? 'block' : 'none';
    });
  }

  function renderTasks(tasks) {
    tasks.forEach((item) => {
      let newModel = document.createElement("div");
      newModel.setAttribute("class", "todo ");
      newModel.innerHTML = `<h3>${item.title}</h3>
                            <p>${item.body}</p>`;
  
      if (filterSelect.value === 'all') {
        // Display edit and delete buttons only when all tasks are shown
        newModel.innerHTML += `<button class="todo_btn" data-task-id="${item.id}">edit</button>
                               <button class="delete_btn" data-task-id="${item.id}">delete</button>`;
      }
  
      newModel.innerHTML += `<button class="mark_btn" data-task-id="${item.id}" data-completed="${item.completed}">
                              ${item.completed ? 'Mark as Undone' : 'Marked as Done'}
                            </button>`;
  
      dashboard.append(newModel);
    });
  }

  async function getData() {
    let data1 = await fetch("https://657b02ed394ca9e4af135daa.mockapi.io/users_tasks")
      .then(response => response.json()).then(data => data);
    return data1;
  }

  async function toShowTasks(id) {
    let data1 = await fetch(`https://657b02ed394ca9e4af135daa.mockapi.io/users_tasks/${id}/tasks`)
      .then(response => response.json()).then(data => data);
    return data1;
  }

  async function createTask(title, body, id) {
    const data = {
      title: title.value,
      body: body.value
    };
    try {
      const response = await fetch(`https://657b02ed394ca9e4af135daa.mockapi.io/users_tasks/${id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();
      console.log('Success:', responseData);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const wLogin = () => {
    modal_login.style.display = "flex";
    modal_signin.style.display = "none";
    wrapper.style.display = "none";
    clearErrorMessages();
  }

  wLogin();

  const wSignin = () => {
    modal_login.style.display = "none";
    modal_signin.style.display = "flex";
    wrapper.style.display = "none";
    clearErrorMessages();
  }

  const wWrapper = () => {
    modal_login.style.display = "none";
    modal_signin.style.display = "none";
    wrapper.style.display = "block";
    clearErrorMessages();
  }

  let idshnik = 0;

  async function appendDash() {
    let newData = await toShowTasks(idshnik);

    newData.map((item) => {
      let newModel = document.createElement("div");
      newModel.setAttribute("class", "todo ");
      newModel.innerHTML = `<h3>${item.title}</h3>
                                <p>${item.body}</p>
                                <button class="todo_btn" data-task-id="${item.id}">edit</button>
                                <button class="delete_btn" data-task-id="${item.id}">delete</button>
                                <button class="mark_btn" data-task-id="${item.id}" data-completed="${item.completed}">
                                  ${item.completed ? 'Mark as Undone' : 'Marked as Done'}
                                </button>`;

      dashboard.append(newModel);
    });

    dashboard.addEventListener('click', async (event) => {
      if (event.target.classList.contains('mark_btn')) {
        const taskId = event.target.dataset.taskId;
        const completed = event.target.dataset.completed === 'true';

        await markTaskAsCompleted(taskId, idshnik, !completed);
      }
    });
  }

  async function markTaskAsCompleted(id, userId, completed) {
    const data = {
      completed: completed,
    };
    try {
      const response = await fetch(`https://657b02ed394ca9e4af135daa.mockapi.io/users_tasks/${userId}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();
      console.log('Mark as Completed Success:', responseData);

      const taskElement = document.querySelector(`.todo[data-task-id="${id}"]`);
      if (taskElement) {
        let markBtn = taskElement.querySelector('.mark_btn');
        if (markBtn) {
          markBtn.textContent = completed ? 'Mark as Undone' : 'Marked as Done';
          markBtn.dataset.completed = completed;
        } else {
          markBtn = document.createElement("button");
          markBtn.setAttribute("class", "mark_btn");
          markBtn.setAttribute("data-task-id", id);
          markBtn.setAttribute("data-completed", completed);
          markBtn.textContent = completed ? 'Mark as Undone' : 'Marked as Done';
          taskElement.appendChild(markBtn);
        }
      }
    } catch (error) {
      console.error('Mark as Completed Error:', error);
    }
  }

  async function deleteTask(id, userId) {
    try {
      const response = await fetch(`https://657b02ed394ca9e4af135daa.mockapi.io/users_tasks/${userId}/tasks/${id}`, {
        method: 'DELETE',
      });

      const responseData = await response.json();
      console.log('Delete Success:', responseData);
    } catch (error) {
      console.error('Delete Error:', error);
    }

    dashboard.innerHTML = "";
    await appendDash();
  }

  dashboard.addEventListener('click', async (event) => {
    if (event.target.classList.contains('todo_btn')) {
      const taskId = event.target.dataset.taskId;
      await editTask(taskId, idshnik);
    }
  });

  const mInpLogin = document.querySelector(".modal_login_form-input1");
  const mInpPassword = document.querySelector(".modal_login_form-input2");

  let WORK = async () => {
    const data = await getData();
    let answer = 0;
    await data.map((item) => {
      if (item.email == mInpLogin.value && item.password == mInpPassword.value) {
        answer = item;
        idshnik = item.id;
      }
    });

    if (answer !== 0) {
      wWrapper();
    } else {
      // Выводим сообщение об ошибке в DOM
      alert("login-error-message", "Incorrect login or password. Please try again.");
    }
    await appendDash();
  }

  mBtn.onclick = () => {
    WORK();
  }

  toSignin.onclick = () => {
    wSignin();
  }

  toLogin.onclick = () => {
    wLogin();
  }

  const sInpEmail = document.querySelector(".modal_signin_form-input1");
  const sInpPassw = document.querySelector(".modal_signin_form-input2");

  sBtn.onclick = async () => {
    // Валидация для регистрации
    if (!validateEmail(sInpEmail.value)) {
      // Выводим сообщение об ошибке в DOM
      alert("signin-error-message", "Invalid email format. Please enter a valid email address.");
    } else if (!sInpPassw.value) {
      // Выводим сообщение об ошибке в DOM
      displayErrorMessage("signin-error-message", "Please enter a password.");
    } else {
      const url = 'https://657b02ed394ca9e4af135daa.mockapi.io/users_tasks';
      const data = {
        email: sInpEmail.value,
        password: sInpPassw.value
      };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        const responseData = await response.json();
        console.log('Success:', responseData);
        wWrapper();
      } catch (error) {
        console.error('Error:', error);
        // Выводим сообщение об ошибке в DOM
        displayErrorMessage("signin-error-message", "An error occurred during registration. Please try again.");
      }
    }
  };

  const creaInp1 = document.querySelector(".newTaskInp1");
  const creaInp2 = document.querySelector(".newTaskInp2");
  const creaBtn = document.querySelector(".newTaskBtn");

  creaBtn.onclick = async () => {
    await createOrUpdateTask(creaInp1, creaInp2, idshnik);
  }

  const creaInp3 = document.querySelector(".newTaskInp3");
  const creaEditBtn = document.querySelector(".newTaskEditBtn");

  creaEditBtn.onclick = async () => {
    const taskId = creaInp3.value;
    if (taskId) {
      await editTask(taskId, idshnik);
    } else {
      alert("Please enter a task ID.");
    }
  };

  async function editTask(id, userId) {
    const newTitle = prompt("Enter new title:");
    const newBody = prompt("Enter new body:");
    await updateTask(id, newTitle, newBody, userId);
    
    // Clear existing content before appending the updated tasks
    dashboard.innerHTML = "";
    
    await appendDash();
  }

  async function updateTask(id, title, body, userId) {
    const data = {
      title: title,
      body: body,
    };
    try {
      const response = await fetch(`https://657b02ed394ca9e4af135daa.mockapi.io/users_tasks/${userId}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();
      console.log('Update Success:', responseData);
    } catch (error) {
      console.error('Update Error:', error);
    }
  }

  async function createOrUpdateTask(title, body, userId) {
    await createTask(title, body, userId);
    dashboard.innerHTML = "";
    await appendDash();
  }

  function validateEmail(email) {
    // Простейшая валидация email
    const emailRegex = /^[A-Za-z]+@[A-Za-z]+\.[A-Za-z]+$/;
    return emailRegex.test(email);
  }

  function displayErrorMessage(elementId, message) {
    // Отображение сообщения об ошибке в DOM
    const errorDiv = document.querySelector(`.${elementId}`);
    if (errorDiv) {
      errorDiv.textContent = message;
    }
  }

  function clearErrorMessages() {
    // Очистка сообщений об ошибках в DOM
    displayErrorMessage("login-error-message", "");
    displayErrorMessage("signin-error-message", "");
  }
});

const taskInput = document.querySelector("#task-input");
const taskInputBtn = document.querySelector("#task-input-btn");
const toastsBlock = document.querySelector("#toasts-block");
const taskList = document.querySelector("#task-list");

if (window.location.pathname === "/") {
  taskInput.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      saveTask();
    }
  });
  taskInputBtn.addEventListener("click", (e) => {
    saveTask();
  });
}

function saveTask() {
  if (taskInput.value === "") return;

  makeHttpRequest(
    "POST",
    "/api/saveTask",
    { taskDescription: taskInput.value },
    (xhr) => {
      const newTask = JSON.parse(xhr.response);
      createToast();
      createTask(newTask._id, newTask.taskDescription);
      taskInput.value = "";
    }
  );
}

function deleteTask(task) {
  makeHttpRequest("POST", "/api/deleteTask", { taskId: task.id }, () => {
    createToast("The task has been deleted", "danger");
    document.getElementById(task.id).remove();
  });
}

function createTask(taskId, taskDescription) {
  let task = document.createElement("li");
  task.classList =
    "list-group-item d-flex justify-content-between align-items-center";
  task.id = taskId;

  let taskName = document.createElement("span");
  taskName.innerText = taskDescription;
  taskName.style.width = "60%";
  taskName.style.wordWrap = "break-word";

  let actionButtonsDiv = document.createElement("div");

  actionButtonsDiv.classList = "action-buttons d-flex";

  actionButtonsDiv.innerHTML += `
  <i class="bi bi-trash-fill fs-4" onclick="deleteTask(event.currentTarget.parentElement.parentElement)"></i>
  <i class="bi bi-star-fill fs-4 mx-3" onclick="highlightTask(event.currentTarget.parentElement.parentElement)"></i>
  <i class="bi bi-check-circle-fill fs-4" onclick="finishTask(event.currentTarget.parentElement.parentElement)"></i>`;

  task.appendChild(taskName);
  task.appendChild(actionButtonsDiv);
  taskList.appendChild(task);
}

function highlightTask(task) {
  makeHttpRequest(
    "POST",
    "/api/setImportance",
    { taskId: task.id, isImportant: !task.classList.contains("important") },
    () => {
      task.classList.toggle("important");

      if (task.classList.contains("important")) {
        taskList.insertBefore(task, taskList.children[0]);
      } else {
        taskList.append(task);
      }
    }
  );
}

function finishTask(task) {
  makeHttpRequest("POST", "/api/finishTask", { taskId: task.id }, () => {
    createToast("The task has been finished", "success");
    document.getElementById(task.id).remove();
  });
}

function restoreTask(task) {
  makeHttpRequest("POST", "/api/restoreTask", { taskId: task.id }, () => {
    createToast("The task has been restored", "warning");
    document.getElementById(task.id).remove();
  });
}

function deleteFinishedTasks() {
  const finishedTasks = Array.from(taskList.querySelectorAll("li"))
  let tasksIds = []
  finishedTasks.map((task) => {
    tasksIds.push(task.id)
  })

  makeHttpRequest("POST", "/api/deleteFinished", { tasksIds }, () => {
    createToast("Cleared", "primary");
    finishedTasks.map((task) => {
      document.getElementById(task.id).remove();
    })
  });
}

function createToast(message = "New task added", bg = "primary") {
  let toast = document.createElement("div");
  toast.classList = `toast align-items-center text-bg-${bg} border-0 d-flex m-1 `;
  toast.role = "alert";
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");
  toast.style =
    "z-index: 1000; animation-name: toastPopUp; animation-duration: 0.5s; opacity: 1";
  toast.onclick = (event) => {
    deleteToast(event.currentTarget);
  };

  let toastWrapper = document.createElement("div");
  toastWrapper.classList = "d-flex justify-content-between w-100";

  let toastBody = document.createElement("div");
  toastBody.classList = "toast-body";
  toastBody.innerText = message;

  let toastBtn = document.createElement("button");
  toastBtn.classList = "btn-close btn-close-white me-2 m-auto";
  toastBtn.setAttribute("data-bs-dismiss", "toast");
  toastBtn.setAttribute("aria-label", "Close");
  toastBtn.onclick = (event) => {
    deleteToast(event.currentTarget.parentElement.parentElement);
  };

  toastWrapper.append(toastBody);
  toastWrapper.append(toastBtn);
  toast.append(toastWrapper);

  toastsBlock.append(toast);

  const fadeout = setInterval(() => {
    let opacity =
      Number.parseFloat(getComputedStyle(toast).getPropertyValue("opacity")) -
      0.02;
    toast.style.opacity = opacity;

    if (opacity <= 0) {
      toast.remove();
      clearInterval(fadeout);
    }
  }, 100);
}

function deleteToast(toast) {
  toast.removeAttribute("style");
  setTimeout(() => {
    toast.style.animationName = "toastPopUp";
    toast.style.animationDuration = "0.5s";
    toast.style.animationDirection = "reverse";
  }, 10);

  setTimeout(() => toast.remove(), 500);
}

function login(event) {
  event.preventDefault();

  const form = event.currentTarget;
  makeHttpRequest(
    "POST",
    "/auth/login",
    { email: form.email.value, password: form.password.value },
    (xhr) => {
      try {
        const error = JSON.parse(xhr.response).error;

        form.children[0].classList.remove("d-none");
        form.children[0].innerText = error;

        form.email.classList.add("border-danger");
        form.password.classList.add("border-danger");
      } catch {
        window.location.href = "/";
      }
    }
  );
}

function registration(event) {
  event.preventDefault();

  const form = event.currentTarget;

  const firstname = form.querySelector("#firstname");
  const lastname = form.querySelector("#lastname");
  const email = form.querySelector("#email");
  const password = form.querySelector("#password");

  let fields = [firstname, lastname, email, password]

  fields.map((el) => {
    el.classList.remove("border-danger")
    el.parentElement.querySelector("div[name='error']").innerText = ''
  })

  let errors = [];

  if (!firstname.value > 0) {
    errors.push({ element: firstname, error: "* Firstname field is required." });
  }

  if (!lastname.value > 0) {
    errors.push({ element: lastname, error: "* Lastname field is required." });
  }

  if (!email.value > 0) {
    errors.push({ element: email, error: "* Email field is required." });
  }

  if (password.value.length < 6) {
    errors.push({ element: password, error: "* The password must be longer than 6 characters." });
  }

  if (errors.length > 0) {
    errors.map(({ element, error }) => {
      element.classList.add("border-danger")
      element.parentElement.querySelector("div[name='error']").innerText = error
    });
    return
  }

  makeHttpRequest(
    "POST",
    "/auth/register",
    { firstname: firstname.value, lastname: lastname.value, email: email.value, password: password.value },
    () => {
      window.location.href = "/";
    }
  );
}

function makeHttpRequest(
  method = "GET",
  path,
  body = {},
  callback,
  headers = {}
) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, path);

  xhr.setRequestHeader("Content-Type", " application/json");
  Object.keys(headers).map((header) => {
    xhr.setRequestHeader(header, headers[header]);
  });
  xhr.send(JSON.stringify(body));

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) callback(xhr);
    }
  };
}
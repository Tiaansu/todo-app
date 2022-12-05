// const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
// const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
//     return new bootstrap.Tooltip(tooltipTriggerEl)
// });

// ---
// Local Storage
// ---
let Tasks = JSON.parse(localStorage.getItem('vanilla-js-todo-app'));
Tasks = !Tasks ? [] : Tasks;
let isEditingTask = false;
let taskID;

// ---
// JQuery
// ---
$('#new-task-modal').on('shown.bs.modal', () => {
    $('input[id="new-task-title"]').focus();
});

$('button[id="new-task-btn"]').click((e) => {
    if ($('input[id="new-task-title"]').val().length === 0) {
        $('#alert-container').html(`
            <div class="alert alert-danger" role="alert">
                Please add a title for your task.
            </div>
        `);

        setTimeout(() => {
            $('#alert-container').html('');
        }, 1000);
    } else if($('textarea[id="new-task-description"]').val().length === 0) {
        $('#alert-container').html(`
            <div class="alert alert-danger" role="alert">
                Please add a description for your task.
            </div>
        `);

        setTimeout(() => {
            $('#alert-container').html('');
        }, 1000);
    } else {
        if (isEditingTask === true) {
            Tasks[taskID].title = $('input[id="new-task-title"').val();
            Tasks[taskID].description = $('textarea[id="new-task-description"]').val();

            $('input[id="new-task-title"]').val('');
            $('textarea[id="new-task-description"]').val('');

            $('#new-task-modal').modal('toggle');

            localStorage.setItem('vanilla-js-todo-app', JSON.stringify(Tasks));
        } else {
            const newTask = {
                id: Tasks.length,
                title: $('input[id="new-task-title"]').val(),
                description: $('textarea[id="new-task-description"]').val(),
                timeAdded: new Date().getTime(),
                timeFinished: null,
                isFinished: false
            };

            Tasks.push(newTask);
            $('input[id="new-task-title"]').val('');
            $('textarea[id="new-task-description"]').val('');

            $('#new-task-modal').modal('toggle');

            localStorage.setItem('vanilla-js-todo-app', JSON.stringify(Tasks));
        }
    }
    showTasks();
});

$('body').on('click', 'button.task-btn', function (e) {
    const btns = Array.from(e.target.classList);
    taskID = e.target.getAttribute('data-task-id');
    
    btns.forEach((button) => {
        if (button === 'task-btn-pending') {
            setTaskPending(taskID);
        } else if (button === 'task-btn-finish') {
            setTaskFinish(taskID);
        } else if (button === 'task-btn-edit') {
            editTask(taskID);
        } else if (button === 'task-btn-delete') {
            deleteTask(taskID);
        }
    });
});

$('body').on('mouseover', '[data-bs-toggle="tooltip"]', function (e) {
    e.stopPropagation();
    return new bootstrap.Tooltip(this).show();
});

$('body').on('mouseleave', '[data-bs-toggle="tooltip"]', function (e) {
    $('[role="tooltip"]').fadeOut(function () {
        e.stopPropagation();
        $(this).remove();
    });
});

// ---
// Functions
// ---
function showTasks() {
    $('#tasks-container').html('');

    let tasksHTML = '';

    if (Tasks.length > 0) {
        Tasks.forEach((task, id) => {
            if (task.isFinished === true) {
                tasksHTML += `
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="tasks-heading-${task.id}">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#tasks-body-${task.id}" aria-expanded="false" aria-controls="tasks-body-${task.id}">
                                ${task.title} <span class="badge bg-success ms-2">Finished</span>
                            </button>
                        </h2>
                        <div id="tasks-body-${task.id}" class="accordion-collapse collapse" aria-labelledby="tasks-heading-${task.id}" data-bs-parent="#tasks-container">
                            <div class="accordion-body">
                                <p id="tasks-body-${task.id}-description">
                                    <strong>Description:</strong> ${task.description}
                                </p>
                                <p id="tasks-body-${task.id}-date-added">
                                    <strong>Date Added:</strong> ${convertTimestampToDate(task.timeAdded)}
                                </p>
                                <p id="tasks-body-${task.id}-date-finished">
                                    <strong>Date Finished:</strong> ${convertTimestampToDate(task.timeFinished)}
                                </p>
                                <div class="accordion-btn-container">
                                    <button type="button" class="btn btn-outline-info task-btn task-btn-pending" data-task-id="${id}" data-bs-toggle="tooltip" data-bs-title="Mark task as Pending">
                                        <i class="fa-solid fa-rotate-left task-btn-pending" data-task-id="${id}"></i>
                                    </button>
                                    <button type="button" class="btn btn-outline-warning task-btn task-btn-edit" data-task-id="${id}" data-bs-toggle="tooltip" data-bs-title="Edit task">
                                        <i class="fa-solid fa-pen task-btn-edit" data-task-id="${id}"></i>
                                    </button>
                                    <button type="button" class="btn btn-outline-danger task-btn task-btn-delete" data-task-id="${id}" data-bs-toggle="tooltip" data-bs-title="Delete task">
                                        <i class="fa-solid fa-trash task-btn-delete" data-task-id="${id}"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                tasksHTML += `
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="tasks-heading-${task.id}">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#tasks-body-${task.id}" aria-expanded="false" aria-controls="tasks-body-${task.id}">
                                ${task.title} <span class="badge bg-danger ms-2">Pending</span>
                            </button>
                        </h2>
                        <div id="tasks-body-${task.id}" class="accordion-collapse collapse" aria-labelledby="tasks-heading-${task.id}" data-bs-parent="#tasks-container">
                            <div class="accordion-body">
                                <p id="tasks-body-${task.id}-description">
                                    <strong>Description:</strong> ${task.description}
                                </p>
                                <p id="tasks-body-${task.id}-date-added">
                                    <strong>Date Added:</strong> ${convertTimestampToDate(task.timeAdded)}
                                </p>
                                <div class="accordion-btn-container">
                                    <button type="button" class="btn btn-outline-success task-btn task-btn-finish" data-task-id="${id}" data-bs-toggle="tooltip" data-bs-title="Mark task as Finished">
                                        <i class="fa-solid fa-check task-btn-finish" data-task-id="${id}"></i>
                                    </button>
                                    <button type="button" class="btn btn-outline-warning task-btn task-btn-edit" data-task-id="${id}" data-bs-toggle="tooltip" data-bs-title="Edit task">
                                        <i class="fa-solid fa-pen task-btn-edit" data-task-id="${id}"></i>
                                    </button>
                                    <button type="button" class="btn btn-outline-danger task-btn task-btn-delete" data-task-id="${id}" data-bs-toggle="tooltip" data-bs-title="Delete task">
                                        <i class="fa-solid fa-trash task-btn-delete" data-task-id="${id}"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        })
    }

    $('#tasks-container').html(Tasks.length > 0 ? tasksHTML : `<p class="text-center">You don't have any task yet.</p>`);
}
showTasks();

function setTaskPending(taskID) {
    Tasks[taskID].isFinished = false;
    Tasks[taskID].timeFinished = null;

    localStorage.setItem('vanilla-js-todo-app', JSON.stringify(Tasks));

    hideTooltip();

    showTasks();
}

function setTaskFinish(taskID) {
    Tasks[taskID].isFinished = true;
    Tasks[taskID].timeFinished = new Date().getTime();

    localStorage.setItem('vanilla-js-todo-app', JSON.stringify(Tasks));

    hideTooltip();

    showTasks();
}

function editTask(taskID) {
    if (Tasks[taskID].isFinished === true) {
        $('#alert-container').html(`
            <div class="alert alert-danger m-3 p-2" role="alert">
                You can't edit a task that is already.
            </div>
        `);

        setTimeout(() => {
            $('#alert-container').html('');
        }, 1000);
    } else {
        isEditingTask = true;
        $('h5[id="new-task-modal-label"]').text(`Edit task`);
        $('input[id="new-task-title"]').val(`${Tasks[taskID].title}`);
        $('textarea[id="new-task-description"]').val(`${Tasks[taskID].description}`);
        $('button[id="new-task-btn"]').addClass('btn-outline-warning').removeClass('btn-outline-success');
        $('button[id="new-task-btn"]').text('Edit task');
        $('#new-task-modal').modal('show');
    }
}

function deleteTask(taskID) {
    isEditingTask = false;
    Tasks.splice(taskID, 1);
    localStorage.setItem('vanilla-js-todo-app', JSON.stringify(Tasks));

    hideTooltip();

    showTasks();
}

function hideTooltip() {
    const currentTooltip = document.querySelector('[role="tooltip"]');
    const tooltip = bootstrap.Tooltip.getInstance(currentTooltip);
    tooltip.hide();
}

function convertTimestampToDate(timestamp) {
    return moment(timestamp).format('MMMM DD, YYYY hh:mm A');
}
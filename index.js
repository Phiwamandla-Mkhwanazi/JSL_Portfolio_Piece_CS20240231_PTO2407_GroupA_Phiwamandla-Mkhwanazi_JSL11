// TASK: import helper functions from utils
import { getTasks, createNewTask , patchTask, putTask, deleteTask}  from "./utils/taskFunctions.js";
// TASK: import initialData
import {initialData} from "./initialData.js"; 


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
     if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "false");
  } else {
    console.log("Data already exists in localStorage");
  }
}
initializeData();

// TASK: Get elements from the DOM
const elements = {
        headerBoardName: document.getElementById('header-board-name'),
        filterDiv: document.getElementById('filterDiv'),
        hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
        showSideBarBtn: document.getElementById('show-side-bar-btn'),
        themeSwitch: document.getElementById('switch'),
        createNewTaskBtn: document.getElementById('add-new-task-btn'),
        modalWindow: document.getElementById('new-task-modal-window'),
        columnDivs: document.querySelectorAll('.column-div'),
        sidebar: document.getElementById('side-bar-div'),
        editTaskModal: document.querySelector('.edit-task-modal-window')
}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  console.log(tasks);
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0];  //->Fix ternary operator expression
    elements.headerBoardName.textContent = activeBoard //->Get header-board-name element
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    //->Add a eventlistener and syntax and include anonymous function.
    boardElement.addEventListener('click' , ()=>  { //->Introduced the event listener and handling of the event. 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    }); //-> added ')'
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName); //-> Assignment instead of Comparison in Filtering

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => { // -> elements.columnDivs is not in the elements object
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => {  //->Assignment instead of Comparison in Filtering
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click',  () => { //-> Add a eventlistener and fix syntax expression 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    if (btn.textContent === boardName) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active'); 
    }
});
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); //-> Fix Template Literal Syntax
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement);  //-> Required an argument
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click' ,() => toggleModal(false, elements.editTaskModal)); //->Add EventListener and fix syntax

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false)); //->Add Event Listener and Fix syntax
  elements.showSideBarBtn.addEventListener('click',() => toggleSidebar(true)); //->Add Event Listener and Fix syntax

  // Theme switch event listener
  elements.themeSwitch.addEventListener('click', () => toggleTheme());//->Fixed the switch event listener. 

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; //-> Fix ternary operator syntax expression
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();
     
  //-> Create an object for the new task
    const task = {
      title: document.getElementById('title-input').value.trim(),
      description: document.getElementById('desc-input').value.trim(),
      status: document.getElementById('select-status').value ,
      board: activeBoard
  };

  //-> Validate input fields
  if (!task.title || !task.description || !task.status || !task.board) {
      alert("Please fill in all fields before adding a task.");
      return;
  }
  //->Close the new task modal
  toggleModal(false);
  elements.filterDiv.style.display = 'none'; 
  
  //-> Create task and store in localStorage
  let newTask = createNewTask(task);
  
  //-> Display task info in console for debugging purposes
  console.log(getTasks())

  //-> Update UI
  addTaskToUI(newTask);
  refreshTasksUI();

  //-> Clear input fields 
  elTitle.value = "";
  elDescription.value = "";
  elStatus.value = "todo"; // Set default status if applicable

}


function toggleSidebar(show) 
{ 
 
  console.log("Get Side Bar Current status : " + show);
 
  if (show) 
 {
    elements.sidebar.style.display = "flex";
    elements.showSideBarBtn.style.display = "none";
    localStorage.setItem('showSideBar','true')
 } 
  
 else 
 {
   elements.sidebar.style.display = "none"; 
   elements.showSideBarBtn.style.display = "block";
   localStorage.setItem('showSideBar' ,'false')
 }

}

function toggleTheme() {
   const elLogo = document.getElementById("logo");
     
  //Used A Switch Statement
  switch(localStorage.getItem('light-theme'))
  {
    case 'enabled' : 
    {
      document.body.classList.remove('light-theme') //Remove the light-theme defaulting to :root theme
      localStorage.setItem('light-theme','disabled') //Change the value inside the localStorage
     console.log("isLightTheme : " + localStorage.getItem('light-theme')) //Show status on my console for debugging purposes - disable
     elLogo.src = "./assets/logo-dark.svg";
    }
    break;
    default : 
    {
      document.body.classList.toggle('light-theme'); //Add the light-theme from the given css file
      localStorage.setItem('light-theme','enabled') //Change the status to enabled  inside the localStorage
      console.log("isLightTheme : " + localStorage.getItem('light-theme'))//Show results on console - enable
      elLogo.src = "./assets/logo-light.svg";
    }
  }
 
}



function openEditTaskModal(task) {
// Set task details in modal inputs
  document.getElementById('edit-task-title-input').value = task.title;
  document.getElementById('edit-task-desc-input').value = task.description;
  document.getElementById('edit-select-status').value = task.status;

 // Get original button elements from the task modal
  const oldSaveChangesBtn = document.getElementById('save-task-changes-btn');
  const oldDeleteTaskBtn = document.getElementById('delete-task-btn');

  // Replace buttons with clean clones to remove previous event listeners
  const saveChangesBtn = oldSaveChangesBtn.cloneNode(true);
  const deleteTaskBtn = oldDeleteTaskBtn.cloneNode(true);
  oldSaveChangesBtn.parentNode.replaceChild(saveChangesBtn, oldSaveChangesBtn);
  oldDeleteTaskBtn.parentNode.replaceChild(deleteTaskBtn, oldDeleteTaskBtn);
  
  // Call saveTaskChanges upon click of Save Changes button
  saveChangesBtn.addEventListener('click', ()=> 
    {
      saveTaskChanges(task.id)
      toggleModal(false, elements.editTaskModal);
      refreshTasksUI();
    });

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener('click', () => 
    {
      //Personal Feature
      if (confirm("Are you sure you want to delete this task?")) 
        {
          let del = deleteTask(task.id);//->delete the current task selected
          console.log(del) //-> Debugging purposes
          
          setTimeout(() => refreshTasksUI(), 100);//->Refresh the UI
          toggleModal(false, elements.editTaskModal); //->Close the edit task modal
        }
  
    });


  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const elTitle = document.getElementById('edit-task-title-input').value.trim();
  const elDescription = document.getElementById('edit-task-desc-input').value.trim();
  const elStatus = document.getElementById('edit-select-status').value;
  
  // Create an object with the updated task details
  let objTask = 
  { id:taskId,
    title: elTitle,
    description: elDescription,
    status: elStatus, 
    board: activeBoard 
  }; 

  // Update task using a hlper functoin
  if (!elTitle || !elDescription || !elStatus) {
  console.error("Error: One or more input fields are empty!");
    return;
  }
  else
  patchTask(taskId, objTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
  handleMobileView(mobileMediaQuery); //->Load MobileView
}


/*------------------Tablet & Mobile Media Queries Edit-----------------------------*/
// Define media query for mobile (max-width: 1024px)
const mobileMediaQuery = window.matchMedia("(max-width: 1023px)");
function handleMobileView(e) {
  const sidebarMobile = document.querySelector(".side-bar");
  const logoMobile = document.querySelector(".logo-mobile");
  const headerBoardMobile = document.querySelector('.header-board-name');
  const dropdownMobile = document.querySelector('.dropdownBtn');
  const dotsMobile = document.querySelector("#three-dots-icon")
  const buttonMobile = document.querySelector('#add-new-task-btn');
   elements.showSideBarBtn.style.display = "none";

  // Handle sidebar visibility
  if (sidebarMobile) {
      if (e.matches) {
          sidebarMobile.style.display = "none"; // Hide sidebar for mobile view
      } else {
          sidebarMobile.style.display = "flex"; // Show sidebar for larger screens
      }
  }

  // Handle logo adjustments for mobile view
  if (logoMobile) {
      if (e.matches) {
      
        logoMobile.style.display = "block";
        logoMobile.style.width = "15em"; // Set a maximum width for the logo
        logoMobile.style.maxWidth = "100%"; // Ensure it doesn't overflow the container
        logoMobile.style.height = "auto"; // Maintain aspect ratio
        logoMobile.style.marginTop = "5%";// Adjust logo size and margin for mobile
      } else {
        logoMobile.style.display = "none";
          logoMobile.style.width = ""; // Reset logo width for larger screens
          logoMobile.style.marginTop = ""; // Reset margin-top
          
      }
  }

  // Handle header adjustments for mobile view
  if (headerBoardMobile) {
      if (e.matches) {
              // Apply flexbox to center the header
              headerBoardMobile.style.display = "flex"; // Flexbox for centering
              headerBoardMobile.style.justifyContent = "center"; // Horizontally center the header
              headerBoardMobile.style.alignItems = "center"; // Vertically center the header (optional)
              headerBoardMobile.style.position = "absolute"; // Absolutely position the header
              headerBoardMobile.style.top = "30%"; // Position in the vertical center
              headerBoardMobile.style.transform = "translateY(-50%)"; // Adjust for exact center
              headerBoardMobile.style.left = "47%"; // Position in the horizontal center
              headerBoardMobile.style.transform += " translateX(-50%)"; // Adjust for exact center
          } else {
              // Reset position and alignment for larger screens
              headerBoardMobile.style.position = ""; // Remove absolute positioning
              headerBoardMobile.style.transform = ""; // Reset transform
              headerBoardMobile.style.marginLeft = ""; // Reset margin-left for larger screens
              headerBoardMobile.style.marginRight = ""; // Reset margin-right for larger screens
  }
}

  // Handle dropdown visibility for mobile view
  if (dropdownMobile) {
      if (e.matches) {
          dropdownMobile.style.display = "block"; // Show dropdown for mobile view
         // Apply flexbox to center the header
         //headerBoardMobile.style.display = "flex"; // Flexbox for centering
         dropdownMobile.style.justifyContent = "center"; // Horizontally center the header
         dropdownMobile.style.alignItems = "center"; // Vertically center the header (optional)
         dropdownMobile.style.position = "absolute"; // Absolutely position the header
         dropdownMobile.style.top = "50%"; // Position in the vertical center
        dropdownMobile.style.transform = "translateY(-50%)"; // Adjust for exact center
         dropdownMobile.style.left = "58%"; // Position in the horizontal center
          dropdownMobile.style.transform += " translateX(-50%)"; // Adjust for exact center
          dropdownMobile.style.backgroundColor = "transparent";
          dropdownMobile.style.border = "0";
          dropdownMobile.style.padding= "1px";
     
              // Attach a single dropdown click event to toggle the sidebar
              if (dropdownMobile && sidebarMobile) 
                {
                    dropdownMobile.addEventListener('click', () => 
                {
                  // Use getComputedStyle to determine the current display value
                  const sidebarDisplay = window.getComputedStyle(sidebarMobile).display;
                  if (sidebarDisplay === "none") 
                    {
                      sidebarMobile.style.top = "40%"
                      toggleSidebar(true);
                     
                    } 
                    else 
                    {
                      toggleSidebar(false);
                      elements.showSideBarBtn.style.display = "none";
                    }
                });
                }
      } else {
        dropdownMobile.style.display = "none"; // Hide dropdown for larger screens
        dropdownMobile.style.marginLeft = ""; // Reset margin for dropdown
        dropdownMobile.style.marginRight = ""; // Reset margin for dropdown
      }
  }

   // Handle logo adjustments for mobile view
   if (dotsMobile) {
    if (e.matches) {
    
     dotsMobile.style.display = "none"
    } else {
      dotsMobile.style.display = "";      
    }
}

  if(buttonMobile)
    {
      if (e.matches) {
        buttonMobile.style.marginRight = "0%"
      
       } else {
         buttonMobile.style.marginRight = "";      
       }
    }
}

// Listen for screen size changes
mobileMediaQuery.addEventListener("change", handleMobileView);

/* =====================================================
   TASKEARN - COMPLETE SCRIPT
===================================================== */


/* ================= TASK DATA ================= */

const tasks = [
    {
        id: 1,
        title: "Check Prime Number",
        language: "Python",
        reward: 50,
        time: "15 min",

        question:
            "Write a Python program that checks whether a given number is prime or not.",

        example:
            "Input: 7 → Output: Prime",

        starter:
`num = int(input())

# Write your code here`,

        tests: [
            { input: "7", output: "Prime" },
            { input: "10", output: "Not Prime" },
            { input: "2", output: "Prime" }
        ]
    },

    {
        id: 2,
        title: "Reverse a String",
        language: "Python",
        reward: 40,
        time: "10 min",

        question:
            "Write a Python program that takes a string as input and prints the string in reverse order.",

        example:
            "Input: hello → Output: olleh",

        starter:
`text = input()

# Write your code here`,

        tests: [
            { input: "hello", output: "olleh" },
            { input: "python", output: "nohtyp" },
            { input: "coding", output: "gnidoc" }
        ]
    },

    {
        id: 3,
        title: "Find Square of a Number",
        language: "Python",
        reward: 30,
        time: "5 min",

        question:
            "Write a Python program that takes a number as input and prints its square.",

        example:
            "Input: 5 → Output: 25",

        starter:
`num = int(input())

# Write your code here`,

        tests: [
            { input: "5", output: "25" },
            { input: "10", output: "100" },
            { input: "12", output: "144" }
        ]
    }
];


/* ================= STORAGE ================= */

function getUser() {
    return JSON.parse(
        localStorage.getItem("taskEarnUser")
    ) || null;
}

function saveUser(user) {
    localStorage.setItem(
        "taskEarnUser",
        JSON.stringify(user)
    );
}

function getHistory() {
    return JSON.parse(
        localStorage.getItem("taskEarnHistory")
    ) || [];
}

function saveHistory(history) {
    localStorage.setItem(
        "taskEarnHistory",
        JSON.stringify(history)
    );
}


/* ================= PYTHON ENGINE ================= */

let pyodide = null;
let currentTask = null;
let testsPassed = false;


async function loadPython() {

    if (pyodide) {
        return pyodide;
    }

    showToast("Loading Python engine...");

    try {

        pyodide = await loadPyodide();

        showToast("Python engine ready.");

        return pyodide;

    } catch (error) {

        console.error(error);

        throw new Error(
            "Python engine could not be loaded."
        );
    }
}


/* ================= SCREEN ================= */

function showScreen(id) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {
            screen.classList.add("hidden");
        });

    const page = document.getElementById(id);

    if (page) {
        page.classList.remove("hidden");
    }

    window.scrollTo(0, 0);
}


/* ================= REGISTER ================= */

document
    .getElementById("registerForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const name =
            document.getElementById("regName")
                .value.trim();

        const email =
            document.getElementById("regEmail")
                .value.trim();

        const mobile =
            document.getElementById("regMobile")
                .value.trim();

        const password =
            document.getElementById("regPassword")
                .value;


        if (!name || !email || !mobile || !password) {
            alert("Please fill all details.");
            return;
        }


        const user = {

            name: name,

            email: email,

            mobile: mobile,

            password: password,

            balance: 0,

            totalEarned: 0,

            withdrawn: 0,

            completedTasks: []
        };


        saveUser(user);

        saveHistory([]);


        document
            .getElementById("registerForm")
            .reset();


        showScreen("loginPage");

        showToast(
            "Account created successfully."
        );
    });


/* ================= LOGIN ================= */

document
    .getElementById("loginForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail")
                .value.trim();

        const password =
            document.getElementById("loginPassword")
                .value;

        const user = getUser();

        const message =
            document.getElementById("loginMessage");


        if (!user) {

            message.textContent =
                "Please register first.";

            return;
        }


        if (
            email !== user.email ||
            password !== user.password
        ) {

            message.textContent =
                "Incorrect email or password.";

            return;
        }


        message.textContent = "";


        localStorage.setItem(
            "taskEarnLoggedIn",
            "true"
        );


        openApplication();
    });


/* ================= OPEN APPLICATION ================= */

function openApplication() {

    const user = getUser();

    if (!user) {
        showScreen("registerPage");
        return;
    }


    document
        .getElementById("registerPage")
        .classList.add("hidden");

    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("appPage")
        .classList.remove("hidden");


    updateUserUI();

    renderTasks();

    renderHistory();

    openPage("tasksPage");
}


/* ================= NAVIGATION ================= */

function openPage(
    pageId,
    clickedButton = null
) {

    document
        .querySelectorAll(".content-page")
        .forEach(page => {
            page.classList.add("hidden");
        });


    const page =
        document.getElementById(pageId);

    if (page) {
        page.classList.remove("hidden");
    }


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {
            button.classList.remove("active");
        });


    if (clickedButton) {
        clickedButton.classList.add("active");
    }


    if (pageId === "tasksPage") {
        renderTasks();
    }

    if (pageId === "walletPage") {
        updateWallet();
    }

    if (pageId === "historyPage") {
        renderHistory();
    }

    if (pageId === "profilePage") {
        updateProfile();
    }


    window.scrollTo(0, 0);
}


/* ================= USER UI ================= */

function updateUserUI() {

    const user = getUser();

    if (!user) return;


    const firstLetter =
        user.name.charAt(0).toUpperCase();


    document
        .getElementById("sideUserName")
        .textContent = user.name;


    document
        .getElementById("userAvatar")
        .textContent = firstLetter;


    document
        .getElementById("profileAvatar")
        .textContent = firstLetter;


    document
        .getElementById("topBalance")
        .textContent =
        "₹" + user.balance;


    document
        .getElementById("mainBalance")
        .textContent =
        "₹" + user.balance;


    document
        .getElementById("earnedAmount")
        .textContent =
        "₹" + user.totalEarned;


    document
        .getElementById("completedCount")
        .textContent =
        user.completedTasks.length;
}


/* ================= TASK LIST ================= */

function renderTasks() {

    const user = getUser();

    if (!user) return;


    const container =
        document.getElementById("taskCards");


    container.innerHTML = "";


    tasks.forEach(task => {

        const completed =
            user.completedTasks.includes(task.id);


        const card =
            document.createElement("div");

        card.className = "task-card";


        card.innerHTML = `

            <div class="task-top">

                <span class="task-language">
                    ${task.language}
                </span>

                <span class="task-reward">
                    ₹${task.reward}
                </span>

            </div>


            <h3>
                ${task.title}
            </h3>


            <p>
                ${task.question}
            </p>


            <div class="task-bottom">

                <span class="task-time">
                    ⏱ ${task.time}
                </span>

                ${
                    completed

                    ?

                    `
                    <span class="completed-label">
                        ✓ Completed
                    </span>
                    `

                    :

                    `
                    <button
                        class="start-btn"
                        onclick="startTask(${task.id})"
                    >
                        Start Task →
                    </button>
                    `
                }

            </div>
        `;


        container.appendChild(card);
    });


    const available =
        tasks.filter(
            task =>
                !user.completedTasks.includes(task.id)
        ).length;


    document
        .getElementById("availableCount")
        .textContent = available;
}


/* ================= START TASK ================= */

function startTask(taskId) {

    const user = getUser();

    currentTask =
        tasks.find(
            task => task.id === taskId
        );


    if (!currentTask) return;


    if (
        user.completedTasks.includes(taskId)
    ) {

        showToast(
            "This task is already completed."
        );

        return;
    }


    testsPassed = false;


    document
        .getElementById("tasksPage")
        .classList.add("hidden");


    document
        .getElementById("successPage")
        .classList.add("hidden");


    document
        .getElementById("codingPage")
        .classList.remove("hidden");


    document
        .getElementById("codingTitle")
        .textContent =
        currentTask.title;


    document
        .getElementById("codingReward")
        .textContent =
        "₹" + currentTask.reward + " Reward";


    document
        .getElementById("codingQuestion")
        .textContent =
        currentTask.question;


    document
        .getElementById("codingExample")
        .textContent =
        currentTask.example;


    document
        .getElementById("codeEditor")
        .value =
        currentTask.starter;


    document
        .getElementById("submitButton")
        .disabled = true;


    document
        .getElementById("codeMessage")
        .textContent =
        "Write your solution and click Run & Test.";


    document
        .getElementById("codeMessage")
        .style.color =
        "#8f95aa";


    document
        .getElementById("testResult")
        .className =
        "test-result hidden";


    document
        .getElementById("testResult")
        .innerHTML = "";


    window.scrollTo(0, 0);
}


/* ================= RUN TEST ================= */

async function runTests() {

    if (!currentTask) {
        return;
    }


    const code =
        document
            .getElementById("codeEditor")
            .value.trim();


    const resultBox =
        document.getElementById("testResult");


    const message =
        document.getElementById("codeMessage");


    const runButton =
        document.getElementById("runButton");


    const submitButton =
        document.getElementById("submitButton");


    testsPassed = false;

    submitButton.disabled = true;


    if (code.length < 5) {

        showTestError(
            "Please write your code first."
        );

        return;
    }


    runButton.disabled = true;

    runButton.textContent =
        "Running...";


    resultBox.className =
        "test-result hidden";


    message.textContent =
        "Running test cases...";


    try {

        const python =
            await loadPython();


        let passed = 0;


        for (
            let i = 0;
            i < currentTask.tests.length;
            i++
        ) {

            const test =
                currentTask.tests[i];


            try {

                const actual =
                    await executePython(
                        python,
                        code,
                        test.input
                    );


                const expectedOutput =
                    normalizeOutput(
                        test.output
                    );


                const actualOutput =
                    normalizeOutput(
                        actual
                    );


                if (
                    actualOutput ===
                    expectedOutput
                ) {

                    passed++;

                } else {

                    showFailedTest(
                        i + 1,
                        test.input,
                        expectedOutput,
                        actualOutput
                    );


                    runButton.disabled = false;

                    runButton.textContent =
                        "▶ Run & Test";

                    return;
                }

            } catch (error) {

                showRuntimeError(
                    i + 1,
                    error
                );


                runButton.disabled = false;

                runButton.textContent =
                    "▶ Run & Test";

                return;
            }
        }


        /* ALL TESTS PASSED */

        testsPassed = true;


        submitButton.disabled = false;


        resultBox.className =
            "test-result test-success";


        resultBox.innerHTML = `

            <div class="test-title">
                ✓ All Test Cases Passed
            </div>

            <div>
                ${passed}/${currentTask.tests.length}
                test cases passed successfully.
            </div>

            <div class="test-case">
                Your code is correct.
                You can now submit the solution.
                Reward: ₹${currentTask.reward}
            </div>

        `;


        message.textContent =
            "✓ All tests passed. You can submit now.";


        message.style.color =
            "#4ade80";


    } catch (error) {

        console.error(error);

        showTestError(
            error.message ||
            "Unable to run the code."
        );
    }


    runButton.disabled = false;

    runButton.textContent =
        "▶ Run & Test";
}


/* ================= EXECUTE PYTHON ================= */

async function executePython(
    python,
    userCode,
    inputValue
) {

    const safeCode =
        JSON.stringify(userCode);


    const safeInput =
        JSON.stringify(inputValue);


    const pythonProgram = `

import io
import contextlib
import builtins

user_code = ${safeCode}

input_data = ${safeInput}

input_values = input_data.split("\\\\n")

input_index = 0


def custom_input(prompt=""):

    global input_index

    if input_index >= len(input_values):

        raise Exception(
            "Your program requested more input than expected."
        )

    value = input_values[input_index]

    input_index += 1

    return value


old_input = builtins.input

builtins.input = custom_input

output = io.StringIO()


try:

    with contextlib.redirect_stdout(output):

        exec(
            user_code,
            {
                "__name__": "__main__"
            }
        )

    final_output = output.getvalue()

finally:

    builtins.input = old_input


final_output
`;


    const result =
        await python.runPythonAsync(
            pythonProgram
        );


    return String(result);
}


/* ================= NORMALIZE OUTPUT ================= */

function normalizeOutput(value) {

    return String(value)
        .replace(/\r/g, "")
        .trim()
        .replace(/\s+/g, " ");
}


/* ================= FAILED TEST ================= */

function showFailedTest(
    testNumber,
    input,
    expected,
    actual
) {

    const resultBox =
        document.getElementById(
            "testResult"
        );


    resultBox.className =
        "test-result test-error";


    resultBox.innerHTML = `

        <div class="test-title">
            ✕ Test Case ${testNumber} Failed
        </div>

        <div class="test-case">
            <strong>Input:</strong><br>
            ${escapeHTML(input)}
        </div>

        <div class="test-case">
            <strong>Expected Output:</strong><br>
            ${escapeHTML(expected)}
        </div>

        <div class="test-case">
            <strong>Your Output:</strong><br>
            ${escapeHTML(actual || "No output")}
        </div>

        <div class="test-case">
            ❌ Your code is not correct.
            Fix it and click Run & Test again.
        </div>
    `;


    const message =
        document.getElementById(
            "codeMessage"
        );


    message.textContent =
        "❌ Test failed. Fix your code.";

    message.style.color =
        "#f87171";
}


/* ================= RUNTIME ERROR ================= */

function showRuntimeError(
    testNumber,
    error
) {

    const resultBox =
        document.getElementById(
            "testResult"
        );


    resultBox.className =
        "test-result test-error";


    resultBox.innerHTML = `

        <div class="test-title">
            ✕ Test Case ${testNumber} Error
        </div>

        <div class="test-case">

            <strong>Bug / Error:</strong>

            <br><br>

            ${escapeHTML(
                error.message || String(error)
            )}

        </div>

        <div class="test-case">

            Fix the error and click
            <strong>Run & Test</strong> again.

        </div>
    `;


    const message =
        document.getElementById(
            "codeMessage"
        );


    message.textContent =
        "❌ Your code has an error.";

    message.style.color =
        "#f87171";
}


/* ================= GENERAL TEST ERROR ================= */

function showTestError(message) {

    const resultBox =
        document.getElementById(
            "testResult"
        );


    resultBox.className =
        "test-result test-error";


    resultBox.innerHTML = `

        <div class="test-title">
            ✕ Cannot Run Code
        </div>

        <div class="test-case">
            ${escapeHTML(message)}
        </div>
    `;


    const codeMessage =
        document.getElementById(
            "codeMessage"
        );


    codeMessage.textContent =
        message;

    codeMessage.style.color =
        "#f87171";
}


/* ================= ESCAPE HTML ================= */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ================= SUBMIT TASK ================= */

function submitTask() {

    if (!currentTask) {
        return;
    }


    /* VERY IMPORTANT */

    if (!testsPassed) {

        showToast(
            "❌ Pass all test cases before submitting."
        );

        return;
    }


    const user = getUser();


    if (!user) {
        return;
    }


    if (
        user.completedTasks.includes(
            currentTask.id
        )
    ) {

        showToast(
            "This task is already completed."
        );

        return;
    }
}
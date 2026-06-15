// =========================
// Get Elements
// =========================

const balanceEl = document.getElementById("balance");
const incomeAmountEl = document.getElementById("income-amount");
const expenseAmountEl = document.getElementById("expense-amount");

const transactionListEl = document.getElementById("transaction-list");
const transactionFormEl = document.getElementById("transaction-form");

const descriptionEl = document.getElementById("description");
const amountEl = document.getElementById("amount");

const incomeBtn = document.getElementById("income-btn");
const expenseBtn = document.getElementById("expense-btn");

const searchEl = document.getElementById("search");

const savingGoalEl = document.getElementById("saving-goal");
const expenseLimitEl = document.getElementById("expense-limit");
const goalMessageEl = document.getElementById("goal-message");


// =========================
// Local Storage
// =========================

let transactions =
  JSON.parse(localStorage.getItem("transactions")) || [];

let savingGoal =
  Number(localStorage.getItem("savingGoal")) || 0;

let expenseLimit =
  Number(localStorage.getItem("expenseLimit")) || 0;


// Show saved goals
savingGoalEl.value = savingGoal;
expenseLimitEl.value = expenseLimit;


// Default transaction type
let transactionType = "income";

// Used for editing
let editId = null;


// =========================
// Event Listeners
// =========================

transactionFormEl.addEventListener("submit", addTransaction);

incomeBtn.addEventListener("click", () => {
  transactionType = "income";

  incomeBtn.classList.add("income-active");
  expenseBtn.classList.remove("expense-active");
});


expenseBtn.addEventListener("click", () => {
  transactionType = "expense";

  expenseBtn.classList.add("expense-active");
  incomeBtn.classList.remove("income-active");
});


// Search
searchEl.addEventListener("input", () => {
  updateTransactionList(searchEl.value);
});


// Goals
savingGoalEl.addEventListener("input", saveGoals);
expenseLimitEl.addEventListener("input", saveGoals);


// =========================
// Add / Edit Transaction
// =========================

function addTransaction(e) {

  e.preventDefault();

  const description =
    descriptionEl.value.trim();

  let amount =
    parseFloat(amountEl.value);


  if (!description || isNaN(amount)) {
    alert("Please enter valid details");
    return;
  }


  // Handle income/expense toggle
  if (transactionType === "expense") {
    amount = -Math.abs(amount);
  } else {
    amount = Math.abs(amount);
  }


  // Edit
  if (editId !== null) {

    transactions = transactions.map(transaction =>
      transaction.id === editId
        ? {
            ...transaction,
            description,
            amount
          }
        : transaction
    );

    editId = null;

  }

  // Add
  else {

    transactions.push({

      id: Date.now(),

      description,

      amount,

      dateTime:
        new Date().toLocaleString()

    });

  }


  saveTransactions();

  updateTransactionList();

  updateSummary();

  transactionFormEl.reset();


  // Reset toggle to income
  transactionType = "income";

  incomeBtn.classList.add("income-active");
  expenseBtn.classList.remove("expense-active");

}


// =========================
// Display Transactions
// =========================

function updateTransactionList(search = "") {

  transactionListEl.innerHTML = "";


  const filteredTransactions =
    transactions.filter(transaction =>
      transaction.description
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      transaction.dateTime
        .toLowerCase()
        .includes(search.toLowerCase())
    );


  const sortedTransactions =
    filteredTransactions.reverse();


  sortedTransactions.forEach(transaction => {

    const li =
      document.createElement("li");


    li.classList.add("transaction");


    if (transaction.amount > 0) {
      li.classList.add("income");
    }

    else {
      li.classList.add("expense");
    }


    li.innerHTML = `

      <div class="transaction-info">

        <strong>
          ${transaction.description}
        </strong>

        <div class="transaction-date">
          📅 ${transaction.dateTime}
        </div>

      </div>


      <div>

        ${formatCurrency(transaction.amount)}


        <button
          class="edit-btn"
          onclick="editTransaction(${transaction.id})">
          ✏️
        </button>


        <button
          class="delete-btn"
          onclick="removeTransaction(${transaction.id})">
          ❌
        </button>

      </div>

    `;


    transactionListEl.appendChild(li);

  });

}


// =========================
// Edit Transaction
// =========================

function editTransaction(id) {

  const transaction =
    transactions.find(item =>
      item.id === id
    );


  descriptionEl.value =
    transaction.description;


  amountEl.value =
    Math.abs(transaction.amount);


  // Set correct toggle
  if (transaction.amount > 0) {

    transactionType = "income";

    incomeBtn.classList.add("income-active");
    expenseBtn.classList.remove("expense-active");

  }

  else {

    transactionType = "expense";

    expenseBtn.classList.add("expense-active");
    incomeBtn.classList.remove("income-active");

  }


  editId = id;

}


// =========================
// Delete Transaction
// =========================

function removeTransaction(id) {


  if (!confirm(
    "Delete this transaction?"
  )) {
    return;
  }


  transactions =
    transactions.filter(
      transaction =>
        transaction.id !== id
    );


  saveTransactions();

  updateTransactionList();

  updateSummary();

}


// =========================
// Update Summary
// =========================

function updateSummary() {


  const balance =
    transactions.reduce(
      (total, item) =>
        total + item.amount,
      0
    );


  const income =
    transactions
      .filter(item =>
        item.amount > 0
      )
      .reduce(
        (total, item) =>
          total + item.amount,
        0
      );


  const expense =
    Math.abs(
      transactions
      .filter(item =>
        item.amount < 0
      )
      .reduce(
        (total, item) =>
          total + item.amount,
        0
      )
    );


  balanceEl.textContent =
    formatCurrency(balance);


  incomeAmountEl.textContent =
    formatCurrency(income);


  expenseAmountEl.textContent =
    formatCurrency(expense);


  updateGoalStatus(
    income,
    expense
  );

}


// =========================
// Saving Goal & Expense Limit
// =========================

function saveGoals() {

  savingGoal =
    Number(savingGoalEl.value);

  expenseLimit =
    Number(expenseLimitEl.value);


  localStorage.setItem(
    "savingGoal",
    savingGoal
  );

  localStorage.setItem(
    "expenseLimit",
    expenseLimit
  );


  updateSummary();

}


// =========================
// Financial Analysis
// =========================

function updateGoalStatus(income, expense) {


  let message = "";


  const savings =
    income - expense;


  // Saving Goal
  if (savingGoal > 0) {

    if (savings >= savingGoal) {

      message +=
        `🟢 Goal achieved! Saved ${formatCurrency(savings)}<br>`;

    }

    else {

      message +=
        `🟡 Need ${formatCurrency(savingGoal - savings)} more to reach goal.<br>`;

    }

  }


  // Expense Limit
  if (expenseLimit > 0) {

    if (expense <= expenseLimit) {

      message +=
        `💰 You can spend ${formatCurrency(expenseLimit - expense)} more.`;

    }

    else {

      message +=
        `🔴 Expense limit exceeded by ${formatCurrency(expense - expenseLimit)}.`;

    }

  }


  if (message === "") {

    message =
      "🎯 Set your saving goal and expense limit.";

  }


  goalMessageEl.innerHTML =
    message;

}


// =========================
// Save Transactions
// =========================

function saveTransactions() {

  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );

}


// =========================
// Currency Format
// =========================

function formatCurrency(amount) {

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD"
    }
  ).format(amount);

}


// =========================
// Initial Load
// =========================

updateTransactionList();

updateSummary();
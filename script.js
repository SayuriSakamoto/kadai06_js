let familyMembers = [];  // 家族メンバーのリスト
let largeExpenses = [];  // 大きな支出のリスト

// 家族メンバーを追加する関数
function addFamilyMember() {
    const familyContainer = document.getElementById('familyMembers');
    const familyIndex = familyMembers.length;

    const memberDiv = document.createElement('div');
    memberDiv.classList.add('family-member');
    memberDiv.innerHTML = `
        <label>家族メンバー ${familyIndex + 1} の年齢:</label>
        <input type="number" id="familyAge${familyIndex}" min="0" required>
        <label>年間の追加支出 (万円):</label>
        <input type="number" id="familyExpense${familyIndex}" min="0" required>
    `;

    familyContainer.appendChild(memberDiv);
    familyMembers.push({ age: null, expense: null });
}

// 特定の年に発生する大きな支出を追加する関数
function addLargeExpense() {
    const largeExpenseContainer = document.getElementById('largeExpenses');
    const expenseIndex = largeExpenses.length;

    const expenseDiv = document.createElement('div');
    expenseDiv.classList.add('large-expense');
    expenseDiv.innerHTML = `
        <label>発生年 (年齢):</label>
        <input type="number" id="expenseYear${expenseIndex}" min="0" required>
        <label>支出額 (万円):</label>
        <input type="number" id="expenseAmount${expenseIndex}" min="0" required>
    `;

    largeExpenseContainer.appendChild(expenseDiv);
    largeExpenses.push({ year: null, amount: null });
}

// シミュレーションを実行する関数
function calculateLifePlan() {
    const age = parseInt(document.getElementById("age").value);  // 現在の年齢
    const currentSavings = parseFloat(document.getElementById("currentSavings").value) * 10000;  // 万円から円に変換
    const retirementAge = parseInt(document.getElementById("retirementAge").value);
    const monthlySavings = parseFloat(document.getElementById("monthlySavings").value) * 10000;  // 万円から円に変換
    const interestRate = parseFloat(document.getElementById("interestRate").value) / 100;
    const annualIncome = parseFloat(document.getElementById("annualIncome").value) * 10000;  // 万円から円に変換
    const annualExpenses = parseFloat(document.getElementById("annualExpenses").value) * 10000;  // 万円から円に変換

    // 家族のデータを収集
    familyMembers.forEach((member, index) => {
        member.age = parseInt(document.getElementById(`familyAge${index}`).value);
        member.expense = parseFloat(document.getElementById(`familyExpense${index}`).value) * 10000;  // 万円から円に変換
    });

    // 大きな支出のデータを収集
    largeExpenses.forEach((expense, index) => {
        expense.year = parseInt(document.getElementById(`expenseYear${index}`).value);
        expense.amount = parseFloat(document.getElementById(`expenseAmount${index}`).value) * 10000;  // 万円から円に変換
    });

    const yearsToRetirement = retirementAge - age;

    let yearlySavings = [];
    let totalSavings = currentSavings;

    // 1年ごとに収入と支出、家族の支出、利率、そして大きな支出を適用して貯蓄額を計算
    for (let year = 0; year <= yearsToRetirement; year++) {
        let familyExpenses = 0;
        familyMembers.forEach(member => {
            if (age + year >= member.age) {
                familyExpenses += member.expense;
            }
        });

        // 大きな支出を確認し、適用する
        let largeExpenseAmount = 0;
        largeExpenses.forEach(expense => {
            if (expense.year === age + year) {
                largeExpenseAmount += expense.amount;
            }
        });

        totalSavings += (monthlySavings * 12) + (annualIncome - annualExpenses - familyExpenses - largeExpenseAmount);
        totalSavings *= (1 + interestRate);  // 年利を適用
        yearlySavings.push({ year: age + year, savings: totalSavings });
    }

    const resultText = `現在の年齢 ${age} 歳から ${retirementAge} 歳までに貯まる金額は、約 ${formatNumberToMan(totalSavings)} 万円です。`;
    document.getElementById("resultText").innerText = resultText;

    drawSavingsChart(yearlySavings, age);
}

// グラフを描画する関数（家族の年齢を除く）
function drawSavingsChart(yearlySavings, baseAge) {
    const ctx = document.getElementById('savingsChart').getContext('2d');

    // 年ごとのラベル（x軸：年齢）と、貯蓄額（y軸）を「万円」単位に変換
    const labels = yearlySavings.map((data, index) => baseAge + index);  // 現在の年齢からスタートするラベル
    const savingsData = yearlySavings.map(data => (data.savings / 10000).toFixed(0));  // 万円単位で表示

    // Chart.jsを使って折れ線グラフを作成
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,  // X軸は「現在の年齢」から始まる
            datasets: [
                {
                    label: '貯蓄額 (万円)',
                    data: savingsData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true,
                }
            ]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '年齢'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '貯蓄額 (万円)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// 万円単位にしてカンマ区切りにする関数
function formatNumberToMan(number) {
    return (number / 10000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');  // 万円単位に変換し、カンマ区切り
}

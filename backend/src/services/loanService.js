export const buildRepaymentSchedule = (loan) => {
  const principal = parseFloat(loan.principal.toString());
  const monthlyRate = loan.interestRate / 12 / 100;
  const emi = loan.calculateEMI();

  let balance = principal;
  const schedule = [];

  for (let i = 1; i <= loan.tenureMonths; i++) {
    const interestComponent = Math.round(balance * monthlyRate * 100) / 100;
    let principalComponent = Math.round((emi - interestComponent) * 100) / 100;

    if (i === loan.tenureMonths) {
      principalComponent = Math.round(balance * 100) / 100;
    }

    balance = Math.round((balance - principalComponent) * 100) / 100;

    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i);

    schedule.push({
      installmentNumber: i,
      dueDate,
      emiAmount: emi,
      principalComponent,
      interestComponent,
      status: "upcoming",
    });
  }

  return schedule;
};
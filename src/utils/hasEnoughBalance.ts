export default function hasEnoughBalance(amount = 2) {
  // const { balance } = profile;
  const balance = window.configs.balanceStore.getBalance();
  return balance && balance >= amount;
}

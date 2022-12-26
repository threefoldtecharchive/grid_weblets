export default function isValidInteger(n: number | string) {
  // check if n is a vaild number.
  const num = +n;
  return typeof num === "number" && !isNaN(num) && num > 0 && num.toFixed(0) === num.toString();
}

export default function isValidInteger(n: number | string) {
  const num = +n;
  return (
    typeof num === "number" &&
    !isNaN(num) &&
    num >= 0 &&
    num.toFixed(0) === num.toString()
  );
}

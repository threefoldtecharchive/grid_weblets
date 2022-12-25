export default function generatePassword(
  length = 10,
  rules: { chars: string; min: number }[] = [
    // default rules
    { chars: "abcdefghijklmnopqrstuvwxyz", min: 4 }, // At least 4 lowercase letters
    { chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", min: 3 }, // At least 3 uppercase letters
    { chars: "0123456789", min: 1 }, // At least 1 digits
    { chars: "!@#$&*?|%+-_./:;=()[]{}`~^", min: 2 }, // At least 2 special char
  ],
): string {
  let allChars = "",
    allMin = 0;
  rules.forEach(function (rule) {
    allChars += rule.chars;
    allMin += rule.min;
  });
  if (length < allMin) {
    length = allMin;
  }
  rules.push({ chars: allChars, min: length - allMin });

  const pswd = [];
  rules.forEach(function (rule) {
    if (rule.min > 0) {
      pswd.push(...generateRandomChars(rule.min, rule.chars));
    }
  });

  return shuffle(pswd).join("");
}

function generateRandomChars(length: number, wishlist: string): Array<string> {
  //using Crypto.getRandomValues() method to get cryptographically strong random values.
  return Array.from(crypto.getRandomValues(new Uint32Array(length))).map(x => wishlist[x % wishlist.length]);
}

function shuffle(array: Array<string>): Array<string> {
  let currentIndex: number = array.length,
    randomIndex: number;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

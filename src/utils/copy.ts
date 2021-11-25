export default function copy(txt: string) {
  const input = document.createElement("textarea");
  input.value = txt;
  input.style.display = "block";
  document.body.appendChild(input);
  input.focus();
  input.select();
  document.execCommand("copy");
  input.remove();
}

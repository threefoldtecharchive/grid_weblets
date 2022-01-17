export default function isInvalidFlist(flist: string): Promise<boolean> {
  return fetch(`${flist}.md5`).then(({ status }) => status !== 200);
}

export default async function nodeExists(nodeId: number): Promise<boolean> {
  return fetch(`${window.env.GRIDPROXY_URL}/nodes/${nodeId}`, {
    method: "GET",
  })
    .then(res => {
      console.log(res);
      return res.status >= 200 && res.status < 400 ? true : false;
    })
    .catch(err => {
      console.log(err);
      return false;
    });
}

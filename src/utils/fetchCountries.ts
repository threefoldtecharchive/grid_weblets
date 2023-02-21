export async function fetchCountries(): Promise<any> {
  return fetch(`${window.env.GRIDPROXY_URL}/stats?status=up`, {
    method: "GET",
  })
    .then(response => response.json())
    .then(response => response["nodesDistribution"])
    .catch(err => {
      console.log(err);
      return err;
    });
}

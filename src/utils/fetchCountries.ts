import type { ActiveProfile } from '../stores/activeProfile';

export async function fetchCountries(profile: ActiveProfile): Promise<any> {
  const { network } = profile;
  return fetch(`https://gridproxy.${network}.grid.tf/stats?status=up`, {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((response) => response['nodesDistribution'])
    .catch((err) => {
      console.log(err);
      return err;
    });
}

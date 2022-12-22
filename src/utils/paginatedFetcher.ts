export default async function paginatedFetcher(url: string, page: number, pageSize: number, previousResponse = []) {
  const response = await fetch(`${url}&page=${page}&size=${pageSize}`);
  const data = await response.json();
  if (data.length === 0) {
    return previousResponse;
  }
  return paginatedFetcher(url, page + 1, pageSize, previousResponse.concat(data));
}

export default async function downloadFile(url: string) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `Check Your network Connectivity to get required files from the internet, failed to download: '${url}'.`,
    );
  }

  return Buffer.from(await res.arrayBuffer());
}

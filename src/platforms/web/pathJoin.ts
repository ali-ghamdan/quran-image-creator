export async function pathJoin(...paths: string[]) {
  return paths.join("/").replace(/\/{2,}/g, "/");
}

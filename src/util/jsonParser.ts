export function JSONParser(readData: string) {
  let res: any;
  try {
    res = JSON.parse(readData);
  } catch {
    const index = readData.lastIndexOf("}");
    readData = `${readData.slice(0, index + 1)}`;
    try {
      res = JSON.parse(readData);
    } catch {
      readData += "}";
      res = JSON.parse(readData);
    }
  }
  return res;
}

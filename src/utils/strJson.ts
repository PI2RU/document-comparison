export const cleanedStrToParse = (text: string) => {
  const cleanedText = text
    .replace(/[\n\s]+/g, " ")
    .replace(/(\w+)\s*:/g, '"$1":')
    .trim();

  return JSON.parse(cleanedText);
};

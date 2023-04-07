export const cleanedStrToParse = (text: string) => {
  const cleanedText = text
    .replace(/[\n\s]+/g, " ")
    .replace(/(\w+)\s*:/g, '"$1":')
    .trim();

  const parseText = JSON.parse(cleanedText);

  console.log("typeof ", typeof parseText);
  console.log("parseText", parseText);

  return parseText;
};

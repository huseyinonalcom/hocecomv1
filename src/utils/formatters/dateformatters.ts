export const dateFormatBe = (date: string) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR");
};

export const pdftemplate = (title: string, body: string) => {
  return `
  <!DOCTYPE html>
<html>
  <head>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"
    />
    <title>${title}</title>
    <style>
    td, th {
      border: 1px solid black;
      padding: 2px;
    }
      </style>
  </head>
  <body
    style="padding: 6px; display: flex; flex-direction: column; height: 100%"
  >
    ${body}
  </body>
</html>
`;
};

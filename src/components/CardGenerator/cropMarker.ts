// Só o quadrado preto do marcador: a folha branca já faz o papel da margem clara.
// As células brancas viram um único traçado, para a impressão não mostrar fios entre elas.
export const cropMarker = (svg: string) => {
  const cells = [...svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="1" height="1" fill="white"\/>/g)];
  const path = cells.map((m) => `M${m[1]} ${m[2]}h1v1h-1z`).join('');
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="1 1 6 6" shape-rendering="crispEdges">' +
    '<rect x="1" y="1" width="6" height="6" fill="black"/>' +
    `<path d="${path}" fill="white"/></svg>`
  );
};

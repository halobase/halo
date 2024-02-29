export async function GET(event) {
  /** @type {Array<import("$lib/types").Doc>} */
  const docs = [
    {
      title: "农事指导",
      knowledge: "1749406324015435776"
    },
    {
      title: "其他测试文档",
      knowledge: "1749406324015435775"
    }
  ];
  return Response.json(docs);
}

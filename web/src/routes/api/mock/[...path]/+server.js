export async function POST(event) {
  const path = event.params.path;
  console.log("mock:", path);
  switch (path) {
    case "diagnosis":
      return Response.json({
        result: "褐腐病"
      });
    case "recognition":
      return Response.json({
        result: "李子"
      });
    default:
      return Response.json({
        result: "无法识别该图片"
      });
  }
}
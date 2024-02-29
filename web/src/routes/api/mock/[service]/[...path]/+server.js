export async function POST(event) {
  const service = event.params.service;
  console.log("mock:", service);
  switch (service) {
    case "plum-diagnosis":
      return Response.json({
        result: "褐腐病"
      });
    case "image-detection":
      return Response.json({
        result: "李子"
      });
    default:
  }
}
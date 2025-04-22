const getMaxPhenophase = (result: Array<{ info: Array<{ [key: string]: string; 置信度: string }> }>) => {
  const fieldName = result[0]?.info[0]?.['物候期'] ? '物候期' : '树势评估';
  
  return Object.entries(
    result.flatMap(item => item.info).reduce((acc, info) => ({
      ...acc,
      [info[fieldName]]: {
        count: (acc[info[fieldName]]?.count || 0) + 1,
        sum: (acc[info[fieldName]]?.sum || 0) + parseFloat(info['置信度'])
      }
    }), {} as Record<string, { count: number; sum: number }>)
  ).sort((a, b) => 
    b[1].count - a[1].count || 
    b[1].sum - a[1].sum
  )[0]?.[0];
}
const result1 = [{ 
    "info": [
        {
            "物候期": "幼果期",
            "置信度": "99.92"
        }
    ]
},
{
    "info": [
        {
            "物候期": "落花期", 
            "置信度": "99.92"
        }
    ]
}];

const result2 = [{
    "info": [
        {
            "树势评估": "强",
            "置信度": "51.65"
        }
    ]
},
{
  "info": [
      {
          "树势评估": "弱",
          "置信度": "51.65"
      }
  ]
},
{
  "info": [
      {
          "树势评估": "弱",
          "置信度": "51.65"
      }
  ]
}];

console.log('物候期结果:', getMaxPhenophase(result1));
console.log('树势评估结果:', getMaxPhenophase(result2));

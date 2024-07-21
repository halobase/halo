import { Hono } from 'hono'
import { surreal } from "@lib/surreal";
import { MonthTotal, Servicelog } from '@lib/types';
const app = new Hono()

app.get('/request/:start/:end',async (ctx) => {
  const { start,end } = ctx.req.param();
  
  var starts = Number(start);
  var ends = Number(end);
  const auth = ctx.get("auth");
  const  res = await surreal.query<Servicelog>(
    `
    select * from servicelog where created_at >= time::from::millis($starts) and created_at <= time::from::millis($ends);
    `,
    {
      starts,
      ends
    },
    auth.token);  
  res.forEach(element => {
    if (element.created_at) {
    var date = new Date(element.created_at);
    date = new Date(date.getTime() + 8*60*60*1000);
    element.created_at = date
  }
  });
  
  return ctx.json(res[0])
});
app.get('/month/:month',async (ctx) =>{
  const {month} = ctx.req.param()
  console.log(month);
  
  const [ , res] = await surreal.query(
    `
    let $time = string::concat(<string> time::year(), '-', $month);
    select service_name,times from monthTotal where time = $time
    `,
    {
      month
    }); 
    
  return ctx.json(res)
});


export default app;

import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { $token } from "./$";
import { GrantPP, User } from "@lib/types";
import { DAY } from "@lib/time";
import { Jwt } from "hono/utils/jwt";
import env from "@lib/env";
import { surreal } from "@lib/surreal";


const app = new OpenAPIHono();

app.openapi($token, async (ctx) => {
  const init = ctx.req.valid("json");
    
  let user;
  switch (init.type) {
    case "PP":
      user = await grant_pp(init);
      break;
    default:
      throw new HTTPException(400, {
        message: `Granting by ${init.type} is not available yet`,
      });
  }

  const expiry = Date.now() + 1 * DAY;
  const access_token = await Jwt.sign({
    iss: "halo.dev",
    exp: Math.floor(expiry / 1000),
    user,
    ns: env.SURREAL_NS,
    db: env.SURREAL_DB,
    sc: "user",
    tk: "user",
  }, env.TOKEN_SECRET!);

  return ctx.json({
    access_token,
    expiry
  });
});

async function grant_pp({ user, pass }: GrantPP): Promise<User> {
  const results = await surreal.query(`
  begin;
  let $users = (select id,level,secret from user where email = $email);
  if array::len($users) == 0 {
    return (create only user content {
      email: $email,
      secret: $secret
    } return id, level);
  } 
  else if crypto::argon2::compare($users[0].secret, $secret) {
    let $user = $users[0];
    return {
      id: $user.id, 
      level: $user.level,
    };
  }
  else {
    return null;
  };
  commit;
  `, {
    email: user,
    secret: pass
  });
  if (results.length !== 2) {
    throw new HTTPException(500);
  }

  if (!results[1]) {
    throw new HTTPException(400, {
      res: Response.json(
        { message: "Bad credentials" },
        { status: 400 },
      ),
    });
  }
  return results[1] as User;
}

export default app;

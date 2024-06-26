import USER from "@/app/models/User";
import { z } from "zod";
import { userSignupSchema } from "@/app/schemas/userSignup";
import dbConnection from "@/app/lib/dbConnection";

const validateUsername = z.object({
  username: userSignupSchema.shape.username,
});

export async function GET(req: Request) {
  await dbConnection();

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("username");

    const isUsernameValidate = validateUsername.safeParse({
      username: query,
    });

    const usernameErrorMsg: any =
      isUsernameValidate?.error?.format().username?._errors;

    if (!isUsernameValidate.success) {
      return Response.json(
        {
          success: false,
          message:
            usernameErrorMsg.length > 0
              ? usernameErrorMsg?.join(", ")
              : "Invalid username",
        },
        {
          status: 405,
        }
      );
    }

    const isUsernameAvailable = await USER.findOne({
      username: isUsernameValidate.data.username,
    });

    if (isUsernameAvailable) {
      return Response.json(
        {
          success: false,
          message: "Username already taken",
        },
        {
          status: 405,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is available",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("error to validate username", error);
    return Response.json(
      {
        success: false,
        message: "error to validate username",
      },
      {
        status: 500,
      }
    );
  }
}

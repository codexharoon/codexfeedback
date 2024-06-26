import USER from "@/app/models/User";
import dbConnection from "@/app/lib/dbConnection";
import { verifyCodeSchema } from "@/app/schemas/verifyCode";

export async function POST(req: Request) {
  await dbConnection();

  try {
    const { username, code } = await req.json();

    const validateCode = verifyCodeSchema.safeParse({
      code,
    });

    const validateCodeErrors: any = validateCode.error?.format().code?._errors;

    if (!validateCode.success) {
      return Response.json(
        {
          success: false,
          message:
            validateCodeErrors.length > 0
              ? validateCodeErrors.join(", ")
              : "Invalid code format",
        },
        {
          status: 405,
        }
      );
    }

    const user = await USER.findOne({ username });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const isCodeMatched = user.verifyCode === validateCode.data.code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeMatched && isCodeNotExpired) {
      user.isVerify = true;
      await user.save();

      return Response.json(
        {
          success: true,
          message: "Code verified successfully",
        },
        {
          status: 200,
        }
      );
    }

    if (!isCodeMatched) {
      return Response.json(
        {
          success: false,
          message: "Incorrect code",
        },
        {
          status: 405,
        }
      );
    }

    if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "Code expired, please sign up again",
        },
        {
          status: 405,
        }
      );
    }
  } catch (error) {
    console.log("error to verifyCode: ", error);
    return Response.json(
      {
        success: false,
        message: "error to verifyCode",
      },
      {
        status: 500,
      }
    );
  }
}

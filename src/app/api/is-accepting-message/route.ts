import dbConnection from "@/app/lib/dbConnection";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import USER from "@/app/models/User";
import { acceptMessageSchema } from "@/app/schemas/acceptMessage";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const user: User = session.user as User;
  await dbConnection();

  try {
    const { isAcceptingMessage } = await req.json();

    const validateIsAccMsg = acceptMessageSchema.safeParse({
      acceptMessage: isAcceptingMessage,
    });

    if (!validateIsAccMsg.success) {
      return Response.json(
        {
          success: false,
          message:
            validateIsAccMsg.error.format().acceptMessage?._errors[0] ||
            "Invalid data provided (required boolean)",
        },
        {
          status: 400,
        }
      );
    }

    const updatedUser = await USER.findByIdAndUpdate(
      user?._id,
      {
        isAcceptingMessage,
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
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

    return Response.json(
      {
        success: true,
        message: "User accept message status updated successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("error in is-accepting-message route: ", error);
    return Response.json(
      {
        success: false,
        message: "error in is-accepting-message route: ",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const user: User = session.user as User;
  await dbConnection();

  try {
    const foundUser = await USER.findById(user?._id);

    if (!foundUser) {
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

    return Response.json(
      {
        success: true,
        message: "User accept message status fetched successfully",
        isAcceptingMessage: foundUser.isAcceptingMessage,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("error to fetch user is-accepting-message status: ", error);
    return Response.json(
      {
        success: false,
        message: "error to fetch user is-accepting-message status",
      },
      {
        status: 500,
      }
    );
  }
}

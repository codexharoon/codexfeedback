import dbConnection from "@/app/lib/dbConnection";
import USER from "@/app/models/User";
import { Message } from "@/app/models/User";

export async function POST(req: Request) {
  await dbConnection();

  try {
    const { username, msgContent } = await req.json();

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

    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting messages",
        },
        {
          status: 400,
        }
      );
    }

    const newMessage = {
      message: msgContent,
      createdAt: new Date(),
    };

    user.messages.push(newMessage as Message);

    await user.save();

    return Response.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("error in sending messages: ", error);
    return Response.json(
      {
        success: false,
        message: "error in sending messages",
      },
      {
        status: 500,
      }
    );
  }
}

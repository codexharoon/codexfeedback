import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/app/lib/dbConnection";
import USER from "@/app/models/User";
import bcryptjs from "bcryptjs";
import { sendVerificationEmail } from "@/app/resendEmail/sendVerificationEmail";

export async function POST(req: NextRequest) {
  try {
    await dbConnection();

    const { username, email, password } = await req.json();

    const existingUserWithUsername = await USER.findOne({
      username,
      isVerify: true,
    });

    if (existingUserWithUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "Username already exists",
        },
        {
          status: 400,
        }
      );
    }

    const existingUserWithEmail = await USER.findOne({ email });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);

    if (existingUserWithEmail) {
      if (existingUserWithEmail.isVerify) {
        return NextResponse.json(
          {
            success: false,
            message: "Email already exists",
          },
          {
            status: 400,
          }
        );
      } else {
        existingUserWithEmail.username = username;
        const hashedPassword = await bcryptjs.hash(password, 10);
        existingUserWithEmail.password = hashedPassword;
        existingUserWithEmail.verifyCode = otp;
        existingUserWithEmail.verifyCodeExpiry = expiry;
        await existingUserWithEmail.save();

        console.log("User created successfully");
      }
    } else {
      const hashedPassword = await bcryptjs.hash(password, 10);

      const newUser = new USER({
        username,
        email,
        password: hashedPassword,
        verifyCode: otp,
        verifyCodeExpiry: expiry,
        isVerify: false,
        isAcceptingMessage: true,
        messages: [],
      });

      await newUser.save();

      console.log("User created successfully");
    }

    // send verification email
    const emailRes = await sendVerificationEmail(username, email, otp);

    if (emailRes.success) {
      return NextResponse.json(
        {
          success: true,
          message:
            "User created successfully, An otp has been sent to your email for verification",
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Error to send verification email",
        },
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    console.log("error to sign up user", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error to sign up user",
      },
      {
        status: 500,
      }
    );
  }
}

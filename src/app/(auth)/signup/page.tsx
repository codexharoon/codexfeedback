"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { userSignupSchema } from "@/app/schemas/userSignup";
import { useDebounceCallback } from "usehooks-ts";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/app/types/ApiResponse";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Span } from "next/dist/trace";

const Signup = () => {
  const [username, setUsername] = useState<string>("");
  const [usernameErrMsg, setUsernameErrMsg] = useState<string>("");
  const [findUsernameLoading, setFindUsernameLoading] =
    useState<boolean>(false);

  const [formSubmitLoading, setFormSubmitLoading] = useState<boolean>(false);

  const debounced = useDebounceCallback(setUsername, 500);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const checkUsername = async () => {
      if (username) {
        setUsernameErrMsg("");
        setFindUsernameLoading(true);
        try {
          const response = await axios.get(
            `/api/check-username/?username=${username}`
          );
          console.log(response);

          const dataMsg = response.data.message;
          setUsernameErrMsg(dataMsg);
        } catch (error) {
          const axiosErr = error as AxiosError<ApiResponse>;
          setUsernameErrMsg(
            axiosErr.response?.data.message || "An error occurred"
          );
        } finally {
          setFindUsernameLoading(false);
        }
      } else {
        setUsernameErrMsg("");
      }
    };

    checkUsername();
  }, [username]);

  const form = useForm<z.infer<typeof userSignupSchema>>({
    resolver: zodResolver(userSignupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof userSignupSchema>) {
    console.log(values);
    setFormSubmitLoading(true);

    try {
      const response = await axios.post("/api/signup", values);

      if (!response.data.success) {
        toast({
          description: response.data.message,
        });
      } else {
        toast({
          title: "Success",
          description: response.data.message,
        });

        router.replace(`/verify/${values.username}`);
      }
    } catch (error) {
      console.log("error to submit form", error);
      const axiosErr = error as AxiosError<ApiResponse>;
      toast({
        title: "An error occurred",
        description: axiosErr.response?.data.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setFormSubmitLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="border p-10 rounded-lg w-full max-w-lg">
        <div className="text-center mb-3">
          <h1 className="text-lg font-bold">Signup to CodexFeedback</h1>
          <p className="text-xs">It takes less then a minute.</p>
        </div>
        <div className="w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="username"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          debounced(e.target.value);
                        }}
                      />
                    </FormControl>

                    {
                      <p className="text-xs">
                        {findUsernameLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : usernameErrMsg === "Username is available" ? (
                          <span className="text-green-500">
                            {usernameErrMsg}
                          </span>
                        ) : (
                          <span className="text-red-500">{usernameErrMsg}</span>
                        )}
                      </p>
                    }

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={formSubmitLoading}>
                {formSubmitLoading ? (
                  <span className="flex gap-2 justify-center items-center">
                    <Loader2 className="h-4 w-4 animate-spin" />{" "}
                    <span>Please Wait</span>
                  </span>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div className="text-center mt-5">
          <p className="text-xs">
            Already have an account?{" "}
            <Link href="/signin">
              {" "}
              <span className="text-blue-400">Login</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

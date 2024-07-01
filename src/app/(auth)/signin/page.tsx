"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { userLoginSchema } from "@/app/schemas/userLogin";
import { useState } from "react";
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
import { signIn } from "next-auth/react";

const Signin = () => {
  const [formSubmitLoading, setFormSubmitLoading] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof userLoginSchema>>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof userLoginSchema>) {
    setFormSubmitLoading(true);

    try {
      const response = await signIn("credentials", {
        redirect: false,
        identifier: values.identifier,
        password: values.password,
      });

      if (response?.error) {
        toast({
          title: "Failed to login",
          description: "Invalid Credientials",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Successfully logged in",
          description: "You are now logged in",
        });

        router.replace("/dashboard");
      }
    } catch (error) {
      console.log("signup: error to submit form", error);
      toast({
        title: "An error occurred",
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
          <h1 className="text-lg font-bold">Signin to CodexFeedback</h1>
          <p className="text-xs">It takes less then a minute.</p>
        </div>
        <div className="w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email / Username</FormLabel>
                    <FormControl>
                      <Input placeholder="email or username" {...field} />
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
                  "Login"
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div className="text-center mt-5">
          <p className="text-xs">
            Don't have an account?{" "}
            <Link href="/signup">
              {" "}
              <span className="text-blue-400">create</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signin;

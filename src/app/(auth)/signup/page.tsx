"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { userSignupSchema } from "@/app/schemas/userSignup";
import { useDebounceValue } from "usehooks-ts";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/app/types/ApiResponse";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Signup = () => {
  const [username, setUsername] = useState<string>("haroon");
  const [usernameErrMsg, setUsernameErrMsg] = useState<string>("");
  const [findUsernameLoading, setFindUsernameLoading] =
    useState<boolean>(false);

  const [formSubmitLoading, setFormSubmitLoading] = useState<boolean>(false);

  const [debouncedUsername, setDebouncedUsername] = useDebounceValue(
    username,
    300
  );

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const checkUsername = async () => {
      setUsernameErrMsg("");
      setFindUsernameLoading(true);
      try {
        const response = await axios.get(
          `/api/check-username/?username=${debouncedUsername}`
        );
        console.log(response);

        setUsernameErrMsg(response.data.message);
      } catch (error) {
        const axiosErr = error as AxiosError<ApiResponse>;
        setUsernameErrMsg(
          axiosErr.response?.data.message || "An error occurred"
        );
      } finally {
        setFindUsernameLoading(false);
      }
    };

    checkUsername();
  }, []);

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

        router.replace(`/verify/?${values.username}`);
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

  return <div>Signup</div>;
};

export default Signup;

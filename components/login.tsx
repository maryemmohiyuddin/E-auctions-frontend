"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
} from "@nextui-org/react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

import { Input } from "@nextui-org/input";
import { EyeFilledIcon } from "./EyeFilledIcon";
import { EyeSlashFilledIcon } from "./EyeSlashFilledIcon";
import { Button } from "@nextui-org/button";
import { toast, ToastContainer } from "react-toastify"; // Import toast for notifications
import {Spinner} from "@nextui-org/spinner";
import Cookies from "js-cookie"; // Import js-cookie for cookie management

import "react-toastify/dist/ReactToastify.css"; // Import toast CSS

export const Login = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false); // Loading state
  const [error, setError] = React.useState("");

  const toggleVisibility = () => setIsVisible(!isVisible);
  const router = useRouter(); // Initialize useRouter for navigation

  const handleLogin = async () => {
    setError("");
    setLoading(true); // Set loading to true when starting the login

    // Validation: Check if both fields are filled
    if (!email || !password) {
      setError("Email and password are required.");
      toast.error("Email and password are required.");
      setLoading(false); // Reset loading state
      return;
    }

    const loginData = { email, password };

    try {
      const response = await fetch("http://localhost:8000/users/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error("Invalid email or password."); // Display error message
        return;
      }

      const data = await response.json();
      console.log("Login successful:", data);
       // Save tokens in cookies
       Cookies.set("access_token", data.access); // Expires in 7 days
       Cookies.set("refresh_token", data.refresh); // Expires in 7 days
       Cookies.set("email", data.user.email); // Expires in 7 days
       Cookies.set("role", data.user.role); // Expires in 7 days
       Cookies.set("id", data.user.id); // Expires in 7 days
       Cookies.set("name", data.user.name); // Expires in 7 days



      // toast.success("Login successful!");
      if(data.user.role=='seller'){
        window.location.href = '/products';

      }
      if(data.user.role=='bidder'){
        window.location.href = '/dashboard';

      }


      // Here you can handle successful login (e.g., redirecting the user)
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("An error occurred. Please try again.");
      setLoading(false); // Reset loading state in the end

    } finally {
    }
  };

  return (
    <Card    style={{ boxShadow: "0px 4px 12px rgba(255, 255, 255, 0.9)" }}

 className="px-6 py-6 rounded-xl shadow-md shadow-white">
      <CardHeader className="flex pb-6 flex-col gap-3 items-center justify-center">
        <div className='flex items-center justify-center gap-2'>
        <Image
          alt="nextui logo"
          height={40}
          radius="sm"
          src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
          width={40}
        />
        {/* <h2 className='text-xl font-semibold'>E-Auctions</h2> */}

        </div>
        {/* <Divider /> */}
       
        <div className="flex flex-col justify-center items-center">
          <p className="text-md">Login</p>
          <p className="text-small text-default-500">
            Login to get access to your account.
          </p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className='min-w-[420px] '>
        <div className="flex flex-col gap-4 py-3 ">
          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            endContent={
              <button
                className="focus:outline-none"
                type="button"
                onClick={toggleVisibility}
                aria-label="toggle password visibility"
              >
                {isVisible ? (
                  <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                ) : (
                  <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                )}
              </button>
            }
            type={isVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button color="secondary" onClick={handleLogin} disabled={loading}>
          {loading ? <Spinner size="sm" color='white' /> : "Login"} {/* Show spinner when loading */}
          </Button>
        </div>
      </CardBody>
      <Divider />
      <CardFooter className="flex pt-6 items-center justify-center text-md">
        <p className="text-small text-default-500">
          Don't have an account?
        </p>
        <Link
          showAnchorIcon
          href="/signup"
          className="ml-1 text-small text-secondary"
        >
          Signup
        </Link>
      </CardFooter>
      <ToastContainer /> 
    </Card>
  );
};

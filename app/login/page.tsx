'use client'
import { Login } from "@/components/login";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
} from "@nextui-org/react";
export default function LoginPage() {
  return (
    <>
    <div style={{
      background: "radial-gradient(circle, #7430b3, #2d1345)",
    }} className='relative flex flex-col items-center justify-center h-screen'>
      <div className='flex flex-col items-center justify-center h-screen'>
    <Login />
    </div>
    <div  className='flex absolute flex-col items-end right-0 bottom-0 justify-end  w-full p-5'> 
    <Image
          alt="nextui logo"
          height={40}
          radius="sm"
          src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
          width={40}
        />
        </div>
    </div>
    </>
  );
}

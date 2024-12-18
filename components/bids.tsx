'use client'
import { useState, useEffect } from 'react';
import { Card, CardBody, CardFooter, Image, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, useDisclosure } from "@nextui-org/react";
import Cookies from 'js-cookie';
import { toast, ToastContainer } from "react-toastify";
import { Tabs, Tab } from "@nextui-org/react"; 
import "react-toastify/dist/ReactToastify.css"; 
import { IoIosRefresh } from "react-icons/io";
import { useRouter } from 'next/navigation';

export default function Bids() {
  const router = useRouter();

  const handleRedirect = (price, auction) => {
    const userId = Cookies.get('id'); // Assuming user ID is saved in cookies

    router.push(`/checkout/${price}/${auction}/${userId}`);
  };
  const [bids, setBids] = useState<any>([]); // State to store bids for the selected product

  useEffect(() => {
    fetchMyBids()

  }, []);

    const [lockedAuctions, setLockedAuctions] = useState([]);
  const [soldAuctions, setSoldAuctions] = useState([]);
  const fetchMyBids = async () => {
    try {
      const accesstoken = Cookies.get('access_token');
      const userId = Cookies.get('id'); // Assuming user ID is saved in cookies

    const response = await fetch(`http://localhost:8000/bids/sold-and-locked-auctions/${userId}`, {
        method: "GET",
        headers: { 'Authorization': `Bearer ${accesstoken}` },
      });
      const data = await response.json();
      console.log("mybids", data)
      const locked = data.filter(auction => auction.auction_status === 'locked');
      const sold = data.filter(auction => auction.auction_status === 'sold');
      console.log("locked", locked)
      console.log("sold", sold)

      // Set the states
      setLockedAuctions(locked);
      setSoldAuctions(sold);
      // setCategories(data);
    } catch (error) {
      console.error("An error occurred while fetching categories:", error);
    }
  };

 
  return (
    <div>
        
          <h2 className='text-4xl font-semibold'>My Bids!</h2>
          <p>You can manage your purchased or won items here.</p>
        
      <div className='mt-10'>
      <h2 className='text-2xl font-semibold mb-5'>Won Auctions</h2>
       
          <div className='w-full'>
            <div className="gap-5 mb-20 grid grid-cols-3 sm:grid-cols-4 w-full">
              {lockedAuctions.map((item: any) => (
                <Card shadow="sm" className='relative group' key={item.id} >
                    <button
              className="absolute bg-secondary rounded-lg py-1 px-2 text-white top-2 right-2 z-[60] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              onClick={() =>handleRedirect(item.winning_bid_value, item.auction.id)
            }
            >
              Proceed to Checkout
            </button>
                   <CardBody className="overflow-visible relative p-0"> 
                    <Image isZoomed shadow="sm" radius="lg" width="100%" alt={item.auction.product.name} className="w-full object-cover h-[140px]" src={process.env.NEXT_PUBLIC_URL+item.auction.product.picture} />
                    <div
                className="absolute z-[50] inset-0 bg-black/10 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
              ></div>
                  </CardBody>
                  <CardFooter className="flex justify-between text-sm">
                    <p>{item.auction.product.name}</p>
                    <p> Rs {Number(item.winning_bid_value).toLocaleString('en-IN')}{}</p>
                    
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <div className='mt-10'>
      <h2 className='text-2xl font-semibold mb-5'>Purchased Auctions</h2>
       
          <div className='w-full'>
            <div className="gap-5 mb-20 grid grid-cols-3 sm:grid-cols-4 w-full">
              {soldAuctions.map((item: any) => (
                <Card shadow="sm" key={item.id} >
                   <CardBody className="overflow-visible p-0"> 
                    <Image isZoomed shadow="sm" radius="lg" width="100%" alt={item.auction.product.name} className="w-full object-cover h-[140px]" src={process.env.NEXT_PUBLIC_URL+item.auction.product.picture} />
                  </CardBody>
                  <CardFooter className="flex justify-between text-sm">
                    <p>{item.auction.product.name}</p>
                    <p> Rs {Number(item.winning_bid_value).toLocaleString('en-IN')}{}</p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>

      <ToastContainer /> 
    </div>
  );
}

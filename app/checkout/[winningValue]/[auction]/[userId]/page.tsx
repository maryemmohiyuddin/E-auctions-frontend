'use client'
import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Cookies from 'js-cookie'; 

import CheckoutForm from "@/components/CheckoutForm";
import CompletePage from "@/components/CompletePage";
import { Card, CardBody, CardFooter, Image, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, useDisclosure } from "@nextui-org/react";

// Initialize Stripe with your publishable API key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutPageProps {
  params: { winningValue: string, auction:string, userId:string };
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ params }) => {
  const [clientSecret, setClientSecret] = useState("");
  const [dpmCheckerLink, setDpmCheckerLink] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const { winningValue, auction, userId } = params;

console.log("values", winningValue, auction, userId)
  useEffect(() => {
    if (!winningValue) return;

    // Set the confirmed state based on the URL query parameters
    setConfirmed(
      new URLSearchParams(window.location.search).has("payment_intent_client_secret")
    );

    // Create PaymentIntent when the page loads
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: winningValue}), // Convert dollars to cents
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setDpmCheckerLink(data.dpmCheckerLink); // Optional for debugging
      });
      
  }, [winningValue]);

useEffect(()=>{

if(!confirmed) return;

createTransaction();

},[confirmed])

  const createTransaction = async () => {
    try {
      const accesstoken = Cookies.get('access_token');

      const response = await fetch("http://localhost:8000/bids/createtransaction/", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accesstoken}`,

          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: winningValue,
          auction,
          user: userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle success (e.g., show success message, update UI)
        // setStatus("Transaction successful!");
        console.log(data);
      } else {
        // Handle failure (e.g., show error message)
        // setStatus("Transaction failed.");
        console.error(data);
      }
    } catch (error) {
      // Handle network error or other unexpected errors
      // setStatus("Error occurred during transaction.");
      console.error(error);
    }
  };

  const appearance = {
    theme: "stripe",
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="App flex justify-center items-center h-screen">
      <Card className='w-[50%] p-5'>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          {confirmed ? (
            <CompletePage />
          ) : (
            <CheckoutForm dpmCheckerLink={dpmCheckerLink} amount={winningValue} auction={auction} userId={userId}/>
          )}
        </Elements>
      ) }
      </Card>
    </div>
  );
};

export default CheckoutPage;

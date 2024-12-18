'use client';
import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css"; // Import toast CSS
import { toast, ToastContainer } from "react-toastify"; // Import toast for notifications
import Cookies from "js-cookie";
import { MdDeleteOutline } from "react-icons/md";
import { MdOutlineModeEdit } from "react-icons/md";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useRouter } from "next/navigation"; // Import useRouter hook
import { Image, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, Select, SelectItem, useDisclosure } from "@nextui-org/react";

import { IoIosRefresh } from "react-icons/io";

export default function ProductPage({ productid, auctionid }: any) {
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onOpenChange: onDeleteModalOpenChange } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onOpenChange: onEditModalOpenChange } = useDisclosure();
  const [biddingValue, setBiddingValue] = useState<number | string>(''); // State for the bidding value
  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal controls
  const [hasPlacedBid, setHasPlacedBid] = useState<boolean>(false); // New state to track if user has placed a bid

  const [productDetail, setProductDetail] = useState<any>();
  const [categories, setCategories] = useState<any>([]);
  const [auction, setAuction] = useState<any>([]);
  const [countdown, setCountdowns] = useState<{ [key: number]: string }>({});
  const [bids, setBids] = useState<any>([]); // State to store bids for the selected product
  const [loading, setLoading] = useState<boolean>(false);

  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [subline, setSubline] = useState('');
  const [yearOfManufacture, setYearOfManufacture] = useState('');
  const [material, setMaterial] = useState('');
  const [description, setDescription] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [image, setImage] = useState<any>();
  const [category, setCategory] = useState<any>(null);
  const [errors, setErrors] = useState<any>({}); // for form validation errors
  const [selectedProduct, setSelectedProduct] = useState<any>(null); // State to store the product being clicked
  const [list, setList] = useState<any>([]);

  const router = useRouter();

  const handleFetchProductDetail = async () => {
    if (!productid) {
      alert("Please select a product for detail.");
      return;
    }
    try {
      const accesstoken = Cookies.get('access_token');
      const response = await fetch(`http://localhost:8000/products/${productid}/`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
        },
      });
      const result = await response.json();
      console.log("result", result)
      setProductDetail(result);
      setProductId(result.id);
      setProductName(result.name);
      setSubline(result.subName);
      setYearOfManufacture(result.yearOfManufacture);
      setMaterial(result.Material);
      setDescription(result.description);
      setWidth(result.width);
      setHeight(result.height);
      setWeight(result.weight);
      setCategory(result.category);
      // Add additional handling for categories if necessary
    } catch (error) {
      console.error("An error occurred while fetching the product:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const accesstoken = Cookies.get('access_token');
      const response = await fetch("http://localhost:8000/categories/view/", {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
        },
      });
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("An error occurred while fetching categories:", error);
    }
  };

  
  const fetchAuction = async () => {
    try {
      const accesstoken = Cookies.get('access_token');
      const response = await fetch(`http://localhost:8000/auctions/${auctionid}/`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
        },
      });
      const data = await response.json();
      console.log("Data", data)
      setAuction(data);
    } catch (error) {
      console.error("An error occurred while fetching auctions:", error);
    }
  };

  useEffect(() => {
    handleFetchProductDetail();
    fetchCategories();
    fetchAuction();

    
  }, []);

  const handleBackClick = () => {
    router.push("/dashboard");
  };

  const handleDeleteProduct = async () => {
    if (!productid) {
      toast.error("Product ID is missing.");
      return;
    }

    try {
      const accesstoken = Cookies.get('access_token');
      const response = await fetch(`http://localhost:8000/products/${productid}/delete/`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
        },
      });

      if (response.ok) {
        toast.success("Product deleted successfully!");
        router.push("/dashboard");
      } else {
        toast.error("Failed to delete the product.");
      }
    } catch (error) {
      console.error("An error occurred while deleting the product:", error);
      toast.error("An error occurred while deleting the product.");
    } finally {
      onDeleteModalOpenChange();
      
    }
  };
const openBidModal=async(productid)=>{
  if(list.length>0){
  console.log("product", productid , list )
  const filteredProduct = list.filter(item => item.product.id === productid && item.status=='active');

console.log("Filtered Product:", filteredProduct[0]);
    setSelectedProduct(filteredProduct[0]);
  }
}
const handleBidSubmit = async () => {
  const startingValueAsInteger = Math.floor(selectedProduct.starting_value);

  if (biddingValue < startingValueAsInteger) {
    console.log("bid", biddingValue, startingValueAsInteger)
    toast.error("Bid must be greater than or equal to the starting value!");
    return;
  }

  const currentTime = new Date();
  const auctionEndTime = new Date(selectedProduct.ending_time);

  // Ensure current time is less than or equal to auction's ending time
  if (currentTime > auctionEndTime) {
    toast.error("The auction has already ended!");
    return;
  }
  try {
    const accesstoken = Cookies.get('access_token');
    const userId = Cookies.get('id'); // Assuming user ID is saved in cookies
    const auctionId = selectedProduct.id;

    const response = await fetch("http://localhost:8000/bids/place-bid/", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${accesstoken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: Number(userId),
        auction_id: auctionId,
        starting_value: Number(selectedProduct.starting_value),
        ending_time: selectedProduct.ending_time,
        bidding_value: biddingValue,
      }),
    });

    const result = await response.json();
    console.log("Result", result)
    if (response.ok) {
      toast.success("Bid placed successfully!");
      onClose(); // Close the modal
    } else {
      toast.error(result.detail || "An error occurred while placing the bid.");
    }
  } catch (error) {
    toast.error("An error occurred while placing the bid.");
  }
};
const fetchBids = async (auctionId: number) => {
  try {
    setLoading(true);

    const accesstoken = Cookies.get('access_token');
    const userId = Cookies.get('id'); // Assuming user ID is saved in cookies

    const response = await fetch(`http://localhost:8000/bids/auction/${auctionId}/`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${accesstoken}`,
        'Content-Type': 'application/json',
      }
    });

    const bidsData = await response.json();
    const sortedBids = bidsData.sort((a: any, b: any) => b.bidding_value - a.bidding_value); // Sort bids by value (highest to lowest)
    setBids(sortedBids);

    const userBid = sortedBids.find((bid: any) => bid.user_id === Number(userId)); // Check if user has placed a bid
    setHasPlacedBid(!!userBid); // Set the state based on whether the user has placed a bid
  } catch (error) {
    console.error("An error occurred while fetching bids:", error);
  }
  finally {
    setLoading(false);
  }
};
const handleRefreshBids = (id) => {
  fetchBids(id); // Call the fetch function to refresh bids
};
  const handleEditProduct = async () => {
    const formData = new FormData();
    formData.append('id', productId);
  
    formData.append('name', productName);
    formData.append('subName', subline);
    formData.append('yearOfManufacture', yearOfManufacture);
    formData.append('Material', material);
    formData.append('description', description);
    formData.append('width', width);
    formData.append('height', height);
    formData.append('weight', weight);
    console.log("category selected", category)
    formData.append('category', category); // Ensuring category is converted to a number
    if (image) {
      formData.append('picture', image); // Add the image file
    }
  
    try {
      const accesstoken = Cookies.get('access_token');
      const response = await fetch(`http://localhost:8000/products/${productid}/update/`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
        },
        body: formData, // Send FormData instead of JSON
      });
  
      if (response.ok) {
        toast.success("Product updated successfully!");
        // router.push(`/products/${id}`);
      } else {
        toast.error("Failed to update the product.");
      }
    } catch (error) {
      console.error("An error occurred while updating the product:", error);
      toast.error("An error occurred while updating the product.");
    } finally {
      onEditModalOpenChange();
      handleFetchProductDetail()
    }
  };
  
  const fetchProducts = async () => {
    try {
      const accesstoken = Cookies.get('access_token');

      const response = await fetch("http://localhost:8000/auctions/auctions-with-products/", {
        method: "GET",
        headers: { 'Authorization': `Bearer ${accesstoken}` },
      });
      const data = await response.json();
      const activeAuctions = data.filter((auction) => auction.status === 'active');
      if (activeAuctions.length > 0) {
      const userId = Cookies.get('id');
      // fetchSearchData(userId, activeAuctions)

        console.log("There are active auctions:", activeAuctions);
      } else {
        console.log("No active auctions found.");
      }
      setList(activeAuctions);

      console.log("Activeauctions", activeAuctions)
    } catch (error) {
      console.error("An error occurred while fetching products:", error);
    }
  };
  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!auction) return; // Handle case where auction might be null or undefined
  
      const now = new Date();
      const newCountdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  
      const endTime = new Date(auction.ending_time);
      const timeLeft = endTime.getTime() - now.getTime();
  
      if (timeLeft > 0) {
        const totalSeconds = Math.floor(timeLeft / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const days = Math.floor(totalHours / 24);
        const hours = totalHours % 24;
        const minutes = totalMinutes % 60;
        const seconds = totalSeconds % 60;
  
        newCountdown.days = days;
        newCountdown.hours = hours;
        newCountdown.minutes = minutes;
        newCountdown.seconds = seconds;
      }
  
      setCountdowns(newCountdown); // Set countdown for the single auction
    };
  
    const intervalId = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [auction]);
  useEffect(()=>{
    console.log("in this useeffect")
    fetchProducts()
  },[])
  return (
    <>
      <div onClick={handleBackClick} style={{ cursor: 'pointer', display: 'inline-block' }}>
        <IoArrowBackCircleOutline size={'30px'} color={'#8f8d8d'} className='mb-5'/>
      </div>

      {productDetail && (
        <div className="grid grid-cols-2 gap-7 mb-10">
          <div className="flex justify-start items-start col-span-1 ">
            <Image
              alt="NextUI Album Cover"
              className="object-cover border border-gray-300 w-[700px] h-[700px]"
              src={productDetail?.picture}
            />
          </div>

          <div className="col-span-1 flex flex-col gap-2">
            <h1 className="text-sm text-gray-500">{productDetail.subName}</h1>
            <h1 className="text-4xl font-bold">{productDetail.name}</h1>
           
            <h1 className="text-md mt-5">
  <span className="font-bold text-secondary">Category: </span>
  {categories.find((cat: any) => cat.id === productDetail?.category)?.name || 'Category not found'}
</h1>

            <h1 className="text-md">
              <span className="font-bold text-secondary">Material: </span>
              {productDetail.Material}
            </h1>
            <h1 className="text-md">
              <span className="font-bold text-secondary">Dimensions: </span>
              {productDetail.height} * {productDetail.width} inches
            </h1>
            <h1 className="text-md">
              <span className="font-bold text-secondary">Weight: </span>
              {productDetail.weight} kg
            </h1>
            <h1 className="text-md mb-5">
              <span className="font-bold text-secondary">Year of Manufacture: </span>
              {productDetail.yearOfManufacture}
            </h1>
         
            <h1 className="text-md">{productDetail.description}</h1>
            <div className='flex my-5 items-center justify-center gap-4 text-3xl'>
         
         <p className="bg-white  shadow-md p-3 rounded-lg">
           {countdown && ( // Check if the countdown exists
             `${countdown.days}d`
           ) } 
         </p>
         <p className="bg-white  shadow-md p-3 rounded-lg">
           {countdown && ( // Check if the countdown exists
             `${countdown.hours}h`
           ) } 
         </p>
         <p className="bg-white  shadow-md p-3 rounded-lg">
           {countdown && ( // Check if the countdown exists
             `${countdown.minutes}m`
           ) } 
         </p>
         <p className="bg-white text-secondary shadow-md p-3 rounded-lg">
           {countdown && ( // Check if the countdown exists
             `${countdown.seconds}s`
           ) } 
         </p>
         </div>
            <div className="flex gap-4 items-end justify-end mb-10 mt-3">
           
<Button onClick={() =>openBidModal(productDetail.id)}>Bid</Button>
             
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
    
      {selectedProduct && (
        <Modal isOpen={isOpen} onClose={onClose}>
          {/* {console.log("selectedproduct", selectedProduct)} */}
          <ModalContent>
          {hasPlacedBid &&  <ModalHeader>Bidding List for {selectedProduct.product.name}</ModalHeader>} 
          {!hasPlacedBid &&  <ModalHeader>Place Bid for {selectedProduct.product.name}</ModalHeader>} 

            <ModalBody>
            {!hasPlacedBid &&
            <>

              <p>Starting Value: Rs {Number(selectedProduct.starting_value).toLocaleString('en-IN')}</p>
              <Input
                label="Bidding Value"
                value={biddingValue}
                onChange={(e) => setBiddingValue(e.target.value)}
                type="number"
                min={selectedProduct.starting_value + 1}
              />
              </>
            }
              {hasPlacedBid && <p>You have already placed a bid on this auction.</p>}

              <div className="mt-5 p-2 border rounded-xl w-full">
      <h4 className=' flex gap-5 font-semibold items-center '> 
        Bidding Leaders     
        <IoIosRefresh
          size={14}
          className={`cursor-pointer ml-2 ${loading ? 'animate-spin' : ''}`}
          onClick={() => handleRefreshBids(selectedProduct.id)} // Pass a function reference
          />
      </h4>
      
      {/* Show loading state when bids are being refreshed */}
      {loading ? (
        <p className='mt-3 text-sm'>Loading...</p>
      ) : bids.length === 0 ? (
        <p className='mt-3 text-sm'>No bids yet.</p>
      ) : (
        bids.map((bid: any, index: number) => {
          const isUserBid = bid.user_id === Number(Cookies.get('id')); // Check if this is the current user's bid
          const position = index + 1; // Position of the bid (1st, 2nd, etc.)
          const positionSuffix = position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th';
          return (
            <p  className='mt-3 text-sm   ' key={bid.id}>
              {position}{positionSuffix} place{isUserBid ? '(You) ' : ''}: {bid.bidding_value}
            </p>
          );
        })
      )}
    </div>
            </ModalBody>
            <ModalFooter>
            {!hasPlacedBid && <Button auto onClick={handleBidSubmit} disabled={hasPlacedBid}>Place Bid</Button>}
              <Button auto onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      <ToastContainer />
    </>
  );
}

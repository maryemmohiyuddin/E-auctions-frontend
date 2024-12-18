'use client'
import { useState, useEffect } from 'react';
import { Card, CardBody, CardFooter, Image, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, useDisclosure } from "@nextui-org/react";
import Cookies from 'js-cookie';
import { toast, ToastContainer } from "react-toastify";
import { Tabs, Tab } from "@nextui-org/react"; 
import "react-toastify/dist/ReactToastify.css"; 
import { IoIosRefresh } from "react-icons/io";
import {SearchIcon} from "./searchIcon";
import { useRef } from "react";
import { format } from "date-fns";
import { useRouter } from 'next/navigation';  // Import useRouter

export default function Dashboard() {
  const [name, setName] = useState(null);
  const [categories, setCategories] = useState<any>([]);
  const [selectedCat, setSelectedCat] = useState();
  const [products, setProducts] = useState<any>([]);
  const [searchCategory, setSearchCategory] = useState<any>([]);
  const [list, setList] = useState<any>([]);
  const [countdowns, setCountdowns] = useState<{ [key: number]: string }>({});
  const [biddingValue, setBiddingValue] = useState<number | string>(''); // State for the bidding value
  const [selectedProduct, setSelectedProduct] = useState<any>(null); // State to store the product being clicked
  const [hasPlacedBid, setHasPlacedBid] = useState<boolean>(false); // New state to track if user has placed a bid
  const [bids, setBids] = useState<any>([]); // State to store bids for the selected product
  const [searchQuery, setSearchQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // useEffect(() => {
  //   const userId = Cookies.get('id');

  //   // Call the API when the component loads or the userId changes
  //   if (userId) {
  //     fetchSearchData(userId)
      
  //   }
  // }, []);
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // Adjust based on desired scroll distance
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };
  const [filteredProducts, setFilteredProducts] = useState([]); // To store the products displayed
  // Filter based on search or category
  const handleSearch = () => {
    const hasWord = /\w+/; // Regular expression to check for at least one word
  
    if (hasWord.test(searchQuery.trim())) {
      const searchedProducts = list.filter((li: any) =>
        li.product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setProducts(searchedProducts);
      setSearched(true); // Mark that a search was performed
    } else {
      filterProducts(); // Revert to category filtering if the query is invalid
    }
  };
  

// Clear search and revert to category filtering
const clearSearch = () => {
  setSearchQuery("");
  setSearched(false);
  filterProducts();
};
useEffect(() => {
  if (!searchQuery) {
    filterProducts(); // Automatically filter based on category when the search query is empty
  }
}, [selectedCat, searchQuery]);


  useEffect(() => {
    filterProducts();
  }, [selectedCat]); 
  const filterProducts = () => {
    console.log("SelectedCat", selectedCat)

    console.log("in filter products", list, selectedCat);
    const categoryNumber = Number(selectedCat);
    const filteredProducts = list.filter((li:any) => li.product.category === categoryNumber);
    console.log("Filtered Products:", filteredProducts);
  setProducts(filteredProducts)

    return filteredProducts; 
  };
  
  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal controls

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    const userName = Cookies.get('name');
    setName(userName);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const newCountdowns: { [key: number]: { days: number; hours: number; minutes: number; seconds: number } } = {};
  
      list.forEach((auction) => {
        const endTime = new Date(auction.ending_time);
        const timeLeft = endTime.getTime() - now.getTime();
  
        if (timeLeft <= 0) {
          newCountdowns[auction.id] = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          };
        } else {
          const totalSeconds = Math.floor(timeLeft / 1000);
          const totalMinutes = Math.floor(totalSeconds / 60);
          const totalHours = Math.floor(totalMinutes / 60);
          const days = Math.floor(totalHours / 24);
          const hours = totalHours % 24;
          const minutes = totalMinutes % 60;
          const seconds = totalSeconds % 60;
  
          newCountdowns[auction.id] = {
            days,
            hours,
            minutes,
            seconds,
          };
        }
      });
  
      setCountdowns(newCountdowns);
    };
  
    const intervalId = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [list]);
  
  const fetchCategories = async () => {
    try {
      const accesstoken = Cookies.get('access_token');
      const response = await fetch("http://localhost:8000/categories/view/", {
        method: "GET",
        headers: { 'Authorization': `Bearer ${accesstoken}` },
      });
      const data = await response.json();
      setCategories(data);
      console.log("Data[0", data[0].id)
      setSelectedCat[data[0].id]
    } catch (error) {
      console.error("An error occurred while fetching categories:", error);
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
      fetchSearchData(userId, activeAuctions)

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
  const router = useRouter();  // Initialize useRouter hook


  const handleProductClick = async(product: any) => {
    // Navigate to /productinfo/[id]
    // setSelectedProduct(product);
    if (searched) {
      try {
      const userId = Cookies.get('id'); // Assuming user ID is saved in cookies

        const categoryId = product.product.category; // Replace with the actual category ID
  
        const response = await fetch("http://localhost:8000/search/create-search/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, category_id: categoryId }),
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log("Search recorded:", data);
        } else {
          console.error("Failed to record search:", await response.text());
        }
      } catch (error) {
        console.error("Error calling createSearch API:", error);
      }
  
      // Reset the `searched` state after recording the search
      // setSearched(false);
    }
    router.push(`/productpage/${product.product.id}/${product.id}`);
  };
//   const handleProductClick =async (product: any) => {
// console.log("product", product)
//     setSelectedProduct(product);
//     fetchBids(product.id); 
//     onOpen(); 
//     if (searched) {
//       try {
//       const userId = Cookies.get('id'); // Assuming user ID is saved in cookies

//         const categoryId = product.product.category; // Replace with the actual category ID
  
//         const response = await fetch("http://localhost:8000/search/create-search/", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ user_id: userId, category_id: categoryId }),
//         });
  
//         if (response.ok) {
//           const data = await response.json();
//           console.log("Search recorded:", data);
//         } else {
//           console.error("Failed to record search:", await response.text());
//         }
//       } catch (error) {
//         console.error("Error calling createSearch API:", error);
//       }
  
//       // Reset the `searched` state after recording the search
//       // setSearched(false);
//     }
//   };


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
  const fetchSearchData = async (userId, activeAuctions) => {
    try {
      const accesstoken = Cookies.get('access_token');

      const response = await fetch(`http://localhost:8000/search/get_search/${userId}/`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Search data:", data);
        const categoryId = data.category_id;
console.log("categoryid", categoryId, list)
        // Assuming `activeAuctions` is the list containing product information
  
        // Filter auctions based on category_id
        const filteredAuctions = activeAuctions.filter(auction => auction.product.category === categoryId);
  console.log("filteredauctions", filteredAuctions)
        // Get the first 10 filtered auctions
        const firstTenAuctions = filteredAuctions.slice(0, 10);
  console.log("firsttenauctions", firstTenAuctions)
        // Set these first 10 auctions to setSearchCategory
        setSearchCategory(firstTenAuctions);

        return data;
      } else {
        const errorData = await response.json();
        console.error("Error fetching search data:", errorData.detail);
        if(errorData.status==404){
        setSearchCategory([])

        }
      }
    } catch (error) {
      console.error("An error occurred while fetching search data:", error);
    }
  };
  
  const [loading, setLoading] = useState<boolean>(false);
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
  return (
    <div>
       
       
      {name !== null && (
        <>
        <div className="mb-5  justify-between items-center  px-8 py-4 bg-secondary rounded-xl">
        <div className='text-white'>

        <h1 className='text-2xl  font-semibold mb-2'>Welcome {name}!</h1>
<p>Welcome to the Bidding Page! Here, you can explore a wide range of products available for bidding. Place your bids on items you’re interested in, track the current status of ongoing auctions, and stay updated on any changes. With user-friendly features and real-time notifications, you can easily manage your bids and participate in auctions with confidence. Good luck, and may the best bid win!</p>
        </div>
   {/* <div className="flex  gap-3 my-5"> */}
          {/* <Button onPress={onManageCategoriesOpen} className='bg-white  text-secondary' startContent={<BiCategory />}>
            Manage Categories
          </Button>
          <Button onPress={onOpen} className='bg-white  text-secondary' startContent={<IoMdAdd />}>
            Add Product
          </Button> */}
        {/* </div> */}
        </div>
        <div className='flex justify-between items-end'>
          <div>
          {/* <h2 className='text-4xl font-semibold'>Welcome {name}!</h2> */}
          {/* <p>Bid on the projects of your choice.</p> */}
          </div>
          <Input
  className="max-w-xs"
  isClearable
  radius="lg"
  onClear={clearSearch} // Call clearSearch when the input is cleared
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") handleSearch();
  }}
  classNames={{
    label: "text-black/50 dark:text-white/90",
    input: [
      "bg-transparent",
      "text-black/90 dark:text-white/90",
      "placeholder:text-default-700/50 dark:placeholder:text-white/60",
    ],
    innerWrapper: "bg-transparent",
  }}
  placeholder="Type to search..."
  startContent={
    <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
  }
/>


        </div>
        </>
      )}
            {searchCategory.length>0 && (

    <div>

      <h2 className="text-2xl mt-5 font-semibold">Search Based Suggestions</h2>
      <p className="mb-10">Bid on the projects of your choice.</p>
      <div className="relative w-full">
        {/* Scroll Arrows */}
        {/* <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-300 rounded-full p-2 shadow-lg"
          onClick={() => scroll("left")}
        >
          ◀
        </button>
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-300 rounded-full p-2 shadow-lg"
          onClick={() => scroll("right")}
        >
          ▶
        </button> */}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="gap-5 p-2 mb-20 flex w-full overflow-x-auto scrollbar-hide"
        >
          {searchCategory.map((item: any) => (
            <Card
              shadow="sm"
              key={item.id}
              isPressable
className='min-w-[200px]'
              onPress={() => handleProductClick(item)}
            >
              <CardBody className="overflow-visible p-0">
                <Image
                  isZoomed
                  shadow="sm"
                  radius="lg"
                  width="100%"
                  alt={item.product.name}
                  className="w-full object-cover h-[140px]"
                  src={item.product.picture}
                />
              </CardBody>
              <CardFooter className="flex justify-between text-left text-sm">
                <p>{item.product.name}</p>
                {/* <p className="text-red-500">{countdowns[item.id] || "Calculating..."}</p> */}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )}
      <div className='mt-5'>
        <div className='flex gap-10'>
        <div>

        <p className='mb-3'>Categories</p>

          <div className="flex flex-wrap">
          <Tabs color='secondary' aria onSelectionChange={(value:any)=>setSelectedCat(value)}  classNames={{
          tabList: "w-[250px] px-3 py-5 bg-[#e8e8e8] bg-opacity-50",
          tab: "bg-opacity-15",
          cursor: "w-full  bg-opacity-15  bg-secondary",

          tabContent: "group-data-[selected=true]:text-secondary "

        }}  variant={'solid'} aria-label="Tabs variants" isVertical>              {categories.map((item: any) => (
                <Tab key={item.id} title={item.name} />
              ))}
            </Tabs>
          </div>
          </div>
          <div className='w-full'>
      <p className='mb-3'>Products</p>

            <div className="gap-5 mb-20 grid grid-cols-3 sm:grid-cols-4 w-full">
           {products.map((item) => {
  const countdown = countdowns[item.id]; // Get the countdown object for the item
  return (
    <Card shadow="sm" key={item.id} isPressable onPress={() => handleProductClick(item)}>
      <CardBody className="overflow-visible relative p-0">
        <Image
          isZoomed
          shadow="sm"
          radius="lg"
          width="100%"
          alt={item.product.name}
          className="w-full object-cover h-[140px]"
          src={item.product.picture}
        />
        <div className="absolute w-full z-[50] flex items-center justify-center bottom-[-10%]">
          <div className='flex gap-1'>
         
          <p className="bg-white text-semibold shadow-md p-1 rounded-lg">
            {countdown && ( // Check if the countdown exists
              `${countdown.days}d`
            ) } 
          </p>
          <p className="bg-white text-semibold shadow-md p-1 rounded-lg">
            {countdown && ( // Check if the countdown exists
              `${countdown.hours}h`
            ) } 
          </p>
          <p className="bg-white text-semibold shadow-md p-1 rounded-lg">
            {countdown && ( // Check if the countdown exists
              `${countdown.minutes}m`
            ) } 
          </p>
          <p className="bg-white text-semibold shadow-md p-1 rounded-lg">
            {countdown && ( // Check if the countdown exists
              `${countdown.seconds}s`
            ) } 
          </p>
          </div>
        </div>
      </CardBody> 
      <CardFooter className="flex gap-1 pt-5 flex-col items-start justify-start text-sm">
        <p><span className='font-semibold'>Name: </span>{item.product.name}</p>
        <p><span className='font-semibold'>Starting Value:</span>  Rs.{Number(item.starting_value)}</p>
        <p className='text-left'> <span className='font-semibold'> Ending Time: </span>  {format(new Date(item.ending_time), "PPpp")}
        </p>


        {/* <p className="text-red-500">{countdowns[item.id] ? 'Countdown active' : 'Calculating...'}</p> */}
      </CardFooter>
    </Card>
  );
})}

            </div>
          </div>
        </div>
      </div>

      {/* Modal for placing bids */}
      {selectedProduct && (
        <Modal isOpen={isOpen} onClose={onClose}>
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

      <ToastContainer /> {/* Toast container for displaying notifications */}
    </div>
  );
}

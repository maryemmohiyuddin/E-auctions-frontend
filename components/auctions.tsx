'use client';
import { useState, useEffect } from "react";
import { Card, CardBody, CardFooter, Image, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, useDisclosure } from "@nextui-org/react";
import Cookies from 'js-cookie'; 
import { IoMdAdd } from "react-icons/io";
import { BiCategory } from "react-icons/bi";
import { title } from "@/components/primitives";
import { Select, SelectItem } from "@nextui-org/react";
import "react-toastify/dist/ReactToastify.css"; 
import { toast, ToastContainer } from "react-toastify"; 
import { Tabs, Tab } from "@nextui-org/react"; 
import {DatePicker} from "@nextui-org/react";
import {now, getLocalTimeZone} from "@internationalized/date";
import {useLocale, useDateFormatter} from "@react-aria/i18n";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@nextui-org/react";

export default function Auctions() {
  const [list, setList] = useState<any>([]);
  const [products, setProducts] = useState<any>([]);
  const [categories, setCategories] = useState<any>([]);
  const [selectedCat, setSelectedCat] = useState();
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  // Modal states
  const [auctionData, setAuctionData] = useState<Partial<{
    productId: number;
    startingValue: string;
    startingTime: any;
    endingTime: any;
  }>>({
    productId: undefined,
    startingValue: '',
    startingTime: '',
    endingTime: '',
  });
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const accesstoken = Cookies.get('access_token');
      const response = await fetch("http://localhost:8000/products/view/", {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
        }
      });
      const data = await response.json();
      setList(data);
    } catch (error) {
      console.error("An error occurred while fetching products:", error);
    }
  };
  const fetchCategories = async () => {
    try {
      const accesstoken = Cookies.get('access_token');
      const response = await fetch("http://localhost:8000/categories/view/", {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
        }
      });
      const data = await response.json();
      setCategories(data);
      setSelectedCat(data[0].id)

    } catch (error) {
      console.error("An error occurred while fetching categories:", error);
    }
  };
const filterProducts = () => {
  console.log("in filter products", list, selectedCat);
  const categoryNumber = Number(selectedCat);
  const filteredProducts = list.filter((li:any) => li.category === categoryNumber);
  console.log("Filtered Products:", filteredProducts);
setProducts(filteredProducts)
  return filteredProducts; 
};
const dateTimeFormatter = useDateFormatter({
  dateStyle: "medium",  // e.g., "Jun 26, 2024"
  timeStyle: "short"    // e.g., "11:36 AM"
});

const handleDateChange = (name: string, value: any) => {
  if (value) {
    // Convert the selected local time to a JavaScript Date object
    console.log("value", name, value)

    console.log(value ? dateTimeFormatter.format(value.toDate(getLocalTimeZone())) : "No date selected");
    const localDate = value.toDate(getLocalTimeZone());
console.log("localdate",localDate

)
const formattedUtcDate = localDate.toISOString();

// Format the UTC date as an ISO 8601 string for database storage

console.log("Formatted UTC date to be stored:", formattedUtcDate);

// Update the state with the formatted date string for database storage
setAuctionData(prev => ({ ...prev, [name]: formattedUtcDate }));

    // const localDate = new Date(value.toString());
    // // Convert the local time to UTC time
    // const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
    // setAuctionData(prev => ({ ...prev, [name]: utcDate.toISOString() }));
  }
};
  useEffect(() => {
    filterProducts();
  }, [selectedCat]); 

  const handleProductClick = (productId: number) => {
    setAuctionData(prev => ({ ...prev, productId }));
    onOpen(); // Open the modal
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAuctionData(prev => ({ ...prev, [name]: value }));
  };

  const validateFields = () => {
    // Basic validation for fields
    return auctionData.productId && auctionData.startingValue && auctionData.endingTime;
  };

  const createAuction = async () => {
    if (!validateFields()) {
      toast.error("Please fill in all fields correctly.");
      return;
    }
    
    try {
      const accesstoken = Cookies.get('access_token');
      const id = Cookies.get('id');

      const response = await fetch("http://localhost:8000/auctions/create/", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: id,// Add your user id here,
          product: auctionData.productId,
          starting_value: auctionData.startingValue,
          starting_time: new Date().toISOString(),
          ending_time: new Date(auctionData.endingTime).toISOString(),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Auction created successfully!");
        // Reset auction data and close modal
        setAuctionData({ productId: undefined, startingValue: '', startingTime: '', endingTime: '' });
        // Optionally, refresh the auction list or perform other actions
      } else {
        toast.error(data.detail || "Failed to create auction.");
      }
    } catch (error) {
      console.error("Error creating auction:", error);
      toast.error("An error occurred while creating the auction.");
    }
    finally{
      onOpenChange();
      fetchAuctions()

    }
  };
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auctionedProductIds, setAuctionedProductIds] = useState<string[]>([]);

  useEffect(() => {
    // Fetch auctions when the component is mounted
    
    fetchAuctions();
  }, []);
  const [countdowns, setCountdowns] = useState<{ [key: number]: string }>({});
  const [auctionStatuses, setAuctionStatuses] = useState({}); // State for auction statuses

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const newCountdowns = {};
      const newStatuses = { ...auctionStatuses }; // Copy current statuses
      console.log("auctionStatuses",auctionStatuses)
      auctions.forEach((auction) => {
        const endTime = new Date(auction.ending_time); // Ensure this is a valid date
        const timeLeft = endTime.getTime() - now.getTime();

        // If the auction has ended
        if (timeLeft <= 0) {
          newCountdowns[auction.id] = '--';
console.log("newStatuses[auction.id]",auction.id,newStatuses[auction.id], newCountdowns[auction.id], auction.status)
          // Update status to 'ended'
          if(auction.status !=='locked'){
          if (auction.status !=='sold'){


          if (newStatuses[auction.id] !== 'ended') {
            newStatuses[auction.id] = 'ended';
          }

          return;
        }
        else{
          if (newStatuses[auction.id] !== 'sold') {
            newStatuses[auction.id] = 'sold';
          }
          return;

        }

        }
      
      else{
        console.log("Auction.status", auction.status)
        if (newStatuses[auction.id] !== 'locked') {
          newStatuses[auction.id] = 'locked';
        }
        return;

      }
    }
        // Calculate total hours, minutes, and seconds
        const totalSeconds = Math.floor(timeLeft / 1000);
        const totalHours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        // Format the time left as hh:mm:ss
        newCountdowns[auction.id] = `${String(totalHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Update status to 'active' if the auction is ongoing
        if (!newStatuses[auction.id]) {
          newStatuses[auction.id] = 'active';
        }
      });

      setCountdowns(newCountdowns); // Update countdown state
      setAuctionStatuses(newStatuses); // Update statuses state
    };

    const intervalId = setInterval(calculateTimeLeft, 1000); // Update countdowns every second
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [auctions, auctionStatuses]);
  
  const fetchAuctions = async () => {
    try {
      const accesstoken = Cookies.get('access_token');

      const response = await fetch("http://localhost:8000/auctions/list/", {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accesstoken}`,
          'Content-Type': 'application/json',
        },
       
      });
      console.log("response.data", response)
      const data=await response.json()
      console.log("data of auctions", data)
      
      setAuctions(data);
      const auctionedIds = data.map((auction:any) => auction.product); // Assuming auction has a 'product' field
      setAuctionedProductIds(auctionedIds);
      console.log("auctionedids", auctionedIds)
    } catch (err:any) {
      setError(err.message || 'An error occurred while fetching auctions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-3">
      {/* <h5 className={title()}>Your Auctions</h5> */}

        <h5 className='text-lg mt-5'>Auctions List</h5>
      </div>
      <Table isStriped aria-label="Auctions Table" className='w-full max-h-[500px] overflow-auto  rounded-lg shadow-lg border border-gray-200'>
  <TableHeader>
    <TableColumn className='w-[20%]'>PRODUCT NAME</TableColumn>
    <TableColumn className='w-[20%]'>STARTING BID</TableColumn>
    <TableColumn className='w-[20%]'>STARTING TIME</TableColumn>
    <TableColumn className='w-[25%]'>ENDING TIME</TableColumn>
    <TableColumn className='w-[15%]'>STATUS</TableColumn>

    <TableColumn className='w-[15%]'>TIME LEFT</TableColumn>

  </TableHeader>
  <TableBody className='' >
    {auctions.map((auction: any) => {
      // Find the product from the products list based on the product ID
      const productList = list.find((lis: any) => lis.id === auction.product);
      return (
        <TableRow key={auction.id}>
          <TableCell>{productList ? productList.name : 'Product Not Found'}</TableCell>
          <TableCell>Rs {Number(auction.starting_value).toLocaleString('en-IN')}</TableCell>
          <TableCell>{new Date(auction.starting_time).toLocaleString()}</TableCell>
          <TableCell>{new Date(auction.ending_time).toLocaleString()}</TableCell>
          <TableCell
 
>
  <span  className={`${
              auctionStatuses[auction.id]
              === 'active' 
      && 'bg-red-500 text-red-500'} ${auctionStatuses[auction.id]
              === 'ended' 
      && 'bg-black text-white'}
       ${auctionStatuses[auction.id]
        === 'locked' 
&& 'bg-secondary text-secondary'}
      ${auctionStatuses[auction.id]
        === 'sold' 
&& 'bg-[#0acc8f] text-[#0acc8f]'} bg-opacity-25 rounded-full px-4 py-1`}>
  {auctionStatuses[auction.id] === 'ended' 
    ? 'Ended' 
    : auctionStatuses[auction.id] === 'active' 
    ? 'Open' 
    : auctionStatuses[auction.id] === 'locked' 
    ? 'Locked' 
    : auctionStatuses[auction.id] === 'sold' 
    ? 'Sold' 
    : ''}
    </span>
</TableCell>

          <TableCell className='text-red-500'>

                  {countdowns[auction.id] || 'Calculating...'}
                </TableCell>
               

        </TableRow>
      );
    })}
  </TableBody>
</Table>

      <div className="mb-5 mt-8">
        <h5  className='text-lg mt-5'>Add Auctions</h5>
      </div>
      <div className='gap-10'>
        <div>
          <p className='mb-3'></p>
          <div className="flex flex-wrap">
            <Tabs color={'secondary'} radius={'full'} fullWidth onSelectionChange={(value:any)=>setSelectedCat(value)} classNames={{
              tabList: "p-2 ",
            }} variant={'solid'} aria-label="Tabs variants">
              {categories.map((item:any, index:any) => (
                <Tab key={item.id} title={item.name}/>
              ))}
            </Tabs>
          </div>
        </div>
        <div className='w-full'>
  <p className='mb-3 mt-5'></p>
  <div className="gap-5 mb-20 grid grid-cols-3 sm:grid-cols-4 w-full">
  {products.map((item: any, index: any) => {
    // Find the auction for the current product
    const relevantAuctions = auctions.filter((auction: any) => auction.product === item.id);
    const isAuctionActive = relevantAuctions.some((auction: any) => auction.status === 'active' || auction.status === 'locked' ||auction.status === 'sold');
console.log("relevantauctions", relevantAuctions, item.id, auctions)
    console.log("isAuctionActive", isAuctionActive)

    // Determine if the auction is active or ended

    return (
      <Card
        shadow="sm"
        key={index}
        isPressable={!isAuctionActive} // Disable pressable if auction is active
        className={`relative group ${isAuctionActive ? 'opacity-50 cursor-not-allowed' : ''}`}
        onPress={!isAuctionActive ? () => handleProductClick(item.id) : undefined}
      >
        <CardBody className="overflow-visible p-0">
          <Image
            isZoomed
            shadow="sm"
            radius="lg"
            width="100%"
            alt={item.name}
            className="w-full object-cover h-[140px]"
            src={item.picture}
          />
        </CardBody>
        <CardFooter className="justify-between text-sm">
          {item.name}
          {isAuctionActive && <span className="text-red-500">Already on auction</span>}
        </CardFooter>
      </Card>
    );
  })}
</div>
</div>

      </div>

      {/* Auction Creation Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Start Product Auction</ModalHeader>
              <ModalBody>
              <Input
            label="Starting Bid Value"
            placeholder="Enter starting Bid Value"

            name="startingValue"
            type='number'
            value={auctionData.startingValue}
            onChange={handleInputChange}
            required
            labelPlacement='outside'

          />
        
            {/* <DatePicker
            label="Starting Time"
            name="startingTime"
        hideTimeZone
        showMonthAndYearPickers
        onChange={(date) => handleDateChange("startingTime", date)}
        labelPlacement='outside'

        defaultValue={now(getLocalTimeZone())}
      /> */}
           <DatePicker
            label="Ending Time"
            name="endingTime"

        hideTimeZone
        showMonthAndYearPickers
        onChange={(date) => handleDateChange("endingTime", date)}
        labelPlacement='outside'
        defaultValue={now(getLocalTimeZone())}
      />
         
              </ModalBody>
              <ModalFooter>
          <Button variant='light' color="danger" onClick={onClose}>
            Close
          </Button>
          <Button color='secondary' onClick={createAuction}>Start</Button>

               
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <ToastContainer /> 
    </div>
  );
}
